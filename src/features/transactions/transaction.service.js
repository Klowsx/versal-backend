const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? require('stripe')(stripeKey) : null
const Transaction = require('../../models/transaction.model')
const User = require('../../models/user.model')
const { COIN_PACKS } = require('../../config/products')
const { SUBSCRIPTION_PLANS } = require('../../config/products')
const {
  Types: { ObjectId }
} = require('mongoose')

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080'

async function getStripeBalance() {
  if (!stripe) {
    return { error: 'Stripe no está configurado.' }
  }
  try {
    const balance = await stripe.balance.retrieve()
    return { balance }
  } catch (error) {
    console.error('Error al obtener el balance de Stripe:', error)
    return { error: 'No se pudo obtener el balance de Stripe.' }
  }
}

async function createStripeCheckoutSessionForSubscription(userId, planId) {
  if (!stripe) {
    return { error: 'Stripe no está configurado.' }
  }
  try {
    const user = await User.findById(userId)
    if (!user) {
      return { error: 'Usuario no encontrado.' }
    }

    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          mongoDbUserId: userId.toString()
        }
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: planId,
          quantity: 1
        }
      ],
      success_url: `${FRONTEND_URL}/frontend/modules/payment/payment-success.html`,
      cancel_url: `${FRONTEND_URL}/frontend/modules/payment/payment-canceled.html`,
      metadata: {
        userId: userId.toString(),
        type: 'subscription',
        planId: planId
      },
      subscription_data: {
        metadata: {
          mongoDbUserId: userId.toString()
        }
      }
    })

    const newTransaction = new Transaction({
      userId,
      type: 'subscription',
      amount: 0,
      currency: process.env.STRIPE_CURRENCY,
      status: 'pending',
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: stripeCustomerId,
      metadata: {
        planId: planId
      }
    })
    await newTransaction.save()

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error al crear sesión de checkout para suscripción:', error)
    return {
      error: `Error al crear sesión de checkout para suscripción: ${error.message}`
    }
  }
}

async function createStripeCheckoutSessionForCoinPack(userId, coinPackId) {
  if (!stripe) {
    return { error: 'Stripe no está configurado.' }
  }
  try {
    const user = await User.findById(userId)
    if (!user) {
      return { error: 'Usuario no encontrado.' }
    }

    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          mongoDbUserId: userId.toString()
        }
      })
      stripeCustomerId = customer.id
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      line_items: [
        {
          price: coinPackId,
          quantity: 1
        }
      ],
      success_url: `${FRONTEND_URL}/frontend/modules/payment/payment-success.html`,
      cancel_url: `${FRONTEND_URL}/frontend/modules/payment/payment-canceled.html`,
      metadata: {
        userId: userId.toString(),
        type: 'coin_pack_purchase',
        coinPackId: coinPackId
      }
    })

    const newTransaction = new Transaction({
      userId,
      type: 'coin_pack_purchase',
      amount: 0,
      currency: process.env.STRIPE_CURRENCY,
      status: 'pending',
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: stripeCustomerId,
      metadata: {
        coinPackId: coinPackId
      }
    })
    await newTransaction.save()

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error(
      'Error al crear sesión de checkout para pack de monedas:',
      error
    )
    return {
      error: `Error al crear sesión de checkout para pack de monedas: ${error.message}`
    }
  }
}

async function handleStripeWebhookEvent(event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('checkout.session.completed', session.id)

        const transaction = await Transaction.findOne({
          stripeCheckoutSessionId: session.id
        })

        if (transaction) {
          if (transaction.status === 'completed') {
            console.log(
              `Transacción ${transaction._id} ya está completada. Ignorando evento duplicado.`
            )
            return { message: 'Evento ya procesado.' }
          }

          let paymentIntentOrSubscription
          if (session.mode === 'payment' && session.payment_intent) {
            paymentIntentOrSubscription = await stripe.paymentIntents.retrieve(
              session.payment_intent
            )
            transaction.stripePaymentIntentId = paymentIntentOrSubscription.id
          } else if (session.mode === 'subscription' && session.subscription) {
            paymentIntentOrSubscription = await stripe.subscriptions.retrieve(
              session.subscription
            )
            transaction.stripeSubscriptionId = paymentIntentOrSubscription.id
          }

          transaction.status = 'completed'
          transaction.amount = session.amount_total / 100
          transaction.currency = session.currency
          transaction.stripeCustomerId = session.customer
          await transaction.save()

          const userId = session.metadata.userId
          const user = await User.findById(userId)

          if (user) {
            if (session.metadata.type === 'subscription') {
              user.isPremium = true
              user.premiumSubscriptionId = transaction.stripeSubscriptionId
              user.subscriptionPlanId = session.metadata.planId

              user.subscription.type = 'premium'
              user.subscription.status = 'active'
              user.subscription.endDate = null
              await user.save()
              console.log(`Usuario ${user.username} suscrito a premium.`)
            } else if (session.metadata.type === 'coin_pack_purchase') {
              const coinPackId = session.metadata.coinPackId
              const coinsToAdd = getCoinsForPack(coinPackId)

              if (coinsToAdd > 0) {
                await User.findByIdAndUpdate(
                  user._id,
                  { $inc: { coins: coinsToAdd } },
                  { new: true }
                )
                console.log(
                  `Usuario ${user.username} compró ${coinsToAdd} monedas. Monedas añadidas atómicamente.`
                )
              } else {
                console.warn(
                  `No se encontraron monedas para el pack: ${coinPackId}. No se añadieron monedas al usuario ${user.username}.`
                )
              }
            }
          }
        } else {
          console.warn(
            `Sesión de Checkout ${session.id} completada, pero no se encontró la transacción correspondiente en la DB.`
          )
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log('invoice.payment_succeeded', invoice.id)
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          )
          const userIdFromMetadata = subscription.metadata.mongoDbUserId

          if (userIdFromMetadata) {
            const user = await User.findById(userIdFromMetadata)
            if (user && !user.isPremium) {
              user.isPremium = true
              user.premiumSubscriptionId = subscription.id
              await user.save()
              console.log(
                `Usuario ${user.username} reactivó suscripción por renovación.`
              )
            }

            const newTransaction = new Transaction({
              userId: new ObjectId(userIdFromMetadata),
              type: 'subscription',
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: 'completed',
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer,
              stripePaymentIntentId: invoice.payment_intent,
              metadata: {
                renewal: true,
                invoiceId: invoice.id,
                planId: subscription.items.data[0].price.id
              }
            })
            await newTransaction.save()
          }
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        console.log('invoice.payment_failed', failedInvoice.id)
        if (failedInvoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            failedInvoice.subscription
          )
          const userIdFromMetadata = subscription.metadata.mongoDbUserId
          if (userIdFromMetadata) {
            const user = await User.findById(userIdFromMetadata)
            if (user) {
              console.log(
                `Pago de suscripción fallido para usuario ${user.username}.`
              )
            }
          }
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        console.log('customer.subscription.deleted', deletedSubscription.id)

        const userIdSubDeleted = deletedSubscription.metadata.mongoDbUserId
        if (userIdSubDeleted) {
          const user = await User.findById(userIdSubDeleted)
          if (user) {
            user.isPremium = false
            user.premiumSubscriptionId = undefined
            user.subscriptionPlanId = undefined

            user.subscription.type = 'basic'
            user.subscription.status = 'expired'
            user.subscription.endDate = new Date()
            await user.save()
            console.log(
              `Suscripción eliminada para el usuario ${user.username}.`
            )
          }
        }

        await Transaction.updateMany(
          { stripeSubscriptionId: deletedSubscription.id, status: 'completed' },
          { $set: { status: 'canceled' } }
        )
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return { received: true }
  } catch (error) {
    console.error('Error al manejar evento de webhook de Stripe:', error)
    return { error: 'Error al manejar evento de webhook de Stripe.' }
  }
}

function getCoinsForPack(coinPackId) {
  const pack = COIN_PACKS.find((p) => p.stripePriceId === coinPackId)

  if (!pack) {
    console.warn(
      `Advertencia: No se encontró un paquete de monedas configurado para el Stripe Price ID: ${coinPackId}`
    )
    return 0
  }

  return pack.coins
}

async function getUserTransactions(userId) {
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
    return { transactions }
  } catch (error) {
    console.error(
      `Error obteniendo transacciones para el usuario ${userId}:`,
      error
    )
    return { error: 'Error al obtener transacciones del usuario.' }
  }
}

async function getSubscriptionPlans() {
  console.log('Obteniendo planes de suscripción disponibles en service...')
  return { plans: SUBSCRIPTION_PLANS }
}

async function getCoinPacks() {
  console.log('Obteniendo packs de monedas disponibles en service...')
  return { packs: COIN_PACKS }
}

module.exports = {
  createStripeCheckoutSessionForSubscription,
  createStripeCheckoutSessionForCoinPack,
  handleStripeWebhookEvent,
  getUserTransactions,
  getSubscriptionPlans,
  getCoinPacks,
  getStripeBalance
}

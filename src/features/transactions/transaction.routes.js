const transactionController = require("./transaction.controller");
const {
  createSubscriptionCheckoutSchema,
  createCoinPackCheckoutSchema,
  stripeWebhookSchema,
  getUserTransactionsSchema,
  getSubscriptionPlansSchema,
  getCoinPacksSchema,
} = require("./transaction.schema");

async function transactionRoutes(fastify) {
  fastify.post(
    "/transactions/stripe-webhook",
    {
      schema: stripeWebhookSchema,
      config: {
        rawBody: true,
      },
    },
    transactionController.stripeWebhook
  );

  fastify.get(
    "/products/subscriptions",
    { schema: getSubscriptionPlansSchema },
    transactionController.getSubscriptionPlans
  );

  fastify.get(
    "/products/coin-packs",
    { schema: getCoinPacksSchema },
    transactionController.getCoinPacks
  );

  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Ruta para iniciar una sesión de checkout de suscripción
    privateRoutes.post(
      "/transactions/checkout/subscription",
      { schema: createSubscriptionCheckoutSchema },
      transactionController.createSubscriptionCheckout
    );

    // Ruta para iniciar una sesión de checkout de compra de pack de monedas
    privateRoutes.post(
      "/transactions/checkout/coin-pack",
      { schema: createCoinPackCheckoutSchema },
      transactionController.createCoinPackCheckout
    );

    // Ruta para obtener las transacciones del usuario
    privateRoutes.get(
      "/transactions/me",
      { schema: getUserTransactionsSchema },
      transactionController.getUserTransactions
    );

    //Obtener balance de stripe
    privateRoutes.get("/transactions/balance", transactionController.getStripeBalance);
  });
}

module.exports = transactionRoutes;

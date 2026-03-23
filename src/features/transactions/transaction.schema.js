const headersAuth = {
  type: "object",
  properties: {
    authorization: { type: "string" },
  },
  required: ["authorization"],
};

const transactionProperties = {
  _id: { type: "string" },
  userId: { type: "string" },
  type: { type: "string", enum: ["subscription", "coin_pack_purchase", "donation"] },
  amount: { type: "number" },
  currency: { type: "string" },
  status: { type: "string", enum: ["pending", "completed", "failed", "canceled"] },
  paymentMethod: { type: "string" },
  stripeCheckoutSessionId: { type: "string", nullable: true },
  stripePaymentIntentId: { type: "string", nullable: true },
  stripeSubscriptionId: { type: "string", nullable: true },
  stripeCustomerId: { type: "string", nullable: true },
  metadata: { type: "object", additionalProperties: true, nullable: true },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const planProperties = {
  id: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
  stripePriceId: { type: "string" },
};

const packProperties = {
  id: { type: "string" },
  name: { type: "string" },
  description: { type: "string" },
  coins: { type: "number" },
  stripePriceId: { type: "string" },
};

const createSubscriptionCheckoutSchema = {
  summary: "Iniciar checkout para una suscripción",
  description: "Crea una sesión de checkout de Stripe para una nueva suscripción.",
  tags: ["Transactions"],
  headers: headersAuth,
  body: {
    type: "object",
    required: ["planId"], 
    properties: {
      planId: { type: "string", description: "ID del precio del plan de suscripción en Stripe" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "ID de la sesión de checkout de Stripe" },
        url: { type: "string", format: "uri", description: "URL de redirección a Stripe Checkout" },
      },
    },
    400: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const createCoinPackCheckoutSchema = {
  summary: "Iniciar checkout para un pack de monedas",
  description: "Crea una sesión de checkout de Stripe para la compra de un pack de monedas.",
  tags: ["Transactions"],
  headers: headersAuth,
  body: {
    type: "object",
    required: ["coinPackId"],
    properties: {
      coinPackId: { type: "string", description: "ID del precio del pack de monedas en Stripe" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "ID de la sesión de checkout de Stripe" },
        url: { type: "string", format: "uri", description: "URL de redirección a Stripe Checkout" },
      },
    },
    400: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const stripeWebhookSchema = {
  summary: "Webhook de Stripe",
  description: "Endpoint para que Stripe envíe eventos de notificaciones de pago.",
  tags: ["Webhooks"],
};

const getUserTransactionsSchema = {
  summary: "Obtener historial de transacciones del usuario",
  description: "Devuelve una lista de todas las transacciones asociadas al usuario autenticado.",
  tags: ["Transactions"],
  headers: headersAuth,
  response: {
    200: {
      description: "Lista de transacciones del usuario.",
      type: "object",
      properties: {
        transactions: {
          type: "array",
          items: {
            type: "object",
            properties: transactionProperties,
          },
        },
      },
    },
    500: {
      description: "Error al obtener las transacciones.",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const getSubscriptionPlansSchema = {
  summary: "Obtener planes de suscripción",
  description: "Devuelve una lista de todos los planes de suscripción disponibles para la compra.",
  tags: ["Products"],
  response: {
    200: {
      description: "Respuesta exitosa.",
      type: "object",
      properties: {
        plans: {
          type: "array",
          items: { type: "object", properties: planProperties },
        },
      },
    },
  },
};

const getCoinPacksSchema = {
  summary: "Obtener paquetes de monedas",
  description: "Devuelve una lista de todos los paquetes de monedas disponibles para la compra.",
  tags: ["Products"],
  response: {
    200: {
      description: "Respuesta exitosa.",
      type: "object",
      properties: {
        packs: {
          type: "array",
          items: { type: "object", properties: packProperties },
        },
      },
    },
  },
};

module.exports = {
  createSubscriptionCheckoutSchema,
  createCoinPackCheckoutSchema,
  stripeWebhookSchema,
  transactionProperties,
  getUserTransactionsSchema,
  getSubscriptionPlansSchema,
  getCoinPacksSchema,
};

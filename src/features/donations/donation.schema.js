const headers = {
  type: "object",
  properties: { authorization: { type: "string" } },
  required: ["authorization"],
};

const makeDonationSchema = {
  summary: "Realiza una donación a un autor",
  description:
    "Permite a un usuario autenticado donar una cantidad de sus monedas al autor de una historia específica.",
  tags: ["Donations"],
  headers,
  params: {
    type: "object",
    properties: {
      storyId: { type: "string", description: "ID de la historia a la que se dona." },
    },
    required: ["storyId"],
  },
  body: {
    type: "object",
    required: ["amount"],
    properties: {
      amount: { type: "number", minimum: 1, description: "La cantidad de monedas a donar." },
      message: { type: "string", maxLength: 280, description: "Un mensaje de apoyo opcional." },
    },
  },
  response: {
    201: {
      description: "Donación realizada exitosamente.",
      type: "object",
      properties: {
        success: { type: "boolean" },
        donation: {
          type: "object",
          properties: {
            _id: { type: "string" },
            donatorId: { type: "string" },
            recipientId: { type: "string" },
            storyId: { type: "string" },
            amount: { type: "number" },
            message: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    400: {
      description: "Error en la petición.",
      type: "object",
      properties: {
        success: { type: "boolean", default: false },
        message: { type: "string" },
      },
    },
  },
};

module.exports = {
  makeDonationSchema,
};

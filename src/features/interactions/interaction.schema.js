const interactionProperties = {
  _id: { type: "string" },
  contentId: { type: "string", description: "ID del capítulo al que pertenece" },
  userId: {
    type: "object",
    properties: {
      _id: { type: "string" },
      username: { type: "string" },
      profileImage: { type: "string" },
    },
  },
  interactionType: { type: "string", enum: ["like", "comment"] },
  text: { type: "string", nullable: true },
  createdAt: { type: "string", format: "date-time" },
};

const headers = {
  type: "object",
  properties: { authorization: { type: "string" } },
  required: ["authorization"],
};

// --- Esquemas de Rutas ---

const addInteractionSchema = {
  summary: "Añade una interacción a un capítulo",
  description: 'Permite a un usuario dar "like" o añadir un comentario a un capítulo específico.',
  tags: ["Interactions"],
  headers,
  params: {
    type: "object",
    properties: {
      id: { type: "string", description: "El ID del Capítulo" },
    },
    required: ["id"],
  },
  body: {
    type: "object",
    required: ["interactionType"],
    properties: {
      interactionType: { type: "string", enum: ["like", "comment"] },
      text: { type: "string", description: 'Requerido si interactionType es "comment"' },
    },
  },
  response: {
    201: {
      description: "Interacción creada exitosamente.",
      type: "object",
      properties: {
        status: { type: "string" },
        comment: { type: "object", properties: interactionProperties },
        like: { type: "object", properties: interactionProperties },
      },
    },
  },
};

const getInteractionsSchema = {
  summary: "Obtiene las interacciones de un capítulo",
  description:
    "Devuelve una lista de comentarios y el conteo de likes para un capítulo específico.",
  tags: ["Interactions"],
  params: {
    type: "object",
    properties: {
      id: { type: "string", description: "El ID del Capítulo" },
    },
    required: ["id"],
  },
  response: {
    200: {
      description: "Respuesta exitosa.",
      type: "object",
      properties: {
        likesCount: { type: "number" },
        comments: {
          type: "array",
          items: {
            type: "object",
            properties: interactionProperties,
          },
        },
      },
    },
  },
};

const deleteInteractionSchema = {
  summary: "Elimina una interacción",
  description: "Elimina un like o un comentario específico por su ID.",
  tags: ["Interactions"],
  headers,
  params: {
    type: "object",
    properties: {
      interactionId: { type: "string", description: "ID de la interacción a eliminar" },
    },
    required: ["interactionId"],
  },
  response: {
    200: {
      description: "Interacción eliminada.",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

module.exports = {
  addInteractionSchema,
  getInteractionsSchema,
  deleteInteractionSchema,
};

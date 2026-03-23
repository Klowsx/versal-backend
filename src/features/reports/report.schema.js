const reportProperties = {
  _id: { type: "string" },
  userId: { type: "object", properties: { _id: { type: "string" }, username: { type: "string" } } },
  contentId: { type: "object" },
  onModel: { type: "string", enum: ["Story", "Interaction"] },
  reason: { type: "string" },
  details: { type: "string", nullable: true },
  status: { type: "string", enum: ["pending", "in_review", "resolved", "dismissed"] },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const headers = {
  type: "object",
  properties: { authorization: { type: "string" } },
  required: ["authorization"],
};

const createReportSchema = {
  summary: "Crea un nuevo reporte",
  description: "Permite a un usuario autenticado reportar un contenido (Historia o Comentario).",
  tags: ["Reports"],
  headers,
  body: {
    type: "object",
    required: ["contentId", "onModel", "reason"],
    properties: {
      contentId: { type: "string", description: "El ID del contenido a reportar." },
      onModel: {
        type: "string",
        enum: ["Story", "Interaction"],
        description: "El tipo de contenido (Historia o Comentario/Interacción).",
      },
      reason: {
        type: "string",
        enum: [
          "Spam",
          "Contenido de odio",
          "Acoso",
          "Información falsa",
          "Contenido explícito",
          "Violencia",
          "Otro",
        ],
      },
      details: { type: "string", description: "Detalles adicionales sobre el reporte (opcional)." },
    },
  },
  response: {
    201: {
      description: "Reporte creado exitosamente.",
      type: "object",
      properties: {
        report: { type: "object", properties: reportProperties },
      },
    },
  },
};

const getAllReportsSchema = {
  summary: "[Admin] Obtiene todos los reportes",
  description:
    "Ruta protegida para administradores. Devuelve una lista de todos los reportes, con filtros opcionales.",
  tags: ["Reports", "Admin"],
  headers,
  querystring: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["pending", "in_review", "resolved", "dismissed"] },
    },
  },
  response: {
    200: {
      description: "Una lista de reportes.",
      type: "object",
      properties: {
        reports: {
          type: "array",
          items: { type: "object", properties: reportProperties },
        },
      },
    },
  },
};

const updateReportStatusSchema = {
  summary: "[Admin] Actualiza el estado de un reporte",
  description:
    "Ruta protegida para administradores. Permite cambiar el estado de un reporte específico.",
  tags: ["Reports", "Admin"],
  headers,
  params: {
    type: "object",
    properties: {
      reportId: { type: "string", description: "ID del reporte a actualizar." },
    },
    required: ["reportId"],
  },
  body: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["in_review", "resolved", "dismissed"] },
    },
  },
  response: {
    200: {
      description: "Reporte actualizado exitosamente.",
      type: "object",
      properties: {
        report: { type: "object", properties: reportProperties },
      },
    },
  },
};

module.exports = {
  createReportSchema,
  getAllReportsSchema,
  updateReportStatusSchema,
};

const chapterProperties = {
  _id: { type: "string" },
  story: { type: "string", description: "ID de la historia padre" },
  chapterNumber: { type: "number" },
  title: { type: "string" },
  content: { type: "string", description: "Contenido del capítulo en formato HTML" },
  images: { type: "array", items: { type: "string" } },
  videos: { type: "array", items: { type: "string" } },
  status: { type: "string", enum: ["draft", "published", "archived"] },
  publishedAt: { type: "string", format: "date-time", nullable: true },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const headers = {
  type: "object",
  properties: { authorization: { type: "string" } },
  required: ["authorization"],
};

const createChapterSchema = {
  summary: "Crea un nuevo capítulo",
  description:
    "Añade un nuevo capítulo a una historia existente. El número del capítulo se asigna automáticamente.",
  tags: ["Chapters"],
  headers,
  params: {
    type: "object",
    properties: {
      storyId: { type: "string", description: "ID de la historia a la que pertenece el capítulo" },
    },
    required: ["storyId"],
  },
  body: {
    type: "object",
    required: ["title", "content"],
    properties: {
      title: { type: "string" },
      content: {
        type: "string",
        description: "El contenido principal del capítulo, usualmente HTML.",
      },
      status: { type: "string", enum: ["draft", "published"], default: "draft" },
    },
  },
  response: {
    201: {
      description: "Capítulo creado exitosamente.",
      type: "object",
      properties: {
        chapter: {
          type: "object",
          properties: chapterProperties,
        },
      },
    },
  },
};

const getChaptersByStorySchema = {
  summary: "Obtiene los capítulos de una historia",
  description:
    "Devuelve una lista ordenada de todos los capítulos pertenecientes a una historia específica.",
  tags: ["Chapters"],
  params: {
    type: "object",
    properties: {
      storyId: { type: "string", description: "ID de la historia" },
    },
    required: ["storyId"],
  },
  response: {
    200: {
      description: "Una lista de capítulos.",
      type: "object",
      properties: {
        chapters: {
          type: "array",
          items: {
            type: "object",
            properties: chapterProperties,
          },
        },
      },
    },
  },
};

const getChapterByIdSchema = {
  summary: "Obtiene un capítulo por ID",
  description: "Devuelve los detalles de un capítulo específico.",
  tags: ["Chapters"],
  params: {
    type: "object",
    properties: { id: { type: "string" } },
    required: ["id"],
  },
  response: {
    200: {
      description: "Respuesta exitosa.",
      type: "object",
      properties: {
        chapter: { type: "object", properties: chapterProperties },
      },
    },
  },
};

const updateChapterSchema = {
  summary: "Actualiza un capítulo",
  description: "Actualiza el contenido, título o estado de un capítulo existente.",
  tags: ["Chapters"],
  headers,
  params: {
    type: "object",
    properties: { id: { type: "string", description: "ID del capítulo a actualizar" } },
    required: ["id"],
  },
  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      status: { type: "string", enum: ["draft", "published", "archived"] },
    },
  },
  response: {
    200: {
      description: "Capítulo actualizado exitosamente.",
      type: "object",
      properties: {
        chapter: {
          type: "object",
          properties: chapterProperties,
        },
      },
    },
  },
};

const deleteChapterSchema = {
  summary: "Elimina un capítulo",
  description:
    "Elimina permanentemente un capítulo y todas sus interacciones asociadas (likes y comentarios).",
  tags: ["Chapters"],
  headers,
  params: {
    type: "object",
    properties: { id: { type: "string", description: "ID del capítulo a eliminar" } },
    required: ["id"],
  },
  response: {
    200: {
      description: "Capítulo eliminado.",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

const uploadChapterImageSchema = {
  summary: "Sube una imagen para un capítulo",
  description:
    "Sube un archivo de imagen y devuelve su URL pública. Utilizado por el editor WYSIWYG.",
  tags: ["Chapters"],
  headers,
  response: {
    200: {
      description: "Imagen subida exitosamente.",
      type: "object",
      properties: {
        url: { type: "string", format: "uri", description: "URL pública de la imagen subida" },
      },
    },
    400: {
      description: "Error en la petición (ej. no se envió archivo).",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      description: "Error interno del servidor al subir la imagen.",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const getPublishedChapterCountSchema = {
  summary: "Obtiene la cantidad de capítulos publicados de una historia",
  description:
    "Devuelve el número total de capítulos con estado 'published' para una historia específica.",
  tags: ["Chapters"],
  params: {
    type: "object",
    properties: {
      storyId: { type: "string", description: "ID de la historia" },
    },
    required: ["storyId"],
  },
  response: {
    200: {
      description: "Cantidad de capítulos publicados.",
      type: "object",
      properties: {
        publishedChapterCount: { type: "number" },
      },
    },
    500: {
      description: "Error interno del servidor.",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

module.exports = {
  createChapterSchema,
  getChaptersByStorySchema,
  getChapterByIdSchema,
  updateChapterSchema,
  deleteChapterSchema,
  uploadChapterImageSchema,
  getPublishedChapterCountSchema,
};

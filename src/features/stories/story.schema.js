const storyProperties = {
  _id: { type: "string" },
  title: { type: "string" },
  description: { type: "string" },
  coverImage: { type: "string", nullable: true },
  author: {
    type: "object",
    properties: {
      _id: { type: "string" },
      username: { type: "string" },
      profileImage: { type: "string" },
    },
  },
  category: {
    type: "object",
    properties: {
      _id: { type: "string" },
      name: { type: "string" },
    },
    nullable: true,
  },
  tags: {
    type: "array",
    items: {
      type: "object",
      properties: {
        _id: { type: "string" },
        name: { type: "string" },
      },
    },
  },
  chapterCount: { type: "number" },
  status: { type: "string", enum: ["draft", "published", "archived"] },
  isAdultContent: { type: "boolean" },
  totalLikes: { type: "number" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const categoryProperties = {
  _id: { type: "string" },
  name: { type: "string" },
};

const tagProperties = {
  _id: { type: "string" },
  name: { type: "string" },
};

const headers = {
  type: "object",
  properties: {
    authorization: { type: "string" },
  },
  required: ["authorization"],
};

const createStorySchema = {
  summary: "Crea una nueva historia",
  description:
    'Crea una nueva historia para el usuario autenticado. El estado inicial siempre será "borrador".',
  tags: ["Stories"],
  headers,
  body: {
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string", description: "Nombre de la categoría" },
      tags: { type: "array", items: { type: "string" } },
      language: { type: "string" },
      isAdultContent: { type: "boolean", default: false },
    },
  },
  response: {
    201: {
      description: "La historia fue creada exitosamente.",
      type: "object",
      properties: {
        story: {
          type: "object",
          properties: storyProperties,
        },
      },
    },
  },
};

const getStoryByIdSchema = {
  summary: "Obtiene una historia por ID",
  description: "Devuelve los detalles completos de una historia específica.",
  tags: ["Stories"],
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Respuesta exitosa.",
      type: "object",
      properties: {
        story: {
          type: "object",
          properties: storyProperties,
        },
      },
    },
    404: {
      description: "Historia no encontrada.",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const getAllStoriesSchema = {
  summary: "Obtiene todas las historias publicadas",
  description:
    'Ruta pública para obtener una lista de todas las historias con estado "publicado". Admite filtros.',
  tags: ["Stories"],
  querystring: {
    type: "object",
    properties: {
      search: { type: "string" },
      categoryName: { type: "string" },
      tagName: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Una lista de historias publicadas.",
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: storyProperties,
          },
        },
      },
    },
  },
};

const getAuthorStoriesSchema = {
  summary: "Obtiene las historias del autor autenticado",
  description:
    "Ruta privada que devuelve todas las historias (incluyendo borradores) del usuario que realiza la petición.",
  tags: ["Stories"],
  headers,
  response: {
    200: {
      description: "Una lista de las historias del autor.",
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: storyProperties,
          },
        },
      },
    },
  },
};

const updateStorySchema = {
  summary: "Actualiza una historia",
  description: "Actualiza los detalles de una historia existente. Solo el autor puede hacerlo.",
  tags: ["Stories"],
  headers,
  params: {
    type: "object",
    properties: { id: { type: "string" } },
  },
  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      status: { type: "string", enum: ["draft", "published", "archived"] },
      isAdultContent: { type: "boolean", default: false },
    },
  },
  response: {
    200: {
      description: "Historia actualizada exitosamente.",
      type: "object",
      properties: {
        story: {
          type: "object",
          properties: storyProperties,
        },
      },
    },
  },
};

const deleteStorySchema = {
  summary: "Elimina una historia",
  description:
    "Elimina permanentemente una historia y todos sus capítulos e interacciones asociadas.",
  tags: ["Stories"],
  headers,
  params: {
    type: "object",
    properties: { id: { type: "string" } },
  },
  response: {
    200: {
      description: "Historia eliminada.",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

const getStoriesByCategorySchema = {
  summary: "Obtiene historias por categoría",
  description:
    "Devuelve una lista de todas las historias publicadas que pertenecen a una categoría específica.",
  tags: ["Stories"],
  params: {
    type: "object",
    properties: {
      categoryName: { type: "string", description: "El nombre de la categoría a buscar" },
    },
    required: ["categoryName"],
  },
  response: {
    200: {
      description: "Una lista de historias publicadas para la categoría.",
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: storyProperties,
          },
        },
      },
    },
  },
};

const getStoriesByTagSchema = {
  summary: "Obtiene historias por etiqueta (tag)",
  description:
    "Devuelve una lista de todas las historias publicadas que tienen una etiqueta específica.",
  tags: ["Stories"],
  params: {
    type: "object",
    properties: {
      tagName: { type: "string", description: "El nombre de la etiqueta a buscar" },
    },
    required: ["tagName"],
  },
  response: {
    200: {
      description: "Una lista de historias publicadas para la etiqueta.",
      type: "object",
      properties: {
        stories: {
          type: "array",
          items: {
            type: "object",
            properties: storyProperties,
          },
        },
      },
    },
  },
};

const getAllCategoriesSchema = {
  summary: "Obtiene todas las categorías disponibles",
  description: "Devuelve una lista de todas las categorías de historias disponibles.",
  tags: ["Stories", "Categories"],
  response: {
    200: {
      description: "Una lista de todas las categorías.",
      type: "object",
      properties: {
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: categoryProperties,
          },
        },
      },
    },
  },
};

const getAllTagsSchema = {
  summary: "Obtiene todas las etiquetas (tags) disponibles",
  description: "Devuelve una lista de todas las etiquetas de historias disponibles.",
  tags: ["Stories", "Tags"],
  response: {
    200: {
      description: "Una lista de todas las etiquetas.",
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: {
            type: "object",
            properties: tagProperties,
          },
        },
      },
    },
  },
};

const authorIdParamSchema = {
  type: "object",
  properties: {
    authorId: { type: "string", description: "ID del autor cuyas historias se desean obtener" },
  },
  required: ["authorId"],
};

module.exports = {
  authorIdParamSchema,
  createStorySchema,
  getStoryByIdSchema,
  getAllStoriesSchema,
  getAuthorStoriesSchema,
  updateStorySchema,
  deleteStorySchema,
  getStoriesByCategorySchema,
  getStoriesByTagSchema,
  getAllCategoriesSchema,
  getAllTagsSchema,
};

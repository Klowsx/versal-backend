

const storyController = require("./story.controller");
const {
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
  authorIdParamSchema,
} = require("./story.schema");

async function storyRoutes(fastify) {
  fastify.get("/", { schema: getAllStoriesSchema }, storyController.getAllStories);

  fastify.get("/:id", { schema: getStoryByIdSchema }, storyController.getStoryById);

  // Obtener categorías y etiquetas
  fastify.get("/categories", { schema: getAllCategoriesSchema }, storyController.getAllCategories);
  fastify.get("/tags", { schema: getAllTagsSchema }, storyController.getAllTags);

  fastify.get(
    "/author/:authorId",
    {
      schema: {
        params: authorIdParamSchema,
        response: getAuthorStoriesSchema.response,
      },
    },
    storyController.getStoriesByAuthorPublic
  );

  // --- Rutas Privadas ---
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Crear una nueva historia
    privateRoutes.post("/", storyController.createStory);

    // Obtener historias del autor autenticado
    privateRoutes.get(
      "/me",
      { schema: getAuthorStoriesSchema },
      storyController.getStoriesByAuthor
    );

    // Actualizar una historia existente
    privateRoutes.patch("/:id", { schema: updateStorySchema }, storyController.updateStory);

    // Eliminar una historia
    privateRoutes.delete("/:id", { schema: deleteStorySchema }, storyController.deleteStory);
  });

  // Rutas para obtener historias por categoría o etiqueta
  fastify.get(
    "/category/:categoryName",
    { schema: getStoriesByCategorySchema },
    storyController.getStoriesByCategory
  );
  fastify.get("/tag/:tagName", { schema: getStoriesByTagSchema }, storyController.getStoriesByTag);
}

module.exports = storyRoutes;

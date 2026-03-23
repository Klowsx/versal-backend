const chapterController = require("./chapter.controller");
const {
  createChapterSchema,
  getChaptersByStorySchema,
  getChapterByIdSchema,
  updateChapterSchema,
  deleteChapterSchema,
  uploadChapterImageSchema,
  getPublishedChapterCountSchema,
} = require("./chapter.schema");

async function chapterRoutes(fastify) {
  // --- Rutas Públicas ---
  // Obtener capítulos de una historia
  fastify.get(
    "/stories/:storyId/chapters",
    { schema: getChaptersByStorySchema },
    chapterController.getChaptersByStory
  );

  // Obtener un capítulo por ID
  fastify.get("/chapters/:id", { schema: getChapterByIdSchema }, chapterController.getChapterById);

  // Obtener cantidad de capítulos publicados
  fastify.get(
    "/stories/:storyId/published-chapters-count",
    { schema: getPublishedChapterCountSchema },
    chapterController.getPublishedChapterCount
  );

  // --- Rutas Privadas ---
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Crear un nuevo capítulo
    privateRoutes.post(
      "/stories/:storyId/chapters",
      { schema: createChapterSchema },
      chapterController.createChapter
    );

    // Actualizar un capítulo
    privateRoutes.patch(
      "/chapters/:id",
      { schema: updateChapterSchema },
      chapterController.updateChapter
    );

    // Eliminar un capítulo
    privateRoutes.delete(
      "/chapters/:id",
      { schema: deleteChapterSchema },
      chapterController.deleteChapter
    );
    // Subir imagen de capítulo
    privateRoutes.post(
      "/chapters/upload-image", // La URL para subir imágenes
      { schema: uploadChapterImageSchema }, // Aplicar el esquema de respuesta
      chapterController.uploadChapterImage
    );
  });
}

module.exports = chapterRoutes;

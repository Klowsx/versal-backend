const interactionController = require("./interaction.controller");
const {
  addInteractionToChapter,
  getInteractionsForChapter,
  deleteInteractionSchema,
} = require("./interaction.schema");

async function interactionRoutes(fastify) {
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Añadir una interacción (like/comentario) a un capítulo
    privateRoutes.post("/chapters/:id/interactions", interactionController.addInteractionToChapter);

    // Eliminar cualquier interacción por su ID
    privateRoutes.delete("/:interactionId", interactionController.deleteInteraction);
  });

  // Ruta para obtener las interacciones de un capítulo
  fastify.get("/chapters/:id/interactions", interactionController.getInteractionsForChapter);
}

module.exports = interactionRoutes;

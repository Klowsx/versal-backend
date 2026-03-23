const favoriteService = require("./favorite.service");

async function toggleFavorite(request, reply) {
  try {
    const { storyId } = request.params;
    const { userId } = request.user;
    const result = await favoriteService.toggleFavorite(userId, storyId);

    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error inesperado." });
  }
}

async function getFavoriteStories(request, reply) {
  try {
    const { userId } = request.user;
    const result = await favoriteService.getFavoriteStoriesByUser(userId);

    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error inesperado." });
  }
}

async function getIsFavorite(request, reply) {
  try {
    const { storyId } = request.params;
    const { userId } = request.user;

    console.log(
      `[Favorite Controller] Recibida petición para verificar favorito de storyId: ${storyId} por userId: ${userId}`
    );

    const result = await favoriteService.checkIsFavorite(userId, storyId);

    if (result.error) {
      console.error(`[Favorite Controller] Error en getIsFavorite: ${result.error}`);
      return reply.code(500).send({ message: result.error });
    }

    reply.code(200).send(result);
  } catch (error) {
    console.error("[Favorite Controller] Ocurrió un error inesperado en getIsFavorite:", error);
    reply
      .code(500)
      .send({ message: "Ocurrió un error inesperado al verificar el estado de favorito." });
  }
}

module.exports = {
  toggleFavorite,
  getIsFavorite,
  getFavoriteStories,
};

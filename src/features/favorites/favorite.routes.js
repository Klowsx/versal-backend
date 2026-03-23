const favoriteController = require("./favorite.controller");

async function favoriteRoutes(fastify) {
  fastify.register(async function (privateRoutes) {
    privateRoutes.addHook("onRequest", fastify.authenticate);

    // Ruta para obtener la lista de historias favoritas del usuario
    privateRoutes.get("/me/favorites", favoriteController.getFavoriteStories);

    // Ruta para añadir/quitar una historia de favoritos
    privateRoutes.post("/stories/:storyId/favorite", favoriteController.toggleFavorite);

    // Obtener si una historia es favorita para el usuario actual
    privateRoutes.get("/stories/:storyId/isFavorite", favoriteController.getIsFavorite);
  });
}

module.exports = favoriteRoutes;

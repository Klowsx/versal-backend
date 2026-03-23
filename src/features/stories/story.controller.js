const storyService = require("./story.service");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);

// Controlador para crear una nueva historia
async function createStory(request, reply) {
  try {
    const { userId } = request.user;
    const data = { authorId: userId };
    let coverImageUrl = null;

    const parts = request.parts();
    for await (const part of parts) {
      if (part.file) {
        if (part.fieldname === "coverImage") {
          const uploadDir = path.join(__dirname, `../../../uploads/covers`);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const uniqueFilename = `${Date.now()}-${part.filename}`;
          const uploadPath = path.join(uploadDir, uniqueFilename);

          await pump(part.file, fs.createWriteStream(uploadPath));

          coverImageUrl = `${request.protocol}://${request.headers.host}/uploads/covers/${uniqueFilename}`;
          data.coverImage = coverImageUrl;
        }
      } else {
        if (part.fieldname === "characters" || part.fieldname === "tags") {
          data[part.fieldname] = JSON.parse(part.value);
        } else {
          data[part.fieldname] = part.value;
        }
      }
    }

    if (!data.coverImage) {
      return reply.code(400).send({ error: "La imagen de portada es requerida." });
    }

    const result = await storyService.createStory(data);

    if (result.error) {
      return reply.code(400).send({ error: result.error });
    }

    reply.code(201).send(result);
  } catch (error) {
    console.error("Error en el controlador createStory:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al crear la historia." });
  }
}

// Controlador para obtener una historia por ID
async function getStoryById(request, reply) {
  try {
    const { id } = request.params;
    const result = await storyService.getStoryById(id);

    if (result.error) {
      return reply.code(404).send({ error: "Historia no encontrada." });
    }

    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getStoryById:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al obtener la historia." });
  }
}

// Controlador para obtener todas las historias publicadas
async function getAllStories(request, reply) {
  try {
    const filters = request.query;
    const result = await storyService.getAllStories(filters);

    if (result.error) {
      return reply.code(500).send({ error: result.error });
    }

    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getAllStories:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al obtener las historias." });
  }
}

// Controlador para obtener las historias de un autor específico
async function getStoriesByAuthor(request, reply) {
  try {
    const { userId } = request.user;
    const result = await storyService.getStoriesByAuthor(userId);

    if (result.error) {
      return reply.code(500).send({ error: result.error });
    }

    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getStoriesByAuthor:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al obtener tus historias." });
  }
}

// obtener las historias de autor por ID para perfil publico
async function getStoriesByAuthorPublic(request, reply) {
  try {
    const { authorId } = request.params;
    const result = await storyService.getPublicStoriesByAuthor(authorId);

    if (result.error) {
      return reply.code(500).send({ error: result.error });
    }

    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getStoriesByAuthorPublic:", error);
    reply
      .code(500)
      .send({ error: "Ocurrió un error inesperado al obtener las historias del autor." });
  }
}

// Controlador para actualizar una historia
async function updateStory(request, reply) {
  try {
    const { id } = request.params;
    const { userId } = request.user;

    const { story: existingStory } = await storyService.getStoryById(id);
    if (!existingStory) {
      return reply.code(404).send({ error: "Historia no encontrada." });
    }
    if (existingStory.author._id.toString() !== userId.toString()) {
      return reply.code(403).send({ error: "No tienes permiso para editar esta historia." });
    }

    const result = await storyService.updateStory(id, request.body);

    if (result.error) {
      return reply.code(400).send({ error: result.error });
    }

    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador updateStory:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al actualizar la historia." });
  }
}

//Eliminar una historia
async function deleteStory(request, reply) {
  try {
    const { id } = request.params;
    const { userId, role } = request.user;

    const { story: existingStory } = await storyService.getStoryById(id);
    if (!existingStory) {
      return reply.code(404).send({ error: "Historia no encontrada." });
    }

    const isAuthor = existingStory.author?._id.toString() === userId.toString();

    if (!isAuthor && role !== "admin") {
      return reply.code(403).send({ error: "No tienes permiso para eliminar esta historia." });
    }

    const result = await storyService.deleteStory(id);

    if (result.error) {
      return reply.code(500).send({ error: result.error });
    }

    reply.send({ message: "Historia eliminada exitosamente." });
  } catch (error) {
    console.error("Error en el controlador deleteStory:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al eliminar la historia." });
  }
}

// Controlador para obtener historias por categoría
async function getStoriesByCategory(request, reply) {
  try {
    const { categoryName } = request.params;
    const result = await storyService.getStoriesByCategory(categoryName);
    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error inesperado." });
  }
}

// Controlador para obtener historias por etiqueta
async function getStoriesByTag(request, reply) {
  try {
    const { tagName } = request.params;
    const result = await storyService.getStoriesByTag(tagName);
    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error inesperado." });
  }
}

// controlador para obtener todas las categorías
async function getAllCategories(request, reply) {
  try {
    const result = await storyService.getAllCategories();
    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getAllCategories:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al obtener las categorías." });
  }
}

// controlador para obtener todos los tags
async function getAllTags(request, reply) {
  try {
    const result = await storyService.getAllTags();
    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    console.error("Error en el controlador getAllTags:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al obtener las etiquetas." });
  }
}

module.exports = {
  createStory,
  getStoryById,
  getAllStories,
  getStoriesByAuthor,
  updateStory,
  deleteStory,
  getStoriesByCategory,
  getStoriesByTag,
  getAllCategories,
  getAllTags,
  getStoriesByAuthorPublic,
};

const fs = require("fs");
const util = require("util");
const path = require("path");
const { pipeline } = require("stream");
const pump = util.promisify(pipeline);

const chapterService = require("./chapter.service");
const { Story } = require("../../models/story.model");

// Controlador para crear un nuevo capítulo
async function createChapter(request, reply) {
  try {
    const { storyId } = request.params;
    const chapterData = request.body;

    const authorId = request.user._id;

    const result = await chapterService.createChapter({
      ...chapterData,
      story: storyId,
      author: authorId,
    });

    return reply.code(201).send({
      message: "Capítulo creado exitosamente",
      chapter: result,
    });
  } catch (error) {
    console.error("Error en createChapter controller:", error);
    return reply.code(500).send({ message: error.message });
  }
}

// Controlador para obtener capítulos por historia
async function getChaptersByStory(request, reply) {
  try {
    console.log("Obteniendo capítulos para la historia:", request.params.storyId);
    const { storyId } = request.params;
    const result = await chapterService.getChaptersByStory(storyId);

    if (result.error) {
      return reply.code(404).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al obtener los capítulos." });
  }
}

// Controlador para obtener un capítulo por ID
async function getChapterById(request, reply) {
  try {
    const { id } = request.params;
    const result = await chapterService.getChapterById(id);

    if (result.error) {
      return reply.code(404).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al obtener el capítulo." });
  }
}

// Controlador para actualizar un capítulo
async function updateChapter(request, reply) {
  try {
    const { id } = request.params;
    const { userId } = request.user;

    // Verificación de permisos
    const { chapter } = await chapterService.getChapterById(id);
    if (!chapter) {
      return reply.code(404).send({ error: "Capítulo no encontrado." });
    }
    if (chapter.story.author.toString() !== userId) {
      return reply.code(403).send({ error: "No tienes permiso para editar este capítulo." });
    }

    const result = await chapterService.updateChapter(id, request.body);

    if (result.error) {
      return reply.code(400).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al actualizar el capítulo." });
  }
}

// eliminar un capítulo
async function deleteChapter(request, reply) {
  try {
    const { id } = request.params;
    const { userId } = request.user;

    const { chapter } = await chapterService.getChapterById(id);
    if (!chapter) {
      return reply.code(404).send({ error: "Capítulo no encontrado." });
    }
    if (chapter.story.author.toString() !== userId) {
      return reply.code(403).send({ error: "No tienes permiso para eliminar este capítulo." });
    }

    const result = await chapterService.deleteChapter(id);

    if (result.error) {
      return reply.code(404).send(result);
    }
    reply.send(result);
  } catch (error) {
    reply.code(500).send({ error: "Ocurrió un error al eliminar el capítulo." });
  }
}

async function uploadChapterImage(request, reply) {
  const file = await request.file();
  const storedFileName = `${Date.now()}-${file.filename}`;
  const filePath = path.join(__dirname, "..", "..", "..", "uploads", "chapters", storedFileName);

  try {
    await pump(file.file, fs.createWriteStream(filePath));

   
    const url = `http://localhost:3000/uploads/chapters/${storedFileName}`;
    return { url };
  } catch (error) {
    console.error("Error en el controlador uploadChapterImage:", error);
    reply.code(500).send({ error: "Ocurrió un error inesperado al subir la imagen del capítulo." });
  }
}

async function getPublishedChapterCount(request, reply) {
  try {
    const { storyId } = request.params;
    const result = await chapterService.getPublishedChapterCount(storyId);

    if (result.error) {
      return reply.code(500).send(result);
    }
    reply.send(result);
  } catch (error) {
    console.error("Error en getPublishedChapterCount controller:", error);
    reply
      .code(500)
      .send({ error: "Ocurrió un error inesperado al obtener la cantidad de capítulos." });
  }
}

module.exports = {
  createChapter,
  getChaptersByStory,
  getChapterById,
  updateChapter,
  uploadChapterImage,
  deleteChapter,
  getPublishedChapterCount,
};

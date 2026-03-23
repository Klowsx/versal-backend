const mongoose = require("mongoose");
const { Story, Category, Tag } = require("../../models/story.model");
const Chapter = require("../../models/chapter.model");
const Interaction = require("../../models/interaction.model");
const User = require("../../models/user.model");
const Favorite = require("../../models/favorite.model");

async function createStory(storyData) {
  try {
    const { authorId, category: categoryName, tags: tagNames, ...rest } = storyData;

    const author = await User.findById(authorId);
    if (!author) {
      return { error: "Autor no encontrado" };
    }

    let categoryId = null;
    if (categoryName) {
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return { error: `Categoria '${categoryName}' no encontrada` };
      }
      categoryId = category._id;
    }

    let tagIds = [];
    if (tagNames && tagNames.length > 0) {
      const foundTags = await Tag.find({ name: { $in: tagNames } });
      if (foundTags.length !== tagNames.length) {
        const foundTagNames = foundTags.map((t) => t.name);
        const missingTag = tagNames.find((t) => !foundTagNames.includes(t));
        return { error: `Tag '${missingTag}' no encontrado` };
      }
      tagIds = foundTags.map((t) => t._id);
    }

    const newStory = new Story({
      ...rest,
      author: authorId,
      category: categoryId,
      tags: tagIds,
    });

    await newStory.save();

    const story = await getStoryById(newStory._id);
    return story;
  } catch (error) {
    console.error("Error al crear historia: ", error);
    return { error: `Error al crear historia: ${error.message}` };
  }
}

async function getStoryById(storyId) {
  try {
    const story = await Story.findById(storyId)
      .populate("author", "username profileImage")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    if (!story) {
      return { error: "Historia no encontrada." };
    }
    return { story };
  } catch (error) {
    console.error(`Error obteniendo historia ${storyId}:`, error);
    return { error: "Error obteniendo historia" };
  }
}

async function getAllStories(filters = {}) {
  try {
    const queryConditions = { status: "published" };

    if (filters.categoryName) {
      const category = await Category.findOne({ name: filters.categoryName }).lean();
      if (!category) return { stories: [] };
      queryConditions.category = category._id;
    }

    if (filters.tagName) {
      const tag = await Tag.findOne({ name: filters.tagName }).lean();
      if (!tag) return { stories: [] };
      queryConditions.tags = tag._id;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      queryConditions.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const stories = await Story.find(queryConditions)
      .sort({ updatedAt: -1 })
      .populate("author", "username profileImage")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    return { stories };
  } catch (error) {
    console.error("Error en getPublishedStories:", error);
    return { error: "Error al obtener historias publicadas" };
  }
}

async function getStoriesByAuthor(authorId) {
  try {
    const stories = await Story.find({ author: authorId })
      .sort({ updatedAt: -1 })
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    return { stories };
  } catch (error) {
    console.error(`Error obteniendo historias para el autor ${authorId}:`, error);
    return { error: "Failed to retrieve user's stories." };
  }
}

async function getPublicStoriesByAuthor(authorId) {
  try {
    const stories = await Story.find({ author: authorId, status: "published" })
      .sort({ updatedAt: -1 })
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    return { stories };
  } catch (error) {
    console.error(`Error obteniendo historias para el autor ${authorId}:`, error);
    return { error: "Failed to retrieve user's stories." };
  }
}

async function updateStory(storyId, updateData) {
  try {
    const { category: categoryName, tags: tagNames, ...rest } = updateData;
    const updatePayload = { ...rest };

    if (categoryName) {
      const category = await Category.findOne({ name: categoryName });
      if (!category) return { error: `Categoria '${categoryName}' no encontrada.` };
      updatePayload.category = category._id;
    }

    if (tagNames) {
      const foundTags = await Tag.find({ name: { $in: tagNames } });
      if (foundTags.length !== tagNames.length) {
        const missingTag = tagNames.find((t) => !foundTags.map((tag) => tag.name).includes(t));
        return { error: `Tag '${missingTag}' no encontrado` };
      }
      updatePayload.tags = foundTags.map((t) => t._id);
    }

    const updatedStory = await Story.findByIdAndUpdate(storyId, updatePayload, {
      new: true,
      runValidators: true,
    })
      .populate("author", "username profileImage")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    if (!updatedStory) {
      return { error: "Historia no encontrada" };
    }

    return { story: updatedStory };
  } catch (error) {
    console.error(`Error actualizando historia ${storyId}:`, error);
    return { error: "Error actualizando historia" };
  }
}

async function deleteStory(storyId) {
  console.log(` Iniciando eliminación para storyId: ${storyId}`);
  try {
    console.log(`Buscando capítulos para storyId: ${storyId}`);
    const chapters = await Chapter.find({ story: storyId }).select("_id").lean();
    const chapterIds = chapters.map((chapter) => chapter._id);
    console.log(`Capítulos encontrados: ${chapterIds.length} (IDs: ${chapterIds.join(", ")})`);

    if (chapterIds.length > 0) {
      console.log(` Eliminando interacciones para ${chapterIds.length} capítulos.`);
      const interactionsDeleteResult = await Interaction.deleteMany({
        contentId: { $in: chapterIds },
      });
      console.log(` Interacciones eliminadas: ${interactionsDeleteResult.deletedCount}`);
    } else {
      console.log(" No hay capítulos, saltando eliminación de interacciones.");
    }

    if (chapterIds.length > 0) {
      console.log(` Eliminando ${chapterIds.length} capítulos.`);
      const chaptersDeleteResult = await Chapter.deleteMany({ _id: { $in: chapterIds } });
      console.log(`Capítulos eliminados: ${chaptersDeleteResult.deletedCount}`);
    } else {
      console.log(" No hay capítulos que eliminar.");
    }

    console.log(`Eliminando favoritos para storyId: ${storyId}`);
    const favoritesDeleteResult = await Favorite.deleteMany({ storyId: storyId });
    console.log(`Favoritos eliminados: ${favoritesDeleteResult.deletedCount}`);

    console.log(`Eliminando la historia principal con ID: ${storyId}`);
    const deletedStory = await Story.findByIdAndDelete(storyId);

    if (!deletedStory) {
      console.warn(`Historia no encontrada para eliminar con ID: ${storyId}`);
      return { error: "Historia no encontrada." };
    }

    console.log(
      `Historia "${deletedStory.title}" y todos sus datos asociados eliminados exitosamente.`
    );
    return { message: "Historia y todos sus datos asociados fueron eliminados exitosamente." };
  } catch (error) {
    console.error(`ERROR al realizar la eliminación completa de la historia ${storyId}:`, error);
    return { error: "Ocurrió un error al realizar la eliminación completa de la historia." };
  }
}

async function getStoriesByCategory(categoryName) {
  try {
    const category = await Category.findOne({ name: categoryName }).lean();
    if (!category) {
      return { stories: [] };
    }

    const stories = await Story.find({ category: category._id, status: "published" })
      .sort({ updatedAt: -1 })
      .populate("author", "username profileImage")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    return { stories };
  } catch (error) {
    console.error("Error al obtener historias por categoría:", error);
    return { error: "Ocurrió un error al buscar historias por categoría." };
  }
}

async function getStoriesByTag(tagName) {
  try {
    const tag = await Tag.findOne({ name: tagName }).lean();
    if (!tag) {
      return { stories: [] };
    }

    const stories = await Story.find({ tags: tag._id, status: "published" })
      .sort({ updatedAt: -1 })
      .populate("author", "username profileImage")
      .populate("category", "name")
      .populate("tags", "name")
      .lean();

    return { stories };
  } catch (error) {
    console.error("Error al obtener historias por tag:", error);
    return { error: "Ocurrió un error al buscar historias por etiqueta." };
  }
}

async function getAllCategories() {
  try {
    const categories = await Category.find({}).lean();
    return { categories };
  } catch (error) {
    console.error("Error al obtener todas las categorías:", error);
    return { error: "Ocurrió un error al obtener las categorías." };
  }
}

async function getAllTags() {
  try {
    const tags = await Tag.find({}).lean();
    return { tags };
  } catch (error) {
    console.error("Error al obtener todos los tags:", error);
    return { error: "Ocurrió un error al obtener las etiquetas." };
  }
}

module.exports = {
  createStory,
  getStoryById,
  getAllStories,
  updateStory,
  deleteStory,
  getStoriesByAuthor,
  getStoriesByCategory,
  getStoriesByTag,
  getAllCategories,
  getAllTags,
  getPublicStoriesByAuthor,
};

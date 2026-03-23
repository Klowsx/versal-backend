const mongoose = require("mongoose"); 
const Interaction = require("../../models/interaction.model");
const { Story } = require("../../models/story.model"); 
const Chapter = require("../../models/chapter.model"); 


async function updateStoryTotalLikes(storyId) {
  try {
    
    const totalLikesResult = await Interaction.aggregate([
      {
        $lookup: {
          from: "chapters", 
          localField: "contentId", 
          foreignField: "_id", 
          as: "chapterInfo",
        },
      },
      {
        $unwind: "$chapterInfo", 
      },
      {
        $match: {
          "chapterInfo.story": new mongoose.Types.ObjectId(storyId), 
          interactionType: "like", 
        },
      },
      {
        $group: {
          _id: null, 
          totalLikes: { $sum: 1 },
        },
      },
    ]);

    const newTotalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;


    await Story.findByIdAndUpdate(storyId, { totalLikes: newTotalLikes });
    console.log(`Story ${storyId} totalLikes updated to ${newTotalLikes}`);
  } catch (error) {
    console.error(`Error updating totalLikes for story ${storyId}:`, error);
  }
}

// Función para añadir una interacción (like o comentario)
async function addInteractionToChapter({ chapterId, userId, interactionType, text }) {
  try {
    if (interactionType === "like") {
      const existingLike = await Interaction.findOne({
        contentId: chapterId,
        userId,
        interactionType: "like",
      });

      let storyId = null;
      const chapter = await Chapter.findById(chapterId);
      if (chapter && chapter.story) {
        storyId = chapter.story;
      }

      if (existingLike) {
        await existingLike.deleteOne(); 
        if (storyId) {
          await updateStoryTotalLikes(storyId); 
        }
        return { status: "unliked", message: "Me gusta quitado." };
      } else {
        const like = await Interaction.create({ contentId: chapterId, userId, interactionType }); 
        if (storyId) {
          await updateStoryTotalLikes(storyId); 
        }
        return { status: "liked", like, message: "¡Me gusta!" };
      }
    }

    if (interactionType === "comment") {
      if (!text) return { error: "El texto del comentario es requerido." };
      const comment = await Interaction.create({
        contentId: chapterId,
        userId,
        interactionType,
        text,
      });
      return { comment, message: "Comentario publicado." };
    }

    return { error: "Tipo de interacción inválido." };
  } catch (error) {
    return { error: `Error al añadir la interacción: ${error.message}` };
  }
}

// Función para obtener las interacciones (likes y comentarios) de un capítulo
async function getInteractionsForChapter(chapterId) {
  try {
    const interactions = await Interaction.find({ contentId: chapterId })
      .populate("userId", "username profileImage")
      .sort({ createdAt: "desc" });

    return { interactions };
  } catch (error) {
    return { error: `Error al obtener las interacciones: ${error.message}` };
  }
}

// Función para eliminar una interacción
async function deleteInteraction({ interactionId, userId, userRole }) {
  try {
    const interaction = await Interaction.findById(interactionId);
    if (!interaction) {
      return { error: "Interaction not found." };
    }

    if (interaction.userId.toString() !== userId.toString() && userRole !== "admin") {
      return { error: "Unauthorized to delete this interaction." };
    }

    const isLike = interaction.interactionType === "like";
    const chapterIdAffected = interaction.contentId; 

    await interaction.deleteOne(); 

    if (isLike) {
    
      const chapter = await Chapter.findById(chapterIdAffected);
      if (chapter && chapter.story) {
    
        await updateStoryTotalLikes(chapter.story);
      }
    }
    return { message: "Interaction deleted successfully." };
  } catch (error) {
    return { error: `Failed to delete interaction: ${error.message}` };
  }
}

module.exports = {
  getInteractionsForChapter,
  addInteractionToChapter,
  deleteInteraction,
};

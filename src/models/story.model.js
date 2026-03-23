const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const StorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    coverImage: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    characters: [{ name: String, description: String }],
    language: { type: String, default: "Español" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    chapterCount: { type: Number, default: 0 },
    isAdultContent: { type: Boolean, default: false },
    totalLikes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);
const Tag = mongoose.model("Tag", TagSchema);
const Story = mongoose.model("Story", StorySchema);

// --- Precarga de datos por defecto ---
async function seedDefaults() {
  const defaultCategories = [
    "Accion",
    "Aventura",
    "Romance",
    "Fantasia",
    "Terror",
    "Misterio",
    "Ciencia Ficción",
    "Drama",
    "Juvenil",
  ];
  const defaultTags = [
    "Drama",
    "Dragones",
    "Magia",
    "Aventura",
    "Comedia",
    "Romance",
    "Accion",
    "Misterio",
    "Vampiros",
    "Superhéroes",
  ];

  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Sembrando datos por defecto si es necesario...");
      await Category.bulkWrite(
        defaultCategories.map((name) => ({
          updateOne: {
            filter: { name },
            update: { $setOnInsert: { name } },
            upsert: true,
          },
        }))
      );
      await Tag.bulkWrite(
        defaultTags.map((name) => ({
          updateOne: {
            filter: { name },
            update: { $setOnInsert: { name } },
            upsert: true,
          },
        }))
      );
      console.log("Datos por defecto sembrados.");
    }
  } catch (error) {
    console.error("Error al sembrar datos por defecto:", error);
  }
}

mongoose.connection.once("open", seedDefaults);

module.exports = { Category, Tag, Story };

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);

const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      require: true,
    },
    label: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

var Dishes = mongoose.model("Dish", dishSchema);
Dishes.collection.createIndex({ name: 1 }, { unique: true });
module.exports = Dishes;

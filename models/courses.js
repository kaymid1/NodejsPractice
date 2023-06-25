const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("strictQuery", false);
const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const courseSchema = new Schema(
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

var Courses = mongoose.model("Course", courseSchema);
Courses.collection.createIndex({ name: 1 }, { unique: true });
module.exports = Courses;

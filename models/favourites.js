const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dishes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
  ],
});

const Favourites = mongoose.model("Favourite", favouriteSchema);

module.exports = Favourites;

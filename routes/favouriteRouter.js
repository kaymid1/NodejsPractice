const express = require("express");
const mongoose = require("mongoose");
const Favourites = require("../models/favourites");

const favouriteRouter = express.Router();
var authenticate = require("../authenticate");
const cors = require("./cors");
favouriteRouter.use(express.json());
//create, read,update
favouriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res) => {
    Favourites.find(req.query)
      .then(
        (favourite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favourite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then((favourite) => {
        if (favourite) {
          const dishIds = req.body.map((dish) => dish._id);
          // Add the dishes to the existing favourite
          for (let i = 0; i < dishIds.length; i++) {
            if (favourite.dishes.indexOf(dishIds[i]) === -1) {
              favourite.dishes.push(dishIds[i]);
            } else {
              // Dish ID already exists in the favourites dishes list
              return res.status(400).json({
                success: false,
                message: `Dish with ID ${dishIds[i]} is already in the favourites list.`,
              });
            }
          }
          favourite
            .save()
            .then((updatedFavourite) => {
              Favourites.findById(updatedFavourite._id)
                .populate("user")
                .populate("dishes")
                .then((populatedFavourite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(populatedFavourite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        } else {
          // Create a new favorite if it doesn't exist for the user
          Favourites.create({ user: req.user._id, dishes: req.body })
            .then((newFavourite) => {
              Favourites.findById(newFavourite._id)
                .populate("user")
                .populate("dishes")
                .then((populatedFavourite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(populatedFavourite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT opertaion not supported on /favourites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.deleteMany({})
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favouriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite
            .save()
            .then((favorite) => {
              Favourites.findById(favorite._id)
                .populate("user")
                .populate("dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        } else {
          Favorites.create({
            user: req.user._id,
            dishes: [{ _id: req.params.dishId }],
          })
            .then((newFavorite) => {
              Favourites.findById(newFavorite._id)
                .populate("user")
                .populate("dishes")
                .then((newFavorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(newFavorite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favourites/:dishId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          const index = favorite.dishes.indexOf(req.params.dishId);
          if (index !== -1) {
            favorite.dishes.splice(index, 1);
            favorite
              .save()
              .then(() => {
                Favourites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  })
                  .catch((err) => next(err));
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, message: "Favourite not found" });
          }
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, message: "Favourite not found" });
        }
      })
      .catch((err) => next(err));
  });

module.exports = favouriteRouter;

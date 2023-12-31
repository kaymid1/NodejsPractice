const express = require("express");
const mongoose = require("mongoose");
const Dishes = require("../models/dishes");
const dishRouter = express.Router();
var authenticate = require("../authenticate");
const cors = require("./cors");
dishRouter.use(express.json());
//create, read, update => dish
dishRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
      .populate("comment.author")
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      console.log("Post function processing");
      console.log(req.body);
      Dishes.create(req.body)
        .then(
          (dish) => {
            console.log("Dish created ", dish);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /dishes");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.deleteMany({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
dishRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comment.author")
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end("POST operation not supported on /dishes/" + req.params.dishId);
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(
          (dish) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
dishRouter
  .route("/:dishId/comments")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (res, req, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comment.author")
      .then(
        (dish) => {
          if (dish != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            err = new Error("Dish " + req.params.dishId + "not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              dish.comments.push(req.body);
              dish.save().then(
                (dish) => {
                  Dishes.findById(dish._id)
                    .populate("comment.author")
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(dish);
                    });
                },
                (err) => next(err)
              );
            } else {
              err = new Error("Dish " + req.params.dishId + "not found");
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        "PUT operation not supported on /dishes/" +
          req.params.dishId +
          "/comments"
      );
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              for (var i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
              }
              dish.save().then(
                (dish) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                },
                (err) => next(err)
              );
            } else {
              err = new Error("Dish " + req.params.dishId + " not found");
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
dishRouter
  .route("/:dishId/comments/:commentId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comment.author")
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            err = new Error("Dish " + req.params.dishId + "not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        "POST operation not supported on /dishes/" +
          req.params.dishId +
          "/comments" +
          req.params.commentId
      );
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Update a comment
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;
    const authorId = req.user._id; // Corrected line

    // Find the comment by commentId and dishId
    Dishes.findById(dishId)
      .then((dish) => {
        if (dish && dish.comments.id(commentId)) {
          // Check if the user is the author of the comment
          if (dish.comments.id(commentId).author.equals(authorId)) {
            // Update the comment
            if (req.body.rating) {
              console.log("Old rating:", dish.comments.id(commentId).rating);
              console.log("New rating:", req.body.rating);
              dish.comments.id(commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
              console.log("Old comment:", dish.comments.id(commentId).comment);
              console.log("New comment:", req.body.comment);
              dish.comments.id(commentId).comment = req.body.comment;
            }

            // Mark the parent document as modified
            dish.markModified("comments");

            dish
              .save()
              .then((dish) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              })
              .catch((err) => next(err));
          } else {
            // User is not the author of the comment
            const err = new Error(
              "You are not authorized to update this comment!"
            );
            err.status = 403;
            return next(err);
          }
        } else {
          // Dish or comment not found
          const err = new Error("Dish or comment not found!");
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;
    const userId = req.user._id;

    Dishes.findById(dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(commentId) != null) {
          // Check if the user is the author of the comment
          if (dish.comments.id(commentId).author.equals(userId)) {
            const oldComment = dish.comments.id(commentId).comment; // Store old comment text
            dish.comments.id(commentId).remove();
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then((dish) => {
                    console.log("Old comment text:", oldComment); // Log the old comment text
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
              },
              (err) => next(err)
            );
          } else {
            // User is not the author of the comment
            const err = new Error(
              "You are not authorized to delete this comment!"
            );
            err.status = 403; // Forbidden status code
            return next(err);
          }
        } else if (dish == null) {
          const err = new Error("Dish " + dishId + " not found");
          err.status = 404; // Not Found status code
          return next(err);
        } else {
          const err = new Error("Comment " + commentId + " not found");
          err.status = 404; // Not Found status code
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = dishRouter;

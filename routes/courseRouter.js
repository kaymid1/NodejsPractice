const express = require("express");
const mongoose = require("mongoose");
const Courses = require("../models/courses");
const cors = require("./cors");
const courseRouter = express.Router();
var authenticate = require("../authenticate");
courseRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Courses.find({})
      .populate("review.author")
      .then(
        (courses) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(courses);
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
      Courses.create(req.body)
        .then(
          (course) => {
            console.log("Course created", course);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(course);
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
      res.end("PUT operation not supported on /courses");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Courses.deleteMany({})
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
courseRouter
  .route("/:courseId")
  .options(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Courses.findById(req.params.courseId)
      .populate("review.author")
      .then(
        (course) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(course);
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
        "POST operation not supported on /courses/" + req.params.courseId
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Courses.findByIdAndUpdate(
        req.params.courseId,
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
      Courses.findOneAndRemove(req.params.courseId)
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

module.exports = courseRouter;

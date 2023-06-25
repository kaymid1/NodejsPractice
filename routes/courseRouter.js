const express = require("express");
const mongoose = require("mongoose");
const Courses = require("../models/courses");
const courseRouter = express.Router();
var authenticate = require("../authenticate");
courseRouter
  .route("/")
  .get((req, res, next) => {
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
  });
module.exports = courseRouter;

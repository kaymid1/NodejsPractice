var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
var User = require("../models/users");
var passport = require("passport");
var authenticate = require("../authenticate");
const { verifyUser } = require("../authenticate");
const { verifyAdmin } = require("../authenticate");
const { verifyOrdinaryUser } = require("../authenticate");
const favouriteRouter = require("./favouriteRouter");
const cors = require("./cors");
router.use(bodyParser.json());
/* GET users listing. */
router.get(
  "/",
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find({})
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        next(err);
      });
  }
);
//profile
router.get("/profile", authenticate.verifyOrdinaryUser, (req, res) => {
  // Access the authenticated user's profile
  // The user object is available in req.user
  const user = req.user;
  const role = req.user.admin ? "Admin" : "User";
  res.json({
    message: `Welcome, ${role} ${user.username}! This is your profile.`,
  });
});

//dang ki
router.post("/signup", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        if (err) {
          res.statusCode = 500;
          res.setHeader("Conetent-Type", "application/json");
          res.json({ err: err });
          return;
        }
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ sucess: true, status: "Registration Sucessful" });
        });
      }
    }
  );
});
router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  // const token = jwt.sign(
  //   { username: req.user.username },
  //   "your-secret-key-goes-here"
  // );
  // Check if the user has admin privileges
  const role = req.user.admin ? "Admin" : "User";
  res.json({
    success: true,
    role: role,
    token: token,
    status: "You are successfully logged in",
  });
});
router.post("/login", (req, res, next) => {
  if (!req.session.user) {
    var authHeader = req.headers.authorization;

    if (!authHeader) {
      var err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var username = auth[0];
    var password = auth[1];

    User.findOne({ username: username })
      .then((user) => {
        if (user === null) {
          var err = new Error("User " + username + " does not exist!");
          err.status = 403;
          return next(err);
        } else if (user.password !== password) {
          var err = new Error("Your password is incorrect!");
          err.status = 403;
          return next(err);
        } else if (user.username === username && user.password === password) {
          req.session.user = "authenticated";
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("You are authenticated!");
        }
      })
      .catch((err) => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("You are already authenticated!");
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

favouriteRouter
  .route("/")
  .get(cors.cors, (req, res, next) => {
    Favourites.find({})
      .populate("user")
      .populate("dishes")
      .then((favourites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favourites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then((favourite) => {
        if (favourite) {
          for (let i = 0; i < req.body.length; i++) {
            if (favourite.dishes.indexOf(req.body[i]._id) < 0) {
              favourite.dishes.push(req.body[i]);
            }
          }
          favourite
            .save()
            .then((favourite) => {
              Favourites.findById(favourite._id)
                .populate("user")
                .populate("dishes")
                .then((favourite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favourite);
                });
            })
            .catch((err) => next(err));
        } else {
          Favourites.create({ user: req.user._id, dishes: req.body })
            .then((newFavourite) => {
              Favourites.findById(newFavourite._id)
                .populate("user")
                .populate("dishes")
                .then((newFavourite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(newFavourite);
                });
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  });
favouriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Favourites.find({ dishes: req.params.dishId })
      .populate("user")
      .populate("dishes")
      .then((favourites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favourites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOne({ user: req.user._id })
      .then((favourite) => {
        if (favourite) {
          if (favourite.dishes.indexOf(req.params.dishId) === -1) {
            favourite.dishes.push(req.params.dishId);
            favourite
              .save()
              .then((favourite) => {
                Favourites.findById(favourite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favourite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favourite);
                  });
              })
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favourite);
          }
        } else {
          Favourites.create({ user: req.user._id, dishes: [req.params.dishId] })
            .then((newFavourite) => {
              Favourites.findById(newFavourite._id)
                .populate("user")
                .populate("dishes")
                .then((newFavourite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(newFavourite);
                });
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
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favourites.findOne({ user: req.user._id })
        .then((favourite) => {
          if (favourite) {
            const index = favourite.dishes.indexOf(req.params.dishId);
            if (index !== -1) {
              favourite.dishes.splice(index, 1);
              favourite
                .save()
                .then(() => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({
                    success: true,
                    message: "Favourite removed successfully",
                  });
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
    }
  );

module.exports = router;

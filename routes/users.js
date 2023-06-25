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

module.exports = router;

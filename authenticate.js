var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/users");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtraJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign , and verify token
var config = require("./config.js");
const { ExtractJwt } = require("passport-jwt");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);
exports.verifyUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error = new Error("You are not authenticated!");
      error.status = 401;
      return next(error);
    }
    // Store the user's ID as the author
    req.author = user._id;
    next();
  })(req, res, next);
};

exports.verifyAdmin = (req, res, next) => {
  // Check if the user is an Admin
  if (req.user && req.user.admin) {
    // User is an Admin, continue to the next middleware
    next();
  } else {
    // User is not an Admin, return an error
    const err = new Error("You are not authorized to perform this operation!");
    err.status = 403; // Forbidden status code
    return next(err);
  }
};
exports.verifyOrdinaryUser = (req, res, next) => {
  // Check if the user's token is valid and retrieve user information
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // User authentication failed
      const error = new Error("You are not authenticated!");
      error.status = 401; // Unauthorized status code
      return next(error);
    }
    // User authentication successful
    req.user = user; // Assign the user object to the request object
    next();
  })(req, res, next);
};

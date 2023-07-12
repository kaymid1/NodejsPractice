const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
var config = require("./config.js");
// var FacebookTokenStrategy = require("passport-facebook-token");
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
    User.findOne({ _id: jwt_payload._id })
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);
exports.verifyAdmin = function (req, res, next) {
  if (req.user.admin) {
    return next();
  } else {
    var err = new Error("You are not admin to perform this operation!");
    err.status = 403;
    return next(err);
  }
};

exports.verifyUser = passport.authenticate("jwt", { session: false });

// exports.facebookPassport = passport.use(
//   new FacebookTokenStrategy(
//     {
//       clientID: config.facebook.clientId,
//       clientSecret: config.facebook.clientSecret,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       User.findOne({ facebookId: profile.id }).then((user) => {
//         if (user) {
//           return done(null, user);
//         } else {
//           user = new User({ username: profile.displayName });
//           user.facebookId = profile.id;
//           user.firstname = profile.name.givenName;
//           user.lastname = profile.name.familyName;
//           user.save().then(
//             (user) => {
//               return done(null, user);
//             },
//             (err) => {
//               return done(err, false);
//             }
//           );
//         }
//       });
//     }
//   )
// );

const mongoose = require("mongoose");
const Dishes = require("./models/dishes");
var config = require("./config.js");
const url = config.mongoUrl;
// const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leadersRouter = require("./routes/leaderRouter");
const favoriteRouter = require("./routes/favoriteRouter");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const cors = require("cors");
var app = express();
var session = require("express-session");
var FileStore = require("session-file-store")(session);
var passport = require("passport");
var authenticate = require("./authenticate");
var commentRouter = require("./routes/commentRouter");
const port = 8000; // Specify the port you want to use
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
connect.then(
  (db) => {
    console.log("Connected to the server");
  },
  (err) => {
    console.log(err);
  }
);

app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Enable CORS middleware
app.use(cors());
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(passport.initialize());
app.use(passport.session());

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leadersRouter);
app.use("/favorites", favoriteRouter);
app.use("/comments", commentRouter);
//cookie
// app.use(cookieParser("12345-67890"));
app.use(auth); // Require auth middleware function

function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) {
    var err = new Error("You are not authenticated!");
    err.status = 403;
    next(err);
  } else {
    next();
  }
}

// function sessionAuth(req, res, next) {
//   console.log(req.session);
//   if (!req.session.user) {
//     var err = new Error("You are not authenticated!");
//     err.status = 403;
//     return next(err);
//   } else {
//     if (req.session.user === "authenticated") {
//       next();
//     } else {
//       var err = new Error("You are not authenticated!");
//       err.status = 403;
//       return next(err);
//     }
//   }
// }
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

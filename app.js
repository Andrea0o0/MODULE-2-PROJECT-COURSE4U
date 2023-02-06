require("dotenv").config();
require("./db");
const hbs = require('hbs')
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const User = require("./models/User");

// Routers require
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const coursesRouter = require("./routes/courses");
const mongoose = require("mongoose");
mongoose.set("strictPopulate", false);

const app = express();

// cookies and loggers
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

// For deployment
app.set("trust proxy", 1);
app.use(
  session({
    name: "course4u-cookie",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 2592000000, // 30 days in milliseconds
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + '/views/partials');
// that takes in a string and a length and returns a truncated version of the string, limited to the specified length.
hbs.registerHelper('truncate', function(str, length) {
  return str.slice(0, length);
});


// routes intro
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/courses", coursesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  if (err.status === 404) {
    res.render("404", { path: req.url });
  } else {
    res.status(err.status || 500);
    res.render("error");
  }
});

module.exports = app;

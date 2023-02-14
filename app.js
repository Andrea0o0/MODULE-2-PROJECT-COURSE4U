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
// const passport = require("passport");

// Routers require
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const coursesRouter = require("./routes/courses");
const reviewsRouter = require('./routes/reviews');
const mongoose = require("mongoose");
mongoose.set("strictPopulate", false);

const app = express();

// cookies and loggers
app.use(logger("dev"));
app.use(express.json());
// app.use(passport.initialize());
// app.use(passport.session());
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

// const facebookStrategy = require("passport-facebook").Strategy;
//facebook login 
// passport.use(new facebookStrategy({
//   clientID : "1233841630868265",
//   clientSecret:  process.env.clientSecret,
//   profileFields : [ "id", 'displayName', 'name', 'gender', 'email', 'picture.type(large)'  ]
// },
// function(token, refreshToken, profile, done) {
//   console.log(profile);
//   return done(null, profile);
// }))
// app.use('/auth/facebook' , passport.authenticate('facebook', {scope:'email'})) ;
// app.use('facebook/callback', passport.authenticate('facebook', {
//   successRedirect: '/profile',
//   failurerediredirec:'/failed'
// }))
// app.use'/profile', (req, res, next) => {
//   res.send("You are a valid user")
// } 



//google login 
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
 
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: "your Google client id here",
//       clientSecret: "your Google client secret here",
//       callbackURL: "/auth/google/callback"
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // to see the structure of the data in received response:
//       console.log("Google account details:", profile);
 
//       User.findOne({ googleID: profile.id })
//         .then(user => {
//           if (user) {
//             done(null, user);
//             return;
//           }
 
//           User.create({ googleID: profile.id })
//             .then(newUser => {
//               done(null, newUser);
//             })
//             .catch(err => done(err)); // closes User.create()
//         })
//         .catch(err => done(err)); // closes User.findOne()
//     }
//   )
// );

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
app.use('/reviews', reviewsRouter);



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

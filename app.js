const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const campground = require('./routes/campground')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport')
const localStrategies = require('passport-local')
const User = require('./models/user');
const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(express.static("src"));

mongoose.connect("mongodb://localhost:27017/campgrounds", {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(flash());
app.use(session(sessionConfig))


app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategies(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


app.use('/campgrounds', campground)


app.get("/", (req, res) => {
  res.render("home");
});


app.all("*", (req, res, next) => {
  next(new expressError("Page note found", 400));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen("3000", () => {
  console.log("Listening on port 3000");
});

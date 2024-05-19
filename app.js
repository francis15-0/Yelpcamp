const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const campground = require("./models/campground");
const Review = require("./models/reviews");
const catchAsync = require("./utils/CatchAsync");
const expressError = require("./utils/ExpressError");
const makeAsync = require("./utils/CatchAsync");
const joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schema");
const { title } = require("process");
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

const validate = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  console.log(req.body);
  if (error) {
    console.log(error.details);
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    console.log(error.details);
    const msg = error.details.map((el) => el.message).join(",");
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const camp = await campground.find({});
    res.render("index", { camp });
  }),
);

app.get("/campgrounds/new", (req, res) => {
  res.render("new");
});

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await campground.findById(id).populate('reviews');
    console.log(foundCamp)
    res.render("show", { foundCamp });
  }),
);

app.post(
  "/campgrounds",
  validate,
  catchAsync(async (req, res) => {
    const { camp } = req.body;
    const newCamp = new campground({
      title: camp.title,
      location: camp.location,
      description: camp.description,
      price: camp.price,
    });
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp.id}`);
  }),
);

app.get(
  "/campgrounds/:id/edit",
  makeAsync(async (req, res) => {
    const { id } = req.params;
    const foundCamp = await campground.findById(id);
    res.render("edit", { foundCamp });
  }),
);

app.patch(
  "/campgrounds/:id/edit",
  validate,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { camp } = req.body;
    console.log(camp, id);
    const update = await campground.findByIdAndUpdate(
      id,
      { title: camp.title, location: camp.location, price: camp.price },
      { new: true, runValidators: true },
    );
    console.log(update);
    res.redirect(`/campgrounds/${update._id}`);
  }),
);

app.post("/campgrounds/:id/review", validateReview, catchAsync(async (req, res) => {
  // const {review} = req.body
  const { id } = req.params;
  console.log(id)
  const camp = await campground.findById(req.params.id);
  const rev = new Review(req.body.review);
  camp.reviews.push(rev);
  console.log(camp.id)
  await camp.save();
  await rev.save();

  res.redirect(`/campgrounds/${camp._id}`)
}));


app.delete(
  "/campgrounds/:id/delete",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  }),
);

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))



app.all("*", (req, res, next) => {
  next(new expressError("Page note found", 400));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err)
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen("3000", () => {
  console.log("Listening on port 3000");
});

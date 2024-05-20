const express = require("express");
const router = express.Router()

const campground = require("../models/campground");

const catchAsync = require("../utils/CatchAsync");
const expressError = require("../utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("../schema");
const Review = require("../models/reviews");

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

router.get(
    "/",
    catchAsync(async (req, res) => {
      const camp = await campground.find({});
      res.render("index", { camp });
    }),
  );
  
  router.get("/new", (req, res) => {
    res.render("new");
  });
  
  router.get(
    "/:id",
    catchAsync(async (req, res) => {
      const { id } = req.params;
      const foundCamp = await campground.findById(id).populate('reviews');
      res.render("show", { foundCamp });
    }),
  );
  
  router.post(
    "/",
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
  
  router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
      const { id } = req.params;
      const foundCamp = await campground.findById(id);
      res.render("edit", { foundCamp });
    }),
  );
  
  router.patch(
    "/:id/edit",
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
  
  router.post("/:id/review", validateReview, catchAsync(async (req, res) => {
    // const {review} = req.body
    const { id } = req.params;
    const camp = await campground.findById(req.params.id);
    const rev = new Review(req.body.review);
    camp.reviews.push(rev);
    await camp.save();
    await rev.save();
  
    res.redirect(`/campgrounds/${camp._id}`)
  }));
  
  
  router.delete(
    "/:id/delete",
    catchAsync(async (req, res) => {
      const { id } = req.params;
      await campground.findByIdAndDelete(id);
      res.redirect("/campgrounds");
    }),
  );
  
  router.delete('/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  }))


  module.exports = router;
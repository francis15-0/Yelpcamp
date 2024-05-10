const mongoose = require("mongoose");
const cities = require("../seed/cities");
const campgrounds = require("../models/campground");
const { descriptors, places } = require("../seed/seedHelper");
mongoose.connect("mongodb://localhost:27017/campgrounds").then(() => {
  console.log("Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await campgrounds.deleteMany({});
  for (let i = 0; i < 50; i++) {
    let rand1000 = Math.floor(Math.random() * 1000);
    const camp = new campgrounds({
      location: `${cities[rand1000].city} ${cities[rand1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://picsum.photos/200/300",
      price: Math.floor(Math.random() * 20) + 10,
      description: `Lorem Ipsum is simply dummy text of the printing and typesetting 
        industry. Lorem Ipsum has been the industrys standard dummy text ever since the 
        1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
         It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`
    });

    await camp.save();
  }
};

seedDB()
  .then(() => {
    console.log("database created");
  })
  .catch((err) => {
    console.log(err);
  });

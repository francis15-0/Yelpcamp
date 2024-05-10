const mongoose = require('mongoose');
const shema = mongoose.Schema;

const campgroundSchema = new shema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String
})

module.exports = mongoose.model('campground', campgroundSchema);
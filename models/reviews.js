const mongoose = require('mongoose');
const Shema = mongoose.Schema;

const reviewSchema = new Shema({
    rating: Number,
    body: String
})

module.exports = mongoose.model('Review', reviewSchema)
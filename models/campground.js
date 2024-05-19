const mongoose = require('mongoose');
const reviews = require('./reviews');
const { ref } = require('joi');
const shema = mongoose.Schema;

const campgroundSchema = new shema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    reviews: [{type: shema.Types.ObjectId, ref: 'Review'}]
})


campgroundSchema.post('findOneAndDelete', async (doc)=>{
    if(doc){
        await reviews.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('campground', campgroundSchema);
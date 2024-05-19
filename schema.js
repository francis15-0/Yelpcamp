const joi = require('joi')
module.exports.campgroundSchema = joi.object({
    camp: joi.object({
    title: joi.string().required(),
    price: joi.number().required(),
    location: joi.string().required(),
    description: joi.string().required()

}).required()

})




module.exports.reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        body: joi.string().required()
    }).required()

})
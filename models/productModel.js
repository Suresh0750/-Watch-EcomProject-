

const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    parentCategory:{
        type: String,
        required: true
    },
    productImage1:{
        type: String,
    },
    productImage2:{
        type: String,
    },
    productImage3:{
        type: String,
    },
    productPrice:{
        type: Number,
        required: true
    },
    productStock: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    productSold:{
        type: Number,
        default:0
    },
  productOfferId: { type: mongoose.Types.ObjectId, default: null },
  productOfferPercentage: { type: Number, default: null },
  priceBeforeOffer: { type: Number, default: null },
  productafterOfferPrice: { type: Number, default: null },
})

const productCollection= mongoose.model('products',productSchema)

module.exports= productCollection

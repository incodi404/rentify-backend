import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    homeName: String,
    floor: String,
    numberOfBedroom: Number,
    numberOfKitchen: Number,
    homeSize: Number,
    numberOfBathroom: Number,
    numberOfDiningRoom: Number,
    haveAnyGarden: Boolean,
    numberOfBalcony: Number,
    haveTerrace: Boolean,
    howOldTheHouse: String,
    moreDetails: String,
    address: String,
    landMark: String,
    nearByPlace: String,
    howFarFromNearestHospital: String,
    rent: Number,
    otherCharges: Number,
    totalRent: Number,
    photosId: [{
        type: String
    }],
    city: String,
    district: String,
    state: String,
    date: String,
    interested : {
        type: Number,
        default: 0
    }
})

export const Post = mongoose.model("Post", postSchema)
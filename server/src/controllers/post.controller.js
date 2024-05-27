import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { asynchandler } from "../utils/asynchandler.utils.js";
import { allNumberValidation } from "../utils/validation.utils.js";
import { Post } from "../models/post.model.js"

const createPost = asynchandler(async (req, res) => {
    const { homeName, floor, numberOfBedroom, numberOfKitchen, homeSize, numberOfBathroom, numberOfDiningRoom, haveAnyGarden, numberOfBalcony, haveTerrace, howOldTheHouse, moreDetails, address, landMark, nearByPlace, howFarFromNearestHospital, rent, otherCharges, totalRent, city, district, state } = req.body

    const user = req.user

    if (!user) { return res.status(400).json(ApiError(400, "User not found!")) }

    if (user?.designation != "seller") { return res.status(400).json(ApiError(400, "You are not a seller!")) }

    if (
        [homeName, floor, numberOfBedroom, numberOfKitchen, homeSize, numberOfBathroom, address, rent, totalRent, otherCharges].some((field) => field === "")
    ) {
        return res.status(400).json(ApiError(400, "Every field is required!"))
    }

    if (
        [numberOfBedroom, numberOfKitchen, homeSize, numberOfBathroom, numberOfDiningRoom, numberOfBalcony, rent, otherCharges, totalRent].some((field) => allNumberValidation(Number(field)) != true)
    ) {
        return res.status(400).json(ApiError(400, "Some number is invalid!"))
    }

    const date = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    const formattedDate = date.toLocaleString('en-GB', options);

    const post = await Post.create({
        sellerId: user._id,
        homeName,
        floor,
        numberOfBedroom,
        numberOfKitchen,
        homeSize,
        numberOfBathroom,
        numberOfDiningRoom,
        haveAnyGarden,
        numberOfBalcony,
        haveTerrace,
        howOldTheHouse,
        moreDetails,
        address: address?.toLowerCase(),
        landMark: landMark?.toLowerCase(),
        nearByPlace: nearByPlace?.toLowerCase(),
        howFarFromNearestHospital,
        rent,
        otherCharges,
        totalRent,
        city: city?.toLowerCase(),
        district: district?.toLowerCase(),
        state: state?.toLowerCase(),
        date: formattedDate
    })

    if (!post) { return res.status(500).json(ApiError(500, "Post failed!")) }

    return res.status(200).json(ApiResponse(200, "Post successfull", post))
})

const updatePost = asynchandler(async (req, res) => {

    const {postId} = req.body

    if(!postId) {return res.status(400).json(ApiError(400, "Post id not found!"))}

    const fields = Object.keys(req.body)

    let updateData = {}

    fields.map((field)=>{
        const fieldData = req?.body[field]
        if(fieldData?.length>0) {
            updateData[field] = fieldData
        }
    })

    const user = req.user

    if (!user) { return res.status(400).json(400, "User not found!") }

    const existedPost = await Post.updateMany({ _id: postId, sellerId: user._id }, updateData)

    if (!existedPost) { return res.status(400).json(ApiError(400, "Post not found!")) }

    if (existedPost.length === 0) { return res.status(400).json(ApiError(400, "User invalid!")) }

    return res.status(200).json(ApiResponse(200, "Post found!", existedPost))
})

const deletePost = asynchandler(async (req, res) => {
    const { postId } = req.body

    if (!postId) { return res.status(400).json(400, "Post id required!") }

    const user = req.user

    if (!user) { return res.status(400).json(400, "User not found!") }

    const post = await Post.deleteMany({ _id: postId, sellerId: user._id })

    if (post.deletedCount === 0) { return res.status(400).json(ApiError(400, "Post not deleted!", user)) }

    return res.status(200).json(ApiResponse(200, "Post deleted successfully!"))

})

export {
    createPost,
    updatePost,
    deletePost
}
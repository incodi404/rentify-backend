import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { Interested } from "../models/interested.model.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { asynchandler } from "../utils/asynchandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

const allPost = asynchandler(async (req, res) => {
    const user = req.user

    if (!user) { return res.status(400).json(ApiError(400, "You are not logged in!")) }

    const posts = await Post.aggregate([
        {
            '$lookup': {
                'from': 'users',
                'localField': 'sellerId',
                'foreignField': '_id',
                'as': 'sellerId'
            }
        }, {
            '$addFields': {
                'sellerId': {
                    '$first': '$sellerId'
                }
            }
        }
    ])

    if (!posts) { return res.status(400).json(ApiError(400, "There is no post!")) }

    return res.status(200).json(ApiResponse(200, "Post fetched successfully!", posts))
})

const myPost = asynchandler(async (req, res) => {
    const user = req.user

    if (user.designation != "seller") { return res.status(400).json(ApiError(400, "You are not a seller!")) }

    if (!user) { return res.status(400).json(ApiError(400, "You are not logged in!")) }

    const posts = await Post.aggregate([
        {
            '$match': {
                'sellerId': new mongoose.Types.ObjectId(user?._id)
            }
        }
    ])

    if (!posts) { return res.status(400).json(ApiError(400, "There is no post!")) }

    return res.status(200).json(ApiResponse(200, "Post fetched successfully!", posts))
})

const getSinglePost = asynchandler(async (req, res) => {
    const { postId } = req.params

    if (!postId) { return res.status(400).json(ApiError(400, "Post id reuired!")) }

    const post = await Post.findById(postId)

    if (!post) { return res.status(500).json(ApiError(500, "Post not found!")) }

    return res.status(200).json(ApiResponse(400, "Post fetched successflly!", post))
})

const interestedData = asynchandler(async (req, res) => {
    const user = req.user

    if (user.designation != "buyer") { return res.status(400).json(ApiError(400, "You are not a buyer!")) }

    if (!user) { return res.status(400).json(ApiError(400, "You are not logged in!")) }

    const interestedPosts = await Interested.aggregate([
        {
            '$match': {
                'userId': new mongoose.Types.ObjectId(user?._id)
            }
        }, {
            '$lookup': {
                'from': 'posts',
                'localField': 'postId',
                'foreignField': '_id',
                'as': 'post'
            }
        }, {
            '$addFields': {
                'post': {
                    '$first': '$post'
                }
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'post.sellerId',
                'foreignField': '_id',
                'as': 'seller'
            }
        }, {
            '$addFields': {
                'seller': {
                    '$first': '$seller'
                }
            }
        }
    ])

    if (!interestedPosts) { return res.status(400).json(ApiError(400, "There is no post!")) }

    return res.status(200).json(ApiResponse(200, "Post fetched successfully!", interestedPosts))
})

const filteredData = asynchandler(async (req, res) => {
    const { city, address } = req.params

    const user = req.user

    if (user.designation != "buyer") { return res.status(400).json(ApiError(400, "You are not a buyer!")) }

    if (!user) { return res.status(400).json(ApiError(400, "You are not logged in!")) }

    let filteredPost

    if (city.length > 0 && address.length > 0) {
        filteredPost = await Post.aggregate([
            {
                '$match': {
                    'city': `${city}`
                }
            }, {
                '$match': {
                    'address': `${address}`
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'sellerId',
                    'foreignField': '_id',
                    'as': 'sellerId'
                }
            }, {
                '$addFields': {
                    'sellerId': {
                        '$first': '$sellerId'
                    }
                }
            }, {
                '$project': {
                    'sellerId': {
                        'password': 0,
                        'refreshToken': 0
                    }
                }
            }
        ])
    }
    filteredPost = await Post.aggregate([
        {
            '$match': {
                'city': `${city}`
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'sellerId',
                'foreignField': '_id',
                'as': 'sellerId'
            }
        }, {
            '$addFields': {
                'sellerId': {
                    '$first': '$sellerId'
                }
            }
        }, {
            '$project': {
                'sellerId': {
                    'password': 0,
                    'refreshToken': 0
                }
            }
        }])

    if (filteredPost.length === 0) { return res.status(400).json(ApiError(400, "We are sorry. There is no post!")) }

    return res.status(200).json(ApiResponse(200, "Post fetched successfully!", filteredPost))
})

export {
    allPost,
    myPost,
    getSinglePost,
    interestedData,
    filteredData
}
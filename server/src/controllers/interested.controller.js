import { ApiError } from "../utils/ApiError.utils.js"
import { asynchandler } from "../utils/asynchandler.utils.js"
import { Post } from "../models/post.model.js"
import { mailSend } from "../utils/nodemailer.utils.js"
import {Interested} from "../models/interested.model.js"

const interested = asynchandler(async (req, res) => {
    const { postId } = req.body

    if (!postId) { return res.status(400).json(ApiError(400, "Post id required!")) }

    const user = req.user

    if (!user) { return res.status(400).json(ApiError(400, "User should be logged in!")) }

    if (user?.designation != "buyer") { return res.status(400).json(ApiError(400, "You are not a buyer!")) }

    const post = await Post.aggregate([
        {
            '$lookup': {
                'from': 'users',
                'localField': 'sellerId',
                'foreignField': '_id',
                'as': 'seller'
            }
        }, {
            '$addFields': {
                'seller': {
                    '$first': '$seller'
                }
            }
        }, {
            '$project': {
                'seller': {
                    'firstName': 1,
                    'lastName': 1,
                    'phone': 1,
                    'email': 1,
                    '_id': 1
                },
                'homeName': 1,
                'floor': 1
            }
        }
    ])

    if (!post) { return res.status(400).json(ApiError(400, "Post not found!")) }

    const buyerData = `Interested Person Name: ${user?.firstName?.toUpperCase()} ${user?.lastName?.toUpperCase()}<br>Email: ${user?.email}<br>Phone: ${user?.phone}<br>Property: ${post[0]['homeName']}'s ${post[0]['floor']} floor`

    const mailToSeller = mailSend(post[0]["seller"]["email"], buyerData, `Someone is interested in ${post[0]['homeName']}`)

    const sellerData = `Owner: ${post[0]["seller"]["firstName"]?.toUpperCase()} ${post[0]["seller"]["lastName"]?.toUpperCase()}<br>Email: ${post[0]["seller"]["email"]}<br>Phone: ${post[0]["seller"]["phone"]}<br>Your are interested in: ${post[0]['homeName']}'s ${post[0]['floor']} floor`

    const mailToBuyer = mailSend(user?.email, sellerData, `Owner Information of ${post[0]['homeName']}`)

    if(!mailToSeller || !mailToBuyer) {return res.status(500).json(ApiError(500, "Sending mail to buyer or seller is failed!"))}

    const interestedList = await Interested.create({
        postId: postId,
        userId: user?._id
    })

    if(!interestedList) {return res.status(500).json(ApiError(500, "Adding data to interested list is failed!"))}

    return res.status(200).json(ApiError(200, "We have sent email to you and seller. Seller will contact soon.", post[0]))
})

export {
    interested
}
import mongoose, { Schema } from "mongoose";

const interestedSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

export const Interested = mongoose.model("Interested", interestedSchema)
import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiErrors} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { owner,content } = req.body
    if (!owner || !content) {
        return new ApiErrors(400, "All fields are required")
    }

    const tweet = await Tweet.create({owner, content})
    
    if(!tweet) throw new ApiErrors(400,"Something went wrong while creating tweet")

    return res.status(201).json(
        new ApiResponse(201,tweet,"Tweet created successfully.!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const user = req.user._id

    const tweets = await Tweet.find({owner: user});
    if(tweets.length === 0) throw new ApiErrors(400,"No tweet found")

    return res.status(200).json(                 
        new ApiResponse(200,tweets,"Tweet founded successfully.!")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { id:tweetId } = req.params
    const { content: newContent } = req.body

    if(!newContent) throw new ApiErrors(400,"Content is required")
    
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        { content:newContent },
        { new:true }
    )

    if(!updatedTweet) throw new ApiErrors(500,"unable to update")
    
    return res.status(200).json(
        new ApiResponse(200,updatedTweet,"Tweet updated successfully.!")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { id:tweetId } = req.params

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200,{},"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
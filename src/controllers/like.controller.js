import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiErrors} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ADDRGETNETWORKPARAMS } from "dns"
import { match } from "assert"

//todo : toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const { isLiked } = req.body

    if(isLiked){
        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id,            
        })

        return res.status(201).json(
            new ApiResponse(201, like, "Video liked successfully")
        )
    }else{
        const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

        await Like.findByIdAndDelete(like._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Video disliked successfully")
        )
    }
})

//todo : toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const { isLiked } = req.body

    if(isLiked){
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user._id,            
        })

        return res.status(201).json(
            new ApiResponse(201, like, "Comment liked successfully")
        )
    }else{
        const like = await Like.findOne({ comment: commentId, likedBy: req.user._id });

        await Like.findByIdAndDelete(like._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Comment disliked successfully")
        )
    }
})

//todo : toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const { isLiked } = req.body

    if(isLiked){
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id,            
        })

        return res.status(201).json(
            new ApiResponse(201, like, "Tweet liked successfully")
        )
    }else{
        const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

        await Like.findByIdAndDelete(like._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Tweet disliked successfully")
        )
    }
})

//todo : get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $ne:null }
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'videoDetails'
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $project: {
                _id: 0,
                videoId: "$videoDetails._id",
                title: "$videoDetails.title",
                thumbnail: "$videoDetails.thumbnail",
                duration: "$videoDetails.duration",
                views: "$videoDetails.views",
                isPublished: "$videoDetails.isPublished",
                createdAt: "$videoDetails.createdAt"
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])
    if(!likedVideos) throw new ApiErrors(400, "No video liked")

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "All kied Videos are fetched")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
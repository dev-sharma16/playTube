import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiErrors} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// todo : get all comments for a video ✅
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const skip = (page-1)*limit

    const totalComments = await Comment.countDocuments();
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find({video: videoId})
                                .skip(skip)
                                .limit(limit)
                                .sort({ createdAt: -1 })
    if(!comments) throw new ApiErrors(500, "No comments yet.!")
    
    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                totalComments,
                totalPages,
                currentPage: page,
                comments
            }, 
            "Comments fetched successfully"
        )
    )
})

// todo : add a comment to a video ✅
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    if(!content) throw new ApiErrors(400, "Content is required for creating comment")
    
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    if(!content) throw new ApiErrors(500, "Somthing went wrong while creating a comment")
    
    return res.status(201).json(
        new ApiResponse(201, comment, "Comment created sucessfully.!")
    )
})

// todo : update a comment ✅
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if(!content) throw new ApiErrors(400, "Content is required for updating comment")
    
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    )
    if(!updatedComment) throw new ApiErrors(500, "Something went wrong while updating comment")
    
    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )
})

// todo : delete a comment ✅
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!commentId) throw new ApiErrors(400, "Comment-Id is required to delete a comment");

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
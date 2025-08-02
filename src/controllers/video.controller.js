import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiErrors} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


//todo: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query
    const skip = (page-1)*limit;

    const totalVideos = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideos / limit)

    const videos = await Video.find({})
                        .skip(skip)
                        .limit(limit)
                        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                totalVideos,
                totalPages,
                currentPage: page,
                videos
            },
            "Videos fetched successfully.!"
        )
    )
})

//todo: get all videos of a user based on query, sort, pagination
const getAllUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType} = req.query
    const {userId} = req.params

    const skip = (page-1)*limit;

    const totalVideos = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideos / limit)

    const videos = await Video
                        .find({owner: userId})
                        .skip(skip)
                        .limit(limit)
                        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                totalVideos,
                totalPages,
                currentPage: page,
                videos
            },
            "Your All Videos fetched successfully.!"
        )
    )
})

//todo: get video, upload to cloudinary, create video ✅
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if(!title || !description) throw new ApiErrors(400,"All fields are required")

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if(!videoLocalPath || !thumbnailLocalPath) throw new ApiErrors(400,"Video and Thumbnail both are required")

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    console.log(uploadedVideo);
    console.log(uploadedThumbnail);

    const video = await Video.create({
        owner: req.user._id,
        videoFile: uploadedVideo.url,
        videoPublicId: uploadedVideo.public_id ,
        thumbnail: uploadedThumbnail.url,
        thumbnailPublicId: uploadedThumbnail.public_id,
        title,
        description,
        duration: uploadedVideo.duration
    })

    if(!video) throw new ApiErrors(500,"Something went wrong while uploading the video.!")
    
    return res.status(201).json(
        new ApiResponse(201, video, "Video uploaded successfully.!")
    )
})

//todo: get video by id ✅
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    const video = await Video.findById({_id:videoId})
    if(!video) throw new ApiErrors(500,"Video not found");

    res.status(200).json(
        new ApiResponse(200, video, "Fetched video successfully")
    )
})

//todo: update video details like title, description, thumbnail ✅
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById({_id: videoId})

    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path

    const updatedValues = {};

    if(title?.trim()) updatedValues.title = title.trim();
    if(description?.trim()) updatedValues.description = description.trim();
    if(thumbnailLocalPath?.trim()){
        const deleteOldThumbnail = await deleteFromCloudinary(video.thumbnailPublicId)
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!uploadedThumbnail.url) throw new ApiErrors(500,"Something went wrong while uploading on cloudinary")
        updatedValues.thumbnail = uploadedThumbnail.url;
        updatedValues.thumbnailPublicId = uploadedThumbnail.public_id
    }

    if(Object.keys(updatedValues).length === 0) throw new ApiErrors(400,"No valid fields provided for update");

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updatedValues,
        {new: true}
    )
    
    res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated sucessfully")
    )
})

//todo: delete video ✅
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById({_id: videoId})

    await Video.findByIdAndDelete({_id: videoId})
    await deleteFromCloudinary(video.thumbnailPublicId)
    await deleteFromCloudinary(video.videoPublicId)

    return res.status(200).json(
        new ApiResponse(200,{},"Video deleted successfully")
    )
})

//todo: toggle Publish status ✅
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { isPublished } = req.body

    let updatedPublishStatus = {}

    if(!isPublished) {
        updatedPublishStatus = await Video.findByIdAndUpdate(
            videoId,
            {
                isPublished: false
            },
            {
                new: true
            }
        )
    } else {
        updatedPublishStatus = await Video.findByIdAndUpdate(
            videoId,
            {
                isPublished: true
            },
            {
                new: true
            }
        )
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPublishStatus, "Publish status changed successfully")
    )
})

export {
    getAllVideos,
    getAllUserVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
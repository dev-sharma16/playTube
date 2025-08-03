import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiErrors} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


//todo: create playlist ✅
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description) throw new ApiErrors(400,"Name and Description both are required")
    
    const userId = req.user._id

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if(!playlist) throw new ApiErrors(500,"Something went Wrong while creating playlist");

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully.!")
    )
})

//todo: get user playlists ✅
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const playlists = await Playlist.find({owner: userId})
    if(!playlists) throw new ApiErrors(500,"Playlists not found");

    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
    )
})

//todo: get playlist by id ✅
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)
    if(!playlist) throw new ApiErrors(500,"Playist did'nt exists")

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully.!")
    )
})

// todo: add video in playlist ✅
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId }
        },
        {new: true}
    )
    if(!videoAddedToPlaylist) throw new ApiErrors(500, "Something went wrong while adding video to playlist")

    return res.status(200).json(
        new ApiResponse(200, videoAddedToPlaylist, "Video added to the playlist.!")
    )
})

// todo: remove video from playlist ✅
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const videoRemovedFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        {new: true}
    )
    if(!videoRemovedFromPlaylist) throw new ApiErrors(500, "Something went wrong while removing video from playlist")

    return res.status(200).json(
        new ApiResponse(200, videoRemovedFromPlaylist, "Video removed from the playlist.!")
    )
})

// todo: delete playlist ✅
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    await Playlist.findByIdAndDelete({_id: playlistId})

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

//todo: update playlist ✅
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    let updateObject = {}
    if(name) updateObject.name = name
    if(description) updateObject.description = description

    if(Object.keys(updateObject).length === 0) throw new ApiErrors(400, "Name or description need one of them to update playist")

    const updatedPlaylistDetails = await Playlist.findByIdAndUpdate(
        playlistId,
        updateObject,
        { new: true }
    )
    if(!updatedPlaylistDetails) throw new ApiErrors(500, "Something went wrong while update the playist details")

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylistDetails, "Playlist details updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
import mongoose, {isValidObjectId, mongo} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { isSubscribed, userId} = req.body //* isSubscribed would be an Bollean value
    
    if(isSubscribed){
        const subscribed = await Subscription.create({subscriber: userId, channel: channelId})
        if(!subscribed) throw new ApiError(500,"Something went wrong while subscribing.!");

        return res.status(201).json(
            new ApiResponse(201,subscribed,"Channel subscribed successfully.!")
        )
    } else {
        const unSubscribing = await Subscription.findByIdAndDelete(channelId)
        if(unSubscribing) throw new ApiError(500,"Something went wrong while un-subscribing.!");

        return res.status(201).json(
            new ApiResponse(201,{},"Channel un-subscribed successfully.!")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo"
            }
        },
        {
            $unwind: "$subscriberInfo"
        },
        {
            $project: {
                _id: 0,
                subscriberId: "$subscriberInfo._id",
                fullName: "$subscriberInfo.fullName",
                avatar: "$subscriberInfo.avatar",
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriptionList  = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId) 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: 'channel',
                foreignField: "_id",
                as: 'subscribedChannel'
            }
        },
        {
            $unwind: "$subscribedChannel"
        },
        {
            $project: {
                _id: 0,
                channelId: "$subscribedChannel._id",
                channelName: "$subscribedChannel.fullName",
                avatar: "$subscribedChannel.avatar",
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,subscriptionList,"Channel subscribed fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
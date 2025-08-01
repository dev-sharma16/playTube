import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        if(!userId) throw new ApiErrors(400, "User ID is required for generating tokens");
        
        const user =  await User.findById(userId);
        if(!userId) throw new ApiErrors(404, "User not found for generating token");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        if (!accessToken || !refreshToken) {
            throw new ApiErrors(500, "Token generation failed");
        }

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) //* while because we are saving only one field and it don't have password with them, so we need to add 'validateBeforeSave' and due to that mongoDB don't need validation

        // TODO we did'nt add accessToken in DB

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiErrors(500, `Something went Wrong while generating its refresh or access token : ${error}`)
    }
}

const registerUser = asyncHandler ( async(req,res) => {
    //? Steps to register user
    //* get uessr details from body
    //* validate the user input [ not empty field ] 
    //* check if the user is already exists or not [ username, email ]
    //* check for images and avatar [ bcz avatar is required ]
    //* upload them to Cloudinary [ bcz avatar is required ]
    //* create user object [ create entry in DB ]
    //* remove password and refresh token field from response [ for frontend ]
    //* check if the user is created 
    //* if then return response 

    const { fullName, email, username, password } = req.body
    // console.log("email:",email);

    // if (fullName === "") {
    //     throw new ApiErrors(400,"Fullname is Required")
    // }
    // ? You can use if else and check each field ,but is more sufficient to make array and use  '.some' : SOME return true or false after checking the condition it has given.
    if ( [fullName, email, username, password].some((field) => field?.trim() === "") ) {
        throw new ApiErrors(400,"All fields is required.!")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if (existedUser) {
        throw new ApiErrors(409, "User with email or username already exists")
    }

    // ? we get access of the 'req.body' by using 'express middleware', we get access of 'req.files' by using 'multer as middleware'.

    // console.log("req.files:", req.files);
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
    //     coverImageLocalPath = req.files?.coverImage?.[0]?.path
    // }

    if (!avatarLocalPath) {
        throw new ApiErrors(400, "Avatar file is required.!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log('avatar url: ',avatar);
    

    if (!avatar) {
        throw new ApiErrors(400, "Avatar file is required.!")
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  //? '.select' unselect the fields which we don't want to return
    )

    if(!createdUser) {
        throw new ApiErrors(500, "Something went wrong while registring the user.!")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered Successfully.!")
    )
})

const loginUser = asyncHandler ( async(req,res) => {
    // ? Steps to login a user :-
    // * take the data from body
    // * check weither you received the username or email
    // * find the user nased in the input
    // * then check the user password you find one in db
    // * if password is correct then generate 'refresh' and 'access' token and send to user both
    // * then send those token in cokkies

    const {email, username, password} = req.body;

    if(!username && !email) throw new ApiErrors(400, "Username or email is Required");

    const user = await User.findOne({
        $or: [{username}, {email}]
    });

    if(!user) throw new ApiErrors(404,"User not exists");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiErrors(401, "Password is not Correct");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //* removing the passwrod and refreshToken from 'user' object 

    // ? When we pass 'true' in the 'httOnly' and 'secure' then the 'Cookies' become unEditable from the frontend
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler ( async(req,res) => {
    //req.user //? we can access this user details object because of the auth middleware  
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //TODO research about mongoDb operators
            // $set: {
            //     refreshToken: undefined
            // } 
            $unset: {
                refreshToken: 1 //* this removes the field from document
            } 
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {},
            "User Logged Out Successfully"
        )
    )
})

const refreshAccessToken = asyncHandler ( async(req,res) => {
    const incomingRefreshToken = req.cookies.accessToken || req.cookies.refreshToken  
    if(!incomingRefreshToken) throw new ApiErrors(401, "Unautherized Request");

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user) throw new ApiErrors(401, "Invalid Refresh Token Request");
    
        if(incomingRefreshToken !== user?.refreshToken) throw new ApiErrors(401, "Refresh token is expired or used")
        
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {access_token: newAccessToken, refresh_token: newRefreshToken},
                "Access token is successfully refreshed.!"
            )
        )
    } catch (error) {
        throw new ApiErrors(400, `Unabled to refresh the access token : ${error}`)
    }
})

const changeCurrentPassword = asyncHandler ( async(req,res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPaswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if (!isPaswordCorrect) throw new ApiErrors(400, "Invalid old Password")

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler ( async(req,res) => {
    const currentUser = req.user;
    
    return res
    .status(200)
    .json(new ApiResponse(200, currentUser, "Cureent user fetched successfully"))
})

const updateAccountDetails = asyncHandler ( async(req,res) => {
    const {fullName, email} = req.body 

    if(!fullName || !email) return new ApiErrors(400, "All fields are required");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler ( async(req,res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) throw new ApiErrors(400, "Avatar file is missing");

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //TODO delete old avatar image from cloudinary after uploading new one 

    if(!avatar.url) throw new ApiErrors(400, "Error while uploading avatar on cloudinary");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler ( async(req,res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath) throw new ApiErrors(400, "Cover Image file is missing");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //TODO delete old cover image from cloudinary after uploading new one 

    if(!coverImage.url) throw new ApiErrors(400, "Error while uploading Cover Image on cloudinary");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler( async(req,res) => {
    const {username} = req.params

    if(!username?.trim){
        throw new ApiErrors(400, "username is missing")
    }
    // * mongoDb aggercation pipeline for finding the subscriber count of the channel and the channels is subscribed by the account
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed:1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiErrors(404, "channel does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"User channels fetched successfully")
    )
})

const getWatchHistory = asyncHandler( async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                // ? we can't directly pass the 'req.user._id' its an string which converted to an object by mongoose then used but in 'aggregate' there is no mongoose
                _id: mongoose.Types.ObjectId(req.user._id)
            },
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField:'_id',
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]) 

    return res.status(200).json(
        new ApiResponse(
            200, 
            user[0].watchHistory,
            "Watch History fetched successfully"
        )
    )
}) 

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiErrors } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler ( async (req, res) => {
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

export { registerUser }
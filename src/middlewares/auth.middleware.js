// ? a middleware for authenticating the logined user

import { ApiErrors } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler( async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if (!token) throw new ApiErrors(401, "Unauthorized request");
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) //TODO add await before 'jwt' if needed
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user) throw new ApiErrors(401, "Invalid Access Token") 
        
        req.user = user; //* adding the user object in this we access it like 'req.user' just like 'req.body' in function which runs after that middleware

        next();

    } catch (error) {
        throw new ApiErrors(401, error?.message || "Invalid access token")
    }
}) 
// ? Its an config file for 'Cloudinary' 

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiErrors } from "../utils/apiError.js"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // ? uploading file on cloudianry
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // ? if file uploaded successfully
        console.log("file uploaded successfully on cloudinary : ",response.url);

        // ? Remove local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        //? it removes the locally saved file as the upload operation got failed
        fs.unlinkSync(localFilePath);
        
        throw new ApiErrors(500, `Cloudinary upload failed: ${error.message}`);
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId)

        return response;
    } catch (error) {
        throw new ApiErrors(500, `Cloudinary delete failed: ${error.message}`);
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
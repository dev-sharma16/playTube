// ? Its an config file for 'Cloudinary' 

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
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
        return response;

    } catch (error) {
        //? it removes the locally saved file as the upload operation got failed
        fs.unlink(localFilePath) 
    }
}

export {uploadOnCloudinary};
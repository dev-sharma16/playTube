// import mongoose from "mongoose";
// import { DB_NAME } from './constants';

//? This is FIRST Approach to connect the DB
// * SECOND Approach is in the 'connectDB' => "/src/db/index.js"
/*
import express from 'express';
const app = express();

;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ",error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })

    } catch (error) {
        console.error("ERROR: ",error);
        throw error
    }
}) ()
*/

// ? SECOND Approach
// require('dotenv').config({path: './env'}) //* You use ths don't need do do config, but not for consistency in code.
import dotenv from 'dotenv';
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB();
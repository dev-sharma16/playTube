import express from "express"
import cookieParser from "cookie-parser" 
import cors from 'cors'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"})) //? we can add limit on json input from body
app.use(express.urlencoded({extended: true, limit: "16kb"})) //? this is url encoder 
app.use(express.static("public")) //? this for creating folder of asset which can be used by anyone, and public is folder name 
app.use(cookieParser()) //? this is for CRUD operation in the user's browser cookies

//* routes
import userRouter from './routes/user.routes.js'

//* routes declaration
app.use("/api/v1/users", userRouter)

//* this is how route will look when the control is passed 
//?  http://localhost:8000/api/v1/users/register 

export { app }
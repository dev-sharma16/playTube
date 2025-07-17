import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(
    loginUser
)

// * Secured Routes
router.route("/logout").post(
    //? if you want to use middleware before a certain function just add before it, and that's why we add 'next()' in middleware so it know then after middleware execution the next function executes which is after that.
    verifyJwt, 
    logoutUser
)

export default router
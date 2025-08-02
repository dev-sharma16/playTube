import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet,deleteTweet,getUserTweets,updateTweet} from '../controllers/tweet.controller.js'

const router = Router();
router.use(verifyJwt)

router.route('/create-tweet').post(createTweet)
router.route('/delete-tweet').post(deleteTweet)
router.route('/get-tweets').get(getUserTweets)
router.route('/update-tweet').patch(updateTweet)

export default router
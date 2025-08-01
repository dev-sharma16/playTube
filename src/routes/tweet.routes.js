import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { createTweet,deleteTweet,getUserTweets,updateTweet} from '../controllers/tweet.controller'

const router = Router();

router.route('/create-tweet').post(verifyJwt, createTweet)
router.route('/delete-tweet').post(verifyJwt, deleteTweet)
router.route('/get-tweets').get(verifyJwt, getUserTweets)
router.route('/update-tweet').patch(verifyJwt, updateTweet)

export default router
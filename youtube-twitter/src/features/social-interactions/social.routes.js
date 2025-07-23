import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../../controllers/like.controller.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../../controllers/subscription.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Like routes
router.route("/like/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/like/comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/like/tweet/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/liked-videos").get(verifyJWT, getLikedVideos);

// Subscription routes
router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed").get(verifyJWT, getSubscribedChannels);

export default router;

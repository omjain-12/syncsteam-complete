import { Router } from "express";
import {
    upload,
    handleMulterError,
    debugFileUpload
} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    publishAVideo,
    togglePublishStatus,
    testCloudinaryUpload,
    getUserVideos,
    getAllVideosDebug
} from "../controllers/video.controller.js";

const router = Router();

// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        handleMulterError,
        debugFileUpload,
        publishAVideo
    );

router
    .route("/v/:videoId")
    .get(verifyJWT, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(
        verifyJWT,
        upload.single("thumbnail"),
        handleMulterError,
        updateVideo
    );

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

// Get user's own videos (including unpublished)
router.route("/user/videos").get(verifyJWT, getUserVideos);

// Test route for Cloudinary
router.route("/test-cloudinary").get(testCloudinaryUpload);

// Debug route to see all videos in database (for testing only)
router.route("/debug/all").get(getAllVideosDebug);

export default router;

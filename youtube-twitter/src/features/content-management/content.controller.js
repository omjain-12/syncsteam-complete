import asyncHandler from "../../shared/utils/asyncHandler.js";
import ApiError from "../../shared/utils/ApiError.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import { Content } from "./content.model.js";
import { Profile } from "../user-profile/profile.model.js";
import {
    uploadToCloud,
    deleteFromCloud
} from "../../shared/services/cloudinary.service.js";
import {
    generateSlug,
    extractHashtags,
    validateContentData
} from "../../shared/utils/contentHelpers.js";
import mongoose from "mongoose";

class ContentController {
    // Upload new content
    uploadContent = asyncHandler(async (req, res) => {
        const {
            title,
            description,
            category,
            tags,
            visibility,
            ageRestriction
        } = req.body;
        const creatorId = req.profile._id;

        // Validate input data
        const validation = validateContentData({
            title,
            description,
            category
        });
        if (!validation.isValid) {
            throw new ApiError(400, validation.message);
        }

        // Check file uploads
        if (!req.files?.mediaFile || !req.files?.thumbnail) {
            throw new ApiError(
                400,
                "Both media file and thumbnail are required"
            );
        }

        const mediaLocalPath = req.files.mediaFile[0]?.path;
        const thumbnailLocalPath = req.files.thumbnail[0]?.path;

        if (!mediaLocalPath || !thumbnailLocalPath) {
            throw new ApiError(400, "File upload failed");
        }

        console.log("Uploading content files to cloud storage...");

        // Upload to cloud storage
        const [mediaUpload, thumbnailUpload] = await Promise.all([
            uploadToCloud(mediaLocalPath, { resource_type: "video" }),
            uploadToCloud(thumbnailLocalPath, { resource_type: "image" })
        ]);

        if (!mediaUpload || !thumbnailUpload) {
            throw new ApiError(500, "Failed to upload files to cloud storage");
        }

        // Process tags and hashtags
        const processedTags = tags
            ? tags.split(",").map((tag) => tag.trim().toLowerCase())
            : [];
        const hashtagsFromDescription = extractHashtags(description);
        const allTags = [
            ...new Set([...processedTags, ...hashtagsFromDescription])
        ];

        // Create content document
        const content = await Content.create({
            title: title.trim(),
            description: description.trim(),
            category,
            tags: allTags,
            visibility: visibility || "public",
            ageRestriction: ageRestriction || "all-ages",
            creator: creatorId,
            mediaFiles: {
                primary: {
                    url: mediaUpload.secure_url,
                    publicId: mediaUpload.public_id,
                    format: mediaUpload.format,
                    duration: mediaUpload.duration || 0,
                    size: mediaUpload.bytes
                },
                thumbnail: {
                    url: thumbnailUpload.secure_url,
                    publicId: thumbnailUpload.public_id
                }
            },
            status: "published",
            publishedAt: new Date()
        });

        // Update creator's content count
        await Profile.findByIdAndUpdate(creatorId, {
            $inc: { "stats.contentCount": 1 }
        });

        // Populate creator details
        await content.populate("creator", "username displayName avatar");

        res.status(201).json(
            new ApiResponse(201, content, "Content uploaded successfully")
        );
    });

    // Get personalized content feed
    getContentFeed = asyncHandler(async (req, res) => {
        const {
            page = 1,
            limit = 20,
            category,
            sortBy = "trending"
        } = req.query;
        const profileId = req.profile?._id;

        const pipeline = [];

        // Base matching criteria
        const matchCriteria = {
            status: "published",
            visibility: { $in: ["public"] }
        };

        // Add category filter if specified
        if (category && category !== "all") {
            matchCriteria.category = category;
        }

        pipeline.push({ $match: matchCriteria });

        // Sorting logic
        switch (sortBy) {
            case "trending":
                pipeline.push({
                    $addFields: {
                        trendingScore: {
                            $add: [
                                { $multiply: ["$metrics.views", 0.3] },
                                { $multiply: ["$metrics.likes", 2] },
                                { $multiply: ["$metrics.comments", 3] },
                                { $multiply: ["$metrics.shares", 4] }
                            ]
                        }
                    }
                });
                pipeline.push({
                    $sort: { trendingScore: -1, publishedAt: -1 }
                });
                break;
            case "latest":
                pipeline.push({ $sort: { publishedAt: -1 } });
                break;
            case "popular":
                pipeline.push({
                    $sort: { "metrics.views": -1, "metrics.likes": -1 }
                });
                break;
            default:
                pipeline.push({ $sort: { publishedAt: -1 } });
        }

        // Add creator information
        pipeline.push({
            $lookup: {
                from: "profiles",
                localField: "creator",
                foreignField: "_id",
                as: "creatorInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            displayName: 1,
                            avatar: 1,
                            isVerified: 1,
                            "stats.followers": 1
                        }
                    }
                ]
            }
        });

        pipeline.push({ $unwind: "$creatorInfo" });

        // Add user interaction data if logged in
        if (profileId) {
            pipeline.push({
                $lookup: {
                    from: "interactions",
                    let: { contentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$targetContent",
                                                "$$contentId"
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$profile",
                                                new mongoose.Types.ObjectId(
                                                    profileId
                                                )
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userInteractions"
                }
            });

            pipeline.push({
                $addFields: {
                    isLiked: {
                        $in: ["like", "$userInteractions.interactionType"]
                    },
                    isSaved: {
                        $in: ["save", "$userInteractions.interactionType"]
                    }
                }
            });
        }

        // Pagination
        const aggregate = Content.aggregate(pipeline);
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { publishedAt: -1 }
        };

        const result = await Content.aggregatePaginate(aggregate, options);

        res.status(200).json(
            new ApiResponse(200, result, "Content feed retrieved successfully")
        );
    });

    // Get single content by ID
    getContentById = asyncHandler(async (req, res) => {
        const { contentId } = req.params;
        const profileId = req.profile?._id;

        if (!mongoose.isValidObjectId(contentId)) {
            throw new ApiError(400, "Invalid content ID");
        }

        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(contentId) } },

            // Add creator info
            {
                $lookup: {
                    from: "profiles",
                    localField: "creator",
                    foreignField: "_id",
                    as: "creatorInfo"
                }
            },
            { $unwind: "$creatorInfo" },

            // Add comments count
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "targetContent",
                    as: "commentsList"
                }
            },
            {
                $addFields: {
                    "metrics.comments": { $size: "$commentsList" }
                }
            }
        ];

        // Add user interaction data if logged in
        if (profileId) {
            pipeline.push({
                $lookup: {
                    from: "interactions",
                    let: { contentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$targetContent",
                                                "$$contentId"
                                            ]
                                        },
                                        {
                                            $eq: [
                                                "$profile",
                                                new mongoose.Types.ObjectId(
                                                    profileId
                                                )
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userInteractions"
                }
            });

            pipeline.push({
                $addFields: {
                    isLiked: {
                        $in: ["like", "$userInteractions.interactionType"]
                    },
                    isSaved: {
                        $in: ["save", "$userInteractions.interactionType"]
                    }
                }
            });
        }

        const content = await Content.aggregate(pipeline);

        if (!content || content.length === 0) {
            throw new ApiError(404, "Content not found");
        }

        // Increment view count (do this asynchronously)
        Content.findByIdAndUpdate(contentId, {
            $inc: { "metrics.views": 1 }
        }).exec();

        res.status(200).json(
            new ApiResponse(200, content[0], "Content retrieved successfully")
        );
    });

    // Update content
    updateContent = asyncHandler(async (req, res) => {
        const { contentId } = req.params;
        const { title, description, category, tags, visibility } = req.body;
        const profileId = req.profile._id;

        const content = await Content.findById(contentId);

        if (!content) {
            throw new ApiError(404, "Content not found");
        }

        if (content.creator.toString() !== profileId.toString()) {
            throw new ApiError(403, "You can only update your own content");
        }

        // Update fields
        if (title) content.title = title.trim();
        if (description) content.description = description.trim();
        if (category) content.category = category;
        if (visibility) content.visibility = visibility;
        if (tags) {
            const processedTags = tags
                .split(",")
                .map((tag) => tag.trim().toLowerCase());
            content.tags = processedTags;
        }

        // Handle thumbnail update
        if (req.file) {
            // Delete old thumbnail
            if (content.mediaFiles.thumbnail.publicId) {
                await deleteFromCloud(content.mediaFiles.thumbnail.publicId);
            }

            // Upload new thumbnail
            const thumbnailUpload = await uploadToCloud(req.file.path);
            if (thumbnailUpload) {
                content.mediaFiles.thumbnail = {
                    url: thumbnailUpload.secure_url,
                    publicId: thumbnailUpload.public_id
                };
            }
        }

        await content.save();

        res.status(200).json(
            new ApiResponse(200, content, "Content updated successfully")
        );
    });

    // Delete content
    deleteContent = asyncHandler(async (req, res) => {
        const { contentId } = req.params;
        const profileId = req.profile._id;

        const content = await Content.findById(contentId);

        if (!content) {
            throw new ApiError(404, "Content not found");
        }

        if (content.creator.toString() !== profileId.toString()) {
            throw new ApiError(403, "You can only delete your own content");
        }

        // Delete files from cloud storage
        await Promise.all([
            deleteFromCloud(content.mediaFiles.primary.publicId),
            deleteFromCloud(content.mediaFiles.thumbnail.publicId)
        ]);

        // Delete content from database
        await Content.findByIdAndDelete(contentId);

        // Update creator's content count
        await Profile.findByIdAndUpdate(profileId, {
            $inc: { "stats.contentCount": -1 }
        });

        res.status(200).json(
            new ApiResponse(200, {}, "Content deleted successfully")
        );
    });

    // Get user's own content
    getUserContent = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, status = "all" } = req.query;
        const profileId = req.profile._id;

        const matchCriteria = { creator: profileId };

        if (status !== "all") {
            matchCriteria.status = status;
        }

        const pipeline = [
            { $match: matchCriteria },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "interactions",
                    localField: "_id",
                    foreignField: "targetContent",
                    as: "interactions"
                }
            },
            {
                $addFields: {
                    "metrics.likes": {
                        $size: {
                            $filter: {
                                input: "$interactions",
                                cond: {
                                    $eq: ["$$this.interactionType", "like"]
                                }
                            }
                        }
                    }
                }
            }
        ];

        const aggregate = Content.aggregate(pipeline);
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await Content.aggregatePaginate(aggregate, options);

        res.status(200).json(
            new ApiResponse(200, result, "User content retrieved successfully")
        );
    });
}

export default new ContentController();

import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const contentSchema = new Schema(
    {
        // Content Metadata
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true
            }
        ],
        category: {
            type: String,
            required: true,
            enum: [
                "education",
                "entertainment",
                "technology",
                "lifestyle",
                "sports",
                "music",
                "gaming",
                "news",
                "travel",
                "cooking",
                "fitness",
                "art",
                "business",
                "science",
                "other"
            ]
        },

        // Media Files
        mediaFiles: {
            primary: {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                format: String,
                duration: Number,
                size: Number
            },
            thumbnail: {
                url: { type: String, required: true },
                publicId: { type: String, required: true }
            },
            preview: {
                url: String,
                publicId: String
            }
        },

        // Content Settings
        visibility: {
            type: String,
            enum: ["public", "unlisted", "private", "subscribers-only"],
            default: "public"
        },
        isMonetized: {
            type: Boolean,
            default: false
        },
        ageRestriction: {
            type: String,
            enum: ["all-ages", "13+", "16+", "18+"],
            default: "all-ages"
        },

        // Creator Information
        creator: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },

        // Engagement Metrics
        metrics: {
            views: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            dislikes: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            watchTime: { type: Number, default: 0 }, // in seconds
            engagement: { type: Number, default: 0 } // calculated field
        },

        // Content Status
        status: {
            type: String,
            enum: ["draft", "processing", "published", "archived", "removed"],
            default: "processing"
        },
        processingStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending"
        },

        // SEO and Discovery
        slug: {
            type: String,
            unique: true,
            sparse: true
        },
        searchKeywords: [String],

        // Scheduling
        publishedAt: Date,
        scheduledFor: Date,

        // Content Moderation
        isReported: {
            type: Boolean,
            default: false
        },
        moderationFlags: [
            {
                reason: String,
                reportedBy: { type: Schema.Types.ObjectId, ref: "Profile" },
                reportedAt: { type: Date, default: Date.now }
            }
        ],

        // Location Data
        location: {
            name: String,
            coordinates: {
                lat: Number,
                lng: Number
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for better performance
contentSchema.index({ creator: 1, createdAt: -1 });
contentSchema.index({ category: 1, status: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ "metrics.views": -1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ slug: 1 });

// Virtual for engagement rate
contentSchema.virtual("engagementRate").get(function () {
    if (this.metrics.views === 0) return 0;
    return (
        ((this.metrics.likes + this.metrics.comments + this.metrics.shares) /
            this.metrics.views) *
        100
    );
});

// Pre-save middleware to generate slug
contentSchema.pre("save", function (next) {
    if (this.isModified("title") && !this.slug) {
        this.slug =
            this.title
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .replace(/\s+/g, "-")
                .substring(0, 50) +
            "-" +
            Date.now();
    }
    next();
});

// Method to increment view count
contentSchema.methods.incrementViews = function (watchTime = 0) {
    this.metrics.views += 1;
    this.metrics.watchTime += watchTime;
    return this.save();
};

// Method to update engagement
contentSchema.methods.updateEngagement = function () {
    this.metrics.engagement = this.engagementRate;
    return this.save();
};

contentSchema.plugin(mongooseAggregatePaginate);

export const Content = model("Content", contentSchema);

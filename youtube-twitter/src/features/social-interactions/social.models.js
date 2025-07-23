import { Schema, model } from "mongoose";

// Interaction Model - handles likes, dislikes, saves, shares
const interactionSchema = new Schema(
    {
        profile: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        targetContent: {
            type: Schema.Types.ObjectId,
            ref: "Content",
            required: true
        },
        interactionType: {
            type: String,
            enum: ["like", "dislike", "save", "share", "view"],
            required: true
        },
        metadata: {
            // For shares - platform shared to
            sharePlatform: {
                type: String,
                enum: [
                    "twitter",
                    "facebook",
                    "instagram",
                    "linkedin",
                    "whatsapp",
                    "copy-link"
                ]
            },
            // For views - watch duration
            watchDuration: Number,
            // For saves - collection name
            collection: String,
            // Additional context
            source: String // where the interaction came from
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for performance
interactionSchema.index(
    { profile: 1, targetContent: 1, interactionType: 1 },
    { unique: true }
);
interactionSchema.index({ targetContent: 1, interactionType: 1 });
interactionSchema.index({ profile: 1, interactionType: 1 });

// Follow/Connection Model
const connectionSchema = new Schema(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        following: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        connectionType: {
            type: String,
            enum: ["follow", "block", "mute"],
            default: "follow"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        // Notification settings for this connection
        notifications: {
            newContent: { type: Boolean, default: true },
            liveStreams: { type: Boolean, default: true },
            mentions: { type: Boolean, default: true }
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate connections
connectionSchema.index({ follower: 1, following: 1 }, { unique: true });
connectionSchema.index({ following: 1, connectionType: 1 });
connectionSchema.index({ follower: 1, connectionType: 1 });

// Comment Model with threading support
const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        targetContent: {
            type: Schema.Types.ObjectId,
            ref: "Content",
            required: true
        },

        // Threading support
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        threadLevel: {
            type: Number,
            default: 0,
            max: 3 // Limit nesting to 3 levels
        },

        // Engagement
        likes: {
            type: Number,
            default: 0
        },
        replies: {
            type: Number,
            default: 0
        },

        // Moderation
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        isDeleted: {
            type: Boolean,
            default: false
        },
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

        // Rich content support
        mentions: [
            {
                profile: { type: Schema.Types.ObjectId, ref: "Profile" },
                username: String,
                position: Number
            }
        ],
        hashtags: [String],

        // Metadata
        sentiment: {
            type: String,
            enum: ["positive", "neutral", "negative"],
            default: "neutral"
        },
        language: {
            type: String,
            default: "en"
        }
    },
    {
        timestamps: true
    }
);

// Indexes for comments
commentSchema.index({ targetContent: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ likes: -1 });

// Notification Model
const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "Profile"
        },
        type: {
            type: String,
            enum: [
                "like",
                "comment",
                "follow",
                "mention",
                "share",
                "content_published",
                "live_stream",
                "system_update",
                "milestone_reached",
                "collaboration_invite"
            ],
            required: true
        },
        content: {
            title: String,
            message: String,
            actionUrl: String
        },
        relatedContent: {
            type: Schema.Types.ObjectId,
            ref: "Content"
        },
        relatedComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: Date,
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        }
    },
    {
        timestamps: true
    }
);

// Indexes for notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

export const Interaction = model("Interaction", interactionSchema);
export const Connection = model("Connection", connectionSchema);
export const Comment = model("Comment", commentSchema);
export const Notification = model("Notification", notificationSchema);

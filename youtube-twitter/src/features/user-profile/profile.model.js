import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const profileSchema = new Schema(
    {
        // Authentication
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email"
            ]
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
            match: [
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            ]
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },

        // Profile Information
        displayName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        bio: {
            type: String,
            maxlength: 500,
            trim: true
        },

        // Media Assets
        avatar: {
            url: {
                type: String,
                default:
                    "https://res.cloudinary.com/demo/image/upload/v1/default-avatar.jpg"
            },
            publicId: String
        },
        coverImage: {
            url: String,
            publicId: String
        },

        // Profile Settings
        isVerified: {
            type: Boolean,
            default: false
        },
        accountType: {
            type: String,
            enum: ["standard", "creator", "business", "premium"],
            default: "standard"
        },
        visibility: {
            type: String,
            enum: ["public", "private", "restricted"],
            default: "public"
        },

        // Social Stats
        stats: {
            followers: { type: Number, default: 0 },
            following: { type: Number, default: 0 },
            contentCount: { type: Number, default: 0 },
            totalViews: { type: Number, default: 0 },
            totalLikes: { type: Number, default: 0 }
        },

        // Preferences
        preferences: {
            theme: {
                type: String,
                enum: ["light", "dark", "auto"],
                default: "auto"
            },
            language: {
                type: String,
                default: "en"
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
                sms: { type: Boolean, default: false }
            },
            privacy: {
                showEmail: { type: Boolean, default: false },
                showFollowers: { type: Boolean, default: true },
                allowMessages: { type: Boolean, default: true }
            }
        },

        // Account Status
        isActive: {
            type: Boolean,
            default: true
        },
        lastActiveAt: {
            type: Date,
            default: Date.now
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },

        // Security
        refreshToken: String,
        emailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,

        // Additional Info
        location: {
            country: String,
            city: String,
            timezone: String
        },
        website: {
            type: String,
            match: [/^https?:\/\/.+/, "Please enter a valid URL"]
        },
        socialLinks: {
            twitter: String,
            instagram: String,
            facebook: String,
            linkedin: String,
            tiktok: String,
            youtube: String
        },

        // Content Categories (for creators)
        contentCategories: [
            {
                type: String,
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
            }
        ]
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.emailVerificationToken;
                delete ret.passwordResetToken;
                return ret;
            }
        }
    }
);

// Indexes
profileSchema.index({ email: 1 });
profileSchema.index({ username: 1 });
profileSchema.index({ "stats.followers": -1 });
profileSchema.index({ accountType: 1 });
profileSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
profileSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
profileSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
profileSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            displayName: this.displayName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    );
};

// Method to generate refresh token
profileSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    );
};

// Method to update last active
profileSchema.methods.updateLastActive = function () {
    this.lastActiveAt = new Date();
    return this.save();
};

export const Profile = model("Profile", profileSchema);

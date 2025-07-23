import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    console.log("Attempting to upload file:", localFilePath);

    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return null;
        }

        // Check if file exists before uploading
        if (!fs.existsSync(localFilePath)) {
            console.log("File does not exist at path:", localFilePath);
            return null;
        }

        console.log("File exists, uploading to Cloudinary...");

        // Enhanced upload options for better compatibility
        const uploadOptions = {
            resource_type: "auto",
            use_filename: true,
            unique_filename: false,
            folder: "video-uploads" // Optional: organize uploads in folders
        };

        // For video files, add specific video options
        const fileStats = fs.statSync(localFilePath);
        console.log("File size:", fileStats.size, "bytes");

        const result = await cloudinary.uploader.upload(
            localFilePath,
            uploadOptions
        );

        console.log("Successfully uploaded to cloudinary:", result.public_id);
        console.log("Cloudinary URL:", result.url);
        console.log("Duration:", result.duration);

        // Remove file from local path after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Local file cleaned up");
        }

        return result;
    } catch (error) {
        console.error("Cloudinary upload failed:");
        console.error("Error message:", error.message);
        console.error("Error details:", error);

        // Remove file from local path even if upload failed
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
                console.log("Local file cleaned up after error");
            } catch (unlinkError) {
                console.error("Failed to clean up local file:", unlinkError);
            }
        }
        return null;
    }
};

const deleteOnCloudinary = async (public_id, resource_type = "image") => {
    try {
        if (!public_id) return null;

        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });

        console.log("File deleted from cloudinary:", result);
        return result;
    } catch (error) {
        console.error("delete on cloudinary failed", error);
        return null;
    }
};

// Test function to verify Cloudinary configuration
export const testCloudinaryConfig = () => {
    console.log("Testing Cloudinary configuration:");
    console.log(
        "Cloud Name:",
        process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing"
    );
    console.log(
        "API Key:",
        process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing"
    );
    console.log(
        "API Secret:",
        process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing"
    );

    if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
    ) {
        console.error("❌ Cloudinary configuration is incomplete!");
        return false;
    }

    console.log("✅ Cloudinary configuration appears complete");
    return true;
};

// Call test on import
testCloudinaryConfig();

export { uploadOnCloudinary, deleteOnCloudinary };

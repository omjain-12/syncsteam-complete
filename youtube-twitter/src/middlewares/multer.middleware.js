import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Multer: Setting destination for file:", file.fieldname);
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + file.originalname;
        console.log("Multer: Generated filename:", filename);
        cb(null, filename);
    }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "videoFile") {
        // Accept video files
        if (file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only video files are allowed for videoFile"), false);
        }
    } else if (file.fieldname === "thumbnail") {
        // Accept image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed for thumbnail"), false);
        }
    } else {
        cb(new Error("Unexpected field"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Middleware to handle multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: "File too large. Maximum size is 100MB"
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                error: "Too many files uploaded"
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                error: "Unexpected field in file upload"
            });
        }
    }

    if (err.message) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    next(err);
};

// Debug middleware to log file upload information
export const debugFileUpload = (req, res, next) => {
    console.log("=== File Upload Debug Info ===");
    console.log("Files received:", req.files ? Object.keys(req.files) : "None");

    if (req.files) {
        Object.keys(req.files).forEach((fieldname) => {
            const files = req.files[fieldname];
            files.forEach((file, index) => {
                console.log(`${fieldname}[${index}]:`, {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: file.path
                });
            });
        });
    }

    console.log("Body:", req.body);
    console.log("============================");
    next();
};

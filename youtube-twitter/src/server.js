import dotenv from "dotenv";
import connectToDB from "./db/dbConnect.js";
import app from "./app-new.js";

dotenv.config({
    path: "./.env"
});

connectToDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `🚀 StreamHub Media Platform is running on port: ${
                    process.env.PORT || 8000
                }`
            );
            console.log(
                `📊 Health check available at: http://localhost:${
                    process.env.PORT || 8000
                }/health`
            );
            console.log(
                `🔗 API base URL: http://localhost:${
                    process.env.PORT || 8000
                }/api/v1`
            );
        });
    })
    .catch((error) => {
        console.log("❌ MONGODB connection failed: ", error);
    });

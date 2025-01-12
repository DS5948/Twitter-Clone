import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors"

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
};
app.use(cors(corsOptions))
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/notifications", notificationRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	connectMongoDB();
});

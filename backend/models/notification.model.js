import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["follow", "like","followRequest", "acceptedRequest"],
		},
		read: {
			type: Boolean,
			default: false,
		},
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post"
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

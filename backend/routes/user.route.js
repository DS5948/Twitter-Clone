import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { acceptRequest, followUnfollowUser, getFollowing, getSuggestedUsers, getUserProfile, searchUsers, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/following", protectRoute, getFollowing)
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/accept-request/:id", protectRoute, acceptRequest)
router.post("/update", protectRoute, updateUser);

export default router;

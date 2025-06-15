import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const startConversation = async (req, res) => {
  const { participantIds } = req.body;
  const currentUserId = req.user._id;

  // Check for invalid or empty participant list
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ error: "Participants list is required." });
  }

  // Prevent self-chat
  const allParticipantIds = [
    ...new Set([currentUserId.toString(), ...participantIds.map(String)]),
  ];
  if (allParticipantIds.length === 1) {
    return res.status(400).json({ error: "Cannot chat with yourself." });
  }

  // If 2 participants: Check for existing one-to-one conversation
  if (allParticipantIds.length === 2) {
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: allParticipantIds, $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: allParticipantIds,
        isGroup: false,
      });
    }

    return res.status(200).json(conversation);
  }

  // If more than 2 participants: create a group
  const conversation = await Conversation.create({
    participants: allParticipantIds,
    isGroup: true,
    groupName: "New Group",
    admin: currentUserId,
  });

  return res.status(201).json(conversation);
};

export const getUserConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .sort({ updatedAt: -1 }) // most recent first
      .populate("participants", "fullName profileImg")
      .populate("lastMessage", "text")
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "fullName profileImg"
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user?._id; // assuming `req.user` is set by your auth middleware

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  try {
    // Fetch all messages for the conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name profileImg")
      .populate("postId", "mediaUrl caption")
      .populate("isReadBy", "fullName profileImg");

    // Update isReadBy for messages not already read by this user
    const unreadMessageIds = messages
      .filter(
        (msg) =>
          !msg.isReadBy.some(
            (user) => user._id.toString() === userId.toString()
          )
      )
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { isReadBy: userId } } // $addToSet avoids duplicates
      );
    }

    // Refetch the updated messages to include updated isReadBy
    const updatedMessages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name profileImg")
      .populate("postId", "mediaUrl caption")
      .populate("isReadBy", "fullName profileImg");

    res.status(200).json(updatedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, caption, media } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !senderId || (!text && !caption && !media)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      senderId,
      text: text || "",
      caption: caption || "",
      media: media || [],
      isReadBy: [senderId],
    });

    await newMessage.save();

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: Date.now(),
    });

    // Populate sender and isReadBy
    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "fullName profileImg" },
      { path: "isReadBy", select: "fullName profileImg" },
    ]);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error while sending message" });
  }
};

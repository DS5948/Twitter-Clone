import Message from "../models/message.model.js";

export const chatSocket = (io, socket) => {
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("sendMessage", (message) => {
    const roomId = message.conversationId;
    io.to(roomId).emit("newMessage", message);
  });
  socket.on("readMessages", async ({ conversationId, userId }) => {
    const unreadMessages = await Message.find({
      conversationId,
      isReadBy: { $ne: userId },
    });

    const unreadMessageIds = unreadMessages.map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { isReadBy: userId } }
      );

      const updatedMessages = await Message.find({
        _id: { $in: unreadMessageIds },
      })
        .populate("senderId", "name profileImg")
        .populate("postId", "mediaUrl caption")
        .populate("isReadBy", "fullName profileImg");

      io.to(conversationId).emit("messagesRead", {
        conversationId,
        messages: updatedMessages,
      });
    }
  });
};

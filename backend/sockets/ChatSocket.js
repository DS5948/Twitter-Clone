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
};

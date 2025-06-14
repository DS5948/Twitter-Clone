import { useParams } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConversationsList from "./ConversationsList ";
import { IoSend } from "react-icons/io5";
import socket from "../../sockets/chatClient";

const ChatWindow = () => {
  const { id: conversationId } = useParams();
  const scrollRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();

  const [messageInput, setMessageInput] = useState("");

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Fetch conversation
  const {
    data: conversation,
    isLoading: loadingConversation,
  } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/chat/conversation/${conversationId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!conversationId,
  });

  // Fetch messages
  const {
    data: messages = [],
    isLoading: loadingMessages,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json()
      console.log("Messages:",data);
      
      return data;
    },
    enabled: !!conversationId,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mutation to send message
  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/chat/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          text: messageInput,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (newMessage) => {
      setMessageInput("");
      socket.emit("sendMessage", newMessage);
    },
  });

  // Socket listeners
  useEffect(() => {
    if (!conversationId || !authUser) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old = []) => [...old, newMessage]);
      }
    };

    socket.emit("joinConversation", conversationId);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.emit("leaveConversation", conversationId);
    };
  }, [conversationId, authUser, queryClient]);

  const getConversationName = () => {
    const isGroup = conversation?.isGroup;
    const otherUsers = conversation?.participants?.filter((p) => p._id !== authUser._id) || [];

    const displayNames = isGroup
      ? otherUsers
          .slice(0, 2)
          .map((u) => u.fullName)
          .join(", ") +
        (otherUsers.length > 2 ? ` and ${otherUsers.length - 2} others` : "")
      : otherUsers[0]?.fullName;

    return displayNames || "Conversation";
  };

  const getConversationImage = () => {
    if (!conversation || !authUser) return "/avatar-placeholder.png";
    if (conversation.isGroup) return "/avatar-placeholder.png";

    const otherUser = conversation.participants.find((p) => p._id !== authUser._id);
    return otherUser?.profileImg || "/avatar-placeholder.png";
  };

  const handleSend = () => {
    if (messageInput.trim() && !sending) {
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex h-screen">
      <ConversationsList selectedChatId={conversationId} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
          <div className="flex items-center gap-3">
            <img
              src={getConversationImage()}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-lg font-semibold">
              {loadingConversation ? "Loading..." : getConversationName()}
            </span>
          </div>
          <div className="flex gap-4 text-xl">
            {/* <button>📞</button>
            <button>🎥</button>
            <button>ℹ️</button> */}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 flex flex-col-reverse">
          <div ref={scrollRef}></div>
          {loadingMessages ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400">No messages yet.</div>
          ) : (
            [...messages].reverse().map((msg) => {
              const isOwn = msg.senderId._id === authUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? "justify-end" : "items-start gap-2"}`}
                >
                  {!isOwn && (
                    <img
                      src={msg.senderId.profileImg || "/avatar-placeholder.png"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="max-w-xs">
                    <div
                      className={`px-3 py-2 rounded-2xl whitespace-pre-line text-sm ${
                        isOwn ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                      }`}
                    >
                      {msg.text || msg.caption || ""}
                    </div>
                    {msg.isReadBy?.length > 0 && (
                      <div className="flex mt-1 space-x-1">
                        {msg.isReadBy.map((user) => (
                          msg.senderId._id != user._id && user._id != authUser._id &&
                          <img
                            key={user._id}
                            src={user.profileImg || "/avatar-placeholder.png"}
                            alt=""
                            className="w-4 h-4 rounded-full border"
                            title={user.fullName}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-300 px-4 py-2 flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-transparent placeholder-gray-400 outline-none"
          />
          <button className="text-xl" onClick={handleSend}>
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

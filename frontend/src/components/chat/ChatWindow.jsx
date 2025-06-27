import { useParams } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConversationsList from "./ConversationsList ";
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaRegSmile } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import EmojiPicker from "emoji-picker-react";
import socket from "../../sockets/chatClient";
import { GoReply } from "react-icons/go";

const ChatWindow = () => {
  const { id: conversationId } = useParams();
  const messageRefs = useRef({});
  const scrollRef = useRef(null);
  const emojiRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/chat/conversation/${conversationId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: async ({ messageInput, replyTo }) => {
      const res = await fetch(`${API_URL}/chat/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          text: messageInput,
          replyTo,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (newMessage, variables) => {
      console.log("New message sent:", newMessage);

      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg._id !== variables.tempId)
      );

      queryClient.setQueryData(["messages", conversationId], (old = []) => {
        const filtered = old.filter((msg) => msg._id !== variables.tempId);
        return [...filtered, newMessage];
      });

      socket.emit("sendMessage", newMessage);
    },
  });

  const handleSend = () => {
    if (messageInput.trim() && !sending && authUser) {
      const tempId = uuidv4();
      const optimisticMessage = {
        _id: tempId,
        text: messageInput,
        senderId: authUser,
        createdAt: new Date().toISOString(),
        status: "sending",
        replyTo: replyingTo
          ? {
              _id: replyingTo._id,
              text: replyingTo.text || replyingTo.caption || "",
              senderId: {
                _id: replyingTo.senderId._id || replyingTo.senderId,
                fullName:
                  replyingTo.senderId._id === authUser._id ||
                  replyingTo.senderId === authUser._id
                    ? "You"
                    : replyingTo.senderId.fullName || "Unknown",

                profileImg: replyingTo.senderId.profileImg || "",
              },
            }
          : null,
      };
      console.log(optimisticMessage);

      setOptimisticMessages((prev) => [...prev, optimisticMessage]);
      sendMessage({
        messageInput,
        tempId,
        replyTo: replyingTo?._id || null,
      });

      setMessageInput("");
      setShowEmojiPicker(false);
      setReplyingTo(null);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    socket.emit("joinConversation", {
      conversationId,
      userId: authUser._id,
    });
    return () => {
      socket.emit("leaveConversation", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !authUser) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old = []) => {
          const exists = old.some((msg) => msg._id === newMessage._id);
          return exists ? old : [...old, newMessage];
        });

        setOptimisticMessages((prev) =>
          prev.filter((msg) => msg._id !== newMessage._id)
        );

        socket.emit("readMessages", {
          conversationId,
          userId: authUser._id,
        });
      }
    };

    const handleMessagesRead = ({
      conversationId: convId,
      messages: updatedMsgs,
    }) => {
      if (convId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (old = []) => {
          const map = new Map(updatedMsgs.map((msg) => [msg._id, msg]));
          return old.map((msg) => map.get(msg._id) || msg);
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    if (messages?.length > 0) {
      socket.emit("readMessages", {
        conversationId,
        userId: authUser._id,
      });
    }

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [conversationId, authUser, messages]);

  const handleEmojiClick = (emojiData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const getConversationName = () => {
    const isGroup = conversation?.isGroup;
    const otherUsers =
      conversation?.participants?.filter((p) => p._id !== authUser._id) || [];
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
    const otherUser = conversation.participants.find(
      (p) => p._id !== authUser._id
    );
    return otherUser?.profileImg || "/avatar-placeholder.png";
  };

  const allMessages = [...messages, ...optimisticMessages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="flex-1 flex h-screen">
      <ConversationsList selectedChatId={conversationId} />
      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="w-full sticky top-0 left-0 sm:flex items-center justify-between px-4 py-3 border-b border-gray-300 bg-white">
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
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-16 sm:py-3 space-y-4 flex flex-col-reverse">
          <div ref={scrollRef}></div>
          {loadingMessages ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-500">
              Loading messages...
            </div>
          ) : allMessages.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-400">
              No messages yet.
            </div>
          ) : (
            [...allMessages].reverse().map((msg) => {
              const isOwn =
                msg.senderId._id === authUser._id ||
                msg.senderId === authUser._id;
              const isSending = msg.status === "sending";

              return (
                <div
                  key={msg._id}
                  ref={(el) => (messageRefs.current[msg._id] = el)}
                  className={`group flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div className="relative flex items-start max-w-xs">
                    {!isOwn && (
                      <img
                        src={
                          msg.senderId.profileImg || "/avatar-placeholder.png"
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                      />
                    )}

                    {/* Reply Icon */}
                    <GoReply
                      size={20}
                      color="gray"
                      onClick={() => {
                        inputRef.current?.focus();
                        setReplyingTo(msg);
                      }}
                      className={`absolute ${
                        isOwn ? "-left-6" : "-right-6"
                      } top-1/2 -translate-y-1/2 hidden group-hover:block cursor-pointer`}
                    />

                    <div>
                      {/* Replied-to Preview (on message bubble) */}
                      {msg.replyTo && (
                        <div
                          onClick={() => {
                            const repliedEl =
                              messageRefs.current[msg.replyTo._id];
                            if (repliedEl) {
                              repliedEl.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              repliedEl.classList.add(
                                "bg-blue-50",
                              );

                              // Optional: remove highlight after some time
                              setTimeout(() => {
                                repliedEl.classList.remove(
                                  "bg-blue-50",
                                );
                              }, 1500);
                            }
                          }}
                          className="cursor-pointer text-xs text-gray-300 mb-1 border-l-2 border-blue-400 pl-2 max-w-[240px] truncate transition"
                        >
                          <strong>
                            {msg.replyTo?.senderId?._id === authUser._id ||
                            msg.replyTo?.senderId === authUser._id
                              ? "You"
                              : msg.replyTo?.senderId?.fullName || "Unknown"}
                          </strong>
                          : {msg.replyTo?.text?.slice(0, 50) || "[media]"}
                        </div>
                      )}

                      <div
                        className={`px-3 py-2 rounded-2xl whitespace-pre-line text-sm ${
                          isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {msg.text || msg.caption || ""}
                      </div>
                    </div>
                  </div>

                  {isSending && (
                    <div className="text-xs text-gray-400 mt-1">Sending...</div>
                  )}

                  {msg.isReadBy?.length > 0 && (
                    <div className="flex mt-1 space-x-1">
                      {msg.isReadBy.map(
                        (user) =>
                          msg.senderId._id !== user._id &&
                          user._id !== authUser._id && (
                            <img
                              key={user._id}
                              src={user.profileImg || "/avatar-placeholder.png"}
                              alt=""
                              className="w-4 h-4 rounded-full border"
                              title={user.fullName}
                            />
                          )
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiRef}
            className="absolute bottom-28 left-4 z-10 shadow-lg rounded-xl bg-white"
          >
            <EmojiPicker theme="light" onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {/* Reply Preview */}
        {replyingTo && (
          <div className="bg-gray-100 px-3 py-2 flex justify-between items-center text-sm border-t border-gray-300">
            <div className="truncate">
              Replying to:{" "}
              <span className="font-medium text-gray-700">
                {replyingTo.text.slice(0, 80)}
              </span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={() => setReplyingTo(null)}
            >
              <IoMdClose />
            </button>
          </div>
        )}
        {/* Input */}
        <div className="w-full fixed bottom-0 left-0 sm:static px-4 py-2 bg-white">
          <div className="border border-gray-400 px-4 py-2 flex items-center gap-3 rounded-3xl">
            <button
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-xl text-gray-600 hidden sm:block"
            >
              <FaRegSmile />
            </button>
            <input
              ref={inputRef}
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
    </div>
  );
};

export default ChatWindow;

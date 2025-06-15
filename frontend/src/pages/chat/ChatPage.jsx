import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { useStartConversation } from "../../hooks/useStartCoversation";
import ConversationsList from "../../components/chat/ConversationsList ";
import Loader from "@mui/material/CircularProgress";

const ChatPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Start conversation hook
  const { mutate: startConversation, isPending: isStarting } =
    useStartConversation();

  // Fetch following users only when modal opens
  const fetchFollowing = async () => {
    const res = await fetch(`${API_URL}/users/following`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch following");
    return res.json();
  };

  const {
    data: suggestedUsers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["followingUsers"],
    queryFn: fetchFollowing,
    enabled: false,
  });

  const handleOpenModal = () => {
    setShowModal(true);
    refetch();
  };

  const toggleUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleStartChat = () => {
    if (selectedUsers.length === 0) return;

    const userIds = selectedUsers.map((u) => u._id);
    startConversation(userIds);
    setShowModal(false);
    setSelectedUsers([]);
  };

  return (
    <div className="flex w-full h-screen">
      {/* Left Sidebar */}
      <ConversationsList
        onSelectChat={setSelectedChat}
        selectedChat={selectedChat}
        onOpenNewMessageModal={handleOpenModal}
      />

      {/* Right Chat Section */}
      <div className="hidden sm:flex-1 sm:flex sm:flex-col items-center justify-center h-full">
        <div className="text-4xl mb-2">💬</div>
        <div className="text-lg font-semibold mb-1">Your messages</div>
        <div className="text-gray-400 mb-4">
          Send a message to start a chat.
        </div>
        <button
          className="bg-black hover:bg-gray-800 px-4 py-2 rounded text-white"
          onClick={handleOpenModal}
        >
          Send message
        </button>
      </div>

      {/* New Message Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="relative z-10"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
              <div className="px-4 py-5">
                <DialogTitle className="text-lg font-bold mb-2">
                  New message
                </DialogTitle>

                {/* Selected Users */}
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user._id}
                      className="bg-black px-2 py-1 rounded text-sm flex items-center gap-1 text-white"
                    >
                      {user.fullName}
                      <button
                        onClick={() => toggleUser(user)}
                        className="ml-1 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggested Users */}
                <div className="relative mb-4 h-64 max-h-64 overflow-y-auto">
                  <div className="font-semibold mb-1">Suggested</div>

                  {isLoading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Loader sx={() => ({ color: "#000" })} />
                    </div>
                  )
                  }
                  {isError && <p>Failed to load suggested users</p>}

                  {suggestedUsers.map((user) => {
                    const isSelected = selectedUsers.some(
                      (u) => u._id === user._id
                    );

                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleUser(user)}
                        className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer ${
                          isSelected
                            ? "bg-gray-300"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {/* Left: Avatar + Name */}
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profileImg || "/avatar-placeholder.png"}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span
                            className="font-medium text-black"
                          >
                            {user.fullName}
                          </span>
                        </div>

                        {/* Right: Custom Circle Checkbox */}
                        <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                          {isSelected && (
                            <div className="w-3 h-3 bg-black rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Button */}
                <button
                  onClick={handleStartChat}
                  disabled={selectedUsers.length === 0 || isStarting}
                  className={`w-full py-2 rounded mt-4 text-white font-semibold ${
                    selectedUsers.length === 0 || isStarting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800"
                  }`}
                >
                  {isStarting ? "Starting..." : "Chat"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ChatPage;

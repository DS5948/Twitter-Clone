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

const ChatPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [selectedChat, setSelectedChat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Start conversation hook
  const {
    mutate: startConversation,
    isPending: isStarting,
  } = useStartConversation();

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
      />

      {/* Right Chat Section */}
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <div className="text-4xl mb-2">💬</div>
        <div className="text-lg font-semibold mb-1">Your messages</div>
        <div className="text-gray-400 mb-4">
          Send a message to start a chat.
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          onClick={handleOpenModal}
        >
          Send message
        </button>
      </div>

      {/* New Message Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-10">
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
                      className="bg-blue-600 px-2 py-1 rounded text-sm flex items-center gap-1 text-white"
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
                <div className="mb-4 max-h-64 overflow-y-auto">
                  <div className="font-semibold mb-1">Suggested</div>

                  {isLoading && <p>Loading...</p>}
                  {isError && <p>Failed to load suggested users</p>}

                  {suggestedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                          <img
                            src={user.profileImg || "/avatar-placeholder.png"}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                        <span>{user.fullName}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedUsers.some((u) => u._id === user._id)}
                        onChange={() => toggleUser(user)}
                        className="accent-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Chat Button */}
                <button
                  onClick={handleStartChat}
                  disabled={selectedUsers.length === 0 || isStarting}
                  className={`w-full py-2 rounded mt-4 text-white font-semibold ${
                    selectedUsers.length === 0 || isStarting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
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

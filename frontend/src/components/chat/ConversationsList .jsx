import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const ConversationsList = () => {
  const navigate = useNavigate();
  const { id: selectedChatId } = useParams();
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch conversations from API
  const fetchConversations = async () => {
    const res = await fetch(`${API_URL}/chat/conversations`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch conversations");
    }
    const data = await res.json();
    console.log(data);

    return data;
  };
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userConversations"],
    queryFn: fetchConversations,
  });

  const handleSelectChat = (conv) => {
    navigate(`/inbox/t/${conv._id}`);
  };

  return (
    <div className="w-[320px] border-r border-gray-300 overflow-y-auto">
      <div className="px-4 py-2 font-bold text-lg">Messages</div>

      {isLoading && <div className="px-4 py-2 text-gray-500">Loading...</div>}
      {isError && (
        <div className="px-4 py-2 text-red-500">
          Failed to load conversations
        </div>
      )}

      {conversations.map((conv) => {
        const isGroup = conv.isGroup;

        // Exclude current user from participant list
        const otherUsers = conv.participants.filter(
          (p) => p._id !== authUser._id
        );

        // Create display names for group or 1-on-1
        const displayNames = isGroup
          ? otherUsers
              .slice(0, 2)
              .map((u) => u.fullName)
              .join(", ") +
            (otherUsers.length > 2
              ? ` and ${otherUsers.length - 2} others`
              : "")
          : otherUsers[0]?.fullName;

        // Choose image:
        const displayImage = isGroup
          ? "/avatar-placeholder.png" // You can customize this image
          : otherUsers[0]?.profileImg || "/avatar-placeholder.png";

        return (
          <div
            key={conv._id}
            className={`p-4 flex gap-3 items-center cursor-pointer hover:bg-gray-100 ${
              selectedChatId === conv._id ? "bg-gray-200" : ""
            }`}
            onClick={() => handleSelectChat(conv)}
          >
            <img
              src={displayImage}
              alt={displayNames}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold">{displayNames}</div>
              <div className="text-sm text-gray-400">Last chat</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;

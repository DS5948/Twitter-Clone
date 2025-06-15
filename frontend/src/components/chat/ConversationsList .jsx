import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaRegEdit } from "react-icons/fa";
import Loader from "@mui/material/CircularProgress";

const ConversationsList = ({onOpenNewMessageModal}) => {
  const navigate = useNavigate();
  const location = useLocation()
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
  const isChatWindow = location.pathname.includes("/inbox/t")
  return (
    <div className={`${isChatWindow ? "hidden sm:block" : ""} relative w-full sm:w-fit md:w-[320px] border-r border-gray-300 overflow-y-auto`}>
      <div className="flex justify-between items-center sm:hidden md:flex px-4 py-2 border-b border-gray-300">
        <p className="font-semibold text-lg">Messages</p>
        <FaRegEdit className="cursor-pointer" onClick={onOpenNewMessageModal} size={22} />
      </div>

      {isLoading && <div className="px-4 py-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500"><Loader sx={() => ({ color: "#000" })} /></div>}
      {isError && (
        <div className="w-full text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-2 text-red-500">
          Failed to load conversations
        </div>
      )}
      {conversations.length == 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-800">No messages here</div>
      )} 
      {conversations.map((conv) => {
        console.log(conv);
        
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
            <div className="block sm:hidden md:block">
              <div className="font-semibold">{displayNames}</div>
              <div className="text-sm text-gray-400">Last Chat</div>
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default ConversationsList;

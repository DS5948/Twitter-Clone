import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPostDate } from "../../utils/date";

const NotificationPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/notifications/getAllNotifications`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
  });

  const { mutate: acceptMutation, isPending: isAccepting } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`${API_URL}/users/accept-request/${userId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
    },
    onSuccess: () => {
      toast.success("Request accepted");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Utility: Categorize notifications by time
  const categorizeNotifications = (notifications) => {
    const now = new Date();
    const today = [];
    const last7Days = [];
    const lastMonth = [];
    const older = [];

    for (let n of notifications) {
      const created = new Date(n.createdAt);
      const diff = (now - created) / (1000 * 60 * 60 * 24); // in days

      if (diff < 1) today.push(n);
      else if (diff < 7) last7Days.push(n);
      else if (diff < 30) lastMonth.push(n);
      else older.push(n);
    }

    return { today, last7Days, lastMonth, older };
  };

  const renderGroup = (group, title) => {
    if (group.length === 0) return null;

    return (
      <div className="mb-6 border-t border-gray-300 pt-2 px-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
        {group.map((notification) => {
          const isRequestAccepted = authUser?.followers.includes(
            notification.from._id
          );
          const time = formatPostDate(notification.createdAt);

          let message = "";
          if (notification.type === "follow") message = "started following you";
          if (notification.type === "like") message = "liked your post";
          if (notification.type === "followRequest")
            message = "sent you a request";
          if (notification.type === "acceptedRequest")
            message = "accepted your follow request";

          return (
            <div
              key={notification._id}
              className="flex items-center justify-between mb-4 rounded-lg"
            >
              <div className="w-full flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${notification.from.username}`}>
                    <div className="w-11 h-11 rounded-full overflow-hidden">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">
                        @{notification.from.username}
                      </span>{" "}
                      {message} <span className="text-gray-500">{time}</span>
                    </p>
                  </div>
                </div>
                {notification.post ? (
                  <Link to={`/p/${notification.post._id}`}>
                    <div className="w-11 h-11">
                      <img
                        className="rounded w-11 h-11 object-cover"
                        src={notification.post?.img}
                      />
                    </div>
                  </Link>
                ) : (
                  <></>
                )}
              </div>

              {notification.type === "followRequest" &&
                (isRequestAccepted ? (
                  <button
                    disabled
                    className="text-sm font-medium text-white bg-gray-600 px-4 py-1.5 rounded-full cursor-default"
                  >
                    Accepted
                  </button>
                ) : (
                  <button
                    onClick={() => acceptMutation(notification.from._id)}
                    disabled={isAccepting}
                    className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-1.5 rounded-full transition"
                  >
                    Accept
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-[4_4_0] min-h-screen">
      <div className="fixed bg-white w-full flex justify-between items-center mb-6 px-4 py-4 ">
        <p className="font-bold text-3xl text-gray-800">Notifications</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center p-4 font-bold">No notifications 🤔</div>
      ) : (
        (() => {
          const grouped = categorizeNotifications(notifications);
          return (
            <div className="mt-20">
              {renderGroup(grouped.today, "Today")}
              {renderGroup(grouped.last7Days, "Last 7 Days")}
              {renderGroup(grouped.lastMonth, "Last Month")}
              {renderGroup(grouped.older, "Older")}
            </div>
          );
        })()
      )}
    </div>
  );
};

export default NotificationPage;

import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { formatPostDate } from "../../utils/date";

const NotificationPage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${API_URL}/notifications/getAllNotifications`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        console.log(data);

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(
          `${API_URL}/notifications/deleteAllNotifications`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: acceptMutation, isPending: isAccepting } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`${API_URL}/users/accept-request/${userId}`, {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Request accepted");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <>
      <div className="flex-[4_4_0] min-h-screen ml-2">
        <div className="flex justify-between items-center p-4">
          <p className="font-bold text-3xl text-gray-800">Notifications</p>
          {/* <div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div> */}
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => {
          const isRequestAccepted = authUser.followers.includes(
            notification.from._id
          );
          const time = formatPostDate(notification.createdAt)

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
              className="flex items-center justify-between p-4 transition rounded-lg bg-[#F6F6F6] mb-2"
            >
              <div className="flex items-center gap-4">
                <Link to={`/profile/${notification.from.username}`}>
                  <div className="w-12 h-12 rounded-full overflow-hidden">
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
                  <p className="text-sm ">
                    <span className="font-semibold">
                      @{notification.from.username}
                    </span>{" "}
                    {message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{time}</p>
                </div>
              </div>

              {/* Action button if it's a follow request */}
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
                    onClick={(e) => {
                      e.preventDefault();
                      acceptMutation(notification.from._id);
                    }}
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
    </>
  );
};
export default NotificationPage;

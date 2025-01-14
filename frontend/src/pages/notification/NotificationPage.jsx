import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
	const API_URL = process.env.REACT_APP_API_URL;
	const queryClient = useQueryClient();
	const {data: authUser} = useQuery({queryKey: ['authUser']})
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {				
				const res = await fetch(`${API_URL}/notifications/getAllNotifications`,{
					method: "GET",
					credentials: "include"
				});
				
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
				const res = await fetch(`${API_URL}/notifications/deleteAllNotifications`, {
					method: "DELETE",
					credentials: "include"
				});
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
			toast.success("Request accepted")
			queryClient.invalidateQueries({queryKey: ['authUser']})
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
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
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='px-2 flex justify-between items-center border-b border-gray-700' key={notification._id}>
						<div className='flex items-center gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 h-8 rounded-full'>
										<img className='w-8 h-8 object-cover rounded-full' src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
							</Link>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "follow" ? "followed you" : ""}
									{notification.type === "like" ? "liked your post": ""}
									{notification.type === "followRequest" ? "requested to follow you": ""}
									{notification.type === "acceptedRequest" ? "accepted your follow request": ""}
								</div>
								
								</div>
							{notification.type === "followRequest" && !authUser.followers.includes(notification.from._id) && (
								<button disabled={isAccepting } onClick={(e) => {
									e.preventDefault()
									acceptMutation(notification.from._id)
								}} className='inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 sm:ml-3 sm:w-auto'>
									Confirm
								</button>
								)
								}
								{
									notification.type === "followRequest" && authUser.followers.includes(notification.from._id) && (
										<button disabled className='inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto'>
											Accepted
										</button>
										)
								}
						
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;

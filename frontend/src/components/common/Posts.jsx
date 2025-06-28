import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
	const API_URL = process.env.REACT_APP_API_URL;
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return `${API_URL}/posts/all`;
			case "following":
				return `${API_URL}/posts/following`;
			case "posts":
				return `${API_URL}/posts/user/${username}`;
			case "likes":
				return `${API_URL}/posts/likes/${userId}`;
			default:
				return `${API_URL}/posts/all`;
		}
	};
 
	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				console.log(POST_ENDPOINT);
				
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "include",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log(data);
				
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && !isRefetching && posts && (
				<div className="pb-12">
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;

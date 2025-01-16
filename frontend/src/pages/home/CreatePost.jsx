import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Loader from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";

const CreatePost = () => {
	const API_URL = process.env.REACT_APP_API_URL;
	const [text, setText] = useState("");
	const [file, setFile] = useState(null); // Can be image or video
	const fileRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const {
		mutate: createPost,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ text, file }) => {
			try {
				const res = await fetch(`${API_URL}/posts/create`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ text, file }),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error.message || "Error creating post");
			}
		},

		onSuccess: () => {
			setText("");
			setFile(null);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({ text, file });
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setFile({
					url: reader.result,
					type: file.type.startsWith("video/") ? "video" : "image",
				});
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='bg-white border border-gray-300 max-w-[600px] mx-auto flex p-4 items-start gap-4'>
			<Link to={`/profile/${authUser.username}`}>
			<img className="w-10 h-10 rounded-full object-cover" src={authUser.profileImg || "/avatar-placeholder.png"} />
			</Link>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='outline-none border-b border-gray-300 focus:border-gray-600 resize-none overflow-auto'
					placeholder='Share something'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{file && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setFile(null);
								fileRef.current.value = null;
							}}
						/>
						{file.type === "image" ? (
							<img src={file.url} className='w-full mx-auto h-72 object-contain rounded' />
						) : (
							<video
								controls
								src={file.url}
								className='w-full mx-auto h-72 object-contain rounded'
							/>
						)}
					</div>
				)}

				<div className='flex justify-between py-2'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => fileRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input
						type='file'
						accept='image/*,video/*'
						hidden
						ref={fileRef}
						onChange={handleFileChange}
					/>
					<button className='inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 sm:ml-3 w-14'>
						{isPending ? <Loader sx={() => ({ color: "#fff" })} size={18} /> : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;

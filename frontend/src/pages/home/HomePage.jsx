import { useState } from "react";
import XSvg from "../../components/svgs/X.jsx";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import RightPanel from "../../components/common/RightPanel";
import { Link } from "react-router-dom";

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");

	return (
			<div className='flex-[4_4_0] mr-auto max-w-[600px] mx-auto min-h-screen'>
				{/* Header */}
				<div className="flex justify-between items-center">
				<div className="hidden sm:block font-bold text-2xl">
					Feed
				</div>
				<div>
				<Link to="/" className="flex sm:hidden justify-center md:justify-start">
					<XSvg className="px-2 w-12 h-12 rounded-full fill-black" />
				</Link>
				</div>
				<div className="flex items-center gap-2">
					<div
						className={
							`flex ${feedType === "forYou" ? "text-black": "text-gray-500"} justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative`
						}
						onClick={() => setFeedType("forYou")}
					>
						For you
						
					</div>
					<div
						className={`flex justify-center  ${feedType === "following" ? "text-black": "text-gray-500"} flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative`}
						onClick={() => setFeedType("following")}
					>
						Following
						
					</div>
				</div>
				</div>

				{/*  CREATE POST INPUT */}
				<CreatePost />

				{/* POSTS */}
				<Posts feedType={feedType} />
		</div>
	);
};
export default HomePage;

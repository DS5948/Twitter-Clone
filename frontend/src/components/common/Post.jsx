import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { GoHeart } from "react-icons/go";
import { FaRegComment } from "react-icons/fa6";
import avatar from "../assets/boy1.png";
import { AiOutlineDelete } from "react-icons/ai";
import test_post from "../assets/post2.png";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { useRef, useEffect } from "react";
import { GoMute } from "react-icons/go";
import { GoUnmute } from "react-icons/go";
import { FaPlay } from "react-icons/fa6";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";
import { IoSend } from "react-icons/io5";

const Post = ({ post }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [comment, setComment] = useState("");
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [open, setOpen] = useState(false);
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const postOwner = post.user;
  const [isMuted, setIsMuted] = useState(true); // State to handle mute/unmute
  const [isVideoEnded, setIsVideoEnded] = useState();
  const videoRef = useRef(null); // Ref for the video element
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.5 } // Adjust the threshold as needed
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);
  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleRestartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };
  const isLiked = localLikes.includes(authUser._id);

  const isMyPost = authUser._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${post._id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_URL}/posts/like/${post._id}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      // this is not the best UX, bc it will refetch all posts
      // queryClient.invalidateQueries({ queryKey: ["posts"] });

      // instead, update the cache directly for that post
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
      setLocalLikes((prevLikes) =>
        isLiked
          ? prevLikes.filter((id) => id !== authUser._id) // Remove like
          : [...prevLikes, authUser._id] // Add like back
      );
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_URL}/posts/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    setLocalLikes((prevLikes) =>
      isLiked
        ? prevLikes.filter((id) => id !== authUser._id) // Remove like
        : [...prevLikes, authUser._id] // Add like
    );
    likePost();
  };

  return (
    <div className="bg-white max-w-[600px] mx-auto border border-t-0 border-gray-300 ">
      {/* Header */}
      <div className="flex justify-between items-center p-2">
        <div className="flex items-center gap-4">
          <img
            src={postOwner.profileImg || "/avatar-placeholder.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <Link
              to={`/profile/${postOwner.username}`}
              className="block font-semibold text-gray-800"
            >
              {postOwner.fullName}
              <span className="text-gray-500 ml-2">{formattedDate}</span>
            </Link>
            <span className="text-sm text-gray-500">@{postOwner.username}</span>
          </div>
        </div>
        {isMyPost && !isDeleting && (
          <AiOutlineDelete
            onClick={handleDeletePost}
            size={24}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          />
        )}
      </div>

      {/* Content */}
      <div className={`${post.text === "" ? "hidden" : ""} text-gray-700 px-2`}>
        {post.text}
      </div>

      {/* Image or Video */}
      <div>
        {post.img && (
          <img
            src={post.img}
            alt="post content"
            className="w-full h-auto max-h-[600px] object-cover"
          />
        )}
        {post.video && (
          <div className="relative">
            <video
              ref={videoRef}
              src={post.video}
              muted={isMuted}
              autoPlay
              onEnded={() => setIsVideoEnded(true)}
              onPlay={() => setIsVideoEnded(false)}
              className={`${
                isVideoEnded ? "opacity-90" : ""
              } w-full h-auto max-h-[600px] object-cover`}
            >
              <source src={post.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Unmute Button */}
            <button
              onClick={handleToggleMute}
              className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              {isMuted ? <GoMute size={18} /> : <GoUnmute size={18} />}
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestartVideo}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 text-white ${
                !isVideoEnded ? "hidden" : ""
              }`}
            >
              <FaPlay size={40} />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between text-gray-500 mb-2 px-2 pt-2">
        <div className="flex items-center gap-6">
          <GoHeart
            onClick={handleLikePost}
            className={`text-xl hover:text-red-500 ${
              isLiked ? "text-red-500" : ""
            } cursor-pointer`}
            size={24}
          />
          <FaRegComment
            onClick={() => setOpen(true)}
            className="text-xl hover:text-blue-500 cursor-pointer"
            size={24}
          />
        </div>
        <Dialog open={open} onClose={setOpen} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className=" flex min-h-full justify-center text-center items-center px-4">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 w-full max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                <div className="flex flex-col bg-white max-h-[500px] relative">
                  <div className="p-4 flex justify-between items-center border-b ">
                    <h2 className="text-xl">Comments</h2>
                    <RxCross1
                      size={20}
                      className="cursor-pointer"
                      onClick={() => setOpen(false)}
                    />
                  </div>
                  <div className="overflow-y-auto">
                    {post.comments.length === 0 && (
                      <div className="w-full text-center py-2">
                        No Comments Yet
                      </div>
                    )}
                    {post.comments?.map((comment) => (
                      <div
                        key={comment._id}
                        className="px-4 py-2 flex gap-2 items-start"
                      >
                        <Link to={`/profile/${comment.user.username}`}>
						<img
                          src={comment.user.profileImg || "/avatar-placeholder.png"}
                          className="h-8 w-8 rounded-full object-cover"
                          alt={`${comment.user.username}'s profile`}
                        />
						</Link>
						
                        <div className="flex-1">
						<Link to={`/profile/${comment.user.username}`}>
                          <span className="text-sm font-semibold text-gray-900">
                            {comment.user.username}
                          </span>{" "}
						  </Link>
                          <span className="text-sm text-gray-800 break-words break-all">
                            {comment.text}
                          </span>
                        </div>
						
                      </div>
                    ))}
                  </div>
                  {/* Comment Input */}
                  <div className="relative mt-auto">
                    <textarea
                      type="text"
                      placeholder="Enter your comment"
                      className="p-2 pr-8 w-full h-full border border-b-0 resize-none outline-none"
                      onChange={(e) => setComment(e.target.value)}
                    />

                    <button
                      disabled={comment === "" || isCommenting}
                      onClick={handlePostComment}
                      className={`${
                        comment === "" ? "text-gray-500" : ""
                      } absolute top-1/2 -translate-y-1/2 right-2`}
                    >
                      <IoSend size={24} />
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-gray-500 text-sm px-2 pb-1">
        <span>{localLikes.length} likes</span>
        <span>{post.comments.length} comments</span>
      </div>
    </div>
  );
};
export default Post;

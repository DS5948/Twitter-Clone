import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import { useState, useRef, useEffect, useState as useReactState } from "react";
import { formatPostDate } from "../../utils/date";

const SinglePostPage = () => {
  const { postId } = useParams();
  const API_URL = process.env.REACT_APP_API_URL;
  const [liked, setLiked] = useState(false);
  const imageRef = useRef(null);
  const [imgHeight, setImgHeight] = useReactState(0);

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) throw new Error(data.error || "Post fetch failed");
      return data;
    },
  });

  useEffect(() => {
    const updateHeight = () => {
      if (imageRef.current) {
        setImgHeight(imageRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [post?.img]);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="p-4 text-red-500">{error.message}</div>;

  return (
    <div className="flex justify-center items-center h-screen w-full p-4">
      <div className="flex w-full max-w-5xl overflow-hidden">
        {/* Left: Post Image */}
        <div className="w-full md:w-1/2">
        <div className="md:hidden flex items-center gap-1 mb-2">
          <img
              src={post.user.profileImg || "/avatar-placeholder.png"}
              alt="user"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-gray-800 font-semibold">@{post.user.username}</p>
            </div>
        </div>
          <img
            ref={imageRef}
            src={post.img}
            alt="Post"
            className="w-full object-contain"
            style={{ maxHeight: "90vh" }}
          />
          <div className="md:hidden py-2">
            <div className="flex items-center gap-4 mb-2">
              {liked ? (
                <FaHeart
                  className="text-red-500 cursor-pointer text-xl"
                  onClick={() => setLiked(false)}
                />
              ) : (
                <FaRegHeart
                  className="cursor-pointer text-xl"
                  onClick={() => setLiked(true)}
                />
              )}
              <FaRegComment className="text-xl" />
            </div>
            <p className="text-sm font-semibold">{post.likes.length} likes</p>
            <p className="text-sm text-gray-400">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="w-1/2 hidden md:flex md:flex-col "
          style={{ height: `${imgHeight}px` }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-gray-300 p-4">
            <img
              src={post.user.profileImg || "/avatar-placeholder.png"}
              alt="user"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">@{post.user.username}</p>
              <p className="text-xs text-gray-400">
                {post.location}
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 text-sm">
            {post.comments?.length > 0 ? (
              post.comments.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Link to={`/profile/${c.user.username}`}>
                    <img
                      src={c.user.profileImg || "/avatar-placeholder.png"}
                      className="h-8 w-8 rounded-full object-cover"
                      alt={`${c.user.username}'s profile`}
                    />
                  </Link>
                  <div className="flex-1">
                    <div>
                      <Link to={`/profile/${c.user.username}`}>
                        <span className="text-sm font-semibold text-gray-900">
                          {c.user.username}
                        </span>{" "}
                      </Link>
                      <span className="text-sm text-gray-800 break-words break-all">
                        {c.text} 
                      </span>
                      <span className="text-sm text-[#A8A8A8]">
                      {" "}{formatPostDate(c.createdAt)}
                    </span>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            )}
          </div>

          {/* Likes + Timestamp */}
          <div className="px-4 py-2 border-t border-gray-300">
            <div className="flex items-center gap-4 mb-2">
              {liked ? (
                <FaHeart
                  className="text-red-500 cursor-pointer text-xl"
                  onClick={() => setLiked(false)}
                />
              ) : (
                <FaRegHeart
                  className="cursor-pointer text-xl"
                  onClick={() => setLiked(true)}
                />
              )}
              <FaRegComment className="text-xl" />
            </div>
            <p className="text-sm font-semibold">{post.likes.length} likes</p>
            <p className="text-sm text-gray-400">
              {formatPostDate(post.createdAt)}
            </p>
          </div>

          {/* Add Comment */}
          <div className="px-4 py-2 border-t border-gray-300 flex items-center gap-2">
            <img
              src={post.user.profileImg || "/avatar-placeholder.png"}
              alt="me"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 p-2 text-sm border border-gray-300 rounded-full outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;

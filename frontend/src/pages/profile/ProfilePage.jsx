import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CiLock } from "react-icons/ci";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { Backdrop } from "@mui/material";
import Loader from "@mui/material/CircularProgress";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import { IoIosLogOut } from "react-icons/io";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import useLogout from "../../hooks/useLogout";

const ProfilePage = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams();
  const { logout, loggingOut } = useLogout()
  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: userposts, isLoading: loadingPosts } = useQuery({ queryKey: ["posts"] });
  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile/${username}`, {
          method: "GET",
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
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = authUser._id === user?._id;
  const requested = authUser?.pendingRequests.includes(user?._id)
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);
  
  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <div className="flex-[4_4_0] mr-auto max-w-[800px] mx-auto min-h-screen">
      <Backdrop sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={loggingOut}>
          <div className="flex flex-col items-center gap-2">
            <Loader color="inherit" />
            <div>Logging Out</div>
          </div>
      </Backdrop>
      {/* HEADER */}
      {(isLoading || isRefetching || loadingPosts) && <ProfileHeaderSkeleton />}
      {!isLoading && !isRefetching && !user && (
        <p className="text-center text-lg mt-4">User not found</p>
      )}
      <div className="flex flex-col">
        {!isLoading && !isRefetching && !loadingPosts && user && (
          <>
            {/* COVER IMG */}
            <div className="relative group/cover">
              <img
                src={coverImg || user?.coverImg || "/cover.png"}
                className="h-52 w-full object-cover"
                alt="cover image"
              />
              {isMyProfile && (
                <div
                  className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                  onClick={() => coverImgRef.current.click()}
                >
                  <MdEdit className="w-5 h-5 text-white" />
                </div>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                ref={coverImgRef}
                onChange={(e) => handleImgChange(e, "coverImg")}
              />
              <input
                type="file"
                hidden
                accept="image/*"
                ref={profileImgRef}
                onChange={(e) => handleImgChange(e, "profileImg")}
              />
              {/* USER AVATAR */}
              <div className="avatar absolute -bottom-16 left-4">
                <div className="w-32 rounded-full relative group/avatar">
                  <img
                    className="w-32 h-32 rounded-full object-cover"
                    src={
                      profileImg ||
                      user?.profileImg ||
                      "/avatar-placeholder.png"
                    }
                  />
                  <div className="absolute top-0 right-0 p-1 bg-black rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                    {isMyProfile && (
                      <MdEdit
                        className="w-4 h-4 text-white"
                        onClick={() => profileImgRef.current.click()}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end px-4 mt-5">
              {isMyProfile && <EditProfileModal authUser={authUser} />}
              {isMyProfile && 
              <button className='inline-flex justify-center px-3 py-2 text-sm font-semibold sm:ml-3'
               onClick={(e) => {
                e.preventDefault()
                logout()
               }}>
                <IoIosLogOut size={30}/>
              </button>
              }  
              {!isMyProfile && (
                <button
				  disabled={requested}
                  className={`inline-flex w-fit justify-center rounded-md ${requested ? "bg-gray-800":"bg-black"} px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 sm:ml-3 sm:w-auto`}
                  onClick={() => follow(user?._id)}
                >
                  {isPending && "Loading..."}
				  {!isPending && requested && "Requested"}
                  {!isPending && !requested && amIFollowing && "Unfollow"}
                  {!isPending && !requested && !amIFollowing && "Follow"}

                </button>
              )}
              {(coverImg || profileImg) && (
                <button
                  className="btn bg-black p-1 btn-primary rounded-md btn-sm text-white px-4 ml-2"
                  onClick={async () => {
                    await updateProfile({ coverImg, profileImg });
                    setProfileImg(null);
                    setCoverImg(null);
                  }}
                >
                  {isUpdatingProfile ? "Updating..." : "Update"}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4 mt-14 px-4">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{user?.fullName}</span>
                <span className="text-sm text-slate-500">
                  @{user?.username}
                </span>
                <span className="text-sm my-1">{user?.bio}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {user?.link && (
                  <div className="flex gap-1 items-center ">
                    <>
                      <FaLink className="w-3 h-3 text-slate-500" />
                      <a
                        href={user?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {/* Updated this after recording the video. I forgot to update this while recording, sorry, thx. */}
                        {user?.link}
                      </a>
                    </>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">
                    {memberSinceDate}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 items-center">
                  <span className="font-semibold text-sm">
                    {user?.following.length}
                  </span>
                  <span className="text-slate-500 text-sm">Following</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="font-semibold text-sm">
                    {user?.followers.length}
                  </span>
                  <span className="text-slate-500 text-sm">Followers</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="font-semibold text-sm">
                    {userposts?.length}
                  </span>
                  <span className="text-slate-500 text-sm">Posts</span>
                </div>
              </div>
            </div>
            <div className="flex w-full border-b border-gray-300 mt-4">
              <div
                className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
                onClick={() => setFeedType("posts")}
              >
                Posts
                {feedType === "posts" && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                )}
              </div>
              <div
                className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                onClick={() => setFeedType("likes")}
              >
                Likes
                {feedType === "likes" && (
                  <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </>
        )}
        {isMyProfile && (
          <Posts feedType={feedType} username={username} userId={user?._id} />
        )}
        {!isMyProfile && (authUser?.following.includes(user?._id) || !user?.isPrivate) && (
          <Posts feedType={feedType} username={username} userId={user?._id} />
        )}
        {!isLoading && !isRefetching && !isMyProfile && !authUser?.following.includes(user?._id) && user?.isPrivate && (
          <div className="mx-auto mt-4 flex gap-2 w-fit justify-center items-center">
			,<div className="border-2 p-1 border-black rounded-full">
			<CiLock size={50}/>
			</div>
			<div className="flex flex-col">
			<p className="text-lg font-bold self-start">This account is private</p>
		  <p className="text-md font-semibold">
            Follow to view {user?.fullName}'s posts.
          </p>
			</div>
		  
		  </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;

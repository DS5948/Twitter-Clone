import XSvg from "../svgs/X";

import { GoHome } from "react-icons/go";
import { GoBell } from "react-icons/go";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const location = useLocation()
  const[active, setActive] = useState('home')
  useEffect(()=> {
    if(location.pathname.includes('notifications')) {
      setActive('notifications')
    }
    else if(location.pathname.includes('profile')) {
      setActive('profile')
    }
    else {
      setActive('home')
    }
  },[location.pathname])
  const API_URL = process.env.REACT_APP_API_URL;
  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className=" bg-white md:flex-[2_2_0] border-r border-gray-300  w-24 max-w-60">
      
      <div className="sticky top-0 left-0 h-screen flex flex-col w-24 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-black" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4 p-1">
          <li className={`flex ${active === 'home' ? 'bg-slate-300' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to="/"
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <GoHome size={24} />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className={`flex ${active === 'notifications' ? 'bg-slate-300' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to="/notifications"
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <GoBell size={24} />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className={`flex ${active === 'profile' ? 'bg-slate-300' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <AiOutlineUser size={24} />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <div
            className="relative cursor-pointer mt-auto mb-10 flex gap-2 items-center transition-all duration-300 py-2 px-4 rounded-full"
          >
            <div className="avatar md:inline-flex justify-start">
              <Link to={`/profile/${authUser.username}`} className="w-10 h-10">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={authUser?.profileImg || "/avatar-placeholder.png"}
                />
              </Link>
            </div>
            <Link to={`/profile/${authUser.username}`} className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-black text-sm">{authUser?.fullName}</p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
            </Link>
			<button onClick={(e) => {
				e.preventDefault()
				logout()
			}} className="hidden md:block hover:bg-slate-300">
				<IoIosLogOut size={24}/>
			</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;

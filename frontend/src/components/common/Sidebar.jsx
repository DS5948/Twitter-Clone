import XSvg from "../svgs/X";
import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { GoBell } from "react-icons/go";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useLocation } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { GoBellFill } from "react-icons/go";
import { FaUser } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";

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
      <div className="fixed border-t md:border-r border-gray-300 bottom-0 left-0 bg-white md:sticky md:top-0 md:left-0 md:h-screen flex gap-4 items-center md:items-start w-full md:flex-col md:max-w-60 md:w-fit p-1">
        <Link to="/" className="hidden md:flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-black" />
        </Link>
        <ul className="flex justify-between items-center md:items-stretch w-full h-full md:flex-col gap-3 md:mt-4 p-1">
          <li className={`flex ${active === 'home' ? 'font-semibold' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to="/"
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-2 max-w-fit cursor-pointer"
            >
              {active === 'home' ? <GoHomeFill size={24}  /> : <GoHome size={24}/>}
              
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className={`flex ${active === 'notifications' ? 'font-semibold' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to="/notifications"
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-2 max-w-fit cursor-pointer"
            >
              {active === 'notifications' ? <GoBellFill size={24} /> : <GoBell size={24} />}
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className={`flex ${active === 'profile' ? 'font-semibold' : ''} hover:bg-slate-300 rounded-md justify-center md:justify-start`} >
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-2 max-w-fit cursor-pointer"
            >
              {active === 'profile' ? <FaUser size={22}/> : <FaRegUser size={22} />}
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
          {authUser && (
          <div
            className=" cursor-pointer mt-auto md:mb-3 flex gap-2 place-self-end items-center justify-center transition-all duration-300 rounded-full"
          >
            <div className="avatar md:inline-flex justify-start">
              <Link to={`/profile/${authUser.username}`} className="w-10 h-10">
                <img
                  className="w-10 h-10 mx-auto rounded-full object-cover"
                  src={authUser?.profileImg || "/avatar-placeholder.png"}
                />
              </Link>
            </div>
            <Link to={`/profile/${authUser.username}`} className="flex justify-between">
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
        </ul>
      </div>
  );
};
export default Sidebar;

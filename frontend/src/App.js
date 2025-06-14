import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Loader from "@mui/material/CircularProgress";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import SinglePostPage from "./pages/post/SinglePostPage";
import ChatPage from "./pages/chat/ChatPage";
import ChatWindow from "./components/chat/ChatWindow";

function App() {
	const API_URL = process.env.REACT_APP_API_URL;
	const location = useLocation(); // 👈

	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch(`${API_URL}/auth/me`, {
					method: "GET",
					credentials: "include",
				});
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	if (isLoading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<Loader sx={() => ({ color: "#000" })} />
			</div>
		);
	}

	// 👇 Check if current route is SinglePostPage
	const isSinglePostPage = location.pathname.startsWith("/p/");
	const isConversationPage = location.pathname.includes("/inbox")
	const shouldCollapseSidebar = isConversationPage
	return (
		<div className="flex">
			{authUser && <Sidebar collapsed={shouldCollapseSidebar}/>}
			<Routes>
				<Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
				<Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
				<Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
				<Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
				<Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
				<Route path="/p/:postId" element={authUser ? <SinglePostPage /> : <Navigate to="/login" />} />
				<Route path="/inbox" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
				<Route path="/inbox/t/:id" element={<ChatWindow />} />
			</Routes>
			{authUser && !isSinglePostPage && !isConversationPage && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;

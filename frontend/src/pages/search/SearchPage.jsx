import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import { Link } from "react-router-dom";

const fetchUsers = async (query) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/users/search?query=${query}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

const SearchPage = () => {
  const [search, setSearch] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["searchUsers", search],
    queryFn: () => fetchUsers(search),
    enabled: search.trim().length > 0, // only fetch when input is not empty
  });

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { follow, isPending } = useFollow();

  return (
    <div className="flex-1 max-w-2xl mx-auto p-4">
      <input
        type="text"
        placeholder="Search friends"
        className="w-full mb-4 px-4 py-2 border rounded-full text-sm outline-none bg-gray-200"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <p className="text-center text-gray-500">Searching...</p>}
      {isError && <p className="text-center text-red-500">Something went wrong.</p>}
      {!isLoading && users.length === 0 && search.trim() && (
        <p className="text-center text-sm text-gray-500">No users found</p>
      )}

      <ul className="space-y-3">
        {users.map((user) => (
          <li key={user._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user.username}`}>
              <img
                src={user.profileImg || "/avatar-placeholder.png"}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              </Link>
              <Link to={`/profile/${user.username}`}>
              <div>
                <p className="font-semibold text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.username || ""}</p>
              </div>
              </Link>
            </div>
            <button
              onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
              className="px-3 py-1 text-xs rounded-full transition-all duration-200 bg-black text-white hover:bg-gray-600"
            >
              {authUser?.pendingRequests?.includes(user?._id)
                      ? "Requested"
                      : authUser?.following?.includes(user?._id)
                      ? "Unfollow"
                      : "Follow"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useLogout = () => {
    const API_URL = process.env.REACT_APP_API_URL;
	const queryClient = useQueryClient();

    const { mutate: logout, isPending: loggingOut } = useMutation({
        mutationFn: async () => {
          try {
            console.log("logout");
            
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

    return {logout, loggingOut}
}

export default useLogout

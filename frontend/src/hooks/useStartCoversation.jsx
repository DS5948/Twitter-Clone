import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL;

export const useStartConversation = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (userIds) => {        
      const res = await fetch(`${API_URL}/chat/startConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ participantIds: userIds }),
      });

      if (!res.ok) throw new Error("Failed to start conversation");

      return res.json();
    },
    onSuccess: (data) => {
      navigate(`/inbox/t/${data._id}`);
    }
  });

  return mutation;
};

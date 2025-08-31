import { useQuery } from "@tanstack/react-query";
import api from "../app/api/api";

// !fetch user data from API
const fetchUser = async () => {
  const response = await api.get("/api/logged-in-user");
  console.log(response, "response");
  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;

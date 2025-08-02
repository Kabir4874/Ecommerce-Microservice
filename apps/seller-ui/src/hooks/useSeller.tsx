import { useQuery } from "@tanstack/react-query";
import api from "../app/api/api";

// !fetch seller data from API
const fetchSeller = async () => {
  const response = await api.get("/logged-in-seller");
  return response.data.seller;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;

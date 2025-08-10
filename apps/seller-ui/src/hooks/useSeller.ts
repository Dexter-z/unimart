import axiosInstance from "@/utils/axiosInstance"
import { useQuery } from "@tanstack/react-query"


//Fetch Seller data from API
const fetchSeller = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-seller");
        return response.data.seller;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            // Not logged in, return null instead of throwing
            return null;
        }
        throw error;
    }
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
        retry: (failureCount, error: any) => {
            // Don't retry if it's a 401 (unauthorized) error
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 1;
        },
        throwOnError: false,
    })


    return { seller, isLoading, isError, refetch }
}

export default useSeller;
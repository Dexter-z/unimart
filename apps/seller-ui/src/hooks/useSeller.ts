import axiosInstance from "@/utils/axiosInstance"
import { useQuery } from "@tanstack/react-query"


//Fetch Seller data from API
const fetchSeller = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-seller");
        return response.data.seller;
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            // Not logged in, treat as error
            throw new Error("Not authenticated");
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
        retry: false,
    })


    return { seller, isLoading, isError, refetch }
}

export default useSeller;
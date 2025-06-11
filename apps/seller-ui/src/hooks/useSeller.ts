import axiosInstance from "@/utils/axiosInstance"
import {useQuery} from "@tanstack/react-query"


//Fetch user data from API
const fetchSeller = async () => {
    const response = await axiosInstance.get("/api/logged-in-seller")
    console.log("Fetch Seller Response: " + response.data)

    return response.data.seller;
}

const useSeller = () => {
    console.log("In the useSeller block")
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
    })

    console.log("I am returning ", seller)

    return {seller, isLoading, isError, refetch}
}

export default useSeller;
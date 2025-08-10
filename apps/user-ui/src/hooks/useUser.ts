import axiosInstance from "@/utils/axiosInstance"
import {useQuery} from "@tanstack/react-query"


//Fetch user data from API
const fetchUser = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-user")
        return response.data.user;
    } catch (error: any) {
        // If user is not authenticated (401), return null instead of throwing
        if (error.response?.status === 401) {
            return null;
        }
        throw error;
    }
}

const useUser = () => {
    const {
        data: user,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["user"],
        queryFn: fetchUser,
        staleTime: 1000 * 60, // 1 minute
        retry: (failureCount, error: any) => {
            // Don't retry if it's a 401 (unauthorized) error
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 1;
        },
        refetchInterval: 1000 * 60, // Refetch every minute
        refetchOnWindowFocus: true,
        // Don't throw on error, just return the error state
        throwOnError: false,
    })

    return {user, isLoading, isError, refetch}
}

export default useUser;

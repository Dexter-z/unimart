import { useAuthStore } from "@/store/authStore";
import axiosInstance from "@/utils/axiosInstance"
import { isProtected } from "@/utils/protected";
import {useQuery} from "@tanstack/react-query"


//Fetch user data from API
const fetchUser = async (isLoggedIn: boolean) => {
    try {
        const config = isLoggedIn ? isProtected : {}
        const response = await axiosInstance.get("/api/logged-in-user", config)
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
    const {setLoggedIn, isLoggedIn} = useAuthStore()
    const {
        data: user,
        isPending,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(isLoggedIn),
        staleTime: 1000 * 60, // 1 minute
        retry: false,
        // @ts-ignore
        onSuccess: () => {
            setLoggedIn(true);
        },
        onError: () => {
            setLoggedIn(false);
        }
    })

    return {user: user as any, isLoading: isPending, isError}
}

export default useUser;

import {useQuery} from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import {useEffect } from "react"
import {useRouter} from "next/navigation"


//Fetch user data from API
const fetchAdmin = async () => {
    try {
        const response = await axiosInstance.get("/api/logged-in-admin");
        return response.data.user;
    } catch (error: any) {
        // If user is not authenticated (401), return null instead of throwing
        if (error.response?.status === 401) {
            return null;
        }
        throw error;
    }
}

const useAdmin = () => {
    const {
        data: admin,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["admin"],
        queryFn: fetchAdmin,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        // @ts-ignore
    })

    const history = useRouter();

    useEffect(() => {
        if (!isLoading && !admin) {
            history.push("/");
        }
    }, [admin, isLoading]);

    return {admin: admin as any, isLoading, isError, refetch, history}
}

export default useAdmin;

import { useRouter } from "next/navigation";
import useUser from "./useUser";
import { useEffect } from "react";

const useRequiredAuth = () => {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    return {user, isLoading}
}

export default useRequiredAuth;

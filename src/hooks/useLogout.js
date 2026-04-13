import Cookies from "js-cookie";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = async () => {
    localStorage.removeItem("cartid");
    localStorage.removeItem("access_token");
    Cookies.remove("access_token", { path: "/" });
    await signOut();
    router.push("/");
    router.refresh();
  };

  return logout;
};

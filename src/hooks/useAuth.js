"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "@/app/actions/auth";

export const useAuth = () => {
    const { isSignedIn, user } = useUser();

    useEffect(() => {
        if (typeof isSignedIn !== "boolean") return;

        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("access_token")
                : null;

        const isTokenValid = token
            ? Date.now() / 1000 < jwtDecode(token).exp
            : false;

        // ❌ remove invalid token
        if (!isSignedIn && token) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("cartid");
            Cookies.remove("access_token", { path: "/" });
            window.location.reload();
            return;
        }

        // ✅ login API call
        if (isSignedIn && user && !isTokenValid) {
            const data = {
                clerk_id: user.id,
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.emailAddresses?.[0]?.emailAddress,
            };

            loginUser(data).then((res) => {
                if (res?.token) {
                    const token = res.token;
                    const decoded = jwtDecode(token);
                    const expiresAt = new Date(decoded.exp * 1000);

                    localStorage.setItem("access_token", token);

                    Cookies.set("access_token", token, {
                        expires: expiresAt,
                        secure: true,
                        sameSite: "None",
                        path: "/",
                    });
                }
            });
        }
    }, [isSignedIn, user?.id]);

    return {
        isSignedIn,
        user
    }
};
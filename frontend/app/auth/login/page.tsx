"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

const Login = () => {
    const router = useRouter();

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {

        const token =
            localStorage.getItem("token");

        if (token) {
            router.replace("/dashboard");
        }

    }, []);

    useEffect(() => {

        const checkAuth = async () => {

            const token =
                localStorage.getItem("token");

            if (!token) {
                setCheckingAuth(false);
                return;
            }

            const response = await fetch(
                `${API_URL}/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                router.replace("/dashboard");
            } else {
                localStorage.removeItem("token");

                setCheckingAuth(false);
            }
        };

        checkAuth();

    }, [router]);


    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }



    const handleGithubLogin = () => {

        try {
            window.location.replace(
                `${API_URL}/auth/github`);

            setLoading(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }


    };

    const handleGoogleLogin = () => {

        try {
            window.location.replace(
                `${API_URL}/auth/google`);

            setLoading(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden relative">

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl backdrop-blur-md bg-white/20 border border-white/20 pointer-events-none">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-black">
                    Auth<span className="text-[#322A97]">Cit</span>
                </h1>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-20 pt-32 lg:pt-0 z-10">
                <div className="flex flex-col items-center lg:items-start justify-center gap-4 w-full max-w-md">

                    <h1 className="text-4xl sm:text-5xl mb-6 lg:mb-10 font-semibold">
                        Login
                    </h1>

                    <Button
                        variant="secondary"
                        size="xl"
                        className="text-base sm:text-lg py-6 hover:bg-primary hover:text-primary-foreground w-full flex items-center justify-center gap-3"
                        onClick={handleGoogleLogin}
                        type="button"
                        loading={loading}
                    >
                        <img src="/google-48.png" className="w-6 sm:w-8" />
                        Google
                    </Button>

                    <Button
                        variant="secondary"
                        size="xl"
                        className="text-base sm:text-lg py-6 hover:bg-primary hover:text-primary-foreground w-full flex items-center justify-center gap-3"
                        onClick={handleGithubLogin}
                        type="button"
                        loading={loading}
                    >
                        <img src="/github-50.png" className="w-6 sm:w-8" />
                        Github
                    </Button>

                    <Button
                        variant="secondary"
                        size="xl"
                        loading={loading}
                        className="text-base sm:text-lg py-6 hover:bg-primary hover:text-primary-foreground w-full flex items-center justify-center gap-3"
                    >
                        <img src="/apple-50.png" className="w-6 sm:w-8" />
                        Apple
                    </Button>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-1/2 items-end justify-end">
                <img
                    src="/login-art.jpg"
                    className="h-screen object-cover"
                    alt="Login Art"
                />
            </div>
        </div>
    );
};

export default Login;
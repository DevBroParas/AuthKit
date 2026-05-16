"use client";

import { useEffect } from "react";

export default function DashboardPage() {

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            window.location.replace("/auth/login");
        }
    }, []);

    return (
        <div>
            Dashboard
        </div>
    );
}
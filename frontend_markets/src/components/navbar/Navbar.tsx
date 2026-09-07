"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import "./navbar.css";

interface AuthUser {
    id: string;
    username: string;
    email: string;
}

export default function Navbar() {
    const router = useRouter();

    const [user, setUser] =
        useState<AuthUser | null>(null);

    const [loggingOut, setLoggingOut] =
        useState(false);

    useEffect(() => {
        const storedUser =
            sessionStorage.getItem(
                "auth_user",
            );

        if (!storedUser) {
            return;
        }

        try {
            const parsedUser =
                JSON.parse(
                    storedUser,
                ) as AuthUser;

            setUser(parsedUser);
        } catch {
            sessionStorage.removeItem(
                "auth_user",
            );
        }
    }, []);

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            await fetch(
                "http://127.0.0.1:3003/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                },
            );
        } catch {
            /*
             * Even if the backend request fails,
             * clear the local session and redirect.
             */
        } finally {
            sessionStorage.removeItem(
                "auth",
            );

            sessionStorage.removeItem(
                "auth_token",
            );

            sessionStorage.removeItem(
                "auth_user",
            );

            router.push("/auth");
        }
    }

    const avatarLetter =
        user?.username
            ?.charAt(0)
            .toUpperCase() ?? "U";

    return (
        <header className="navbar">
            <div className="navbar-inner">

                <button
                    type="button"
                    className="navbar-brand"
                    onClick={() =>
                        router.push(
                            "/simulation",
                        )
                    }
                >
                    <span className="brand-mark">
                        D
                    </span>

                    <span className="brand-name">
                        Deep Markets Mind
                    </span>
                </button>

                <div className="navbar-right">

                    <div className="profile">

                        <div className="profile-avatar">
                            {avatarLetter}
                        </div>

                        <div className="profile-info">
                            <span className="profile-name">
                                {user?.username ??
                                    "User"}
                            </span>

                            <span className="profile-email">
                                {user?.email ?? ""}
                            </span>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={
                            handleLogout
                        }
                        disabled={
                            loggingOut
                        }
                    >
                        {loggingOut
                            ? "Logging out..."
                            : "Logout"}
                    </button>

                </div>

            </div>
        </header>
    );
}
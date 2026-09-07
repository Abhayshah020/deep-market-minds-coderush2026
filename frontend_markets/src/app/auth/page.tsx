"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import "./auth.css";

type AuthMode = "login" | "register";

interface AuthUser {
    id: string;
    username: string;
    email: string;
}

interface AuthResponse {
    user: AuthUser;
    token: string;
}

interface ApiError {
    error?: string;
}

const API_URL = "http://127.0.0.1:3003";

export default function AuthPage() {
    const router = useRouter();

    const [mode, setMode] =
        useState<AuthMode>("login");

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const endpoint =
                mode === "login"
                    ? "/api/auth/login"
                    : "/api/auth/register";

            const body =
                mode === "login"
                    ? {
                        email,
                        password,
                    }
                    : {
                        username,
                        email,
                        password,
                    };

            const response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(body),
                },
            );

            const data =
                (await response.json()) as
                | AuthResponse
                | ApiError;

            if (!response.ok) {
                throw new Error(
                    "error" in data && data.error
                        ? data.error
                        : "Something went wrong",
                );
            }

            const authData =
                data as AuthResponse;

            /*
             * ==============================
             * REGISTER SUCCESS
             * ==============================
             */

            if (mode === "register") {
                setSuccess(
                    "Account created successfully. Please login.",
                );

                // Clear registration fields
                setUsername("");
                setPassword("");

                // Switch to login
                setMode("login");

                return;
            }

            /*
             * ==============================
             * LOGIN SUCCESS
             * ==============================
             */

            const sessionData = {
                token: authData.token,
                user: authData.user,
            };

            /*
             * Save authentication information
             * as JSON in sessionStorage.
             */
            sessionStorage.setItem(
                "auth",
                JSON.stringify(sessionData),
            );

            /*
             * Optional individual values.
             * These make them easier to access
             * later if needed.
             */
            sessionStorage.setItem(
                "auth_token",
                authData.token,
            );

            sessionStorage.setItem(
                "auth_user",
                JSON.stringify(
                    authData.user,
                ),
            );

            /*
             * Redirect to the main simulation.
             */
            router.push("/simulation");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    }

    function switchMode(
        newMode: AuthMode,
    ) {
        setMode(newMode);

        setError("");
        setSuccess("");

        setPassword("");
    }

    return (
        <main className="auth-page">
            <div className="auth-container">

                {/* BRAND */}
                <div className="auth-brand">
                    <div className="brand-icon">
                        D
                    </div>

                    <h1>
                        Deep Markets Mind
                    </h1>

                    <p>
                        Financial Education
                        Through Simulation
                    </p>
                </div>

                {/* CARD */}
                <div className="auth-card">

                    <div className="auth-header">
                        <h2>
                            {mode === "login"
                                ? "Welcome back"
                                : "Create your account"}
                        </h2>

                        <p>
                            {mode === "login"
                                ? "Sign in to continue to your market simulation."
                                : "Create an account and start exploring financial markets."}
                        </p>
                    </div>

                    {/* TABS */}
                    <div className="auth-tabs">

                        <button
                            type="button"
                            className={
                                mode === "login"
                                    ? "auth-tab active"
                                    : "auth-tab"
                            }
                            onClick={() =>
                                switchMode(
                                    "login",
                                )
                            }
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={
                                mode ===
                                    "register"
                                    ? "auth-tab active"
                                    : "auth-tab"
                            }
                            onClick={() =>
                                switchMode(
                                    "register",
                                )
                            }
                        >
                            Register
                        </button>

                    </div>

                    {/* FORM */}
                    <form
                        className="auth-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* USERNAME */}
                        {mode ===
                            "register" && (
                                <div className="form-group">

                                    <label htmlFor="username">
                                        Username
                                    </label>

                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={
                                            username
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setUsername(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        minLength={
                                            3
                                        }
                                        maxLength={
                                            50
                                        }
                                        required
                                    />

                                </div>
                            )}

                        {/* EMAIL */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(
                                    event,
                                ) =>
                                    setEmail(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                required
                            />

                        </div>

                        {/* PASSWORD */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(
                                    event,
                                ) =>
                                    setPassword(
                                        event
                                            .target
                                            .value,
                                    )
                                }
                                minLength={
                                    mode ===
                                        "register"
                                        ? 8
                                        : 1
                                }
                                required
                            />

                            {mode ===
                                "register" && (
                                    <span className="input-hint">
                                        Minimum 8
                                        characters
                                    </span>
                                )}

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="message error">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {success && (
                            <div className="message success">
                                {success}
                            </div>
                        )}

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={
                                loading
                            }
                        >
                            {loading
                                ? "Please wait..."
                                : mode ===
                                    "login"
                                    ? "Login"
                                    : "Create Account"}
                        </button>

                    </form>

                    {/* FOOTER */}
                    <div className="auth-footer">

                        <span>
                            {mode === "login"
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(
                                    mode ===
                                        "login"
                                        ? "register"
                                        : "login",
                                )
                            }
                        >
                            {mode === "login"
                                ? "Create one"
                                : "Sign in"}
                        </button>

                    </div>

                </div>

                {/* COPYRIGHT */}
                <p className="copyright">
                    © 2026 Deep Markets Mind.
                    All rights reserved.
                </p>

            </div>
        </main>
    );
}

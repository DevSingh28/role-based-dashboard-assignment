"use client";

import { useState } from "react";
import useAuthStore from "@/lib/authStore";

export default function LoginForm({ onSuccess, onSwitchMode }) {
    const login = useAuthStore((state) => state.login);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(form);
            onSuccess();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-7">
                

                <h2 className="text-2xl font-semibold text-slate-900">
                    Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Login to access your dashboard.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <button
                    type="button"
                    onClick={onSwitchMode}
                    disabled={loading}
                    className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed"
                >
                    Register
                </button>
            </p>
        </div>
    );
}
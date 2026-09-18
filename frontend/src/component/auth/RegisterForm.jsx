"use client";

import { useState } from "react";
import useAuthStore from "@/lib/authStore";

export default function RegisterForm({ onSuccess, onSwitchMode }) {
    const register = useAuthStore((state) => state.register);

    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "north_manager",
        region: "North"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => {
            const updated = {
                ...previous,
                [name]: value
            };

            if (name === "role") {
                if (value === "north_manager") {
                    updated.region = "North";
                }

                if (value === "south_manager") {
                    updated.region = "South";
                }

                if (value === "admin") {
                    updated.region = "";
                }
            }

            return updated;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(form);
            onSuccess();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = form.role === "admin";

    return (
        <div>
            <div className="mb-7">
               

                <h2 className="text-2xl font-semibold text-slate-900">
                    Create account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Create an account to access the dashboard.
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
                        minLength={6}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Role
                    </label>

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="north_manager">
                            North Manager
                        </option>

                        <option value="south_manager">
                            South Manager
                        </option>

                        <option value="admin">
                            Admin
                        </option>
                    </select>
                </div>

                {!isAdmin && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Region
                        </label>

                        <input
                            value={form.region}
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                        />
                    </div>
                )}

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
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                    type="button"
                    disabled={loading}
                    onClick={onSwitchMode}
                    className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed"
                >
                    Login
                </button>
            </p>
        </div>
    );
}
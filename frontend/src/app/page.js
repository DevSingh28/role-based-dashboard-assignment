"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthModal from "@/component/auth/AuthModal";
import useAuthStore from "@/lib/authStore";

export default function Home() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    const [authMode, setAuthMode] = useState(null);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-sm text-slate-500">
                    Loading...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
                <div className="flex justify-center w-full gap-12 mx-auto ">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                       

                        <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl text-center">
                            Simple insights from your learning data.
                        </h1>

                        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 text-center">
                            A role-based dashboard for viewing revenue and
                            course performance across different regions.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setAuthMode("login")}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <LogIn size={17} />
                                Login
                               
                            </button>

                            <button
                                type="button"
                                onClick={() => setAuthMode("register")}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                <UserPlus size={17} />
                                Register
                            </button>
                        </div>
                    </motion.div>

                    

                </div>
            </div>

            {authMode && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setAuthMode(null)}
                    onSuccess={() => router.push("/dashboard")}
                    onSwitchMode={(mode) => setAuthMode(mode)}
                />
            )}
        </main>
    );
}
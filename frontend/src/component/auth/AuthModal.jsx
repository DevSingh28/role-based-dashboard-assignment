"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({
    mode,
    onClose,
    onSuccess,
    onSwitchMode
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={18} />
                </button>

                {mode === "login" ? (
                    <LoginForm
                        onSuccess={onSuccess}
                        onSwitchMode={() => onSwitchMode("register")}
                    />
                ) : (
                    <RegisterForm
                        onSuccess={onSuccess}
                        onSwitchMode={() => onSwitchMode("login")}
                    />
                )}
            </motion.div>
        </div>
    );
}
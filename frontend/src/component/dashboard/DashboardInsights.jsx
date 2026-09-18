"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "@/lib/authStore";

export default function DashboardInsights({ region }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const fetchInsights = useAuthStore((state) => state.fetchInsights);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await fetchInsights(region);
                setData(data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard insights."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [fetchInsights, region]);

    if (loading) {
        return (
            <div className="flex min-h-45 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading insights...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-45 items-center justify-center">
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} />
                    {error}
                </div>
            </div>
        );
    }

    const { overview } = data;

    const cards = [
        { label: "Students", value: overview.students.toLocaleString("en-IN") },
        { label: "Enrollments", value: overview.enrollments.toLocaleString("en-IN") },
        { label: "Completion Rate", value: `${overview.completionRate}%` },
        { label: "Average Rating", value: `${overview.averageRating} / 5` }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            {card.label}
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                            {card.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { AlertCircle, Loader2 } from "lucide-react";
import useAuthStore from "@/lib/authStore";

export default function RevenueChart({ region }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const fetchRevenue = useAuthStore((state) => state.fetchRevenue);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await fetchRevenue(region);
                setData(data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load revenue data."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [fetchRevenue, region]);

    if (loading) {
        return (
            <div className="flex h-100 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading revenue data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-100 items-center justify-center">
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis dataKey="category" tickLine={false} axisLine={false} />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />

                    <Tooltip
                        formatter={(value) => [
                            `₹${Number(value).toLocaleString("en-IN")}`,
                            "Revenue"
                        ]}
                        cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                    />

                    <Bar dataKey="totalRevenue" name="Total Revenue" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin } from "lucide-react";
import useAuthStore from "@/lib/authStore";
import RevenueChart from "@/component/dashboard/RevenueChart";
import DashboardInsights from "@/component/dashboard/DashboardInsights";

export default function DashboardPage() {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const logout = useAuthStore((state) => state.logout);

    const [selectedRegion, setSelectedRegion] = useState("");

    useEffect(() => {
        if (!user && loading) {
            checkAuth();
        }
    }, [user, loading, checkAuth]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-500">
                    Loading dashboard...
                </p>
            </main>
        );
    }

    const isAdmin = user.role === "admin";

    const chartRegion = isAdmin
        ? selectedRegion
        : user.region;

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Dashboard
                        </h1>

                        <p className="text-sm text-slate-500">
                            {user.email}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </header>

            <section className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-slate-500">
                            Signed in as
                        </p>

                        <h2 className="mt-1 text-2xl font-semibold">
                            {user.role}
                        </h2>

                        {!isAdmin && user.region && (
                            <p className="mt-1 text-sm text-slate-500">
                                Region: {user.region}
                            </p>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="w-full sm:w-56">
                            <label
                                htmlFor="region"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Filter by region
                            </label>

                            <div className="relative">
                                <MapPin
                                    size={17}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <select
                                    id="region"
                                    value={selectedRegion}
                                    onChange={(event) =>
                                        setSelectedRegion(event.target.value)
                                    }
                                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        All Regions
                                    </option>

                                    <option value="North">
                                        North
                                    </option>

                                    <option value="South">
                                        South
                                    </option>

                                    <option value="East">
                                        East
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-slate-900">
      Revenue by Course Category
    </h3>
    <p className="mt-1 text-sm text-slate-500">
      Total revenue generated from course enrollments.
    </p>
  </div>

  <div className="space-y-6">

    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <DashboardInsights region={chartRegion} />
    </div>

    
    <div className="relative flex items-center justify-center">
      <div className="w-full border-t border-slate-200" />
      <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        Performance Breakdown
      </span>
    </div>

    
    <div className="pt-2">
      <RevenueChart region={chartRegion} />
    </div>
  </div>
</div>
            </section>
        </main>
    );
}
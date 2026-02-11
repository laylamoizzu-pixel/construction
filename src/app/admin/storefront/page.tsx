"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    LayoutDashboard,
    Star,
    Zap,
    MousePointerClick,
    ArrowLeft,
    ExternalLink,
    LineChart,
    Settings2,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

const homepageSections = [
    {
        name: "Hero Section",
        description: "The main headline, subtitle, and background image at the top of the home page.",
        href: "/admin/content/hero",
        icon: LayoutDashboard,
        color: "text-brand-blue",
        bgColor: "bg-brand-blue/10",
        stats: "Main Banner"
    },
    {
        name: "Highlights",
        description: "Showcase key products or categories with a special section and rating highlights.",
        href: "/admin/content/highlights",
        icon: Star,
        color: "text-brand-gold",
        bgColor: "bg-brand-gold/10",
        stats: "Featured Items"
    },
    {
        name: "Features",
        description: "List the main benefits and services like store pickup and warranty.",
        href: "/admin/content/features",
        icon: Zap,
        color: "text-brand-lime",
        bgColor: "bg-brand-lime/10",
        stats: "Service Benefits"
    },
    {
        name: "CTA Section",
        description: "The final 'Call to Action' section at the bottom of the home page.",
        href: "/admin/content/cta",
        icon: MousePointerClick,
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
        stats: "Conversion Focus"
    }
];

export default function StorefrontManagement() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    if (authLoading || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-800 hover:shadow-sm border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-gray-900">Storefront Design</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage and customize your homepage content</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Live Store</span>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Sections</p>
                            <p className="text-2xl font-semibold text-gray-900">{homepageSections.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <LineChart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Views</p>
                            <p className="text-2xl font-semibold text-gray-900">12.5k</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="text-lg font-semibold text-gray-900">Live</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {homepageSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-blue" />
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${section.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-7 h-7 ${section.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors mb-2">
                                            {section.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                            {section.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${section.bgColor} ${section.color}`}>
                                                {section.stats}
                                            </span>
                                            <span className="text-xs text-gray-400">Customize content</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Need more sections? <button className="text-brand-blue hover:underline font-medium">Browse templates</button>
                    </p>
                </div>
            </div>
        </div>
    );
}

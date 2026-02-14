import Link from "next/link";
import { getPageContent } from "@/app/actions/page-content";

export default async function PrivacyPage() {
    const page = await getPageContent("privacy");

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <nav className="flex mb-8 text-sm font-medium text-slate-500">
                    <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="text-slate-900">Privacy Policy</span>
                </nav>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
                        Privacy <span className="text-brand-blue">Policy</span>
                    </h1>
                    <div
                        className="prose prose-lg prose-slate max-w-none text-slate-600 space-y-8"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                    {page.lastUpdated && (
                        <p className="text-sm text-slate-400 mt-12 italic">
                            Last Updated: {page.lastUpdated}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}

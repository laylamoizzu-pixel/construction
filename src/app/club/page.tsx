import { getClubTiers } from "@/app/actions";
import { Check, Crown, CreditCard, Gift, Truck } from "lucide-react";
import ClientClubTiers from "@/components/ClientClubTiers";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
    const tiers = await getClubTiers();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <section className="bg-brand-dark text-white py-20 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <span className="text-brand-gold font-medium tracking-widest text-sm uppercase mb-4 block">Loyalty Program</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">The Smart <span className="text-brand-gold">Club</span></h1>
                    <p className="text-gray-300 text-lg">
                        Unlock a world of exclusive privileges, priority services, and rewards tailored just for you.
                    </p>
                </div>
            </section>

            {/* Tiers Grid */}
            <section className="py-20 px-4 md:px-6 container mx-auto">
                <ClientClubTiers tiers={tiers} />
            </section>

            {/* Benefits Showcase */}
            <section className="bg-white py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-dark mb-12">Why Join The Club?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Crown, label: "VIP Access", desc: "Early access to sales" },
                            { icon: Truck, label: "Free Delivery", desc: "On orders above ₹500" },
                            { icon: Gift, label: "Birthday Treats", desc: "Special surprises" },
                            { icon: CreditCard, label: "Smart Points", desc: "Earn on every spend" },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-brand-green/5 flex items-center justify-center text-brand-green mb-4">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">{item.label}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}


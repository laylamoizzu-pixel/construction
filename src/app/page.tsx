import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Highlights />
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
              Why Choose <span className="text-brand-gold">Smart Avnue?</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We are committed to delivering the best retail experience in Patna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Premium Quality", desc: "Handpicked products that meet high standards of durability and style." },
              { title: "Affordable Pricing", desc: "Luxury doesn't have to be expensive. We offer the best value for your money." },
              { title: "Stylish Designs", desc: "Modern and aesthetic designs that elevate your lifestyle." },
              { title: "Wide Variety", desc: "Everything from stationery to home décor under one roof." },
              { title: "Trusted Retail Store", desc: "A name you can rely on for everyday essentials and gifting." },
              { title: "Customer Focused", desc: "Your satisfaction is our top priority." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100">
                <h3 className="text-xl font-bold text-brand-dark mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

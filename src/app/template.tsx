import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
        </>
    );
}

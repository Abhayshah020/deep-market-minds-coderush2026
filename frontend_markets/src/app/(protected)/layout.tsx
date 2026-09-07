import Navbar from "@/components/navbar/Navbar";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="protected-layout">
            <Navbar />

            <main>
                {children}
            </main>
        </div>
    );
}
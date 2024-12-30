import { Navbar } from "@/components/navbar";

// app/layout.js
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex flex-1">
        <div className="h-[calc(100vh-65px)] w-full relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

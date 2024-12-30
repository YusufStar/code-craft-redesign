import LandingPage from "@/components/landing/landing-page";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-1">
        <div className="h-full w-full relative overflow-hidden">
          <LandingPage />
        </div>
      </main>
    </div>
  );
}

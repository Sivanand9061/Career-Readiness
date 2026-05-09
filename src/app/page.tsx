import { LanguageSuite } from "~/app/_components/LanguageSuite";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0f1016] text-white p-4 sm:p-12 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center justify-center pt-32 pb-16">
        {/* Header Section */}
        <div className="text-center space-y-4 print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Career Suite Online
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-indigo-300">
            Career Readiness Suite
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Grammar Checker, Virtual Mock Interviews, and Final Year BCA Career Launchpad.
          </p>
        </div>

        <LanguageSuite />
      </div>
    </main>
  );
}

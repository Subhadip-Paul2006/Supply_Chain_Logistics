import Link from "next/link"
import { ShieldCheck, MapTrifold, Graph, Bell, Gear, User } from "@phosphor-icons/react/dist/ssr"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck size={24} weight="fill" className="text-blue-500" />
            <span className="font-bold tracking-wider text-sm uppercase">NexusGuard</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 px-2">Core</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md bg-white/5">
            <MapTrifold size={18} />
            War Room Map
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-md transition-colors">
            <Graph size={18} />
            Network Topology
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-md transition-colors">
            <Bell size={18} />
            Alerts & Audit
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <User size={16} />
            </div>
            <div>
              <div className="text-sm font-medium">Ops Commander</div>
              <div className="text-xs text-gray-500">PharmaDistrib</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A]/50 backdrop-blur-sm z-10">
          <div className="text-sm text-gray-400">PharmaDistrib → Logistics Execution</div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Gear size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  )
}

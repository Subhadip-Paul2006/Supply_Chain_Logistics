"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Warning, CheckCircle, Play, SignOut } from "@phosphor-icons/react"
import { ApprovalModal } from "@/components/dashboard/approval-modal"
import { fetchDisruptions, fetchPendingDecisions, triggerDemoDisruption } from "@/lib/api"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const [disruptions, setDisruptions] = useState<any[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<any[]>([])
  const [selectedDecision, setSelectedDecision] = useState<any>(null)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const d = await fetchDisruptions()
      setDisruptions(d.items || [])
      const dec = await fetchPendingDecisions()
      setPendingDecisions(dec.items || [])
    } catch(e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data.")
    }
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    let mounted = true

    const initialize = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return

      if (!data.user) {
        router.replace('/login')
        return
      }

      setUser(data.user)
      setAuthReady(true)
      await loadData()
    }

    initialize().catch(() => router.replace('/login'))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
        return
      }

      setUser(session.user)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const handleTriggerDemo = async () => {
    setLoadingDemo(true)
    setError(null)
    try {
      await triggerDemoDisruption()
      await loadData()
    } catch(e) {
      setError(e instanceof Error ? e.message : "Failed to trigger the demo scenario.")
    }
    setLoadingDemo(false)
  }

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!authReady) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-gray-400">
        Loading secure operations console…
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight">Active Operations</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
             {user?.email ? `Signed in as ${user.email}` : "Supabase session active"}
           </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSignOut}
            className="border border-white/10 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-all"
          >
            <SignOut weight="bold" />
            Sign out
          </button>
          <button 
            onClick={handleTriggerDemo} 
            disabled={loadingDemo}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Play weight="fill" /> 
            {loadingDemo ? "Simulating..." : "Trigger Scenario (Suez Blockade)"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Map/Visualizer */}
        <div className="lg:col-span-2 border border-white/5 bg-white/5 rounded-xl flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h2 className="text-sm font-medium tracking-wide uppercase text-gray-400">Network Topology</h2>
          </div>
          
          <div className="flex-1 p-6 relative flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-center backdrop-blur-3xl opacity-80">
            {/* Extremely simple placeholder topology for the War Room */}
            <div className="w-full flex items-center justify-between px-10">
              <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 bg-gray-800 border-2 border-green-500/50 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]">IN</div>
                 <span className="text-[10px] text-gray-400 uppercase">Chennai Mfg</span>
              </div>
              <div className="h-0.5 flex-1 bg-linear-to-r from-green-500/30 to-red-500/30"></div>
              <div className="flex flex-col items-center gap-2 relative">
                 <div className="absolute -top-8 animate-pulse">
                    <Warning weight="fill" size={24} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                 </div>
                 <div className="w-12 h-12 bg-gray-900 border-2 border-red-500 rounded flex items-center justify-center font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)]">SUEZ</div>
                 <span className="text-[10px] text-gray-400 uppercase">Hub</span>
              </div>
              <div className="h-0.5 flex-1 bg-linear-to-r from-red-500/30 to-green-500/30"></div>
              <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 bg-blue-900/50 border-2 border-blue-500/50 rounded-full flex items-center justify-center font-bold text-xs">EU</div>
                 <span className="text-[10px] text-gray-400 uppercase">Frankfurt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Events & Decisions */}
        <div className="border border-white/5 bg-white/5 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/20 flex gap-4">
             <div className="text-sm font-medium tracking-wide uppercase text-white border-b-2 border-blue-500 pb-1">Activity Stream</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {pendingDecisions.length > 0 && (
              <div className="mb-6 space-y-3">
                 <h3 className="text-xs uppercase text-amber-500 font-bold tracking-wider">Requires Approval</h3>
                 {pendingDecisions.map(d => (
                   <div key={d.id} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 block"></div>
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="text-amber-400 font-medium text-sm mb-1">{d.scenario_taken_id ? "Escalation" : "Manual Reroute Required"}</div>
                            <div className="text-xs text-gray-400">Confidence limits exceeded. Human needed.</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => setSelectedDecision(d)}
                        className="mt-3 w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 transition-colors rounded text-xs text-amber-300 font-medium"
                      >
                         Review Options
                      </button>
                   </div>
                 ))}
              </div>
            )}

            <div>
              <h3 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-3">Live Log</h3>
              <div className="space-y-3">
                {disruptions.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">No active disruptions.</div>
                ) : disruptions.map(d => (
                  <div key={d.id} className="p-3 bg-black/30 border border-white/5 rounded-lg flex gap-3 text-sm">
                    <div className="mt-0.5">
                      {d.severity_score >= 8 ? <Warning className="text-red-500" size={16}/> : <CheckCircle className="text-green-500" size={16}/>}
                    </div>
                    <div>
                      <div className="font-medium text-gray-200">{d.geography} <span className="mx-1 text-gray-600">•</span> <span className="text-white text-xs px-1.5 py-0.5 bg-white/10 rounded">{d.event_type}</span></div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">Severity: <span className="text-gray-200">{d.severity_score}/10</span>. Detected by Supabase-backed operations storage.</div>
                      <div className="text-[11px] text-gray-500 mt-1">{format(new Date(d.created_at), "MMM d, HH:mm")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <ApprovalModal 
         decision={selectedDecision} 
         onClose={() => setSelectedDecision(null)} 
         onActionCb={loadData} 
        approverId={user?.email || user?.id || 'demo-user'}
      />
    </div>
  )
}

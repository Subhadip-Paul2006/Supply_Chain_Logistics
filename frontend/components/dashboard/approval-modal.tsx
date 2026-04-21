"use client"

import { useState } from "react"
import { CheckCircle, XCircle, WarningCircle, Lightning } from "@phosphor-icons/react"
import { approveDecision, rejectDecision } from "@/lib/api"

export function ApprovalModal({ decision, onClose, onActionCb, approverId }: { decision: any, onClose: () => void, onActionCb: () => void, approverId?: string }) {
  const [loading, setLoading] = useState(false)

  if (!decision) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveDecision(decision.id, approverId)
      onActionCb()
      onClose()
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectDecision(decision.id, approverId)
      onActionCb()
      onClose()
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><XCircle size={24} /></button>
        
        <div className="flex items-center gap-3 text-amber-500 mb-6">
          <WarningCircle size={28} weight="fill" />
          <h2 className="text-xl font-bold">Manual Approval Required</h2>
        </div>

        <div className="text-gray-300 mb-6 text-sm leading-relaxed">
          The system detected a severe disruption block in the primary network. Confidence in the autonomous scenario execution is below the 85% threshold. Please review the options and manually execute.
        </div>
        
        <div className="space-y-4 mb-8">
           {decision.scenarios?.map((sc: any, idx: number) => (
             <div key={idx} className={`p-4 rounded-lg border ${sc.recommended ? "border-amber-500/50 bg-amber-500/5" : "border-white/5 bg-white/5"}`}>
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                   <div className="font-semibold text-white">Option {["A", "B", "C"][idx]}:</div>
                   <div className="text-sm font-light text-gray-300 truncate max-w-75">{sc.description || sc.name}</div>
                 </div>
                 {sc.recommended && (
                   <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">Recommended</span>
                 )}
               </div>
               <div className="flex gap-4 text-xs text-gray-400 mt-2">
                  <div className="bg-black/30 px-2 py-1 rounded">Delta Cost: <span className="text-red-400">+${sc.estimated_cost_usd?.toLocaleString() || "N/A"}</span></div>
                  <div className="bg-black/30 px-2 py-1 rounded">Delay: <span className="text-amber-400">+{sc.estimated_delay_days || 0} days</span></div>
                  <div className="bg-black/30 px-2 py-1 rounded">Confidence: <span className="text-white">{sc.success_confidence ? Math.round(sc.success_confidence * 100) : "--"}%</span></div>
               </div>
             </div>
           ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
           <button onClick={handleReject} disabled={loading} className="px-4 py-2 hover:bg-white/5 rounded-md text-sm transition-colors text-gray-400 hover:text-white">Reject</button>
           <button onClick={handleApprove} disabled={loading} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-md font-semibold text-sm transition-colors flex items-center gap-2">
             <Lightning weight="fill" /> Execute Recommended Option
           </button>
        </div>
      </div>
    </div>
  )
}

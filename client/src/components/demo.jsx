import React from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { Heart, Activity, Users, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden bg-[#070A13] pb-10 border-b border-slate-900">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-full uppercase tracking-wider mb-6 animate-pulse">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Life Saving Network</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 font-display tracking-tight leading-none mb-4">
              Every Second Counts. <br />
              <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent font-black mt-2 inline-block">
                Locate Blood Instantly.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 font-sans mt-3 mb-8 leading-relaxed">
              Bridging the gap between voluntary donors, institutional inventories, and emergency wards in real-time. Scroll down to explore our crisis control dashboard interface.
            </p>
          </div>
        }
      >
        {/* Customized High-Fidelity Mockup Dashboard Inside the 3D Scroll Card */}
        <div className="w-full h-full p-4 md:p-6 text-slate-200 flex flex-col justify-between select-none">
          {/* Operations Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
                <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-slate-100 font-display flex items-center gap-1.5">
                  HEMOLINK COMMAND CENTER
                  <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">NODE_IP: 104.22.18.232 // DISTRICT: BANGALORE CENTRAL</p>
              </div>
            </div>
            
            {/* Live Stats Ticker */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Active Donors</span>
                <span className="text-sm font-black text-slate-200 font-mono flex items-center justify-end gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  14,204
                </span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4 md:pl-6">
                <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Banks Linked</span>
                <span className="text-sm font-black text-slate-200 font-mono flex items-center justify-end gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  48
                </span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4 md:pl-6">
                <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Survival Rate</span>
                <span className="text-sm font-black text-slate-200 font-mono flex items-center justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  99.8%
                </span>
              </div>
            </div>
          </div>

          {/* Main Visual Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 flex-1 overflow-hidden min-h-0">
            {/* Left Col: Real-time Emergency Incidents Ticker */}
            <div className="md:col-span-2 border border-slate-800/80 rounded-xl bg-slate-950/40 p-3.5 flex flex-col justify-between min-h-[140px] md:min-h-0">
              <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-bounce" />
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Active Crisis Alert Broadcasts</span>
              </div>
              
              <div className="space-y-2.5 flex-1 overflow-hidden">
                <div className="p-2.5 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 animate-ping" />
                  <div>
                    <p className="text-xs text-red-200 font-semibold">O- Negative Needed Urgently (Accident Ward)</p>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      📍 City Central Blood Bank • ⏱️ Received 45s ago • 📞 9876543210
                    </span>
                  </div>
                </div>
                
                <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg flex items-start gap-2.5 opacity-85">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                  <div>
                    <p className="text-xs text-slate-300 font-semibold">AB- Negative Required (Cardiac Surgery)</p>
                    <span className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      📍 St. Jude Hospital • ⏱️ Received 3m ago • Radius: 4.4km
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg flex items-start gap-2.5 opacity-60 hidden md:flex">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <p className="text-xs text-emerald-300 font-medium line-through">2 bags B+ successfully dispatched & delivered</p>
                    <span className="text-[9px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                      📍 Metro Red Cross • Transfusion Complete • Saved 1 Life
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Blood Availability Index Gauges */}
            <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Region Supply Gauge</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/5 px-1.5 py-0.2 rounded font-mono">NORMAL</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-850/50">
                  <span className="block text-[10px] text-slate-500 font-mono">O- Type</span>
                  <span className="text-base font-extrabold text-rose-500 font-mono">10 bags</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full w-[25%]" />
                  </div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-850/50">
                  <span className="block text-[10px] text-slate-500 font-mono">A+ Type</span>
                  <span className="text-base font-extrabold text-slate-300 font-mono">37 bags</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[78%]" />
                  </div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-850/50">
                  <span className="block text-[10px] text-slate-500 font-mono">B+ Type</span>
                  <span className="text-base font-extrabold text-slate-300 font-mono">40 bags</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%]" />
                  </div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-850/50">
                  <span className="block text-[10px] text-slate-500 font-mono">AB- Type</span>
                  <span className="text-base font-extrabold text-amber-500 font-mono">15 bags</span>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-amber-550 h-full w-[50%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Console Footer */}
          <div className="border-t border-slate-850 pt-2.5 flex items-center justify-between text-[9px] text-slate-600 font-mono">
            <span>SECURE SYSTEM PROTOCOL v4.19-SEC // ENCRYPTED END-TO-END</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              STATUS: STABLE OPERATIONS
            </span>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}

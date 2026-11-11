import React from 'react';

export default function LandingHero({
  onSelectView,
  onOpenLogin,
  onOpenRegister,
  onAutoLoginTourist,
  onAutoLoginAdmin
}) {
  return (
    <div className="relative overflow-hidden py-12 md:py-20">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🛡️ Production-Grade Safety Architecture
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            ⛓️ SHA-256 Blockchain Verified
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Smart Tourist Safety Monitoring & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Incident Response System
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Protecting travelers with real-time GPS tracking, automated danger zone geo-fencing, 
            instant SOS emergency dispatch, and tamper-proof blockchain digital identity.
          </p>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={() => onSelectView('tourist')}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Launch Tourist Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView('admin')}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Admin Command Center</span>
          </button>

          <button
            onClick={() => onSelectView('map')}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Live Radar & Geo-fences</span>
          </button>
        </div>

        {/* 1-Click Quick Demo Login Pill Bar */}
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-navy-900/80 border border-slate-800 mb-16 text-center">
          <p className="text-xs text-slate-400 mb-2 font-mono">⚡ QUICK EVALUATOR DEMO LOGIN (1-CLICK)</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAutoLoginTourist}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors font-medium"
            >
              👤 Sign in as Sample Tourist (John Doe)
            </button>
            <button
              onClick={onAutoLoginAdmin}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors font-medium"
            >
              🛡️ Sign in as Safety Admin HQ
            </button>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Live GPS & Phone Tracking */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Consensual GPS Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browser Geolocation API captures phone coordinates with accuracy radius. Clear Start/Stop consent controls; never tracks secretly.
            </p>
          </div>

          {/* Card 2: Geo-Fencing & Danger Zones */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Geo-Fence Danger Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic circular and polygon perimeters for high-tide cliffs and wild trails. Instant audio-visual warnings upon proximity or breach.
            </p>
          </div>

          {/* Card 3: Emergency SOS Response */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800/80 hover:border-red-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">One-Touch Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Large red SOS button with accidental-click confirmation. Automatically dispatches coordinates and medical contacts to Admin Command Center.
            </p>
          </div>

          {/* Card 4: Blockchain Digital ID */}
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Blockchain Digital ID</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically hashed tourist identity stored on an immutable SHA-256 block ledger with private QR code verification and tamper-check.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

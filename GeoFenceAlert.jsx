import React, { useEffect, useState, useRef } from 'react';

export default function GeoFenceAlert({
  breachData,
  onDismiss,
  onTriggerSOS
}) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  // Web Audio API Synthesizer Alarm (self-contained, no external audio files needed!)
  const playSirenBeep = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.linearRampToValueAtTime(650, now + 0.35);
      osc.frequency.linearRampToValueAtTime(980, now + 0.7);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.7);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) {
      console.warn('Audio alert could not play automatically:', e);
    }
  };

  useEffect(() => {
    if (breachData && breachData.type === 'BREACH' && !isMuted) {
      playSirenBeep();
      intervalRef.current = setInterval(playSirenBeep, 2500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [breachData, isMuted]);

  if (!breachData) return null;

  const isCritical = breachData.type === 'BREACH';
  const zone = breachData.zone;

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-gentle">
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
        isCritical 
          ? 'bg-red-950/95 border-red-500 text-white shadow-red-900/50' 
          : 'bg-amber-950/95 border-amber-500 text-white shadow-amber-900/50'
      }`}>
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">
              {isCritical ? '🚨' : '⚠️'}
            </span>
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wide">
                {isCritical ? 'Geo-Fence Breach Alert!' : 'Approaching Hazard Zone'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {zone?.name || 'Restricted Safety Perimeter'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute siren' : 'Mute siren'}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={onDismiss}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Warning Content */}
        <div className="text-xs space-y-2 mb-3 bg-black/30 p-2.5 rounded-xl border border-white/10">
          <p className="leading-relaxed">
            {breachData.message}
          </p>
          <div className="flex justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
            <span>Danger Level: <strong className="text-red-400">{zone?.danger_level || 'CRITICAL'}</strong></span>
            <span>Radius: <strong>{zone?.radius_meters || 300}m</strong></span>
          </div>
        </div>

        {/* Emergency Guidance & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors text-center"
          >
            I am Turning Back
          </button>
          <button
            onClick={onTriggerSOS}
            className="py-1.5 px-3 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/40 transition-colors flex items-center gap-1"
          >
            <span>Need SOS</span>
          </button>
        </div>

      </div>
    </div>
  );
}

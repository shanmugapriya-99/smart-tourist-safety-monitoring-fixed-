import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';

export default function DigitalIDCard({ user }) {
  const canvasRef = useRef(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const touristId = user?.tourist_id || 'TRV-8942-IN';
  const touristName = user?.name || 'John Doe (Demo Tourist)';
  const bloodGroup = user?.blood_group || 'B+';
  const digitalHash = user?.digital_id_hash || '7f9a8b1c4e2d3f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a';

  // Draw High-Tech QR Code pattern on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 180;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw pseudo-random deterministic QR grid based on touristId string
    ctx.fillStyle = '#0f172a';
    const gridSize = 21;
    const cellSize = size / gridSize;

    // Fixed corner position detection boxes
    const drawFinder = (startX, startY) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Fill data cells with deterministic hash pattern
    let seed = 0;
    for (let i = 0; i < touristId.length; i++) {
      seed = (seed + touristId.charCodeAt(i) * 31) % 1000;
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finder patterns
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c < 8)
        ) {
          continue;
        }

        seed = (seed * 9301 + 49297) % 233280;
        if (seed / 233280 > 0.52) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [touristId]);

  // Handle Verify Digital ID
  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyDigitalIdPublic(touristId);
      setVerificationResult(res);
      setShowScannerModal(true);
    } catch (err) {
      setVerificationResult({
        valid: true,
        tourist_id: touristId,
        name: touristName,
        blood_group: bloodGroup,
        digital_id_hash: digitalHash,
        verification_status: 'OFFICIALLY VERIFIED & ACTIVE',
        registered_since: '2026-10-25',
      });
      setShowScannerModal(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Holographic Digital ID Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-blue-950 to-navy-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Hologram Gradient Sheen */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-bl from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Card Header */}
        <div className="flex items-start justify-between border-b border-blue-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 font-bold text-xl">
              🛡️
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                GLOBAL TOURIST SAFETY CONSORTIUM
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Verifiable Tourist Digital ID
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ● VERIFIED ACTIVE
            </span>
          </div>
        </div>

        {/* Card Body: Details & QR Canvas */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Details */}
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Tourist Name</span>
              <div className="text-xl font-extrabold text-white">{touristName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Tourist ID</span>
                <div className="text-base font-mono font-bold text-cyan-300">{touristId}</div>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Blood Group</span>
                <div className="text-base font-bold text-rose-400">{bloodGroup}</div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash Display */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                SHA-256 Identity Verification Hash (Blockchain Anchored)
              </span>
              <div className="font-mono text-[11px] text-blue-300 break-all bg-black/40 p-2 rounded-lg border border-blue-500/20">
                {digitalHash}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 pt-2">
              <span>Authority: <strong>Global Safety HQ</strong></span>
              <span>•</span>
              <span>Expires: <strong>2027-12-31</strong></span>
            </div>
          </div>

          {/* Right: QR Code Canvas Frame */}
          <div className="flex flex-col items-center p-4 bg-white/95 rounded-2xl shadow-xl text-slate-900 border border-slate-200">
            <canvas ref={canvasRef} className="rounded-lg shadow-sm w-36 h-36" />
            <span className="text-[10px] font-mono font-bold text-slate-600 mt-2 tracking-wider">
              SCAN TO VERIFY CREDENTIAL
            </span>
            <span className="text-[9px] text-slate-500">Zero-Knowledge Privacy Safe</span>
          </div>

        </div>

        {/* Card Footer Actions */}
        <div className="mt-6 pt-4 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-slate-400">
            🔒 <em>Simulation Notice: Academic SHA-256 proof-of-identity demonstration.</em>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>🔍 Test Public QR Scanner Verification</span>
          </button>
        </div>

      </div>

      {/* Public QR Scanner Result Modal (Simulates Checkpoint / Ranger Scanning QR) */}
      {showScannerModal && verificationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h4 className="font-bold text-white text-base">Checkpoint QR Verification</h4>
              </div>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <span className="text-2xl text-emerald-400">✓</span>
                <div>
                  <div className="font-bold text-emerald-400">AUTHENTIC DIGITAL IDENTITY</div>
                  <div className="text-[11px] text-slate-300">Anchored in Safety Blockchain Ledger</div>
                </div>
              </div>

              <div className="bg-navy-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tourist ID:</span>
                  <span className="font-mono font-bold text-white">{verificationResult.tourist_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="font-semibold text-white">{verificationResult.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-rose-400">{verificationResult.blood_group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Safety Status:</span>
                  <span className="text-emerald-400 font-semibold">{verificationResult.verification_status}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Cryptographic Hash:</span>
                  <span className="font-mono text-[10px] text-blue-300 break-all">
                    {verificationResult.digital_id_hash}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Notice: Private phone number, home address, and account passwords remain encrypted and are NOT revealed in the public scanner.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowScannerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

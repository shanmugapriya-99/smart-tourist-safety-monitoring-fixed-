import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function BlockchainExplorer() {
  const [ledger, setLedger] = useState({
    chain: [],
    is_valid: true,
    verification_message: 'Ledger initialized.',
    total_blocks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tamperMessage, setTamperMessage] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await api.getBlockchainLedger();
      setLedger(data);
    } catch (err) {
      console.warn('Failed to fetch blockchain ledger from backend, using sample chain:', err);
      // Fallback sample chain for offline demo
      setLedger({
        chain: [
          {
            index: 0,
            timestamp: '2026-01-01T00:00:00Z',
            data: { type: 'GENESIS', authority: 'Tourist Safety HQ', message: 'Genesis Block Initialized' },
            previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
            nonce: 104,
            hash: '0038f9c2d4e7b1a03948572019b8e7c6d5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0',
          },
          {
            index: 1,
            timestamp: '2026-10-25T14:30:00Z',
            data: { type: 'DIGITAL_ID_ISSUANCE', tourist_id: 'TRV-8942-IN', status: 'VERIFIED' },
            previous_hash: '0038f9c2d4e7b1a03948572019b8e7c6d5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0',
            nonce: 285,
            hash: '00a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
          },
        ],
        is_valid: true,
        verification_message: 'Cryptographic chain valid.',
        total_blocks: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerifyChain = async () => {
    setLoading(true);
    try {
      const res = await api.verifyBlockchain();
      setLedger((prev) => ({
        ...prev,
        is_valid: res.is_valid,
        verification_message: res.message,
        corrupted_index: res.corrupted_index,
      }));
    } catch (err) {
      alert(`Verification check: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTamper = async () => {
    setLoading(true);
    try {
      const res = await api.tamperBlockchainDemo(1);
      setTamperMessage(res.message);
      await fetchLedger();
    } catch (err) {
      alert(`Tamper simulation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepairChain = async () => {
    setLoading(true);
    try {
      const res = await api.repairBlockchainDemo();
      setTamperMessage(res.message);
      await fetchLedger();
    } catch (err) {
      alert(`Repair chain: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Ledger Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              TAMPER-PROOF LEDGER
            </span>
            <span className="text-xs text-slate-400">SHA-256 Proof-of-Authority</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Safety Blockchain Explorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Immutable cryptographic ledger logging tourist identity issuances, SOS alerts, and emergency incident resolutions.
          </p>
        </div>

        {/* Chain Integrity Badge */}
        <div className={`p-4 rounded-xl border flex items-center gap-3 self-start md:self-auto ${
          ledger.is_valid
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border-red-500/50 text-red-300 animate-pulse'
        }`}>
          <div className="text-2xl">
            {ledger.is_valid ? '🛡️' : '🚨'}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              {ledger.is_valid ? 'Chain Integrity: VALID' : 'Chain Integrity: TAMPERED!'}
            </div>
            <div className="text-[11px] opacity-80">
              {ledger.verification_message}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Demonstration Warning & Simulator Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          <strong className="text-white">Academic Viva Simulation Tool:</strong> Test cryptographic tamper-detection live.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow"
          >
            ✓ Verify All Hashes
          </button>

          <button
            onClick={handleSimulateTamper}
            disabled={loading}
            title="Alters block payload data to show examiners how cryptographic hash mismatch is flagged immediately"
            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold text-xs transition-colors"
          >
            ⚠️ Simulate Tampering Block #1
          </button>

          <button
            onClick={handleRepairChain}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-colors"
          >
            🔄 Re-Mine & Repair Chain
          </button>
        </div>
      </div>

      {tamperMessage && (
        <div className="p-3 rounded-xl bg-navy-950 border border-blue-500/30 text-xs text-blue-300 font-mono">
          ℹ️ {tamperMessage}
        </div>
      )}

      {/* Visual Chain Blocks Sequence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Block Ledger Sequence ({ledger.chain?.length || 0} Blocks Mined)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Difficulty: {ledger.difficulty || 2} leading zeros
          </span>
        </div>

        <div className="space-y-4">
          {ledger.chain?.map((block, idx) => {
            const isCorrupted = ledger.corrupted_index === block.index;

            return (
              <div
                key={block.index}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrupted
                    ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-900/30'
                    : 'bg-navy-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Block Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold flex items-center justify-center text-xs">
                      #{block.index}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {block.index === 0 ? 'Genesis Safety Block' : `Block #${block.index}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
                      {block.data?.type || 'DATA_RECORD'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Timestamp: {new Date(block.timestamp).toLocaleString()} | Nonce: {block.nonce}
                  </div>
                </div>

                {/* Hashes & Link Pointers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-3">
                  <div className="bg-navy-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Previous Hash Pointer</span>
                    <span className="text-slate-400 break-all text-[11px]">
                      {block.previous_hash}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isCorrupted ? 'bg-red-950/60 border-red-500' : 'bg-navy-950 border-slate-800/80'
                  }`}>
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Block Hash (SHA-256)</span>
                    <span className={`break-all text-[11px] font-bold ${isCorrupted ? 'text-red-400' : 'text-emerald-400'}`}>
                      {block.hash}
                    </span>
                  </div>
                </div>

                {/* Block Payload Data */}
                <div className="bg-navy-950/90 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Immutable Transaction Payload</span>
                  <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(block.data, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

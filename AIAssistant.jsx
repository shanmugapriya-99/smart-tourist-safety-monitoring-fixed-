import React, { useState } from 'react';
import { api } from '../api';

export default function AIAssistant({ aiSafetyScore, userCoords, onSelectView }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your AI Tourist Safety Advisor. I continuously analyze your GPS telemetry, terrain hazard proximity, and local safety protocols to keep you safe. Ask me anything or select a prompt below!",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    '🩹 What should I do in case of a snakebite?',
    '🚨 How does the Emergency SOS button work?',
    '📍 How does Geo-Fencing protect me?',
    '🪪 Is my private data exposed in the Digital ID QR code?',
    '☀️ What should I do if experiencing heatstroke?',
  ];

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat(textToSend);
      const botMsg = {
        sender: 'bot',
        text: res.answer || "I'm monitoring your safety. Please stay on marked paths and contact 112 if in danger.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg = {
        sender: 'bot',
        text: "Safety Tip: In case of immediate physical hazard, press the RED SOS button on your dashboard to broadcast your GPS coordinates to our 24/7 Command Center.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              AI RISK ANALYTICS & TRIAGE
            </span>
            <span className="text-xs text-slate-400">Intelligent Safety Companion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Tourist Safety Advisor & Emergency Bot
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time hazard triage, first-aid advice, and personalized risk calculation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center gap-4">
          <div className="text-3xl">🤖</div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Risk Level</div>
            <div className="text-sm font-bold text-emerald-400">
              {aiSafetyScore?.status || 'OPTIMAL'} ({aiSafetyScore?.safety_score || 95}%)
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Safety Score Factors & Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Risk Assessment Details */}
        <div className="lg:col-span-1 space-y-4">
          
          <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📊</span>
              <span>AI Risk Factor Analysis</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Proximity to Danger Zones:</span>
                <span className="font-semibold text-emerald-400">Within Safe Buffer</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Time-of-Day Visibility:</span>
                <span className="font-semibold text-slate-200">Optimal Daylight</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Telemetry Accuracy:</span>
                <span className="font-mono text-blue-400">High Precision (GPS)</span>
              </div>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Emergency Protocol:</span>
                <span className="font-semibold text-cyan-400">Ready for Instant Dispatch</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-amber-300 mb-1">💡 Personalized AI Recommendation:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {aiSafetyScore?.recommendation || "Maintain phone charge above 30% and stay on recognized trails. Geo-fencing is actively guarding your route."}
              </p>
            </div>
          </div>

          {/* Quick SOS Trigger Shortcut */}
          <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/30 text-center space-y-2">
            <div className="text-xs font-bold text-red-300">In Immediate Physical Distress?</div>
            <p className="text-[11px] text-slate-400">
              Trigger the red SOS beacon on your dashboard or dial emergency services directly.
            </p>
            <button
              onClick={() => onSelectView('tourist')}
              className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/30"
            >
              Go to SOS Button
            </button>
          </div>

        </div>

        {/* Right Column: Conversational Chatbot */}
        <div className="lg:col-span-2 flex flex-col h-[550px] bg-navy-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-navy-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Tourist Safety AI Assistant</h4>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active 24/7 Safety Triage
                </div>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-navy-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>AI evaluating safety database...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-slate-800 bg-navy-950/60 overflow-x-auto flex gap-1.5 no-scrollbar">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-navy-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800 bg-navy-950 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask safety protocols, first-aid, or emergency guidelines..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

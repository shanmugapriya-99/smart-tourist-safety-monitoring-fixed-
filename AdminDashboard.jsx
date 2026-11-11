import React, { useState, useEffect } from 'react';
import LiveMap from './LiveMap';
import { api } from '../api';

export default function AdminDashboard({
  user,
  incidents = [],
  dangerZones = [],
  trackingTourists = [],
  onUpdateIncidentStatus,
  onAddDangerZone,
  onDeleteDangerZone,
}) {
  const [stats, setStats] = useState({
    total_tourists: 1,
    tracking_now: 1,
    active_incidents: 0,
    resolved_incidents: 1,
  });

  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents', 'map', 'tourists', 'geofences'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Zone Form state
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDesc, setNewZoneDesc] = useState('');
  const [newZoneLat, setNewZoneLat] = useState('15.5100');
  const [newZoneLng, setNewZoneLng] = useState('73.8150');
  const [newZoneRadius, setNewZoneRadius] = useState('350');
  const [newZoneLevel, setNewZoneLevel] = useState('CRITICAL');
  const [isSubmittingZone, setIsSubmittingZone] = useState(false);

  // Fetch admin stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getAdminStats();
        if (res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.warn('Could not fetch remote admin stats, using calculated counts:', err);
      }
    };
    fetchStats();
  }, [incidents]);

  // Handle adding new danger zone
  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZoneName || !newZoneLat || !newZoneLng) return;

    setIsSubmittingZone(true);
    try {
      await onAddDangerZone({
        name: newZoneName,
        description: newZoneDesc || 'Restricted safety boundary established by Command Center.',
        latitude: parseFloat(newZoneLat),
        longitude: parseFloat(newZoneLng),
        radius_meters: parseFloat(newZoneRadius) || 300,
        danger_level: newZoneLevel,
      });

      setNewZoneName('');
      setNewZoneDesc('');
    } catch (err) {
      alert(`Error creating danger zone: ${err.message}`);
    } finally {
      setIsSubmittingZone(false);
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSearch =
      (inc.tourist_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.tourist_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.incident_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeIncidentsCount = incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'RESPONDING').length;

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SAFETY COMMAND HQ
            </span>
            <span className="text-xs text-slate-400">Authorized Personnel Only</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Incident Response & Tourist Monitoring Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time telemetry, emergency dispatch coordination, and geo-fence perimeter control.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-400">System Telemetry Live</span>
        </div>
      </div>

      {/* 4 KPI Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tourists */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Registered Tourists</span>
            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold">
              👥
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.total_tourists || trackingTourists.length || 1}
          </div>
          <span className="text-[11px] text-slate-400">Encrypted Digital IDs</span>
        </div>

        {/* Tracking Tourists */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Consented Tracking</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
              🛰️
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats.tracking_now || 1}
          </div>
          <span className="text-[11px] text-slate-400">Active GPS Streams</span>
        </div>

        {/* Active SOS Alerts */}
        <div className={`p-5 rounded-2xl border shadow-lg transition-all ${
          activeIncidentsCount > 0
            ? 'bg-red-950/40 border-red-500/50 shadow-red-900/30'
            : 'bg-navy-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active SOS Alerts</span>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              activeIncidentsCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              🚨
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold ${activeIncidentsCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {activeIncidentsCount}
          </div>
          <span className="text-[11px] text-slate-400">Requires Dispatch</span>
        </div>

        {/* Resolved Incidents */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Resolved Incidents</span>
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300">
            {stats.resolved_incidents || 1}
          </div>
          <span className="text-[11px] text-slate-400">Immutable Ledger</span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'incidents'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>Emergency Incidents</span>
          {activeIncidentsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-mono animate-pulse">
              {activeIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'map'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Command Center Radar Map
        </button>

        <button
          onClick={() => setActiveTab('tourists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tourists'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Registered Tourists Roster
        </button>

        <button
          onClick={() => setActiveTab('geofences')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'geofences'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-navy-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Geo-Fence Manager ({dangerZones.length})
        </button>
      </div>

      {/* TAB 1: INCIDENTS MANAGEMENT */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-navy-900 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {['ALL', 'ACTIVE', 'RESPONDING', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tourist, ID, or incident..."
                className="w-full px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Incidents Table / Cards */}
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
              <span className="text-4xl">🛡️</span>
              <h4 className="text-base font-bold text-white">No Incidents Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No emergency SOS or geo-fence breach incidents match your filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map((inc) => {
                const isActive = inc.status === 'ACTIVE';
                const isResponding = inc.status === 'RESPONDING';
                const isResolved = inc.status === 'RESOLVED';

                return (
                  <div
                    key={inc.incident_id || inc.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/20'
                        : isResponding
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-navy-900 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Metadata & Tourist info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold uppercase ${
                            isActive
                              ? 'bg-red-500 text-white animate-pulse'
                              : isResponding
                              ? 'bg-amber-500 text-slate-900 font-extrabold'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {inc.status}
                          </span>

                          <span className="text-xs font-mono font-semibold text-slate-300">
                            {inc.incident_id}
                          </span>

                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {inc.incident_type || 'SOS'}
                          </span>

                          {inc.severity && (
                            <span className="text-xs px-2 py-0.5 rounded font-semibold text-red-300 bg-red-950/60 border border-red-900">
                              Urgency: {inc.severity}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{inc.tourist_name || 'Tourist'}</span>
                          <span className="text-xs font-mono text-blue-400">({inc.tourist_id})</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {inc.notes || 'Emergency signal emitted.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span>📍 Lat: {inc.latitude.toFixed(5)}, Lng: {inc.longitude.toFixed(5)}</span>
                          <span>🕒 {new Date(inc.created_at).toLocaleString()}</span>
                          {inc.emergency_phone && (
                            <span>📞 Emergency: <a href={`tel:${inc.emergency_phone}`} className="text-blue-400 underline font-mono">{inc.emergency_phone}</a></span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                        
                        {/* Open in Google Maps */}
                        <a
                          href={`https://maps.google.com/?q=${inc.latitude},${inc.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                        >
                          <span>🗺️ Open in Google Maps</span>
                        </a>

                        {/* Status Update Buttons */}
                        {isActive && (
                          <button
                            onClick={() => onUpdateIncidentStatus(inc.incident_id, 'RESPONDING', 'Paramedic & Ranger unit dispatched')}
                            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1"
                          >
                            <span>🚑 Dispatch / Responding</span>
                          </button>
                        )}

                        {(isActive || isResponding) && (
                          <button
                            onClick={() => onUpdateIncidentStatus(inc.incident_id, 'RESOLVED', 'Assisted safely on site by command patrol')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                          >
                            <span>✓ Mark Resolved</span>
                          </button>
                        )}

                        {isResolved && (
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <span>✓ Resolved & Anchored to Block #{inc.block_index || 'Ledger'}</span>
                          </span>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COMMAND CENTER MAP */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Consensual Safety Telemetry Radar</h3>
              <p className="text-xs text-slate-400">
                Displays live GPS pins of all registered tourists actively sharing location
              </p>
            </div>
          </div>

          <LiveMap
            dangerZones={dangerZones}
            activeIncidents={incidents}
            trackingTourists={trackingTourists}
            isAdmin={true}
          />
        </div>
      )}

      {/* TAB 3: REGISTERED TOURISTS ROSTER */}
      {activeTab === 'tourists' && (
        <div className="bg-navy-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Tourist Registry & Live Status</h3>
            <span className="text-xs font-mono text-slate-400">
              Total: {trackingTourists.length} Tourists
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tourist ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Emergency Contact</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Live Tracking</th>
                  <th className="px-4 py-3">Latest Ping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trackingTourists.map((t) => (
                  <tr key={t.tourist_id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-blue-400">
                      {t.tourist_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {t.name}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {t.phone || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div>{t.emergency_contact || 'N/A'}</div>
                      <div className="text-[10px] text-blue-400 font-mono">{t.emergency_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                        {t.blood_group || 'O+'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.is_tracking ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.is_tracking ? '● Tracking' : '○ Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {t.last_location_update ? new Date(t.last_location_update).toLocaleTimeString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GEO-FENCE MANAGER */}
      {activeTab === 'geofences' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Zone Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-navy-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <h3 className="text-base font-bold text-white">Establish Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-400">
              Create a virtual safety perimeter around dangerous cliffs, wildlife zones, or flash-flood streams.
            </p>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. North Bay Rip Current Shore"
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hazard Description</label>
                <input
                  type="text"
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  placeholder="e.g. Strong underwater current and loose shale."
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZoneLat}
                    onChange={(e) => setNewZoneLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZoneLng}
                    onChange={(e) => setNewZoneLng(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Danger Severity</label>
                  <select
                    value={newZoneLevel}
                    onChange={(e) => setNewZoneLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Red)</option>
                    <option value="HIGH">HIGH (Orange)</option>
                    <option value="WARNING">WARNING (Yellow)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingZone}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30 pt-2"
              >
                {isSubmittingZone ? 'Saving...' : 'Add Geo-Fence Perimeter'}
              </button>
            </form>
          </div>

          {/* Active Zones List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Active Geo-Fence Zones</h3>
            <div className="space-y-3">
              {dangerZones.map((z) => (
                <div
                  key={z.zone_id}
                  className="p-4 rounded-xl bg-navy-900 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        z.danger_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {z.danger_level}
                      </span>
                      <h4 className="text-sm font-bold text-white">{z.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{z.description}</p>
                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Coords: {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}</span>
                      <span>Radius: {z.radius_meters}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDangerZone(z.zone_id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
                    title="Remove Danger Zone"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

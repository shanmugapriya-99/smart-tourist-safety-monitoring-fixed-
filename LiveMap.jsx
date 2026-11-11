import React, { useEffect, useRef, useState } from 'react';

export default function LiveMap({
  userCoords,
  dangerZones = [],
  activeIncidents = [],
  trackingTourists = [],
  onSimulateMove,
  isTracking = true,
  isAdmin = false,
}) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const incidentsLayerRef = useRef(null);
  const touristsLayerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center coordinates (e.g. scenic coastal resort area)
  const defaultLat = userCoords?.latitude || 15.4950;
  const defaultLng = userCoords?.longitude || 73.8180;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return;

    // Check if Leaflet L is loaded from script or window
    const L = window.L;
    if (!L) {
      console.error('Leaflet library not found on window.L');
      return;
    }

    // Initialize Map
    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: true,
    });

    // Dark Carto / OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Layer groups for dynamic markers
    zonesLayerRef.current = L.layerGroup().addTo(map);
    incidentsLayerRef.current = L.layerGroup().addTo(map);
    touristsLayerRef.current = L.layerGroup().addTo(map);

    leafletMap.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update Danger Zones layer
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletMap.current || !zonesLayerRef.current) return;

    zonesLayerRef.current.clearLayers();

    dangerZones.forEach((zone) => {
      const isCritical = zone.danger_level === 'CRITICAL';
      const isHigh = zone.danger_level === 'HIGH';
      const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';

      const circle = L.circle([zone.latitude, zone.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.22,
        weight: 2,
        dashArray: '5, 5',
        radius: zone.radius_meters || 300,
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 180px;">
          <div style="font-weight: bold; font-size: 13px; color: ${color}; margin-bottom: 4px;">
            ⚠️ ${zone.name}
          </div>
          <div style="margin-bottom: 6px; color: #334155;">
            ${zone.description || 'Restricted area.'}
          </div>
          <div style="font-size: 11px; background: #f1f5f9; padding: 4px 6px; border-radius: 4px;">
            <strong>Radius:</strong> ${zone.radius_meters}m | <strong>Level:</strong> ${zone.danger_level}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
            * Sample Demo Danger Zone
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      zonesLayerRef.current.addLayer(circle);
    });
  }, [dangerZones, mapLoaded]);

  // Update Active SOS Incidents layer
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletMap.current || !incidentsLayerRef.current) return;

    incidentsLayerRef.current.clearLayers();

    activeIncidents.forEach((inc) => {
      if (inc.status === 'RESOLVED') return;

      const sosIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: '<div class="pulse-marker-sos"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: sosIcon });
      const popup = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 200px;">
          <div style="font-weight: bold; color: #ef4444; font-size: 13px; margin-bottom: 2px;">
            🚨 ACTIVE EMERGENCY SOS
          </div>
          <div style="font-size: 11px; font-weight: bold; color: #1e293b;">Incident: ${inc.incident_id}</div>
          <div style="font-size: 11px; color: #475569;">Tourist: ${inc.tourist_name || inc.tourist_id}</div>
          <div style="font-size: 11px; color: #475569;">Notes: ${inc.notes || 'No extra notes'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Status: <strong>${inc.status}</strong></div>
        </div>
      `;
      marker.bindPopup(popup);
      incidentsLayerRef.current.addLayer(marker);
    });
  }, [activeIncidents, mapLoaded]);

  // Update User Marker
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletMap.current) return;

    if (!userCoords) return;

    const lat = userCoords.latitude;
    const lng = userCoords.longitude;
    const acc = userCoords.accuracy || 15;

    // Create or update user beacon marker
    if (!userMarkerRef.current) {
      const touristIcon = L.divIcon({
        className: 'custom-tourist-marker',
        html: '<div class="pulse-marker-tourist"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([lat, lng], { icon: touristIcon }).addTo(leafletMap.current);
      userMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong>Your Current Location</strong><br/>
          Accuracy: ±${Math.round(acc)}m<br/>
          Status: Consented Live Tracking Active
        </div>
      `);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
    }

    // Accuracy circle
    if (!userCircleRef.current) {
      userCircleRef.current = L.circle([lat, lng], {
        radius: acc,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(leafletMap.current);
    } else {
      userCircleRef.current.setLatLng([lat, lng]);
      userCircleRef.current.setRadius(acc);
    }
  }, [userCoords, mapLoaded]);

  // Update Admin view of all tourists
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletMap.current || !touristsLayerRef.current || !isAdmin) return;

    touristsLayerRef.current.clearLayers();

    trackingTourists.forEach((t) => {
      // Don't duplicate self if userCoords exists
      if (t.latitude && t.longitude) {
        const marker = L.circleMarker([t.latitude, t.longitude], {
          radius: 7,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.9,
          weight: 2,
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong>Tourist:</strong> ${t.name || t.tourist_id}<br/>
            <strong>Phone:</strong> ${t.phone || 'N/A'}<br/>
            <strong>Emergency:</strong> ${t.emergency_phone || 'N/A'}<br/>
            <strong>Updated:</strong> ${new Date(t.updated_at || Date.now()).toLocaleTimeString()}
          </div>
        `);
        touristsLayerRef.current.addLayer(marker);
      }
    });
  }, [trackingTourists, isAdmin, mapLoaded]);

  // Center map on user
  const handleCenterOnUser = () => {
    if (leafletMap.current && userCoords) {
      leafletMap.current.setView([userCoords.latitude, userCoords.longitude], 15, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-navy-900">
      
      {/* Map DOM Element */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-navy-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-lg text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="font-bold text-white">
              {isTracking ? 'Live GPS Tracking Active' : 'Tracking Paused'}
            </span>
          </div>
          {userCoords && (
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {userCoords.latitude.toFixed(5)}, {userCoords.longitude.toFixed(5)} (±{Math.round(userCoords.accuracy || 10)}m)
            </div>
          )}
        </div>
      </div>

      {/* Legend & Simulation Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Map Legend */}
        <div className="pointer-events-auto bg-navy-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-lg text-xs flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
            <span className="text-slate-300">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-300">Danger Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Hazard Zone</span>
          </div>
          {activeIncidents.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-red-400 font-bold">SOS Beacon</span>
            </div>
          )}
        </div>

        {/* Viva Demo Simulation Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={handleCenterOnUser}
            className="px-3 py-2 rounded-xl bg-navy-800/90 hover:bg-navy-700 text-white text-xs font-semibold border border-slate-700 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>My Location</span>
          </button>

          {/* Golden Viva Feature: Simulate entering danger zone */}
          {onSimulateMove && (
            <div className="flex gap-1.5">
              <button
                onClick={() => onSimulateMove(15.4989, 73.8055)} // Inside Rocky Cliff zone
                title="Academic Demo: Instantly moves GPS inside the Coastal Cliff danger zone to demonstrate real-time geo-fence breach alert"
                className="px-3 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold border border-red-400/50 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-colors"
              >
                <span>⚠️ Test Breach Zone</span>
              </button>
              <button
                onClick={() => onSimulateMove(15.4950, 73.8180)} // Safe beach zone
                title="Reset GPS to safe trail zone"
                className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-400/50 shadow-lg backdrop-blur-md transition-colors"
              >
                <span>✓ Safe Trail</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

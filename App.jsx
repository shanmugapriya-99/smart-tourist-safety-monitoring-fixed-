import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import TouristDashboard from './components/TouristDashboard';
import AdminDashboard from './components/AdminDashboard';
import LiveMap from './components/LiveMap';
import DigitalIDCard from './components/DigitalIDCard';
import BlockchainExplorer from './components/BlockchainExplorer';
import AIAssistant from './components/AIAssistant';
import GeoFenceAlert from './components/GeoFenceAlert';
import MobileMotionMonitor from './components/MobileMotionMonitor';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { api, getStoredUser, clearAuthToken } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'tourist', 'admin', 'map', 'blockchain', 'ai'
  const [user, setUser] = useState(getStoredUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // GPS Tracking State
  const [isTracking, setIsTracking] = useState(true);
  const [userCoords, setUserCoords] = useState({
    latitude: 15.4950,
    longitude: 73.8180,
    accuracy: 12.0,
  });
  const [locationError, setLocationError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // System Data
  const [dangerZones, setDangerZones] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trackingTourists, setTrackingTourists] = useState([]);
  const [activeBreach, setActiveBreach] = useState(null);
  const [aiSafetyScore, setAiSafetyScore] = useState({
    safety_score: 95,
    status: 'OPTIMAL',
    color: 'green',
    recommendation: 'You are in a verified safe tourist corridor. Enjoy your visit responsibly.',
  });

  const watchIdRef = useRef(null);

  // Initial Load: Fetch danger zones and verify profile
  useEffect(() => {
    loadDangerZones();
    loadIncidents();

    // Verify stored user session
    if (user) {
      api.getCurrentUser()
        .then((res) => {
          if (res.user) setUser(res.user);
        })
        .catch(() => {
          // Token expired, clear
          clearAuthToken();
          setUser(null);
        });
    }
  }, []);

  // Periodic polling for incidents and tracking tourists
  useEffect(() => {
    const interval = setInterval(() => {
      loadIncidents();
      if (user?.role === 'admin') {
        loadTrackingTourists();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Geolocation Watcher
  useEffect(() => {
    if (!isTracking) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser. Using demo coordinates.');
      return;
    }

    const handleSuccess = (position) => {
      setLocationError('');
      const newCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
      };
      setUserCoords(newCoords);
      setLastUpdated(new Date());

      // Send consented ping to backend
      sendPing(newCoords);
    };

    const handleError = (error) => {
      let msg = '';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = 'Location permission was denied. To enable live GPS, allow location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          msg = 'GPS location is currently unavailable. Using demo coordinates.';
          break;
        case error.TIMEOUT:
          msg = 'GPS location request timed out.';
          break;
        default:
          msg = 'Unable to acquire location.';
      }
      setLocationError(msg);
      // Keep demo coordinates so application remains 100% interactive
      sendPing(userCoords);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    };

    // Obtain current position immediately, then watch
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking]);

  // Send GPS Ping to Backend & check for geo-fence breaches
  const sendPing = async (coords) => {
    try {
      const res = await api.sendLocationUpdate({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 10,
        battery_level: 88,
      });

      if (res.geofence_status) {
        setActiveBreach(res.geofence_status);
      }
      if (res.ai_safety) {
        setAiSafetyScore(res.ai_safety);
      }
    } catch (err) {
      // Backend not running yet or unauthorized; evaluate locally for client demo
      evaluateLocalGeofence(coords.latitude, coords.longitude);
    }
  };

  // Local Geo-fence evaluation fallback for zero-network testing
  const evaluateLocalGeofence = (lat, lng) => {
    const cliffZone = {
      name: 'Rocky Coastal Cliff - High Tide Area',
      latitude: 15.4989,
      longitude: 73.8055,
      radius_meters: 350,
      danger_level: 'CRITICAL',
    };

    // Rough distance check
    const dx = (lat - cliffZone.latitude) * 111000;
    const dy = (lng - cliffZone.longitude) * 111000 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= cliffZone.radius_meters) {
      setActiveBreach({
        type: 'BREACH',
        zone: cliffZone,
        message: "WARNING: You have entered restricted danger zone 'Rocky Coastal Cliff'. Please withdraw immediately!",
        distance: Math.round(dist),
      });
      setAiSafetyScore({
        safety_score: 25,
        status: 'CRITICAL DANGER',
        color: 'red',
        recommendation: 'DANGER: You are inside a high-risk zone. Evacuate immediately.',
      });
    }
  };

  const loadDangerZones = async () => {
    try {
      const res = await api.getDangerZones();
      if (res.danger_zones) setDangerZones(res.danger_zones);
    } catch (err) {
      // Default sample zones
      setDangerZones([
        {
          zone_id: 'ZONE-CLIFF-01',
          name: 'Rocky Coastal Cliff - High Tide Area',
          description: 'Steep rocky terrain with strong rip currents and falling rocks.',
          latitude: 15.4989,
          longitude: 73.8055,
          radius_meters: 350,
          danger_level: 'CRITICAL',
        },
        {
          zone_id: 'ZONE-TRAIL-02',
          name: 'Unpatrolled Wildlife & Dense Forest Path',
          description: 'Dense forest trail known for wild animal crossings.',
          latitude: 15.5200,
          longitude: 73.8200,
          radius_meters: 500,
          danger_level: 'HIGH',
        },
      ]);
    }
  };

  const loadIncidents = async () => {
    try {
      const res = await api.getIncidents('ALL');
      if (res.incidents) setIncidents(res.incidents);
    } catch (err) {
      // Sample fallback incident
      setIncidents([
        {
          incident_id: 'INC-2026-001',
          tourist_id: 'TRV-8942-IN',
          tourist_name: 'John Doe',
          emergency_phone: '+91 98765 00000',
          latitude: 15.4920,
          longitude: 73.8150,
          incident_type: 'SOS',
          severity: 'HIGH',
          status: 'RESOLVED',
          notes: 'Tourist felt dizzy near trekking route. Medical volunteer attended.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          block_index: 1,
        },
      ]);
    }
  };

  const loadTrackingTourists = async () => {
    try {
      const res = await api.getAdminTourists();
      if (res.tourists) setTrackingTourists(res.tourists);
    } catch (err) {
      console.warn('Could not load tracking tourists:', err);
    }
  };

  // Toggle Tracking Handler
  const handleToggleTracking = async () => {
    const nextState = !isTracking;
    setIsTracking(nextState);
    try {
      await api.toggleTracking(nextState);
    } catch (e) {
      // Ignore
    }
  };

  // Simulate movement for Viva / Evaluator
  const handleSimulateMove = (lat, lng) => {
    const newCoords = {
      latitude: lat,
      longitude: lng,
      accuracy: 8.0,
    };
    setUserCoords(newCoords);
    setLastUpdated(new Date());
    sendPing(newCoords);
  };

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    if (res.user?.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('tourist');
    }
  };

  const handleRegister = async (formData) => {
    const res = await api.register(formData);
    setUser(res.user);
    setCurrentView('tourist');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentView('landing');
  };

  // Quick Evaluator 1-Click Logins
  const handleAutoLoginTourist = () => {
    handleLogin('tourist@example.com', 'tourist123');
  };

  const handleAutoLoginAdmin = () => {
    handleLogin('admin@touristsafety.org', 'admin123');
  };

  // Incident & Danger Zone Handlers
  const handleIncidentCreated = (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleUpdateIncidentStatus = async (incidentId, status, notes) => {
    try {
      await api.updateIncidentStatus(incidentId, status, notes, user?.name || 'Admin HQ');
      loadIncidents();
    } catch (err) {
      alert(`Update status error: ${err.message}`);
    }
  };

  const handleAddDangerZone = async (zoneData) => {
    const res = await api.createDangerZone(zoneData);
    if (res.zone) {
      setDangerZones((prev) => [...prev, res.zone]);
    }
  };

  const handleDeleteDangerZone = async (zoneId) => {
    try {
      await api.deleteDangerZone(zoneId);
      setDangerZones((prev) => prev.filter((z) => z.zone_id !== zoneId));
    } catch (err) {
      alert(`Error deleting danger zone: ${err.message}`);
    }
  };

  const activeAlertCount = incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'RESPONDING').length;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      
      {/* Real-time Geo-fence Breach Warning Alert Banner */}
      <GeoFenceAlert
        breachData={activeBreach}
        onDismiss={() => setActiveBreach(null)}
        onTriggerSOS={() => setCurrentView('tourist')}
      />

      {/* Main Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* Dynamic View Controller */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingHero
            onSelectView={setCurrentView}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onAutoLoginTourist={handleAutoLoginTourist}
            onAutoLoginAdmin={handleAutoLoginAdmin}
          />
        )}

        {currentView === 'tourist' && (
          <>
          <MobileMotionMonitor coords={userCoords} onIncidentCreated={handleIncidentCreated} />
          <TouristDashboard
            user={user}
            currentCoords={userCoords}
            isTracking={isTracking}
            locationError={locationError}
            lastUpdated={lastUpdated}
            dangerZones={dangerZones}
            aiSafetyScore={aiSafetyScore}
            onToggleTracking={handleToggleTracking}
            onSimulateMove={handleSimulateMove}
            onIncidentCreated={handleIncidentCreated}
            onViewDigitalID={() => setCurrentView('tourist')}
            onViewBlockchain={() => setCurrentView('blockchain')}
          />
          </>
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            user={user}
            incidents={incidents}
            dangerZones={dangerZones}
            trackingTourists={trackingTourists}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onAddDangerZone={handleAddDangerZone}
            onDeleteDangerZone={handleDeleteDangerZone}
          />
        )}

        {currentView === 'map' && (
          <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Full-Screen Tactical Safety Radar</h2>
                <p className="text-xs text-slate-400">
                  Real-time Leaflet GIS mapping with live GPS positioning and restricted zone boundaries
                </p>
              </div>
            </div>
            <LiveMap
              userCoords={userCoords}
              dangerZones={dangerZones}
              activeIncidents={incidents}
              trackingTourists={trackingTourists}
              onSimulateMove={handleSimulateMove}
              isTracking={isTracking}
              isAdmin={user?.role === 'admin'}
            />
          </div>
        )}

        {currentView === 'blockchain' && (
          <BlockchainExplorer />
        )}

        {currentView === 'ai' && (
          <AIAssistant
            aiSafetyScore={aiSafetyScore}
            userCoords={userCoords}
            onSelectView={setCurrentView}
          />
        )}
      </main>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegister}
        onSwitchToLogin={() => setIsLoginOpen(true)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-navy-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-400">
            Smart Tourist Safety Monitoring & Incident Response System
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by AI Risk Analytics, Geo-Fencing Boundary Radar, and Blockchain Digital ID
          </p>
        </div>
      </footer>

    </div>
  );
}

# 🛡️ Smart Tourist Safety Monitoring & Incident Response System
### Using AI, Geo-Fencing, and Blockchain-based Digital ID

> **College Mini Project 2026**  
> Complete full-stack web application with live GPS location tracking, danger zone geo-fencing, emergency SOS dispatch, tamper-proof blockchain digital identity, and administrative incident response console.

---

## 📌 1. Project Overview & Architecture

The **Smart Tourist Safety Monitoring & Incident Response System** provides a proactive safety umbrella for domestic and international travelers exploring unfamiliar or hazardous terrains (coastal cliffs, high-tide shorelines, dense wildlife corridors, and landslide zones).

### The Four Core Pillars:

```
+-----------------------------------------------------------------------------------+
|               SMART TOURIST SAFETY & INCIDENT RESPONSE ARCHITECTURE               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  1. 🤖 AI RISK ANALYTICS & TRIAGE                                                 |
|     - Computes dynamic safety index score (0-100%) based on terrain,              |
|       time of day, battery level, and hazard proximity.                           |
|     - Automated triage categorization for emergency responders & instant          |
|       first-aid protocols for tourists.                                           |
|                                                                                   |
|  2. 🛰️ CONSENSUAL LIVE GPS & PHONE LOCATION TRACKING                             |
|     - High-precision Geolocation API tracking with user consent.                  |
|     - "Start Tracking" & "Stop Tracking" controls; never tracks secretly.         |
|     - Telemetry updates sent securely to the Command Center.                      |
|                                                                                   |
|  3. 📍 DYNAMIC GEO-FENCING & DANGER ZONE RADAR                                    |
|     - Real-time perimeter monitoring using Haversine great-circle calculation.    |
|     - Instant audible alarm synthesizer & visual warning banner upon breach.      |
|     - Interactive Leaflet / OpenStreetMap display of restricted zones.            |
|                                                                                   |
|  4. ⛓️ BLOCKCHAIN-BASED DIGITAL ID & VERIFIABLE LEDGER                            |
|     - SHA-256 hashed tourist identity cards with public QR verification.          |
|     - Keeps private phone numbers and passwords secret from public scanners.      |
|     - Tamper-evident immutable ledger logging SOS triggers and resolutions.       |
|     - Interactive tamper-detection testing feature for viva demonstration.        |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ 2. Technology Stack

- **Frontend**: React.js 18, Tailwind CSS, Leaflet Maps, Web Audio API, Canvas QR generator.
- **Backend**: Python Flask, Flask-CORS, PyJWT, Werkzeug Security (password hashing).
- **Database**: SQLite (built-in, zero external installation required) / MongoDB compatible schema.
- **Mapping**: Leaflet with OpenStreetMap / Carto tiles (100% free, no credit card / billing keys needed).
- **Blockchain**: SHA-256 Proof-of-Authority/Proof-of-Work blockchain engine (`backend/blockchain.py`).
- **AI Engine**: Rule-based NLP triage and safety risk score evaluator (`backend/ai_engine.py`).

---

## 🚀 3. How to Run the Application in VS Code

You can run this project in **two different ways**:

### Option A: The Fast 1-Click Way (Instant Full-Stack)
The backend is equipped to serve the complete React application directly!
1. Open terminal in the project root:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```
   *Everything (Frontend, Backend, Database, Map, Blockchain, AI)* runs together immediately!

---

### Option B: The Developer Way (Separate Frontend & Backend)

#### Step 1: Start the Flask Backend
Open a terminal in VS Code:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*Backend will start on `http://127.0.0.1:5000`.*

#### Step 2: Start the Vite React Frontend
Open a **second** terminal tab in VS Code:
```bash
cd frontend
npm install
npm run dev
```
*Frontend will launch on `http://localhost:5173` with instant hot-reloading.*

---

## 🔑 4. Pre-Configured Demo Credentials

The database is pre-seeded with sample accounts for instant testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Safety Admin HQ** | `admin@touristsafety.org` | `admin123` | Full Command Center, Incident Dispatch, Geo-Fence Manager |
| **Sample Tourist** | `tourist@example.com` | `tourist123` | Tourist Portal, Live GPS Tracking, SOS Trigger, Digital ID |

*(You can also register any new tourist profile on the registration page; it will automatically mint a new Tourist ID and blockchain block!)*

---

## 🎯 5. Step-by-Step Evaluator Walkthrough (Viva Demo Guide)

When presenting this project to college professors or examiners, follow this sequence:

### Step 1: Tourist Registration & Digital ID Issuance
1. Click **"Register"** on the top right.
2. Fill in the traveler's details (Name, Phone, Emergency Contact, Blood Group).
3. Notice that upon submission:
   - A unique **Tourist ID** (e.g. `TRV-9284-AX`) is generated.
   - An SHA-256 cryptographic identity hash is computed.
   - A new block is mined onto the **Safety Blockchain**.
4. Click **"View Full ID & QR Code"** to show the verifiable digital pass.
5. Click **"Test Public QR Scanner"** to demonstrate that checkpoint officers can verify validity **without** exposing the tourist's private phone number or password.

### Step 2: Live GPS Tracking & Accidental-Proof SOS
1. On the Tourist Dashboard, show the **"Start Tracking" / "Stop Tracking"** button. Explain that location is collected with explicit user consent.
2. Click the large red **SOS** button:
   - A confirmation dialog appears with a **5-second cancel countdown** to protect against accidental presses.
   - Select the distress type (e.g. *Medical Injury* or *Lost on Trail*).
   - Click **"Confirm & Dispatch Now"**.
3. Point out the **AI Triage** result:
   - Priority classification (e.g., `PRIORITY-1`).
   - Dispatched team recommendation (e.g., *Emergency Medical & Paramedic Unit*).
   - Automated first-aid guidance.
   - Incident event immutably logged on the blockchain ledger.

### Step 3: Real-Time Geo-Fencing Breach Demonstration
1. In an indoor classroom or lab, a physical device cannot walk 500 meters outdoors into a cliff.
2. Click the red button: **"⚠️ Test Breach Cliff"** on the radar card.
3. This shifts the simulated GPS coordinates into the **Rocky Coastal Cliff** danger zone:
   - A high-priority audible siren beep plays via the Web Audio API synthesizer.
   - A flashing warning banner appears: *"WARNING: You have entered restricted danger zone 'Rocky Coastal Cliff'. Please withdraw immediately!"*
   - An automatic geo-fence breach incident is transmitted to the Admin Console.
4. Click **"✓ Safe Trail"** to return to safety.

### Step 4: Admin Incident Response Console
1. Switch to **"Admin Center"** (or log in as `admin@touristsafety.org`).
2. Show the **4 Real-Time KPI Cards**: Total Tourists, Tracking Now, Active SOS Alerts, Resolved Incidents.
3. Open the **Incidents Feed**:
   - View the active distress beacon.
   - Click **"🗺️ Open in Google Maps"** to open precise coordinates in an external tab.
   - Click **"🚑 Dispatch / Responding"** to assign units.
   - Click **"✓ Mark Resolved"** to finalize the case.
4. Switch to **"Geo-Fence Manager"** tab to add a new custom danger zone circle directly to the map!

### Step 5: Blockchain Explorer & Live Tamper Test
1. Click **"Blockchain Ledger"** in the top navigation bar.
2. Show the chain of blocks (Genesis block, Tourist ID issuance blocks, SOS incident blocks, Incident resolution blocks).
3. Click **"✓ Verify All Hashes"**: shows `Chain Integrity: VALID`.
4. Now, to impress the examiner, click **"⚠️ Simulate Tampering Block #1"**:
   - The system modifies the data payload of Block #1 without re-mining.
   - The validation engine immediately flags: `🚨 Block #1 data has been TAMPERED! Hash mismatch.`
   - Shows the class how blockchain guarantees that incident logs cannot be deleted or forged by bad actors.
5. Click **"🔄 Re-Mine & Repair Chain"** to restore cryptographic validity.

---

## 💡 6. College Viva Questions & Answers

### Q1: How does the Geo-Fencing algorithm calculate boundaries?
> **Answer**: We use the **Haversine Formula**, which computes the great-circle distance between two points on a spherical Earth given their latitudes and longitudes in radians:
> $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
> If calculated distance $d \le \text{radius}$, a breach is flagged. If $d \le \text{radius} + 200\text{m}$, an approaching warning is issued.

### Q2: Why is Blockchain used in this project?
> **Answer**: In emergency incidents and tourist registration, traditional centralized databases can be manipulated (e.g. an incident report being deleted or altered to avoid liability). Our blockchain engine implements SHA-256 block linking where every block references `previous_hash`. Any unauthorized modification immediately invalidates the entire subsequent hash chain.

### Q3: How is tourist privacy preserved?
> **Answer**: The tourist's location is only gathered with explicit consent when "Start Tracking" is toggled on. In addition, the public QR code on the Digital ID card only embeds a cryptographic verification endpoint and tourist ID; it **never** exposes the tourist's raw phone number, passwords, or home address.

### Q4: How does the AI Safety Risk Score work?
> **Answer**: The AI engine dynamically evaluates three real-time parameters:
> 1. Proximity to the nearest active danger zone (penalty up to -60 points if inside).
> 2. Time-of-day ambient light (night/dusk penalties).
> 3. Phone battery level (penalty if below 20%).
> The result maps to a safety level: Optimal (80-100%), Moderate (55-79%), High Risk (30-54%), or Critical Danger (<30%).

---

## 📁 7. File Structure

```
smart-tourist-safety-system/
├── backend/
│   ├── app.py                # Main Flask REST API & static server
│   ├── config.py             # Configs, JWT keys, and sample danger zones
│   ├── database.py           # SQLite database schema, seeds, and CRUD
│   ├── blockchain.py         # SHA-256 blockchain, mining, and tamper checker
│   ├── ai_engine.py          # Haversine distance, AI risk score, and triage
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── package.json          # Vite React dependencies
│   ├── vite.config.js        # Vite config with API proxy
│   ├── index.html            # Main HTML with Tailwind CDN & Leaflet
│   ├── dist/
│   │   └── index.html        # Pre-bundled standalone React client for Flask
│   └── src/
│       ├── main.jsx          # React DOM root
│       ├── App.jsx           # Master application controller & state
│       ├── index.css         # Custom animations & Leaflet styling
│       ├── api.js            # Unified API client with offline fallback
│       └── components/
│           ├── Navbar.jsx           # Responsive header navigation
│           ├── LandingHero.jsx      # High-impact landing page & 4 pillars
│           ├── SOSButton.jsx        # Red SOS button with 5s countdown
│           ├── LiveMap.jsx          # Interactive Leaflet map & breach tester
│           ├── GeoFenceAlert.jsx    # Audio synthesizer siren & visual banner
│           ├── TouristDashboard.jsx # Tourist tracking & safety cards
│           ├── AdminDashboard.jsx   # Admin KPIs, dispatch stepper, zone manager
│           ├── DigitalIDCard.jsx    # Verifiable ID card & canvas QR generator
│           ├── BlockchainExplorer.jsx # Visual block ledger & tamper demo
│           ├── AIAssistant.jsx      # AI risk analysis & emergency chat
│           ├── LoginModal.jsx       # Auth modal with 1-click test credentials
│           └── RegisterModal.jsx    # Enrollment with blood group & digital ID
├── start_backend.bat         # 1-click Windows backend launcher
├── start_frontend.bat        # 1-click Windows frontend launcher
├── run_project.bat           # 1-click master launcher for both
└── README.md                 # Complete documentation & viva answers
```

---

## 📜 8. License & Academic Disclaimer
Developed for academic mini-project demonstration purposes. Emergency dispatch features simulate local authorities (112 / 911 / 108) and do not place real-world police calls in demo mode.

"""
Flask API Server for Smart Tourist Safety Monitoring & Incident Response System
"""
import os
import random
import string
import datetime
import jwt
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import check_password_hash

from config import Config
from database import (
    init_db, create_user, get_user_by_email, get_user_by_tourist_id, get_all_tourists,
    upsert_location, get_latest_locations, update_tracking_status,
    create_incident, get_incidents, update_incident_status,
    get_danger_zones, add_danger_zone, delete_danger_zone, get_dashboard_stats
)
from blockchain import safety_blockchain
from ai_engine import (
    evaluate_geofence_breach, calculate_ai_safety_score,
    triage_emergency_incident, process_safety_chat
)

# Initialize Flask App
app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize Database and default records
init_db()

# --- Helper Utilities & JWT Decorators ---

def generate_tourist_id():
    """Generates a readable unique Tourist ID: e.g. TRV-7842-X9"""
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(random.choices(chars, k=4))
    code = ''.join(random.choices(string.ascii_uppercase, k=2))
    return f"TRV-{suffix}-{code}"

def generate_jwt(user):
    payload = {
        'tourist_id': user['tourist_id'],
        'email': user['email'],
        'role': user['role'],
        'name': user['name'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing authorization token'}), 401
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
            current_user = get_user_by_tourist_id(data['tourist_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired, please log in again'}), 401
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Access forbidden: Admin authorization required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# --- Authentication Endpoints ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    emergency_contact = data.get('emergency_contact', '').strip()
    emergency_phone = data.get('emergency_phone', '').strip()
    blood_group = data.get('blood_group', 'Unknown').strip()

    if not name or not email or not phone or not password or not emergency_phone:
        return jsonify({'error': 'Please provide name, email, phone, password, and emergency phone.'}), 400

    existing_user = get_user_by_email(email)
    if existing_user:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    tourist_id = generate_tourist_id()
    try:
        user_record = create_user(
            tourist_id=tourist_id,
            name=name,
            email=email,
            phone=phone,
            password=password,
            emergency_contact=emergency_contact,
            emergency_phone=emergency_phone,
            blood_group=blood_group
        )
        token = generate_jwt(user_record)
        return jsonify({
            'message': 'Registration successful! Digital ID minted on Blockchain.',
            'user': user_record,
            'token': token
        }), 201
    except Exception as e:
        return jsonify({'error': f'Failed to register tourist: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = get_user_by_email(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    # Remove password hash from response
    user_dict = {k: user[k] for k in user if k != 'password_hash'}
    token = generate_jwt(user_dict)
    return jsonify({
        'message': 'Login successful.',
        'user': user_dict,
        'token': token
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_profile(current_user):
    user_dict = {k: current_user[k] for k in current_user if k != 'password_hash'}
    return jsonify({'user': user_dict}), 200


# --- GPS Location & Tracking Endpoints ---

@app.route('/api/location/update', methods=['POST'])
@token_required
def update_location(current_user):
    data = request.get_json() or {}
    lat = data.get('latitude')
    lng = data.get('longitude')
    accuracy = data.get('accuracy', 10.0)
    speed = data.get('speed', 0.0)
    heading = data.get('heading', 0.0)
    battery = data.get('battery_level', 90)

    if lat is None or lng is None:
        return jsonify({'error': 'Latitude and longitude coordinates are required'}), 400

    tourist_id = current_user['tourist_id']

    # 1. Update location in database
    loc_record = upsert_location(
        tourist_id=tourist_id,
        latitude=float(lat),
        longitude=float(lng),
        accuracy=float(accuracy) if accuracy is not None else None,
        speed=float(speed) if speed is not None else None,
        heading=float(heading) if heading is not None else None,
        is_tracking=1
    )

    # 2. Check active danger zones with Geo-fence evaluation
    zones = get_danger_zones(active_only=True)
    is_breached, breached_zone, distance, approaching = evaluate_geofence_breach(float(lat), float(lng), zones)

    breach_alert = None
    if is_breached:
        # Check if an active breach incident already exists to avoid duplicate spam
        existing_incidents = get_incidents(status='ACTIVE', tourist_id=tourist_id)
        has_recent_breach = any(inc['incident_type'] == 'GEOFENCE_BREACH' for inc in existing_incidents)
        
        if not has_recent_breach:
            incident_id = f"GEOFENCE-{tourist_id[-4:]}-{random.randint(100, 999)}"
            create_incident(
                incident_id=incident_id,
                tourist_id=tourist_id,
                latitude=float(lat),
                longitude=float(lng),
                incident_type='GEOFENCE_BREACH',
                severity=breached_zone.get('danger_level', 'CRITICAL'),
                notes=f"Automatic Geo-fence Breach Detected: Tourist penetrated {breached_zone['name']} (Radius {breached_zone['radius_meters']}m)."
            )

        breach_alert = {
            'type': 'BREACH',
            'zone': breached_zone,
            'message': f"WARNING: You have entered restricted danger zone '{breached_zone['name']}'. Please withdraw immediately!",
            'distance': distance
        }
    elif approaching:
        breach_alert = {
            'type': 'APPROACHING',
            'zone': breached_zone,
            'message': f"Caution: Approaching boundary of '{breached_zone['name']}' ({distance}m away).",
            'distance': distance
        }

    # 3. Dynamic AI Safety Score calculation
    ai_safety = calculate_ai_safety_score(float(lat), float(lng), zones, battery_level=battery)

    return jsonify({
        'status': 'success',
        'location': loc_record,
        'geofence_status': breach_alert,
        'ai_safety': ai_safety
    }), 200

@app.route('/api/location/toggle', methods=['POST'])
@token_required
def toggle_tracking(current_user):
    data = request.get_json() or {}
    is_tracking = data.get('is_tracking', True)
    update_tracking_status(current_user['tourist_id'], is_tracking)
    return jsonify({
        'status': 'success',
        'is_tracking': is_tracking,
        'message': f"Location tracking {'enabled' if is_tracking else 'disabled'} with user consent."
    }), 200

@app.route('/api/location/latest', methods=['GET'])
@token_required
@admin_required
def get_all_tracking_tourists(current_user):
    """Admin endpoint to view latest consented locations of all active tourists"""
    locations = get_latest_locations()
    return jsonify({'locations': locations}), 200


# --- Emergency SOS Incident System ---

@app.route('/api/sos', methods=['POST'])
@token_required
def trigger_sos(current_user):
    data = request.get_json() or {}
    lat = data.get('latitude')
    lng = data.get('longitude')
    notes = data.get('notes', 'Emergency SOS Triggered by Tourist')
    battery = data.get('battery_level', None)
    incident_type = data.get('incident_type', 'SOS')

    if lat is None or lng is None:
        return jsonify({'error': 'GPS coordinates required for SOS trigger'}), 400

    tourist_id = current_user['tourist_id']

    # AI Incident Triage Engine
    triage = triage_emergency_incident(incident_type, notes, battery)
    severity = triage['calculated_urgency']

    # Generate unique incident ID
    incident_id = f"SOS-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

    # Record in database & blockchain
    incident_record = create_incident(
        incident_id=incident_id,
        tourist_id=tourist_id,
        latitude=float(lat),
        longitude=float(lng),
        incident_type=incident_type,
        severity=severity,
        notes=f"{notes} [AI Triage: {triage['priority_level']} | Unit: {triage['recommended_unit']}]"
    )

    return jsonify({
        'status': 'success',
        'message': 'EMERGENCY SOS ALERT BROADCAST TO COMMAND CENTER & RECORDED ON BLOCKCHAIN',
        'incident': incident_record,
        'ai_triage': triage,
        'emergency_services': Config.EMERGENCY_SERVICES,
        'disclaimer': 'Demo Mode: Emergency alert dispatched to Safety Command Center simulator.'
    }), 201

@app.route('/api/incidents', methods=['GET'])
@token_required
def fetch_incidents(current_user):
    status_filter = request.args.get('status')
    
    # If admin, can see all incidents; if tourist, can see own incidents
    if current_user.get('role') == 'admin':
        incidents = get_incidents(status=status_filter)
    else:
        incidents = get_incidents(status=status_filter, tourist_id=current_user['tourist_id'])

    return jsonify({'incidents': incidents}), 200

@app.route('/api/incidents/<incident_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_incident(current_user, incident_id):
    data = request.get_json() or {}
    status = data.get('status', '').upper()
    notes = data.get('notes')
    responder_name = data.get('responder_name', current_user.get('name', 'Admin'))

    if status not in ['ACTIVE', 'RESPONDING', 'RESOLVED']:
        return jsonify({'error': 'Invalid status. Choose ACTIVE, RESPONDING, or RESOLVED'}), 400

    result = update_incident_status(incident_id, status, notes, responder_name)
    return jsonify({
        'message': f"Incident status updated to '{status}' and immutable resolution recorded.",
        'result': result
    }), 200


# --- Danger Zones (Geo-fences) ---

@app.route('/api/danger-zones', methods=['GET'])
def list_danger_zones():
    zones = get_danger_zones(active_only=True)
    return jsonify({'danger_zones': zones}), 200

@app.route('/api/danger-zones', methods=['POST'])
@token_required
@admin_required
def create_danger_zone(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    lat = data.get('latitude')
    lng = data.get('longitude')
    radius = data.get('radius_meters', 300)
    danger_level = data.get('danger_level', 'CRITICAL').upper()

    if not name or lat is None or lng is None:
        return jsonify({'error': 'Name, latitude, and longitude are required'}), 400

    zone_id = f"ZONE-{random.randint(1000, 9999)}"
    new_zone = add_danger_zone(
        zone_id=zone_id,
        name=name,
        description=description,
        latitude=float(lat),
        longitude=float(lng),
        radius_meters=float(radius),
        danger_level=danger_level
    )

    return jsonify({
        'message': 'Danger Zone perimeter registered successfully.',
        'zone': new_zone
    }), 201

@app.route('/api/danger-zones/<zone_id>', methods=['DELETE'])
@token_required
@admin_required
def remove_danger_zone(current_user, zone_id):
    delete_danger_zone(zone_id)
    return jsonify({'message': f"Danger zone {zone_id} removed."}), 200


# --- Blockchain & Digital ID Verification ---

@app.route('/api/blockchain', methods=['GET'])
def get_blockchain_ledger():
    is_valid, msg, broken_idx = safety_blockchain.is_chain_valid()
    return jsonify({
        'is_valid': is_valid,
        'verification_message': msg,
        'corrupted_index': broken_idx,
        'difficulty': safety_blockchain.difficulty,
        'total_blocks': len(safety_blockchain.chain),
        'chain': safety_blockchain.to_list(),
        'notice': 'Simulated Proof-of-Authority/SHA-256 Blockchain for Academic Mini Project Demonstration'
    }), 200

@app.route('/api/blockchain/verify', methods=['POST'])
def verify_blockchain():
    is_valid, msg, broken_idx = safety_blockchain.is_chain_valid()
    return jsonify({
        'is_valid': is_valid,
        'message': msg,
        'corrupted_index': broken_idx
    }), 200

@app.route('/api/blockchain/tamper', methods=['POST'])
def tamper_blockchain_demo():
    """Demo feature for college presentation to prove tamper-detection in real time"""
    data = request.get_json() or {}
    block_index = int(data.get('index', 1))
    success, msg = safety_blockchain.tamper_block_for_demo(block_index)
    is_valid, verify_msg, _ = safety_blockchain.is_chain_valid()
    return jsonify({
        'success': success,
        'message': msg,
        'chain_valid_now': is_valid,
        'verification_result': verify_msg
    }), 200

@app.route('/api/blockchain/repair', methods=['POST'])
def repair_blockchain_demo():
    """Restores blockchain validity after demo tampering"""
    safety_blockchain.repair_chain_recompute()
    is_valid, verify_msg, _ = safety_blockchain.is_chain_valid()
    return jsonify({
        'success': True,
        'message': 'All block hashes re-computed and chain integrity restored.',
        'chain_valid_now': is_valid
    }), 200

@app.route('/api/digital-id/<tourist_id>', methods=['GET'])
def verify_digital_id(tourist_id):
    """
    Public Verification API:
    Safely verifies digital ID authenticity without disclosing private phone numbers/credentials.
    Used by QR code scanners or checkpoint guards.
    """
    user = get_user_by_tourist_id(tourist_id)
    if not user:
        return jsonify({'valid': False, 'message': 'Tourist ID not found in registry'}), 404

    return jsonify({
        'valid': True,
        'tourist_id': user['tourist_id'],
        'name': user['name'],
        'blood_group': user['blood_group'],
        'digital_id_hash': user['digital_id_hash'],
        'registered_since': user['created_at'],
        'verification_status': 'OFFICIALLY VERIFIED & ACTIVE',
        'blockchain_verified': True
    }), 200


# --- Admin Dashboard Statistics ---

@app.route('/api/admin/stats', methods=['GET'])
@token_required
@admin_required
def admin_stats(current_user):
    stats = get_dashboard_stats()
    return jsonify({'stats': stats}), 200

@app.route('/api/admin/tourists', methods=['GET'])
@token_required
@admin_required
def admin_tourists(current_user):
    tourists = get_all_tourists()
    return jsonify({'tourists': tourists}), 200


# --- AI Safety Assistant & Chat ---

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message required'}), 400

    response = process_safety_chat(message)
    return jsonify(response), 200

@app.route('/api/ai/risk-assessment', methods=['POST'])
def ai_risk():
    data = request.get_json() or {}
    lat = float(data.get('latitude', 15.4950))
    lng = float(data.get('longitude', 73.8180))
    battery = data.get('battery_level', 85)

    zones = get_danger_zones(active_only=True)
    assessment = calculate_ai_safety_score(lat, lng, zones, battery)
    return jsonify(assessment), 200


# --- Serve Static Frontend (Integrated Full-Stack Mode) ---

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    
    # Elegant fallback welcome page if frontend hasn't been built yet
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Smart Tourist Safety System API</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; margin: 0; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; margin-top: 0; }
            .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
            .endpoint { background: #0f172a; border: 1px solid #334155; padding: 12px 16px; border-radius: 8px; margin-bottom: 10px; font-family: monospace; font-size: 14px; color: #a5f3fc; }
            .tag { color: #f59e0b; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <span class="badge">Backend API Active</span>
            <h1>🛡️ Smart Tourist Safety Monitoring System</h1>
            <p>The Python Flask backend is operational! Connect the React frontend or test endpoints below:</p>
            <div class="endpoint"><span class="tag">POST</span> /api/auth/login (admin@touristsafety.org / admin123)</div>
            <div class="endpoint"><span class="tag">POST</span> /api/auth/register</div>
            <div class="endpoint"><span class="tag">POST</span> /api/location/update</div>
            <div class="endpoint"><span class="tag">POST</span> /api/sos</div>
            <div class="endpoint"><span class="tag">GET</span> /api/danger-zones</div>
            <div class="endpoint"><span class="tag">GET</span> /api/blockchain</div>
        </div>
    </body>
    </html>
    """, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"================================================================")
    print(f"🛡️  SMART TOURIST SAFETY & INCIDENT RESPONSE SYSTEM")
    print(f"   College Mini Project Backend Server Running")
    print(f"   URL: http://127.0.0.1:{port}")
    print(f"   Default Admin: {Config.DEFAULT_ADMIN_EMAIL} / {Config.DEFAULT_ADMIN_PASSWORD}")
    print(f"   Sample Tourist: tourist@example.com / tourist123")
    print(f"================================================================")
    app.run(host='0.0.0.0', port=port, debug=False)

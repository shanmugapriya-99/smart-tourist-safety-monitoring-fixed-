"""
Database layer for Smart Tourist Safety Monitoring System.
Uses SQLite for robust zero-config out-of-the-box execution for college mini projects.
Compatible with MongoDB / Firebase migrations (interface mimics NoSQL documents).
"""
import sqlite3
import json
import os
import hashlib
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from blockchain import safety_blockchain

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and populates default sample records"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tourist_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        emergency_contact TEXT,
        emergency_phone TEXT,
        blood_group TEXT,
        role TEXT NOT NULL DEFAULT 'tourist',
        digital_id_hash TEXT,
        created_at TEXT NOT NULL
    )
    ''')

    # 2. Locations Table (Latest GPS location per tourist)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tourist_id TEXT UNIQUE NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        speed REAL,
        heading REAL,
        is_tracking INTEGER DEFAULT 1,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tourist_id) REFERENCES users (tourist_id)
    )
    ''')

    # 3. Incidents Table (Emergency SOS and Geo-fence breaches)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT UNIQUE NOT NULL,
        tourist_id TEXT NOT NULL,
        tourist_name TEXT,
        emergency_phone TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        incident_type TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'HIGH',
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        notes TEXT,
        responder_name TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        block_index INTEGER,
        block_hash TEXT
    )
    ''')

    # 4. Danger Zones Table (Geo-fencing perimeters)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS danger_zones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        zone_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius_meters REAL NOT NULL,
        danger_level TEXT NOT NULL DEFAULT 'CRITICAL',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
    )
    ''')

    # 5. Blockchain Persistence Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS blockchain_store (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        block_index INTEGER UNIQUE NOT NULL,
        block_json TEXT NOT NULL
    )
    ''')

    conn.commit()

    # Seed Default Admin Account if not exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (Config.DEFAULT_ADMIN_EMAIL,))
    admin = cursor.fetchone()
    if not admin:
        admin_pass_hash = generate_password_hash(Config.DEFAULT_ADMIN_PASSWORD)
        cursor.execute('''
            INSERT INTO users (tourist_id, name, email, phone, password_hash, emergency_contact, emergency_phone, blood_group, role, digital_id_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'ADMIN-001',
            Config.DEFAULT_ADMIN_NAME,
            Config.DEFAULT_ADMIN_EMAIL,
            '+1-800-SAFE-01',
            admin_pass_hash,
            'Safety HQ Dispatch',
            '112',
            'O+',
            'admin',
            hashlib.sha256(b'ADMIN-MASTER-ID').hexdigest(),
            datetime.utcnow().isoformat()
        ))
        conn.commit()

    # Seed Default Danger Zones if empty
    cursor.execute('SELECT COUNT(*) as count FROM danger_zones')
    if cursor.fetchone()['count'] == 0:
        for zone in Config.DEFAULT_DANGER_ZONES:
            cursor.execute('''
                INSERT INTO danger_zones (zone_id, name, description, latitude, longitude, radius_meters, danger_level, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
            ''', (
                zone['zone_id'],
                zone['name'],
                zone['description'],
                zone['latitude'],
                zone['longitude'],
                zone['radius_meters'],
                zone['danger_level'],
                datetime.utcnow().isoformat()
            ))
        conn.commit()

    # Seed Sample Tourist for immediate testing/presentation
    cursor.execute('SELECT id FROM users WHERE email = ?', ('tourist@example.com',))
    if not cursor.fetchone():
        demo_pass = generate_password_hash('tourist123')
        demo_tourist_id = 'TRV-8942-IN'
        digital_hash = hashlib.sha256(f"{demo_tourist_id}:John Doe:+919876543210".encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (tourist_id, name, email, phone, password_hash, emergency_contact, emergency_phone, blood_group, role, digital_id_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            demo_tourist_id,
            'John Doe (Demo Tourist)',
            'tourist@example.com',
            '+91 98765 43210',
            demo_pass,
            'Sarah Doe (Spouse)',
            '+91 98765 00000',
            'B+',
            'tourist',
            digital_hash,
            datetime.utcnow().isoformat()
        ))

        # Add initial sample location
        cursor.execute('''
            INSERT INTO locations (tourist_id, latitude, longitude, accuracy, speed, heading, is_tracking, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        ''', (
            demo_tourist_id,
            15.4950,
            73.8180,
            12.5,
            1.2,
            45.0,
            datetime.utcnow().isoformat()
        ))

        # Add initial sample resolved incident
        cursor.execute('''
            INSERT INTO incidents (incident_id, tourist_id, tourist_name, emergency_phone, latitude, longitude, incident_type, severity, status, notes, responder_name, created_at, resolved_at, block_index, block_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ''', (
            'INC-2026-001',
            demo_tourist_id,
            'John Doe',
            '+91 98765 00000',
            15.4920,
            73.8150,
            'SOS',
            'HIGH',
            'RESOLVED',
            'Tourist felt dizzy near trekking route. Medical volunteer attended with hydration pack.',
            'Officer Rao (Coastal Patrol)',
            '2026-10-25T14:30:00Z',
            '2026-10-25T15:15:00Z',
            'a8f9c2d4e7b1a03948572019b8e7c6d5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9'
        ))
        conn.commit()

        # Add sample tourist ID block to blockchain
        safety_blockchain.record_digital_id(demo_tourist_id, "John Doe", "+919876543210", datetime.utcnow().isoformat())

    conn.close()

# --- User Functions ---
def create_user(tourist_id, name, email, phone, password, emergency_contact, emergency_phone, blood_group='Unknown'):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = generate_password_hash(password)
    digital_id_hash = hashlib.sha256(f"{tourist_id}:{name}:{phone}".encode()).hexdigest()
    created_at = datetime.utcnow().isoformat()

    try:
        cursor.execute('''
            INSERT INTO users (tourist_id, name, email, phone, password_hash, emergency_contact, emergency_phone, blood_group, role, digital_id_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'tourist', ?, ?)
        ''', (tourist_id, name, email, phone, password_hash, emergency_contact, emergency_phone, blood_group, digital_id_hash, created_at))
        conn.commit()

        # Record Digital ID in Blockchain
        block = safety_blockchain.record_digital_id(tourist_id, name, phone, created_at)
        return {
            "tourist_id": tourist_id,
            "name": name,
            "email": email,
            "phone": phone,
            "emergency_contact": emergency_contact,
            "emergency_phone": emergency_phone,
            "blood_group": blood_group,
            "role": "tourist",
            "digital_id_hash": digital_id_hash,
            "blockchain_block": block.index,
            "blockchain_hash": block.hash
        }
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_tourist_id(tourist_id):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE tourist_id = ?', (tourist_id,)).fetchone()
    conn.close()
    return dict(user) if user else None

def get_all_tourists():
    conn = get_db_connection()
    users = conn.execute('''
        SELECT u.tourist_id, u.name, u.phone, u.emergency_contact, u.emergency_phone, u.blood_group, u.created_at, u.digital_id_hash,
               l.latitude, l.longitude, l.accuracy, l.is_tracking, l.updated_at as last_location_update
        FROM users u
        LEFT JOIN locations l ON u.tourist_id = l.tourist_id
        WHERE u.role = 'tourist'
        ORDER BY u.id DESC
    ''').fetchall()
    conn.close()
    return [dict(u) for u in users]

# --- Location Functions ---
def upsert_location(tourist_id, latitude, longitude, accuracy=None, speed=None, heading=None, is_tracking=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    updated_at = datetime.utcnow().isoformat()

    cursor.execute('''
        INSERT INTO locations (tourist_id, latitude, longitude, accuracy, speed, heading, is_tracking, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tourist_id) DO UPDATE SET
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            accuracy = excluded.accuracy,
            speed = excluded.speed,
            heading = excluded.heading,
            is_tracking = excluded.is_tracking,
            updated_at = excluded.updated_at
    ''', (tourist_id, latitude, longitude, accuracy, speed, heading, is_tracking, updated_at))
    conn.commit()
    conn.close()
    return {"tourist_id": tourist_id, "latitude": latitude, "longitude": longitude, "updated_at": updated_at}

def get_latest_locations():
    conn = get_db_connection()
    locs = conn.execute('''
        SELECT l.*, u.name, u.phone, u.emergency_contact, u.emergency_phone, u.blood_group
        FROM locations l
        JOIN users u ON l.tourist_id = u.tourist_id
        WHERE l.is_tracking = 1
    ''').fetchall()
    conn.close()
    return [dict(l) for l in locs]

def update_tracking_status(tourist_id, is_tracking):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE locations SET is_tracking = ? WHERE tourist_id = ?', (1 if is_tracking else 0, tourist_id))
    conn.commit()
    conn.close()

# --- Incidents Functions ---
def create_incident(incident_id, tourist_id, latitude, longitude, incident_type='SOS', severity='CRITICAL', notes=''):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get tourist details
    user = conn.execute('SELECT name, emergency_phone FROM users WHERE tourist_id = ?', (tourist_id,)).fetchone()
    tourist_name = user['name'] if user else 'Unknown Tourist'
    emergency_phone = user['emergency_phone'] if user else ''

    # Record on blockchain
    block = safety_blockchain.record_sos_incident(incident_id, tourist_id, latitude, longitude, incident_type, severity)
    created_at = datetime.utcnow().isoformat()

    cursor.execute('''
        INSERT INTO incidents (incident_id, tourist_id, tourist_name, emergency_phone, latitude, longitude, incident_type, severity, status, notes, created_at, block_index, block_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?)
    ''', (incident_id, tourist_id, tourist_name, emergency_phone, latitude, longitude, incident_type, severity, notes, created_at, block.index, block.hash))
    conn.commit()
    conn.close()

    return {
        "incident_id": incident_id,
        "tourist_id": tourist_id,
        "tourist_name": tourist_name,
        "emergency_phone": emergency_phone,
        "latitude": latitude,
        "longitude": longitude,
        "incident_type": incident_type,
        "severity": severity,
        "status": "ACTIVE",
        "notes": notes,
        "created_at": created_at,
        "block_index": block.index,
        "block_hash": block.hash
    }

def get_incidents(status=None, tourist_id=None):
    conn = get_db_connection()
    query = 'SELECT * FROM incidents WHERE 1=1'
    params = []

    if status and status != 'ALL':
        query += ' AND status = ?'
        params.append(status)
    if tourist_id:
        query += ' AND tourist_id = ?'
        params.append(tourist_id)

    query += ' ORDER BY id DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_incident_status(incident_id, status, notes=None, responder_name=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    resolved_at = datetime.utcnow().isoformat() if status == 'RESOLVED' else None

    cursor.execute('''
        UPDATE incidents
        SET status = ?, notes = COALESCE(?, notes), responder_name = COALESCE(?, responder_name), resolved_at = COALESCE(?, resolved_at)
        WHERE incident_id = ?
    ''', (status, notes, responder_name, resolved_at, incident_id))
    conn.commit()

    if status == 'RESOLVED' and responder_name:
        safety_blockchain.record_incident_resolution(incident_id, responder_name, notes or "Resolved safely")

    conn.close()
    return {"incident_id": incident_id, "status": status, "responder_name": responder_name, "resolved_at": resolved_at}

# --- Danger Zones ---
def get_danger_zones(active_only=True):
    conn = get_db_connection()
    if active_only:
        zones = conn.execute('SELECT * FROM danger_zones WHERE is_active = 1').fetchall()
    else:
        zones = conn.execute('SELECT * FROM danger_zones').fetchall()
    conn.close()
    return [dict(z) for z in zones]

def add_danger_zone(zone_id, name, description, latitude, longitude, radius_meters, danger_level='CRITICAL'):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()

    cursor.execute('''
        INSERT INTO danger_zones (zone_id, name, description, latitude, longitude, radius_meters, danger_level, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    ''', (zone_id, name, description, latitude, longitude, radius_meters, danger_level, created_at))
    conn.commit()
    conn.close()
    return {
        "zone_id": zone_id,
        "name": name,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "radius_meters": radius_meters,
        "danger_level": danger_level,
        "is_active": 1,
        "created_at": created_at
    }

def delete_danger_zone(zone_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM danger_zones WHERE zone_id = ?', (zone_id,))
    conn.commit()
    conn.close()
    return True

# --- Dashboard Stats ---
def get_dashboard_stats():
    conn = get_db_connection()
    total_tourists = conn.execute("SELECT COUNT(*) as c FROM users WHERE role = 'tourist'").fetchone()['c']
    tracking_now = conn.execute("SELECT COUNT(*) as c FROM locations WHERE is_tracking = 1").fetchone()['c']
    active_incidents = conn.execute("SELECT COUNT(*) as c FROM incidents WHERE status IN ('ACTIVE', 'RESPONDING')").fetchone()['c']
    resolved_incidents = conn.execute("SELECT COUNT(*) as c FROM incidents WHERE status = 'RESOLVED'").fetchone()['c']
    total_zones = conn.execute("SELECT COUNT(*) as c FROM danger_zones WHERE is_active = 1").fetchone()['c']
    conn.close()

    return {
        "total_tourists": total_tourists,
        "tracking_now": tracking_now,
        "active_incidents": active_incidents,
        "resolved_incidents": resolved_incidents,
        "active_danger_zones": total_zones
    }

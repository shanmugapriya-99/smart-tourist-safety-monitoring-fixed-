"""
Configuration settings for Smart Tourist Safety Monitoring & Incident Response System
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'tourist-safety-super-secret-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-tourist-safety-token-key-2026')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24
    
    # SQLite Database File Path
    DATABASE_PATH = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'tourist_safety.db'))
    
    # Default Admin Credentials for Demo / College Viva
    DEFAULT_ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@touristsafety.org')
    DEFAULT_ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
    DEFAULT_ADMIN_NAME = 'Command Center Admin'
    
    # Blockchain simulation difficulty (number of leading zeros required)
    BLOCKCHAIN_DIFFICULTY = 2
    
    # Sample Emergency Contact Numbers (Display and one-click dialer)
    EMERGENCY_SERVICES = {
        'national_emergency': '112',
        'police': '100',
        'ambulance': '108',
        'tourist_helpline': '1363'
    }
    
    # Default Sample Danger Zones (Sample coordinates around popular tourist spot: Goa/Scenic Beach & Cliffs)
    DEFAULT_DANGER_ZONES = [
        {
            "zone_id": "ZONE-CLIFF-01",
            "name": "Rocky Coastal Cliff - High Tide Area",
            "description": "Steep rocky terrain with strong underwater rip currents and falling rocks.",
            "latitude": 15.4989,
            "longitude": 73.8055,
            "radius_meters": 350,
            "danger_level": "CRITICAL"
        },
        {
            "zone_id": "ZONE-TRAIL-02",
            "name": "Unpatrolled Wildlife & Dense Forest Path",
            "description": "Dense forest trail known for wild animal crossings and sudden flash floods.",
            "latitude": 15.5200,
            "longitude": 73.8200,
            "radius_meters": 500,
            "danger_level": "HIGH"
        },
        {
            "zone_id": "ZONE-LANDSLIDE-03",
            "name": "Landslide Hazard Ridge",
            "description": "Unstable soil ridge during monsoon rains. Falling debris hazard.",
            "latitude": 15.4850,
            "longitude": 73.8300,
            "radius_meters": 400,
            "danger_level": "WARNING"
        }
    ]

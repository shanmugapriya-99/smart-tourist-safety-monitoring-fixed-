"""
AI Engine for Tourist Safety Monitoring & Emergency Incident Response.
Features:
1. Geo-fence boundary & proximity detection (Haversine formula).
2. Dynamic AI Safety Risk Score (0-100%).
3. Emergency Incident Triage & Automated First-Aid Guidance.
4. AI Safety Assistant Q&A Chatbot for tourist guidance.
"""
import math
from datetime import datetime

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates great-circle distance between two points on Earth in meters.
    """
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def evaluate_geofence_breach(tourist_lat, tourist_lon, danger_zones):
    """
    Checks if tourist coordinates violate any active danger zone perimeter.
    Returns: (is_breached: bool, breached_zone: dict or None, distance_meters: float, approaching: bool)
    """
    approaching_zone = None
    min_dist = float('inf')

    for zone in danger_zones:
        dist = haversine_distance(tourist_lat, tourist_lon, zone['latitude'], zone['longitude'])
        radius = zone['radius_meters']

        # Breach condition: inside the circle perimeter
        if dist <= radius:
            return True, zone, round(dist, 1), False

        # Warning condition: within 200m buffer zone
        if dist <= radius + 200:
            if dist < min_dist:
                min_dist = dist
                approaching_zone = zone

    if approaching_zone:
        return False, approaching_zone, round(min_dist, 1), True

    return False, None, round(min_dist, 1) if min_dist != float('inf') else 9999, False

def calculate_ai_safety_score(tourist_lat, tourist_lon, danger_zones, battery_level=85):
    """
    AI Safety Index Calculation (0 to 100):
    Factors:
    - Distance to danger zones
    - Time of day (night penalty)
    - Phone battery level
    """
    score = 100
    risk_factors = []

    # 1. Proximity to Danger Zones
    is_breached, zone, dist, approaching = evaluate_geofence_breach(tourist_lat, tourist_lon, danger_zones)
    if is_breached:
        score -= 60
        risk_factors.append(f"Inside {zone['name']} danger zone ({zone['danger_level']})!")
    elif approaching:
        score -= 30
        risk_factors.append(f"Approaching boundary of {zone['name']} ({dist}m away)")
    elif dist < 1000:
        score -= 10
        risk_factors.append("Within 1km of restricted hazard zone")

    # 2. Time of day analysis (Local twilight/night penalty)
    now_hour = datetime.utcnow().hour  # UTC; during evening hours, higher risk
    if now_hour >= 18 or now_hour <= 4:
        score -= 15
        risk_factors.append("Low ambient visibility (night hours)")

    # 3. Battery health penalty
    if battery_level and battery_level < 20:
        score -= 20
        risk_factors.append(f"Critically low device battery ({battery_level}%)")
    elif battery_level and battery_level < 40:
        score -= 10
        risk_factors.append(f"Moderate battery level ({battery_level}%)")

    score = max(5, min(100, score))

    if score >= 80:
        status = "OPTIMAL"
        color = "green"
        recommendation = "You are in a verified safe tourist corridor. Enjoy your visit responsibly."
    elif score >= 55:
        status = "MODERATE"
        color = "yellow"
        recommendation = "Stay vigilant. Stick to well-lit trails and monitor your battery level."
    elif score >= 30:
        status = "HIGH RISK"
        color = "orange"
        recommendation = "Warning: Approaching hazardous terrain. Consider moving toward populated areas."
    else:
        status = "CRITICAL DANGER"
        color = "red"
        recommendation = "DANGER: You are inside or right on the perimeter of a high-risk zone. Evacuate or contact emergency."

    return {
        "safety_score": score,
        "status": status,
        "color": color,
        "recommendation": recommendation,
        "risk_factors": risk_factors
    }

def triage_emergency_incident(incident_type, notes, battery_level=None):
    """
    Automated AI Emergency Triage Protocol:
    Determines urgency level and first-aid recommendations for victim and responders.
    """
    notes_lower = (notes or "").lower()
    high_urgency_keywords = ["unconscious", "bleeding", "fracture", "drowning", "snake", "cliff", "heart", "attack", "fall"]
    medium_urgency_keywords = ["lost", "dizzy", "sprain", "water", "heat", "exhaustion", "trail"]

    urgency = "HIGH"
    first_aid_guidance = "Stay in place. Conserve phone battery. If in immediate danger, move slowly to open flat ground."
    dispatch_unit = "Rapid Response Patrol"

    if any(k in notes_lower for k in high_urgency_keywords):
        urgency = "CRITICAL"
        dispatch_unit = "Emergency Medical & Paramedic Unit"
        if "snake" in notes_lower:
            first_aid_guidance = "Keep calm and immobilize the bitten limb below heart level. DO NOT attempt to cut or suck venom. Wait for paramedics."
        elif "bleeding" in notes_lower:
            first_aid_guidance = "Apply firm, continuous pressure with a clean cloth. Elevate injured limb if possible."
        elif "fracture" in notes_lower or "fall" in notes_lower:
            first_aid_guidance = "Do not move the injured limb. Keep warm and await rescue team with stretcher."
        elif "drowning" in notes_lower or "cliff" in notes_lower:
            first_aid_guidance = "Stay away from edge/water line. Make visible waving gestures or whistle."
    elif any(k in notes_lower for k in medium_urgency_keywords):
        urgency = "MEDIUM"
        dispatch_unit = "Tourist Safety Guide / Ranger"
        first_aid_guidance = "Sit in the shade, sip water slowly, and wait for ranger beacon coordinates."

    return {
        "calculated_urgency": urgency,
        "recommended_unit": dispatch_unit,
        "automated_first_aid": first_aid_guidance,
        "priority_level": "PRIORITY-1" if urgency == "CRITICAL" else "PRIORITY-2"
    }

def process_safety_chat(query):
    """
    AI Safety Assistant response generator for tourists.
    Includes comprehensive emergency knowledge base and offline fallback responses.
    """
    q = query.lower().strip()

    if any(w in q for w in ["sos", "emergency", "help", "danger"]):
        return {
            "answer": "If you are in immediate danger, press the RED SOS button on your dashboard. This captures your exact GPS coordinates and alerts our 24/7 Command Center. You can also dial 112 directly.",
            "action": "trigger_sos_prompt",
            "category": "emergency"
        }
    elif any(w in q for w in ["geo", "fence", "zone", "restricted"]):
        return {
            "answer": "Geo-fencing creates virtual protective boundaries around dangerous zones (cliffs, high-tide shorelines, dense wildlife corridors). If your GPS crosses into these zones, you'll receive an instant audible warning and our safety patrol is alerted.",
            "category": "feature_info"
        }
    elif any(w in q for w in ["blockchain", "digital id", "verification", "qr"]):
        return {
            "answer": "Your Tourist Digital ID is cryptographically hashed with SHA-256 and anchored in our tamper-proof Safety Ledger. The QR code verifies your active registration without revealing your private personal phone or password to anyone scanning it.",
            "category": "blockchain_info"
        }
    elif any(w in q for w in ["snake", "bite"]):
        return {
            "answer": "Emergency Snakebite Protocol: 1. Keep victim completely calm and still. 2. Keep bitten limb below heart level. 3. Remove rings or tight clothing. 4. DO NOT cut the wound, apply ice, or use a tourniquet. 5. Trigger SOS immediately for anti-venom dispatch.",
            "category": "first_aid"
        }
    elif any(w in q for w in ["heat", "sun", "dehydrat"]):
        return {
            "answer": "Heat Exhaustion Protocol: Move immediately into shaded or air-conditioned shelter. Drink cool water or electrolyte fluid in small sips. Loosen clothing and apply damp cloths to neck and forehead.",
            "category": "first_aid"
        }
    elif any(w in q for w in ["lost", "direction", "trail"]):
        return {
            "answer": "Lost on trail? 1. Stop walking to prevent getting further off-course. 2. Enable 'Start Tracking' on your dashboard so command center can see your live ping. 3. Look for marked trail markers. 4. If signal is weak, move to the nearest high, open clearing.",
            "category": "safety_guide"
        }
    else:
        return {
            "answer": "I am your AI Tourist Safety Assistant. I can assist you with emergency response protocols, geo-fence alerts, first-aid steps (snakebite, sprain, heatstroke), and how our blockchain Digital ID verifies your safety status. How can I help you stay safe?",
            "category": "general"
        }

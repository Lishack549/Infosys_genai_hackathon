import requests
import re

OLLAMA_API = "http://localhost:11434/api/generate"

# ------------------- CALL LLAMA3 -------------------
def call_llama3(prompt: str) -> str:
    payload = {"model": "llama3", "prompt": prompt}
    response = requests.post(OLLAMA_API, json=payload, stream=True)
    output = ""
    for line in response.iter_lines():
        if line:
            data = line.decode("utf-8")
            if '"response":"' in data:
                part = data.split('"response":"')[1].split('"')[0]
                output += part
    return output.strip()

# ------------------- DEPARTMENT CLASSIFIER -------------------
def classify_department(text: str) -> str:
    text_lower = text.lower()
    if "invoice" in text_lower or "payment" in text_lower or "amount" in text_lower or "finance" in text_lower:
        return "Finance"
    elif "resignation" in text_lower or "joining" in text_lower or "salary" in text_lower or "employee" in text_lower:
        return "HR"
    elif "complaint" in text_lower or "delay" in text_lower or "issue" in text_lower or "support" in text_lower:
        return "Customer Support"
    elif "agreement" in text_lower or "contract" in text_lower or "clause" in text_lower or "legal" in text_lower:
        return "Legal"
    else:
        return "General"

# ------------------- ENTITY EXTRACTION -------------------
def extract_entities(text: str) -> dict:
    # Amounts
    amounts = re.findall(r"(?:₹|\$)?\s?\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?", text)

    # Dates
    dates = re.findall(
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{2,4}\b",
        text,
        flags=re.IGNORECASE,
    )

    # Invoice numbers
    invoice_numbers = re.findall(r"\bINV[-/]\d{4}[-/]\d{3}\b", text, flags=re.IGNORECASE)

    return {
        "amounts": amounts,
        "dates": dates,
        "invoice_numbers": invoice_numbers
    }

# ------------------- IT TICKET CLASSIFIER -------------------
def classify_ticket(text: str) -> str:
    text_lower = text.lower()
    
    # Network & Connectivity Issues
    if any(word in text_lower for word in ["vpn", "network", "internet", "wifi", "connection", "connectivity"]):
        return "Network & Connectivity"
    
    # Password & Authentication
    elif any(word in text_lower for word in ["password", "login", "authentication", "access", "locked", "expired"]):
        return "Password & Authentication"
    
    # Software & Applications
    elif any(word in text_lower for word in ["software", "install", "license", "application", "app", "program", "update"]):
        return "Software & Applications"
    
    # Hardware Issues
    elif any(word in text_lower for word in ["printer", "scanner", "keyboard", "mouse", "monitor", "laptop", "computer", "hardware"]):
        return "Hardware Issues"
    
    # Email & Communication
    elif any(word in text_lower for word in ["email", "outlook", "gmail", "calendar", "meeting", "teams", "zoom"]):
        return "Email & Communication"
    
    # Data & File Issues
    elif any(word in text_lower for word in ["file", "data", "backup", "storage", "drive", "folder", "document"]):
        return "Data & File Issues"
    
    # Security & Permissions
    elif any(word in text_lower for word in ["security", "permission", "access", "firewall", "antivirus", "malware"]):
        return "Security & Permissions"
    
    # Account & Access Management
    elif any(word in text_lower for word in ["account", "user", "profile", "access", "permission", "role"]):
        return "Account & Access Management"
    
    else:
        return "General IT Issue"

# ------------------- AI SUGGESTION FOR IT -------------------
def generate_it_suggestion(category: str, description: str) -> str:
    base_prompts = {
        "Network & Connectivity": f"""
Category: {category}
Issue: {description}

Provide step-by-step troubleshooting instructions for network connectivity issues. Include:
1. Basic connectivity checks (ping, traceroute)
2. VPN connection troubleshooting
3. WiFi/Network adapter settings
4. Common network configuration fixes
5. When to contact network administrator
""",
        
        "Password & Authentication": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for password and authentication issues. Include:
1. Password reset procedures
2. Account unlock steps
3. Multi-factor authentication setup
4. Common login troubleshooting
5. When to contact system administrator
""",
        
        "Software & Applications": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for software and application issues. Include:
1. Software installation procedures
2. License activation steps
3. Application troubleshooting
4. Update and patch procedures
5. When to contact software vendor or IT admin
""",
        
        "Hardware Issues": f"""
Category: {category}
Issue: {description}

Provide step-by-step troubleshooting for hardware issues. Include:
1. Basic hardware diagnostics
2. Driver updates and installations
3. Hardware connection checks
4. Common hardware fixes
5. When to contact hardware support or replace equipment
""",
        
        "Email & Communication": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for email and communication issues. Include:
1. Email client configuration
2. Calendar and meeting setup
3. Video conferencing troubleshooting
4. Email sync and backup procedures
5. When to contact email administrator
""",
        
        "Data & File Issues": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for data and file issues. Include:
1. File recovery procedures
2. Backup and restore steps
3. Storage space management
4. File permission fixes
5. When to contact data recovery specialist
""",
        
        "Security & Permissions": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for security and permission issues. Include:
1. Security software configuration
2. Permission settings adjustment
3. Firewall and antivirus setup
4. Security best practices
5. When to contact security team
""",
        
        "Account & Access Management": f"""
Category: {category}
Issue: {description}

Provide step-by-step instructions for account and access management. Include:
1. Account creation and setup
2. Access permission requests
3. Role and profile management
4. Account security settings
5. When to contact access management team
""",
        
        "General IT Issue": f"""
Category: {category}
Issue: {description}

Provide general IT troubleshooting steps. Include:
1. Basic system diagnostics
2. Common IT issue resolution
3. System optimization tips
4. Best practices for the specific issue
5. When to escalate to IT support team
"""
    }
    
    prompt = base_prompts.get(category, base_prompts["General IT Issue"])
    return call_llama3(prompt)

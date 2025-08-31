import re
from utils import call_llama3

# ------------------ FINANCE ------------------ #
def extract_finance_fields(text: str) -> dict:
    """Extract vendor, amount, due date from invoices."""
    vendor = None
    amount = None
    due_date = None

    # Regex for amount
    match_amount = re.search(r"(?:₹|\$)?\s?\d+(?:,\d{3})*(?:\.\d{2})?", text)
    if match_amount:
        amount = match_amount.group()

    # Regex for due date
    match_date = re.search(r"\b(?:\d{1,2}/\d{1,2}/\d{2,4}|\d{1,2} \w+ \d{4})\b", text)
    if match_date:
        due_date = match_date.group()

    # Vendor via LLM (more accurate)
    vendor_prompt = f"Extract the vendor/supplier name from this invoice:\n{text}\nVendor:"
    vendor = call_llama3(vendor_prompt)

    return {
        "vendor": vendor,
        "amount": amount,
        "due_date": due_date
    }

# ------------------ CUSTOMER SUPPORT ------------------ #
def extract_support_fields(text: str) -> dict:
    """Extract issue category and priority from complaints."""
    prompt = f"""Classify the following client complaint:
    Text: {text}
    Return JSON with 'category' (Refund/Delay/Delivery/Other) and 'priority' (Low/Medium/High).
    """
    response = call_llama3(prompt)
    return {"raw": response}

# ------------------ LEGAL ------------------ #
def extract_legal_fields(text: str) -> dict:
    """Check for missing clauses in contracts."""
    clauses = ["Termination", "Liability", "Confidentiality"]
    missing = [c for c in clauses if c.lower() not in text.lower()]

    return {
        "parties": call_llama3(f"Extract parties in this contract:\n{text}\nParties:"),
        "missing_clauses": missing
    }

# ------------------ HR ------------------ #
def extract_hr_fields(text: str) -> dict:
    """Sentiment analysis + category extraction for HR feedback."""
    prompt = f"""Analyze employee feedback:
    {text}
    Return JSON with 'sentiment' (Positive/Negative/Neutral) and 'category' (Workload, Manager support, Pay, Other).
    """
    response = call_llama3(prompt)
    return {"raw": response}

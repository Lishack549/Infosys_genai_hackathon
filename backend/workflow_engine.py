def generate_workflow(department: str, extracted: dict) -> dict:
    """Apply Infosys-specific rules and return workflow suggestions."""

    if department == "Finance":
        amounts = extracted.get("amounts", [])
        amount_num = 0
        if amounts:
            # Prefer values with currency or thousand separators; parse all and take the largest
            def parse_amount(value: str) -> int:
                try:
                    cleaned = (
                        value.replace("₹", "").replace("$", "").replace(",", "").strip()
                    )
                    # handle decimals by taking integer part for thresholding
                    return int(cleaned.split(".")[0])
                except Exception:
                    return 0

            # Sort candidates to prefer those that look like currency amounts
            prioritized = sorted(
                amounts,
                key=lambda v: (1 if ("₹" in v or "$" in v or "," in v) else 0, parse_amount(v)),
                reverse=True,
            )
            amount_num = max(parse_amount(v) for v in prioritized)

        if amount_num > 50000:
            return {
                "outcome": "Approval Required",
                "checklist": [
                    "Escalate to Finance Manager",
                    "Log in SAP",
                    "Schedule Payment"
                ]
            }
        else:
            return {"outcome": "Process Normally", "checklist": ["Schedule Payment"]}

    elif department == "Customer Support":
        raw_text = extracted.get("raw", "")
        return {
            "outcome": "Escalation Needed" if "High" in raw_text else "Normal Ticket",
            "checklist": [
                "Create ServiceNow Ticket",
                "Notify Project Manager",
                "Draft Apology Email"
            ]
        }

    elif department == "Legal":
        missing = extracted.get("missing_clauses", [])
        if missing:
            return {
                "outcome": "Legal Review Required",
                "checklist": [f"Add {c} Clause" for c in missing] + ["Route to Legal"]
            }
        else:
            return {"outcome": "Contract OK", "checklist": ["Archive in Legal System"]}

    elif department == "HR":
        # Get the raw text content for analysis
        raw_text = extracted.get("raw", "")
        if not raw_text:
            raw_text = extracted.get("summary", "")
        
        # Convert to lowercase for analysis
        text_lower = raw_text.lower()
        
        # Check for resignation/exit feedback
        if any(word in text_lower for word in ["resign", "quit", "leaving", "exit", "termination", "fired", "dismissed", "separation"]):
            return {
                "outcome": "Employee Exit Process",
                "checklist": [
                    "Schedule exit interview within 48 hours",
                    "Collect company assets and access cards",
                    "Process final settlement and benefits",
                    "Update HRIS and remove system access",
                    "Conduct knowledge transfer session"
                ]
            }
        
        # Check for harassment/complaint issues
        elif any(word in text_lower for word in ["harassment", "discrimination", "bullying", "inappropriate", "uncomfortable", "threat", "abuse", "hostile", "toxic"]):
            return {
                "outcome": "Serious Complaint - Immediate Investigation",
                "checklist": [
                    "Escalate to HRBP and Legal team immediately",
                    "Document all details and evidence",
                    "Schedule investigation meeting within 24 hours",
                    "Notify senior management",
                    "Consider temporary suspension if needed",
                    "Follow company harassment policy strictly"
                ]
            }
        
        # Check for positive feedback
        elif any(word in text_lower for word in ["positive", "good", "excellent", "satisfied", "appreciate", "benefits", "improved", "higher", "increased", "enhanced", "valued", "respected", "motivated", "engagement", "collaboration", "teamwork", "productivity", "retention", "innovation", "unity", "happy", "great", "wonderful", "amazing", "fantastic"]):
            return {
                "outcome": "Positive Feedback - Recognition",
                "checklist": [
                    "Archive positive feedback in HR system",
                    "Share with relevant manager for recognition",
                    "Consider for employee recognition program",
                    "Document as positive culture indicator",
                    "Follow up with employee to express appreciation"
                ]
            }
        
        # Check for urgent/negative issues
        elif any(word in text_lower for word in ["urgent", "critical", "immediate", "high", "burnout", "frustration", "stress", "disengagement", "attrition", "overworked", "underappreciated", "fatigue", "exploited", "emergency", "crisis", "severe", "serious"]):
            return {
                "outcome": "Immediate Action Required",
                "checklist": [
                    "Escalate to HRBP within 24 hours",
                    "Schedule urgent 1:1 meeting",
                    "Document incident in HR system",
                    "Notify relevant manager immediately",
                    "Assess if immediate intervention needed",
                    "Consider temporary workload adjustment"
                ]
            }
        
        # Check for salary/compensation issues
        elif any(word in text_lower for word in ["salary", "pay", "compensation", "bonus", "increment", "raise", "wage", "money", "financial", "benefits", "insurance", "pension"]):
            return {
                "outcome": "Compensation Review Required",
                "checklist": [
                    "Review current compensation structure",
                    "Compare with market benchmarks",
                    "Schedule meeting with employee",
                    "Consult with compensation team",
                    "Prepare compensation proposal",
                    "Follow up within 2 weeks"
                ]
            }
        
        # Check for work-life balance issues
        elif any(word in text_lower for word in ["work-life", "balance", "overtime", "flexible", "remote", "home", "family", "personal", "time", "schedule", "hours"]):
            return {
                "outcome": "Work-Life Balance Review",
                "checklist": [
                    "Review current work schedule and policies",
                    "Discuss flexible work options",
                    "Assess workload distribution",
                    "Consider remote work possibilities",
                    "Schedule follow-up in 1 week",
                    "Monitor improvement over next month"
                ]
            }
        
        # Check for training/development needs
        elif any(word in text_lower for word in ["training", "development", "learning", "skill", "course", "certification", "growth", "career", "advancement", "promotion", "mentoring"]):
            return {
                "outcome": "Training & Development Plan",
                "checklist": [
                    "Assess current skill gaps",
                    "Identify relevant training programs",
                    "Create development plan",
                    "Assign mentor if needed",
                    "Schedule regular progress reviews",
                    "Track development milestones"
                ]
            }
        
        # Check for moderate concerns
        elif any(word in text_lower for word in ["negative", "concern", "issue", "problem", "imbalance", "frustration", "uneven", "workload", "morale", "low", "communication", "trust", "absenteeism", "dissatisfied", "unhappy", "disappointed"]):
            return {
                "outcome": "Follow-up Needed",
                "checklist": [
                    "Schedule 1:1 meeting this week",
                    "Document concerns in HR system",
                    "Identify root cause of issues",
                    "Create action plan with employee",
                    "Follow up in 2 weeks",
                    "Monitor progress monthly"
                ]
            }
        
        # Check for general feedback
        elif any(word in text_lower for word in ["feedback", "suggestion", "idea", "improvement", "process", "system", "policy", "procedure", "workflow"]):
            return {
                "outcome": "General Feedback - Process Review",
                "checklist": [
                    "Review feedback for process improvements",
                    "Share with relevant department heads",
                    "Evaluate feasibility of suggestions",
                    "Schedule feedback discussion",
                    "Implement approved changes",
                    "Follow up on implementation"
                ]
            }
        
        # Default case - neutral feedback
        else:
            return {
                "outcome": "Neutral Feedback - Monitor",
                "checklist": [
                    "Archive in HR system for reference",
                    "Monitor for patterns or trends",
                    "Include in quarterly HR review",
                    "No immediate action required"
                ]
            }

    return {"outcome": "General Processing", "checklist": []}

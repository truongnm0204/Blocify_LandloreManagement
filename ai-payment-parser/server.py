# ─────────────────────────────────────────────────────────────────────────────
# Blocify Payment Parser API Server
# Parses raw bank transfer descriptions into structured payment data
# Uses Ollama (qwen2.5:3b) + regex hybrid approach
# ─────────────────────────────────────────────────────────────────────────────

import json
import re
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

app = FastAPI(title="Blocify Payment Parser", version="1.0.0")

# Allow frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "blocify-payment"


# ─── Request / Response models ───────────────────────────────────────────────

class PaymentInput(BaseModel):
    raw_text: str

class ParsedPayment(BaseModel):
    tenant_name: Optional[str] = None
    room_code: Optional[str] = None
    month: Optional[int] = None
    year: Optional[int] = None
    invoice_code: Optional[str] = None
    confidence: float = 0.0
    method: str = "unknown"
    raw_text: str = ""

class BatchInput(BaseModel):
    items: list[PaymentInput]


# ─── Regex parser (fast path) ────────────────────────────────────────────────

def regex_parse(text: str) -> dict:
    """Extract fields using regex patterns for common formats."""
    result = {}
    text_upper = text.upper().strip()

    # Room: "Phong H104", "P A102", "P.F103", "PHONG 201", "P201", "B301"
    m = re.search(r'(?:PHONG\.?\s*|P\.?\s?)([A-Z]?\d{3,4})', text_upper)
    if m:
        result["room_code"] = m.group(1)
    else:
        # Standalone room code like "B301" after common keywords
        m = re.search(r'(?:CK|TIEN\s*TRO|TIEN\s*NHA|TIEN\s*PHONG)\s+([A-Z]\d{3})', text_upper)
        if m:
            result["room_code"] = m.group(1)

    # Month: T3, T03, THANG 3, THANG3, KY 3
    m = re.search(r'(?:THANG\s*|KY\s*|T)(\d{1,2})(?=[/\s]|$)', text_upper)
    if m:
        month = int(m.group(1))
        if 1 <= month <= 12:
            result["month"] = month

    # Year: /2026, NAM 2026
    m = re.search(r'(?:[/\s]|NAM\s*)(202[4-9])', text_upper)
    if m:
        result["year"] = int(m.group(1))

    # Invoice code: HD-2603-001 or HD2603001
    m = re.search(r'(HD-?\d{4}-?\d{3})', text_upper)
    if m:
        result["invoice_code"] = m.group(1)

    return result


# ─── Post-process LLM output ─────────────────────────────────────────────────

def clean_room_code(code: Optional[str]) -> Optional[str]:
    """Normalize room code - strip P/PHONG prefix but keep building letter prefix (H104, A102)."""
    if not code:
        return None
    # Remove only P/PHONG prefix, keep building letter (H, A, B, etc.)
    cleaned = re.sub(r'^(?:PHONG\.?\s*|P\.?\s*)', '', code.upper()).strip()
    return cleaned if cleaned else code


def parse_llm_response(content: str) -> dict:
    """Extract JSON from LLM response, handling edge cases."""
    content = content.strip()
    # Find JSON object in response
    start = content.find("{")
    end = content.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(content[start:end])
        except json.JSONDecodeError:
            pass
    return {}


# ─── LLM parser ──────────────────────────────────────────────────────────────

def llm_parse(text: str) -> dict:
    """Parse payment text using Ollama blocify-payment model."""
    try:
        response = ollama.chat(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": text}],
            options={"temperature": 0.1, "num_predict": 256}
        )
        return parse_llm_response(response["message"]["content"])
    except Exception as e:
        print(f"[LLM Error] {e}")
        return {}


# ─── Hybrid parser ────────────────────────────────────────────────────────────

def parse_payment(raw_text: str) -> ParsedPayment:
    """Hybrid approach: always use LLM, regex as validation/supplement."""
    regex_result = regex_parse(raw_text)

    # Always call LLM to get tenant_name and full context
    llm_result = llm_parse(raw_text)

    # Merge: regex overrides LLM for fields it found (more reliable)
    merged = {**llm_result, **regex_result}

    # Post-process: clean room_code prefix
    merged["room_code"] = clean_room_code(merged.get("room_code"))

    # Determine method used
    method = "hybrid" if regex_result and llm_result else (
        "regex" if regex_result else "llm"
    )

    return ParsedPayment(
        tenant_name=merged.get("tenant_name"),
        room_code=merged.get("room_code"),
        month=merged.get("month"),
        year=merged.get("year"),
        invoice_code=merged.get("invoice_code"),
        confidence=merged.get("confidence", 0.7),
        method=method,
        raw_text=raw_text,
    )


# ─── API endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/parse", response_model=ParsedPayment)
async def api_parse(input: PaymentInput):
    """Parse a single payment description."""
    return parse_payment(input.raw_text)


@app.post("/parse/batch", response_model=list[ParsedPayment])
async def api_parse_batch(input: BatchInput):
    """Parse multiple payment descriptions."""
    return [parse_payment(item.raw_text) for item in input.items]


# ─── Run server ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    print(f"Starting Blocify Payment Parser API (model: {MODEL_NAME})")
    print(f"Docs: http://localhost:8100/docs")
    uvicorn.run(app, host="0.0.0.0", port=8100)

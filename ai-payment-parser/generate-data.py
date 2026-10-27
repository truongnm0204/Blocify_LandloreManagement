# ─────────────────────────────────────────────────────────────────────────────
# Generate synthetic bank transfer data for training/testing
# Creates realistic Vietnamese bank transfer descriptions
# ─────────────────────────────────────────────────────────────────────────────

import json
import random

# ─── Vietnamese names (no diacritics, as in bank transfers) ───────────────────

FIRST_NAMES = ["VAN", "THI", "HOANG", "MINH", "THANH", "NGOC", "QUANG", "DUC", "PHUONG", "ANH"]
LAST_NAMES = ["NGUYEN", "LE", "TRAN", "PHAM", "HOANG", "VU", "VO", "DANG", "BUI", "DO", "NGO", "DINH", "LUONG"]
MIDDLE_NAMES = ["VAN", "THI", "HOANG", "MINH", "THANH", "NGOC", "QUOC", "DUC", "HUU", "DINH", "XUAN", ""]

ROOMS = ["101", "102", "103", "201", "202", "203", "301", "302", "303", "305", "401", "402", "501"]
MONTHS = list(range(1, 13))
YEARS = [2025, 2026]

# ─── Transfer description templates ──────────────────────────────────────────
# {name} = full name, {room} = room number, {month}/{year} = period
# {yy} = 2-digit year, {mm} = 2-digit month, {seq} = invoice sequence

TEMPLATES_WITH_ALL = [
    "{name} CK TIEN PHONG {room} T{month}/{year}",
    "{name} CHUYEN KHOAN TIEN PHONG {room} THANG {month}/{year}",
    "{name} TT PHONG {room} KY {month}/{year}",
    "{name} THANH TOAN TIEN NHA P{room} T{month}/{year}",
    "CK TIEN PHONG {room} THANG {month} NAM {year} {name}",
    "TIEN PHONG {room} THANG {month}/{year} {name}",
    "{name} CK P{room} THANG{month}/{year}",
    "{name} TIEN TRO PHONG {room} T{month} {year}",
]

TEMPLATES_WITH_INVOICE = [
    "{name} THANH TOAN HD-{yy}{mm}-{seq}",
    "{name} CK HD-{yy}{mm}-{seq} PHONG {room}",
    "THANH TOAN HOA DON HD-{yy}{mm}-{seq} {name}",
    "{name} TT HD-{yy}{mm}-{seq} P{room}",
    "CK {name} HD-{yy}{mm}-{seq}",
]

TEMPLATES_PARTIAL = [
    "{name} CK TIEN PHONG {room}",
    "{name} CHUYEN KHOAN TIEN NHA P{room}",
    "CK TIEN PHONG {room} {name}",
    "{name} TT PHONG {room} T{month}",
    "TIEN PHONG THANG {month} {name}",
    "{name} CK P{room}",
    "{name} TIEN TRO T{month}",
]

TEMPLATES_MINIMAL = [
    "{name} CK TIEN PHONG",
    "CK TIEN NHA {name}",
    "{name} CHUYEN KHOAN",
    "TIEN PHONG {name}",
    "CK TIEN TRO {name}",
]

TEMPLATES_NOISY = [
    "{name} CK TIEN PHONG {room} T{month}/{year} BLOCIFY",
    "{name} {phone} CK P{room} T{month}",
    "FT{seq_long} {name} CK TIEN PHONG {room}",
    "{name} MBVCB CK P{room} THANG {month}",
    "IBFT {name} TIEN PHONG {room} T{month}/{year}",
]


def generate_name() -> str:
    """Generate a random Vietnamese name without diacritics."""
    last = random.choice(LAST_NAMES)
    middle = random.choice(MIDDLE_NAMES)
    first = random.choice(FIRST_NAMES)
    if middle:
        return f"{last} {middle} {first}"
    return f"{last} {first}"


def generate_sample() -> dict:
    """Generate one training sample with input text and expected output."""
    name = generate_name()
    room = random.choice(ROOMS)
    month = random.choice(MONTHS)
    year = random.choice(YEARS)
    yy = str(year)[-2:]
    mm = f"{month:02d}"
    seq = f"{random.randint(1, 99):03d}"
    seq_long = f"{random.randint(10000000, 99999999)}"
    phone = f"0{random.randint(900000000, 999999999)}"

    # Choose template category with weights
    category = random.choices(
        ["all", "invoice", "partial", "minimal", "noisy"],
        weights=[35, 20, 25, 10, 10],
        k=1
    )[0]

    if category == "all":
        tmpl = random.choice(TEMPLATES_WITH_ALL)
        text = tmpl.format(name=name, room=room, month=month, year=year)
        output = {
            "tenant_name": name, "room_code": room,
            "month": month, "year": year, "invoice_code": None
        }

    elif category == "invoice":
        tmpl = random.choice(TEMPLATES_WITH_INVOICE)
        invoice_code = f"HD-{yy}{mm}-{seq}"
        text = tmpl.format(name=name, room=room, month=month, year=year,
                           yy=yy, mm=mm, seq=seq)
        has_room = "{room}" in tmpl or "P{room}" in tmpl
        output = {
            "tenant_name": name,
            "room_code": room if has_room else None,
            "month": None, "year": None,
            "invoice_code": invoice_code
        }

    elif category == "partial":
        tmpl = random.choice(TEMPLATES_PARTIAL)
        text = tmpl.format(name=name, room=room, month=month)
        has_room = "{room}" in tmpl or "P{room}" in tmpl
        has_month = "{month}" in tmpl
        output = {
            "tenant_name": name,
            "room_code": room if has_room else None,
            "month": month if has_month else None,
            "year": None, "invoice_code": None
        }

    elif category == "minimal":
        tmpl = random.choice(TEMPLATES_MINIMAL)
        text = tmpl.format(name=name)
        output = {
            "tenant_name": name, "room_code": None,
            "month": None, "year": None, "invoice_code": None
        }

    else:  # noisy
        tmpl = random.choice(TEMPLATES_NOISY)
        text = tmpl.format(name=name, room=room, month=month, year=year,
                           seq_long=seq_long, phone=phone)
        has_room = "{room}" in tmpl or "P{room}" in tmpl
        has_month = "{month}" in tmpl
        has_year = "{year}" in tmpl
        output = {
            "tenant_name": name,
            "room_code": room if has_room else None,
            "month": month if has_month else None,
            "year": year if has_year else None,
            "invoice_code": None
        }

    return {"input": text, "output": output}


def main():
    random.seed(42)

    # Generate 500 training + 100 test samples
    all_samples = [generate_sample() for _ in range(600)]
    random.shuffle(all_samples)

    train_data = all_samples[:500]
    test_data = all_samples[500:]

    # Save training data
    with open("training_data.jsonl", "w", encoding="utf-8") as f:
        for item in train_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    # Save test data
    with open("test_data.jsonl", "w", encoding="utf-8") as f:
        for item in test_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    # Print stats
    print(f"Generated {len(train_data)} training samples -> training_data.jsonl")
    print(f"Generated {len(test_data)} test samples -> test_data.jsonl")
    print(f"\nSample entries:")
    for i in range(5):
        s = train_data[i]
        print(f"  Input:  {s['input']}")
        print(f"  Output: {json.dumps(s['output'], ensure_ascii=False)}")
        print()


if __name__ == "__main__":
    main()

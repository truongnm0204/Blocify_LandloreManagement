# ─────────────────────────────────────────────────────────────────────────────
# Evaluate blocify-payment model accuracy against test dataset
# Tests both individual field accuracy and overall exact match
# ─────────────────────────────────────────────────────────────────────────────

import json
import re
import time
import ollama

MODEL_NAME = "blocify-payment"
TEST_FILE = "test_data.jsonl"


def clean_room_code(code):
    """Strip P/PHONG prefix from room code."""
    if not code:
        return None
    cleaned = re.sub(r'^(?:PHONG\.?\s*|P\.?)', '', str(code).upper()).strip()
    return cleaned if cleaned else None


def parse_llm_response(content: str) -> dict:
    """Extract JSON from LLM response."""
    content = content.strip()
    start = content.find("{")
    end = content.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(content[start:end])
        except json.JSONDecodeError:
            return {}
    return {}


def normalize(value):
    """Normalize value for comparison."""
    if value is None:
        return None
    if isinstance(value, str):
        return value.strip().upper()
    return value


def evaluate():
    # Load test data
    test_samples = []
    with open(TEST_FILE, "r", encoding="utf-8") as f:
        for line in f:
            test_samples.append(json.loads(line))

    total = len(test_samples)
    exact_match = 0
    field_correct = {
        "tenant_name": 0, "room_code": 0,
        "month": 0, "year": 0, "invoice_code": 0
    }
    field_total = {k: 0 for k in field_correct}
    parse_errors = 0
    errors_detail = []

    print(f"Evaluating {total} samples with model '{MODEL_NAME}'...\n")
    start_time = time.time()

    for i, sample in enumerate(test_samples):
        input_text = sample["input"]
        expected = sample["output"]

        # Call LLM
        try:
            response = ollama.chat(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": input_text}],
                options={"temperature": 0.1, "num_predict": 256}
            )
            pred = parse_llm_response(response["message"]["content"])
        except Exception as e:
            parse_errors += 1
            print(f"  [{i+1}] ERROR: {e}")
            continue

        if not pred:
            parse_errors += 1
            continue

        # Clean room_code
        pred["room_code"] = clean_room_code(pred.get("room_code"))

        # Compare fields
        all_correct = True
        for field in field_correct:
            field_total[field] += 1
            expected_val = normalize(expected.get(field))
            pred_val = normalize(pred.get(field))

            if expected_val == pred_val:
                field_correct[field] += 1
            else:
                all_correct = False
                if len(errors_detail) < 20:  # Keep first 20 errors
                    errors_detail.append({
                        "input": input_text,
                        "field": field,
                        "expected": expected_val,
                        "predicted": pred_val
                    })

        if all_correct:
            exact_match += 1

        # Progress
        if (i + 1) % 10 == 0:
            print(f"  Processed {i+1}/{total}...")

    elapsed = time.time() - start_time

    # ─── Results ──────────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  EVALUATION RESULTS - {MODEL_NAME}")
    print(f"{'='*60}")
    print(f"  Samples:      {total}")
    print(f"  Parse errors:  {parse_errors}")
    print(f"  Time:          {elapsed:.1f}s ({elapsed/total:.2f}s/sample)")
    print(f"  Exact match:   {exact_match}/{total} ({exact_match/total*100:.1f}%)")
    print(f"\n  Per-field accuracy:")
    print(f"  {'Field':<16} {'Correct':>8} {'Total':>8} {'Accuracy':>10}")
    print(f"  {'-'*44}")
    for field in field_correct:
        correct = field_correct[field]
        t = field_total[field]
        pct = correct / t * 100 if t > 0 else 0
        status = "OK" if pct >= 85 else "LOW"
        print(f"  {field:<16} {correct:>8} {t:>8} {pct:>9.1f}% {status}")

    overall = sum(field_correct.values()) / max(sum(field_total.values()), 1) * 100
    print(f"\n  Overall field accuracy: {overall:.1f}%")
    print(f"{'='*60}")

    # Show errors
    if errors_detail:
        print(f"\n  Sample errors (first {len(errors_detail)}):")
        for err in errors_detail[:10]:
            print(f"    Input:    {err['input']}")
            print(f"    Field:    {err['field']}")
            print(f"    Expected: {err['expected']}")
            print(f"    Got:      {err['predicted']}")
            print()

    # Save results
    results = {
        "model": MODEL_NAME,
        "total_samples": total,
        "parse_errors": parse_errors,
        "exact_match": exact_match,
        "exact_match_pct": round(exact_match / total * 100, 1),
        "field_accuracy": {
            k: round(field_correct[k] / max(field_total[k], 1) * 100, 1)
            for k in field_correct
        },
        "overall_field_accuracy": round(overall, 1),
        "time_seconds": round(elapsed, 1),
    }
    with open("eval_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nResults saved to eval_results.json")


if __name__ == "__main__":
    evaluate()

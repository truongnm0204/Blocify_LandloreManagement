const AI_API_URL = 'http://localhost:8100'

export interface ParsedPayment {
  tenant_name: string | null
  room_code: string | null
  month: number | null
  year: number | null
  invoice_code: string | null
  confidence: number
  method: string
  raw_text: string
}

export async function parsePaymentText(raw_text: string): Promise<ParsedPayment> {
  const res = await fetch(`${AI_API_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text }),
  })
  if (!res.ok) {
    throw new Error(`AI parse failed: ${res.status}`)
  }
  return res.json()
}

export async function parsePaymentBatch(items: { raw_text: string }[]): Promise<ParsedPayment[]> {
  const res = await fetch(`${AI_API_URL}/parse/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  if (!res.ok) {
    throw new Error(`AI batch parse failed: ${res.status}`)
  }
  return res.json()
}

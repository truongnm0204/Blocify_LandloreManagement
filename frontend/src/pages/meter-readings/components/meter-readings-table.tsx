import { useState } from 'react'
import { Eye, Lock, Check, Pencil } from 'lucide-react'
import { MeterReadingStatusBadge } from './meter-reading-status-badge'
import { EditableReadingCell } from './meter-reading-editable-cell'
import type { MeterReading } from '@/types'

interface MeterReadingsTableProps {
  readings: MeterReading[]
  onSave?: (id: string, data: { electricityCurrent: number; waterCurrent: number }) => void
  onLock?: (id: string) => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  /** When true, removes outer border/shadow (used inside MotelSection wrapper) */
  embedded?: boolean
}

type RowStatus = 'da-chot' | 'chua-nhap' | 'sai-so-cao' | 'luu' | 'cho-duyet'

interface RowInputState {
  electricityCurrent: string
  waterCurrent: string
}

function getRowStatuses(reading: MeterReading): RowStatus[] {
  if (reading.isLocked) return ['da-chot']
  if (reading.electricityUsage === 0 && reading.waterUsage === 0) return ['chua-nhap']
  if (reading.electricityUsage > 200) return ['sai-so-cao']
  return ['luu']
}

export function MeterReadingsTable({ readings, onSave, onLock, onView, onEdit, embedded }: MeterReadingsTableProps) {
  const [inputs, setInputs] = useState<Record<string, RowInputState>>({})

  function getInput(reading: MeterReading): RowInputState {
    return inputs[reading.id] ?? {
      electricityCurrent: String(reading.electricityCurrent ?? ''),
      waterCurrent: String(reading.waterCurrent ?? ''),
    }
  }

  function setField(id: string, reading: MeterReading, field: keyof RowInputState, value: string) {
    setInputs((prev) => ({ ...prev, [id]: { ...getInput(reading), [field]: value } }))
  }

  function handleSave(reading: MeterReading) {
    const state = getInput(reading)
    const elec = Number(state.electricityCurrent)
    const water = Number(state.waterCurrent)
    if (!isNaN(elec) && !isNaN(water)) {
      onSave?.(reading.id, { electricityCurrent: elec, waterCurrent: water })
    }
  }

  function elecError(reading: MeterReading): boolean {
    const s = inputs[reading.id]
    if (!s) return false
    const v = Number(s.electricityCurrent)
    return !isNaN(v) && v < reading.electricityPrevious
  }

  function waterError(reading: MeterReading): boolean {
    const s = inputs[reading.id]
    if (!s) return false
    const v = Number(s.waterCurrent)
    return !isNaN(v) && v < reading.waterPrevious
  }

  if (readings.length === 0) {
    return (
      <div className={embedded ? 'px-5 py-6 text-center' : 'rounded-xl bg-white p-8 text-center shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]'}>
        <p className="text-sm text-[#7b7a7d]">Chua co du lieu chi so dien nuoc.</p>
      </div>
    )
  }

  return (
    <div className={embedded ? 'overflow-x-auto' : 'overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]'}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
            <th className="px-5 py-3">Phong</th>
            <th className="px-5 py-3">Nguoi thue</th>
            <th className="px-5 py-3">Dien (Cu / Moi)</th>
            <th className="px-5 py-3">Nuoc (Cu / Moi)</th>
            <th className="px-5 py-3">Trang thai</th>
            <th className="px-5 py-3 text-right">Hanh dong</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => {
            const locked = reading.isLocked
            const input = getInput(reading)
            const hasElecErr = elecError(reading)
            const hasWaterErr = waterError(reading)
            const elecDiff = input.electricityCurrent !== ''
              ? Number(input.electricityCurrent) - reading.electricityPrevious
              : reading.electricityUsage
            const waterDiff = input.waterCurrent !== ''
              ? Number(input.waterCurrent) - reading.waterPrevious
              : reading.waterUsage

            return (
              <tr
                key={reading.id}
                className={`border-b border-gray-50 last:border-0 ${
                  locked ? 'bg-gray-50 opacity-70' : 'transition-colors hover:bg-gray-50'
                }`}
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#323235]">{reading.room?.roomCode ?? '—'}</p>
                  <p className="text-xs text-[#7b7a7d]">{reading.room?.roomName ?? ''}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-[#323235]">
                    {reading.room?.contracts?.[0]?.representativeTenant?.fullName
                      ?? reading.contract?.tenants?.find((t) => t.isRepresentative)?.tenant?.fullName
                      ?? reading.contract?.contractCode
                      ?? '—'}
                  </p>
                  {reading.room?.contracts?.[0]?.contractCode && (
                    <p className="text-xs text-[#7b7a7d]">{reading.room.contracts[0].contractCode}</p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <EditableReadingCell
                    previous={reading.electricityPrevious}
                    current={input.electricityCurrent}
                    locked={locked}
                    hasError={hasElecErr}
                    diff={elecDiff}
                    onChange={(v) => setField(reading.id, reading, 'electricityCurrent', v)}
                  />
                </td>

                <td className="px-5 py-4">
                  <EditableReadingCell
                    previous={reading.waterPrevious}
                    current={input.waterCurrent}
                    locked={locked}
                    hasError={hasWaterErr}
                    diff={waterDiff}
                    onChange={(v) => setField(reading.id, reading, 'waterCurrent', v)}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getRowStatuses(reading).map((s) => (
                      <MeterReadingStatusBadge key={s} status={s} />
                    ))}
                    {locked && <Lock className="h-3.5 w-3.5 text-[#7b7a7d]" />}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView?.(reading.id)}
                      className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#323235]"
                      title="Xem chi tiet"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!locked && (
                      <>
                        <button
                          onClick={() => onEdit?.(reading.id)}
                          className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-blue-50 hover:text-[#1d5fa8]"
                          title="Chinh sua"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSave(reading)}
                          disabled={hasElecErr || hasWaterErr}
                          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
                        >
                          Luu
                        </button>
                        <button
                          onClick={() => onLock?.(reading.id)}
                          className="rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-green-50 hover:text-green-600"
                          title="Chot chi so"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

type MeterReadingStatus = 'da-chot' | 'chua-nhap' | 'sai-so-cao' | 'luu' | 'cho-duyet'

interface MeterReadingStatusBadgeProps {
  status: MeterReadingStatus
}

const statusConfig: Record<MeterReadingStatus, { label: string; className: string }> = {
  'da-chot': {
    label: 'Da chot',
    className: 'bg-green-100 text-green-700',
  },
  'chua-nhap': {
    label: 'Chua nhap',
    className: 'bg-gray-100 text-[#7b7a7d]',
  },
  'sai-so-cao': {
    label: 'Sai so cao',
    className: 'bg-red-100 text-red-600',
  },
  'luu': {
    label: 'Luu',
    className: 'bg-blue-100 text-[#1d5fa8]',
  },
  'cho-duyet': {
    label: 'Cho duyet',
    className: 'bg-yellow-100 text-yellow-700',
  },
}

export function MeterReadingStatusBadge({ status }: MeterReadingStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

import { useState, useMemo } from 'react'
import type { RoomWithMotel } from './room-table'
import { RoomCard } from './room-card'

interface RoomGridViewProps {
  rooms: RoomWithMotel[]
  onRoomClick: (id: string) => void
}

const ALL_FLOORS_TAB = '__all__'
const OTHER_FLOOR_TAB = '__other__'

export function RoomGridView({ rooms, onRoomClick }: RoomGridViewProps) {
  const [activeFloor, setActiveFloor] = useState<string>(ALL_FLOORS_TAB)

  // Extract unique floors, sorted ascending
  const floorTabs = useMemo(() => {
    const floors = new Set<number>()
    let hasOther = false

    for (const room of rooms) {
      if (room.floor != null) {
        floors.add(room.floor)
      } else {
        hasOther = true
      }
    }

    const sorted = Array.from(floors).sort((a, b) => a - b)
    const tabs: { key: string; label: string }[] = [
      { key: ALL_FLOORS_TAB, label: 'Tat ca' },
      ...sorted.map((f) => ({ key: String(f), label: `Tang ${f}` })),
    ]

    if (hasOther) {
      tabs.push({ key: OTHER_FLOOR_TAB, label: 'Khac' })
    }

    return tabs
  }, [rooms])

  // Filter rooms by selected floor
  const filteredRooms = useMemo(() => {
    if (activeFloor === ALL_FLOORS_TAB) return rooms

    if (activeFloor === OTHER_FLOOR_TAB) {
      return rooms.filter((r) => r.floor == null)
    }

    const floorNum = Number(activeFloor)
    return rooms.filter((r) => r.floor === floorNum)
  }, [rooms, activeFloor])

  // Only show tabs if there are multiple floors
  const showTabs = floorTabs.length > 2

  return (
    <div className="p-4">
      {/* Floor tabs */}
      {showTabs && (
        <div className="mb-4 flex flex-wrap gap-1">
          {floorTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFloor(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFloor === tab.key
                  ? 'bg-[#1d5fa8] text-white'
                  : 'bg-gray-100 text-[#7b7a7d] hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Room cards grid */}
      {filteredRooms.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#7b7a7d]">Khong co phong nao o tang nay.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onClick={onRoomClick} />
          ))}
        </div>
      )}
    </div>
  )
}

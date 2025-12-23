import { useState } from 'react'
import { Button } from '@sunday-school/ui'
import { Clock } from 'lucide-react'

interface DurationSelectorProps {
  onDurationSelect: (duration: number) => void
  maxDuration: number
  disabled?: boolean
}

export function DurationSelector({ onDurationSelect, maxDuration, disabled }: DurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState(30)
  const durations = [30, 60, 90, 120].filter(d => d <= maxDuration)
  
  const handleSelect = (duration: number) => {
    setSelectedDuration(duration)
    onDurationSelect(duration)
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Select song duration:</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {durations.map(duration => (
          <Button
            key={duration}
            type="button"
            variant={selectedDuration === duration ? 'default' : 'outline'}
            onClick={() => handleSelect(duration)}
            disabled={disabled}
            className="h-12 text-lg font-medium"
          >
            {duration} seconds
          </Button>
        ))}
      </div>
      {maxDuration < 120 && (
        <p className="text-xs text-gray-500 text-center">
          Maximum duration is limited to {maxDuration} seconds
        </p>
      )}
    </div>
  )
}
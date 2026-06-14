'use client'

import { useTransition } from 'react'
import { Plus } from 'lucide-react'
import { addDay } from '@/app/(dashboard)/trips/actions'

export default function AddDayButton({ tripId }: { tripId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => addDay(tripId))}
      disabled={pending}
      className="btn-secondary"
    >
      <Plus className="w-4 h-4" /> {pending ? 'Adding…' : 'Add Day'}
    </button>
  )
}

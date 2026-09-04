import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from './schedules.queries'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { QueryStates } from '@/shared/ui/query-states'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { SCHEDULE_TYPE_LABELS } from '@/shared/types/labels'

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Calendário mensal a partir de `GET /schedules/calendar`.
 *
 * O backend agrupa os eventos por dia **em UTC**; para o Brasil (UTC-3) um culto
 * das 22h pode cair no dia seguinte no calendário. A lista é a visão exata.
 */
export function ScheduleCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const query = useCalendar(year, month)

  function shiftMonth(delta: number) {
    const date = new Date(year, month - 1 + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth() + 1)
  }

  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  return (
    <Card>
      <header className="flex items-center justify-between gap-4 border-b border-border-subtle p-4">
        <h2 className="text-base font-semibold text-content capitalize">
          {MONTH_NAMES[month - 1]} de {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Mês anterior" onClick={() => shiftMonth(-1)}>
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setYear(today.getFullYear())
              setMonth(today.getMonth() + 1)
            }}
          >
            Hoje
          </Button>
          <Button variant="outline" size="icon" aria-label="Próximo mês" onClick={() => shiftMonth(1)}>
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </header>

      <QueryStates
        query={query}
        skeleton={
          <div className="grid grid-cols-7 gap-px p-4">
            {Array.from({ length: 35 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        }
      >
        {(calendar) => (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-px text-center">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="pb-2 text-xs font-semibold text-content-muted uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-border-subtle">
              {Array.from({ length: firstWeekday }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-24 bg-surface-muted/40" />
              ))}

              {calendar.days.map((day) => {
                const isToday = isCurrentMonth && day.day === today.getDate()
                return (
                  <div key={day.day} className="min-h-24 space-y-1 bg-surface p-1.5">
                    <span
                      className={cn(
                        'inline-grid size-6 place-items-center rounded-full text-xs',
                        isToday ? 'bg-primary font-semibold text-primary-foreground' : 'text-content-muted',
                      )}
                    >
                      {day.day}
                    </span>
                    {day.events.map((event) => (
                      <Link
                        key={event.id}
                        to={`/agenda/${event.id}`}
                        title={`${event.time} · ${SCHEDULE_TYPE_LABELS[event.type]}`}
                        className={cn(
                          'block truncate rounded px-1.5 py-1 text-xs',
                          event.status === 'CANCELLED'
                            ? 'bg-danger/10 text-danger line-through'
                            : 'bg-primary/10 text-primary hover:bg-primary/20',
                        )}
                      >
                        {event.time} {event.title}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </QueryStates>
    </Card>
  )
}

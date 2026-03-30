import { format, differenceInDays, addDays, parseISO, isWithinInterval } from 'date-fns'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatDayOfWeek(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE')
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a')
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a')
}

export function getDaysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date())
}

export function getTripDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
}

export function getNights(checkIn: string, checkOut: string): number {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

export function getDayDate(startDate: string, dayIndex: number): string {
  return addDays(parseISO(startDate), dayIndex).toISOString().split('T')[0]
}

export function getDayDates(startDate: string, endDate: string): string[] {
  const days: string[] = []
  const duration = getTripDuration(startDate, endDate)
  for (let i = 0; i < duration; i++) {
    days.push(getDayDate(startDate, i))
  }
  return days
}

export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  return isWithinInterval(parseISO(dateStr), {
    start: parseISO(startDate),
    end: parseISO(endDate),
  })
}

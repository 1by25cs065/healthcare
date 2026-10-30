import type { Appointment, AppointmentStatus } from '../types/appointment'

interface AppointmentListProps {
  appointments: Appointment[]
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onView: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
  onCancel: (id: string) => void
  onDelete: (id: string) => void
}

const statusStyles: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-brand-50 text-brand-700',
  Completed: 'bg-blue-50 text-blue-700',
  Cancelled: 'bg-slate-100 text-slate-500',
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`)
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export default function AppointmentList({
  appointments,
  onStatusChange,
  onView,
  onEdit,
  onCancel,
  onDelete,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <span aria-hidden="true" className="text-xl">＋</span>
        </div>
        <p className="mt-4 font-semibold text-ink">No appointments found</p>
        <p className="mt-1 text-sm text-muted">Try another search or add a new appointment.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-slate-100">
      {appointments.map((appointment) => (
        <li
          key={appointment.id}
          className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(130px,1fr)_minmax(120px,0.8fr)_auto] sm:items-center sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#edf3f7] text-sm font-bold text-[#607b92]">
              {appointment.patientName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{appointment.patientName}</p>
              <p className="truncate text-xs text-muted">{appointment.reason}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{appointment.doctorName}</p>
            <p className="mt-0.5 text-xs text-muted">{appointment.specialization}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span aria-hidden="true" className="text-slate-400">◷</span>
            <span>{formatDate(appointment.appointmentDate)} · {formatTime(appointment.appointmentTime)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[appointment.status]}`}>
              {appointment.status}
            </span>
            <label className="sr-only" htmlFor={`status-${appointment.id}`}>
              Update status for {appointment.patientName}
            </label>
            <select
              id={`status-${appointment.id}`}
              aria-label={`Update status for ${appointment.patientName}`}
              value={appointment.status}
              onChange={(event) => onStatusChange(appointment.id, event.target.value as AppointmentStatus)}
              className="max-w-[35px] cursor-pointer rounded-lg border-0 bg-transparent text-xs text-slate-400 focus:ring-2 focus:ring-brand-500"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              type="button"
              aria-label={`View appointment for ${appointment.patientName}`}
              className="row-action"
              onClick={() => onView(appointment)}
            >
              View
            </button>
            <button
              type="button"
              aria-label={`Edit appointment for ${appointment.patientName}`}
              className="row-action"
              onClick={() => onEdit(appointment)}
            >
              Edit
            </button>
            {appointment.status === 'Scheduled' && (
              <button
                type="button"
                aria-label={`Cancel appointment for ${appointment.patientName}`}
                className="row-action text-amber-700"
                onClick={() => onCancel(appointment.id)}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              aria-label={`Delete appointment for ${appointment.patientName}`}
              className="row-action text-red-600"
              onClick={() => onDelete(appointment.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

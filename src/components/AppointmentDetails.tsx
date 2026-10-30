import type { Appointment } from '../types/appointment'

interface AppointmentDetailsProps {
  appointment: Appointment
  onClose: () => void
  onEdit: () => void
}

export default function AppointmentDetails({
  appointment,
  onClose,
  onEdit,
}: AppointmentDetailsProps) {
  const details = [
    ['Patient', appointment.patientName],
    ['Doctor', appointment.doctorName],
    ['Specialization', appointment.specialization],
    ['Date', appointment.appointmentDate],
    ['Time', appointment.appointmentTime],
    ['Status', appointment.status],
    ['Reason', appointment.reason],
  ]

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
      <section
        aria-labelledby="details-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              Appointment details
            </p>
            <h2 id="details-title" className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {appointment.patientName}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close appointment details"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            ×
          </button>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          {details.map(([label, value]) => (
            <div key={label} className={label === 'Reason' ? 'col-span-2' : ''}>
              <dt className="text-xs font-medium text-muted">{label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="button-secondary">
            Close
          </button>
          <button type="button" onClick={onEdit} className="button-primary">
            Edit appointment
          </button>
        </div>
      </section>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import type { Appointment, NewAppointment } from '../types/appointment'
import { validateAppointmentDetails } from '../utils/appointments'

interface AppointmentFormProps {
  appointment?: Appointment
  onSubmit: (appointment: NewAppointment) => void
  onClose: () => void
}

function today(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function AppointmentForm({
  appointment,
  onSubmit,
  onClose,
}: AppointmentFormProps) {
  const [patientName, setPatientName] = useState(appointment?.patientName ?? '')
  const [doctorName, setDoctorName] = useState(appointment?.doctorName ?? '')
  const [specialization, setSpecialization] = useState(
    appointment?.specialization ?? 'General practice',
  )
  const [appointmentDate, setAppointmentDate] = useState(appointment?.appointmentDate ?? today())
  const [appointmentTime, setAppointmentTime] = useState(appointment?.appointmentTime ?? '09:00')
  const [reason, setReason] = useState(appointment?.reason ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const details: NewAppointment = {
      patientName,
      doctorName,
      specialization,
      appointmentDate,
      appointmentTime,
      reason,
    }

    try {
      validateAppointmentDetails(details, new Date(), appointment?.appointmentDate)
      onSubmit(details)
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        throw submitError
      }
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
      <section
        aria-labelledby="form-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              {appointment ? 'Update booking' : 'New booking'}
            </p>
            <h2 id="form-title" className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {appointment ? 'Edit appointment' : 'Add an appointment'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {appointment
                ? 'Update the details for this visit.'
                : 'Add a few details to get this visit on the calendar.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close form"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-ink"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Patient name</span>
            <input
              autoFocus
              required
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              className="form-input"
              placeholder="e.g. Alex Morgan"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Doctor name</span>
              <input
                required
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
                className="form-input"
                placeholder="Dr. Taylor"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Specialization</span>
              <select
                required
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="form-input"
              >
                <option>General practice</option>
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>Neurology</option>
                <option>Pediatrics</option>
                <option>Orthopedics</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Appointment date</span>
              <input
                required
                min={appointment ? undefined : today()}
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="form-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink">Appointment time</span>
              <input
                required
                type="time"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
                className="form-input"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">Reason for appointment</span>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="form-input resize-y"
              placeholder="What is this visit for?"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="button-secondary">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              {appointment ? 'Save changes' : 'Save appointment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

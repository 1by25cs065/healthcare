import { useEffect, useMemo, useState } from 'react'
import AppointmentDetails from './components/AppointmentDetails'
import AppointmentForm from './components/AppointmentForm'
import AppointmentList from './components/AppointmentList'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import type {
  Appointment,
  AppointmentFilter,
  AppointmentStatus,
  NewAppointment,
} from './types/appointment'
import {
  cancelAppointment,
  createAppointment,
  deleteAppointment,
  editAppointment,
  filterAppointments,
  loadAppointments,
  saveAppointments,
  searchAppointments,
  updateAppointmentStatus,
} from './utils/appointments'

const filters: Array<{ value: AppointmentFilter; label: string }> = [
  { value: 'All', label: 'All visits' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

function dateLabel(): string {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

function appointmentDateTime(appointment: Appointment): Date {
  return new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`)
}

function today(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments)
  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>('All')
  const [activeSection, setActiveSection] = useState<'overview' | 'appointments'>('overview')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    saveAppointments(appointments)
  }, [appointments])

  const visibleAppointments = useMemo(() => {
    const filtered = filterAppointments(appointments, activeFilter)
    return searchAppointments(filtered, search).sort(
      (first, second) =>
        appointmentDateTime(first).getTime() - appointmentDateTime(second).getTime(),
    )
  }, [activeFilter, appointments, search])

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'Scheduled' && appointment.appointmentDate >= today(),
  ).length
  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === 'Completed',
  ).length
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === 'Cancelled',
  ).length

  function openNewAppointment() {
    setEditingAppointment(null)
    setIsFormOpen(true)
  }

  function openEditAppointment(appointment: Appointment) {
    setSelectedAppointment(null)
    setEditingAppointment(appointment)
    setIsFormOpen(true)
  }

  function saveAppointment(details: NewAppointment) {
    if (editingAppointment) {
      setAppointments((current) =>
        editAppointment(current, editingAppointment.id, details),
      )
    } else {
      setAppointments((current) => [...current, createAppointment(details)])
    }
    setIsFormOpen(false)
    setEditingAppointment(null)
  }

  function changeAppointmentStatus(id: string, status: AppointmentStatus) {
    setAppointments((current) => updateAppointmentStatus(current, id, status))
  }

  function cancelScheduledAppointment(id: string) {
    setAppointments((current) => cancelAppointment(current, id))
  }

  function removeAppointment(id: string) {
    setAppointments((current) => deleteAppointment(current, id))
    setSelectedAppointment((current) => (current?.id === id ? null : current))
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen">
        <Sidebar
          appointmentCount={appointments.length}
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />
        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-lg font-bold text-white">+</span>
              <span className="font-bold tracking-tight text-ink">careflow</span>
            </div>
            <nav aria-label="Mobile navigation" className="flex items-center gap-4">
              <a
                href="#overview"
                aria-current={activeSection === 'overview' ? 'page' : undefined}
                onClick={() => setActiveSection('overview')}
                className={`text-xs font-semibold ${activeSection === 'overview' ? 'text-brand-700' : 'text-muted'}`}
              >
                Overview
              </a>
              <a
                href="#appointments"
                aria-current={activeSection === 'appointments' ? 'page' : undefined}
                onClick={() => setActiveSection('appointments')}
                className={`text-xs font-semibold ${activeSection === 'appointments' ? 'text-brand-700' : 'text-muted'}`}
              >
                Appointments ({appointments.length})
              </a>
            </nav>
          </header>
          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
            <header
              id="overview"
              className="scroll-mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            >
              <div>
                <p className="text-sm font-medium text-brand-600">{dateLabel()}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
                  Good morning, Jordan <span aria-hidden="true">☀️</span>
                </h1>
                <p className="mt-2 text-sm text-muted sm:text-base">
                  Here&apos;s what&apos;s happening with your care schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={openNewAppointment}
                className="button-primary self-start sm:self-auto"
              >
                <span aria-hidden="true" className="text-lg leading-none">＋</span>
                New appointment
              </button>
            </header>

            <section aria-label="Appointment overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total appointments" value={appointments.length} detail="All appointments in your schedule" tone="blue" />
              <StatCard label="Upcoming appointments" value={upcomingAppointments} detail="Scheduled for today or later" tone="green" />
              <StatCard label="Completed appointments" value={completedAppointments} detail="Care delivered so far" tone="indigo" />
              <StatCard label="Cancelled appointments" value={cancelledAppointments} detail="Appointments that were cancelled" tone="rose" />
            </section>

            <section id="appointments" className="mt-9">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-ink">Your appointments</h2>
                  <p className="mt-1 text-sm text-muted">Keep track of every visit, all in one place.</p>
                </div>
                <label className="relative block w-full sm:max-w-[270px]">
                  <span className="sr-only">Search appointments</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                  </svg>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                    placeholder="Search appointments"
                  />
                </label>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
                <div className="flex gap-5 overflow-x-auto border-b border-slate-100 px-5 sm:px-6">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setActiveFilter(filter.value)}
                      aria-pressed={activeFilter === filter.value}
                      className={`relative shrink-0 py-4 text-sm font-medium transition ${
                        activeFilter === filter.value
                          ? 'text-brand-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-500'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {filter.label}
                      {filter.value === 'All' && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                          {appointments.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <AppointmentList
                  appointments={visibleAppointments}
                  onStatusChange={changeAppointmentStatus}
                  onView={setSelectedAppointment}
                  onEdit={openEditAppointment}
                  onCancel={cancelScheduledAppointment}
                  onDelete={removeAppointment}
                />
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-muted sm:px-6">
                  Showing {visibleAppointments.length} of {appointments.length} appointments
                </div>
              </div>
            </section>
            <footer className="mt-8 text-center text-xs text-slate-400">
              Careflow keeps your schedule close and your day moving.
            </footer>
          </div>
        </main>
      </div>
      {isFormOpen && (
        <AppointmentForm
          key={editingAppointment?.id ?? 'new'}
          appointment={editingAppointment ?? undefined}
          onSubmit={saveAppointment}
          onClose={() => {
            setIsFormOpen(false)
            setEditingAppointment(null)
          }}
        />
      )}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => openEditAppointment(selectedAppointment)}
        />
      )}
    </div>
  )
}

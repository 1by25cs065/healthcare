import type {
  Appointment,
  AppointmentFilter,
  AppointmentStatus,
  NewAppointment,
} from '../types/appointment'

const STORAGE_KEY = 'careflow-appointments'

function localDateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatLocalDate(date)
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return value === 'Scheduled' || value === 'Completed' || value === 'Cancelled'
}

function isAppointment(value: unknown): value is Appointment {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.patientName === 'string' &&
    typeof value.doctorName === 'string' &&
    typeof value.specialization === 'string' &&
    typeof value.appointmentDate === 'string' &&
    typeof value.appointmentTime === 'string' &&
    typeof value.reason === 'string' &&
    isAppointmentStatus(value.status)
  )
}

function migrateLegacyAppointment(value: unknown): unknown {
  if (!isRecord(value) || typeof value.provider !== 'string') {
    return value
  }

  return {
    id: value.id,
    patientName: value.patientName,
    doctorName: value.provider,
    specialization: value.specialty,
    appointmentDate: value.date,
    appointmentTime: value.time,
    reason: value.notes,
    status: value.status,
  }
}

function normalizeDetails(details: NewAppointment): NewAppointment {
  return {
    patientName: details.patientName.trim(),
    doctorName: details.doctorName.trim(),
    specialization: details.specialization.trim(),
    appointmentDate: details.appointmentDate.trim(),
    appointmentTime: details.appointmentTime.trim(),
    reason: details.reason.trim(),
  }
}

export function validateAppointmentDetails(
  details: NewAppointment,
  now: Date = new Date(),
  unchangedPastDate?: string,
): void {
  const requiredFields: Array<[keyof NewAppointment, string]> = [
    ['patientName', 'Patient name is required'],
    ['doctorName', 'Doctor name is required'],
    ['specialization', 'Specialization is required'],
    ['appointmentDate', 'Appointment date is required'],
    ['appointmentTime', 'Appointment time is required'],
    ['reason', 'Reason is required'],
  ]

  for (const [field, message] of requiredFields) {
    if (typeof details[field] !== 'string' || details[field].trim() === '') {
      throw new Error(message)
    }
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(details.appointmentDate)
  if (!dateMatch) {
    throw new Error('Appointment date must be a valid date')
  }
  const [, year, month, day] = dateMatch
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    throw new Error('Appointment date must be a valid date')
  }
  if (
    details.appointmentDate !== unchangedPastDate &&
    details.appointmentDate < formatLocalDate(now)
  ) {
    throw new Error('Appointment date cannot be in the past')
  }

  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(details.appointmentTime)
  if (!timeMatch) {
    throw new Error('Appointment time must be valid')
  }
}

export function getInitialAppointments(): Appointment[] {
  return [
    {
      id: 'apt-1',
      patientName: 'Olivia Rhye',
      doctorName: 'Dr. Leslie Alexander',
      specialization: 'Cardiology',
      appointmentDate: localDateOffset(0),
      appointmentTime: '09:30',
      status: 'Scheduled',
      reason: 'Follow-up consultation',
    },
    {
      id: 'apt-2',
      patientName: 'Phoenix Baker',
      doctorName: 'Dr. Darlene Robertson',
      specialization: 'Dermatology',
      appointmentDate: localDateOffset(0),
      appointmentTime: '11:00',
      status: 'Scheduled',
      reason: 'Skin health check',
    },
    {
      id: 'apt-3',
      patientName: 'Lana Steiner',
      doctorName: 'Dr. Courtney Henry',
      specialization: 'Neurology',
      appointmentDate: localDateOffset(1),
      appointmentTime: '14:15',
      status: 'Scheduled',
      reason: 'Initial consultation',
    },
    {
      id: 'apt-4',
      patientName: 'Demi Wilkinson',
      doctorName: 'Dr. Leslie Alexander',
      specialization: 'Cardiology',
      appointmentDate: localDateOffset(-1),
      appointmentTime: '10:00',
      status: 'Completed',
      reason: 'Routine check-up',
    },
  ]
}

export function createAppointment(
  details: NewAppointment,
  now: Date = new Date(),
): Appointment {
  validateAppointmentDetails(details, now)
  return {
    ...normalizeDetails(details),
    id: globalThis.crypto.randomUUID(),
    status: 'Scheduled',
  }
}

export function editAppointment(
  appointments: Appointment[],
  id: string,
  updates: Partial<NewAppointment>,
  now: Date = new Date(),
): Appointment[] {
  const existing = appointments.find((appointment) => appointment.id === id)
  if (!existing) {
    throw new Error(`Appointment "${id}" was not found`)
  }

  const details = normalizeDetails({ ...existing, ...updates })
  validateAppointmentDetails(details, now, existing.appointmentDate)

  return appointments.map((appointment) =>
    appointment.id === id ? { ...appointment, ...details } : appointment,
  )
}

export function cancelAppointment(
  appointments: Appointment[],
  id: string,
): Appointment[] {
  const existing = appointments.find((appointment) => appointment.id === id)
  if (!existing) {
    throw new Error(`Appointment "${id}" was not found`)
  }
  if (existing.status !== 'Scheduled') {
    throw new Error('Only scheduled appointments can be cancelled')
  }

  return appointments.map((appointment) =>
    appointment.id === id ? { ...appointment, status: 'Cancelled' } : appointment,
  )
}

export function deleteAppointment(
  appointments: Appointment[],
  id: string,
): Appointment[] {
  return appointments.filter((appointment) => appointment.id !== id)
}

export function updateAppointmentStatus(
  appointments: Appointment[],
  id: string,
  status: AppointmentStatus,
): Appointment[] {
  if (!appointments.some((appointment) => appointment.id === id)) {
    throw new Error(`Appointment "${id}" was not found`)
  }

  return appointments.map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment,
  )
}

export function searchAppointments(
  appointments: Appointment[],
  query: string,
): Appointment[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return appointments
  }

  return appointments.filter((appointment) =>
    [
      appointment.patientName,
      appointment.doctorName,
      appointment.specialization,
      appointment.appointmentDate,
      appointment.appointmentTime,
      appointment.reason,
    ].some((value) => value.toLowerCase().includes(normalizedQuery)),
  )
}

export function filterAppointments(
  appointments: Appointment[],
  status: AppointmentFilter,
): Appointment[] {
  return status === 'All'
    ? appointments
    : appointments.filter((appointment) => appointment.status === status)
}

export function loadAppointments(): Appointment[] {
  const storedAppointments = window.localStorage.getItem(STORAGE_KEY)
  if (storedAppointments === null) {
    return getInitialAppointments()
  }

  const parsedAppointments: unknown = JSON.parse(storedAppointments)
  if (!Array.isArray(parsedAppointments)) {
    throw new Error('Saved appointments must be a list')
  }

  const appointments = parsedAppointments.map(migrateLegacyAppointment)
  if (!appointments.every(isAppointment)) {
    throw new Error('Saved appointment data is invalid')
  }
  return appointments
}

export function saveAppointments(appointments: Appointment[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments))
}

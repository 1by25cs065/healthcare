export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled'

export interface Appointment {
  id: string
  patientName: string
  doctorName: string
  specialization: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  status: AppointmentStatus
}

export type NewAppointment = Omit<Appointment, 'id' | 'status'>
export type AppointmentFilter = AppointmentStatus | 'All'

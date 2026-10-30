import { beforeEach, describe, expect, it } from 'vitest'
import type { Appointment, NewAppointment } from '../types/appointment'
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
} from './appointments'

const appointmentDetails: NewAppointment = {
  patientName: 'Alex Morgan',
  doctorName: 'Dr. Taylor',
  specialization: 'Cardiology',
  appointmentDate: '2026-11-02',
  appointmentTime: '09:00',
  reason: 'Annual check-up',
}

const existingAppointment: Appointment = {
  id: 'test-1',
  ...appointmentDetails,
  status: 'Scheduled',
}

describe('appointment management', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates a valid scheduled appointment', () => {
    expect(createAppointment(appointmentDetails, new Date('2026-10-30T12:00:00'))).toEqual({
      ...existingAppointment,
      id: expect.any(String),
    })
  })

  it.each([
    ['patientName', 'Patient name is required'],
    ['doctorName', 'Doctor name is required'],
    ['specialization', 'Specialization is required'],
    ['appointmentDate', 'Appointment date is required'],
    ['appointmentTime', 'Appointment time is required'],
    ['reason', 'Reason is required'],
  ] as const)('rejects an appointment missing %s', (field, message) => {
    expect(() =>
      createAppointment(
        { ...appointmentDetails, [field]: '  ' },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toThrow(message)
  })

  it('rejects appointments scheduled on a past date', () => {
    expect(() =>
      createAppointment(
        { ...appointmentDetails, appointmentDate: '2026-10-29' },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toThrow('Appointment date cannot be in the past')
  })

  it.each([
    ['not-a-date', 'Appointment date must be a valid date'],
    ['2026-02-30', 'Appointment date must be a valid date'],
  ])('rejects invalid appointment date %s', (appointmentDate, message) => {
    expect(() =>
      createAppointment(
        { ...appointmentDetails, appointmentDate },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toThrow(message)
  })

  it.each(['9:00', '24:00', '12:60'])('rejects invalid appointment time %s', (appointmentTime) => {
    expect(() =>
      createAppointment(
        { ...appointmentDetails, appointmentTime },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toThrow('Appointment time must be valid')
  })

  it('trims appointment details when creating a booking', () => {
    expect(
      createAppointment(
        {
          ...appointmentDetails,
          patientName: '  Alex Morgan  ',
          doctorName: '  Dr. Taylor ',
          reason: ' Annual check-up ',
        },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toMatchObject({
      patientName: 'Alex Morgan',
      doctorName: 'Dr. Taylor',
      reason: 'Annual check-up',
    })
  })

  it('edits appointment details while retaining its id and status', () => {
    const updatedAppointments = editAppointment(
      [existingAppointment],
      existingAppointment.id,
      { doctorName: 'Dr. Casey', reason: 'Follow-up' },
      new Date('2026-10-30T12:00:00'),
    )

    expect(updatedAppointments).toEqual([
      {
        ...existingAppointment,
        doctorName: 'Dr. Casey',
        reason: 'Follow-up',
      },
    ])
  })

  it('rejects editing an appointment that does not exist', () => {
    expect(() =>
      editAppointment([existingAppointment], 'missing', {}, new Date('2026-10-30T12:00:00')),
    ).toThrow('Appointment "missing" was not found')
  })

  it('allows an unchanged past appointment date when editing another field', () => {
    const pastAppointment = { ...existingAppointment, appointmentDate: '2026-10-29' }

    expect(
      editAppointment(
        [pastAppointment],
        pastAppointment.id,
        { doctorName: 'Dr. Casey' },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toEqual([{ ...pastAppointment, doctorName: 'Dr. Casey' }])
  })

  it('rejects changing an appointment to a different past date', () => {
    expect(() =>
      editAppointment(
        [existingAppointment],
        existingAppointment.id,
        { appointmentDate: '2026-10-29' },
        new Date('2026-10-30T12:00:00'),
      ),
    ).toThrow('Appointment date cannot be in the past')
  })

  it('cancels a scheduled appointment', () => {
    expect(cancelAppointment([existingAppointment], existingAppointment.id)[0].status).toBe(
      'Cancelled',
    )
  })

  it('rejects cancelling an appointment that is not scheduled', () => {
    const completed = { ...existingAppointment, status: 'Completed' as const }

    expect(() => cancelAppointment([completed], completed.id)).toThrow(
      'Only scheduled appointments can be cancelled',
    )
  })

  it('rejects cancelling an appointment that does not exist', () => {
    expect(() => cancelAppointment([existingAppointment], 'missing')).toThrow(
      'Appointment "missing" was not found',
    )
  })

  it('deletes an appointment by id', () => {
    expect(deleteAppointment([existingAppointment], existingAppointment.id)).toEqual([])
  })

  it('searches case-insensitively across appointment details and ignores surrounding whitespace', () => {
    expect(searchAppointments([existingAppointment], '  ANNUAL CHECK-UP  ')).toEqual([
      existingAppointment,
    ])
    expect(searchAppointments([existingAppointment], '09:00')).toEqual([existingAppointment])
    expect(searchAppointments([existingAppointment], 'missing')).toEqual([])
  })

  it('searches and filters appointments', () => {
    const completed = { ...existingAppointment, id: 'test-2', status: 'Completed' as const }
    const cancelled = { ...existingAppointment, id: 'test-3', status: 'Cancelled' as const }
    const appointments = [existingAppointment, completed, cancelled]

    expect(searchAppointments(appointments, 'taylor')).toEqual(appointments)
    expect(filterAppointments(appointments, 'Scheduled')).toEqual([existingAppointment])
    expect(filterAppointments(appointments, 'Completed')).toEqual([completed])
    expect(filterAppointments(appointments, 'Cancelled')).toEqual([cancelled])
    expect(filterAppointments(appointments, 'All')).toHaveLength(3)
  })

  it('persists appointments using the requested appointment fields', () => {
    saveAppointments([existingAppointment])

    expect(loadAppointments()).toEqual([existingAppointment])
  })

  it('rejects a local-storage value that is not an appointment list', () => {
    window.localStorage.setItem('careflow-appointments', JSON.stringify({ appointment: existingAppointment }))

    expect(() => loadAppointments()).toThrow('Saved appointments must be a list')
  })

  it('uses the sample appointments when local storage is empty', () => {
    expect(loadAppointments()).toHaveLength(4)
  })

  it('migrates appointments saved with the legacy field names', () => {
    window.localStorage.setItem(
      'careflow-appointments',
      JSON.stringify([
        {
          id: 'legacy-1',
          patientName: 'Alex Morgan',
          provider: 'Dr. Taylor',
          specialty: 'Cardiology',
          date: '2026-11-02',
          time: '09:00',
          notes: 'Annual check-up',
          status: 'Scheduled',
        },
      ]),
    )

    expect(loadAppointments()).toEqual([{ ...existingAppointment, id: 'legacy-1' }])
  })

  it('reports invalid appointment data from local storage', () => {
    window.localStorage.setItem('careflow-appointments', JSON.stringify([{ id: 'broken' }]))

    expect(() => loadAppointments()).toThrow('Saved appointment data is invalid')
  })

  it('rejects status updates for an appointment that does not exist', () => {
    expect(() =>
      updateAppointmentStatus([existingAppointment], 'missing', 'Completed'),
    ).toThrow('Appointment "missing" was not found')
  })
})

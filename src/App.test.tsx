import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import type { Appointment } from './types/appointment'

function dateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const dashboardAppointments: Appointment[] = [
  {
    id: 'scheduled-1',
    patientName: 'Scheduled Patient',
    doctorName: 'Dr. Scheduled',
    specialization: 'Cardiology',
    appointmentDate: dateOffset(3),
    appointmentTime: '09:00',
    reason: 'Check-up',
    status: 'Scheduled',
  },
  {
    id: 'completed-1',
    patientName: 'Completed Patient',
    doctorName: 'Dr. Completed',
    specialization: 'Dermatology',
    appointmentDate: dateOffset(-1),
    appointmentTime: '10:00',
    reason: 'Follow-up',
    status: 'Completed',
  },
  {
    id: 'cancelled-1',
    patientName: 'Cancelled Patient',
    doctorName: 'Dr. Cancelled',
    specialization: 'Neurology',
    appointmentDate: dateOffset(4),
    appointmentTime: '11:00',
    reason: 'Consultation',
    status: 'Cancelled',
  },
  {
    id: 'past-scheduled-1',
    patientName: 'Past Scheduled Patient',
    doctorName: 'Dr. Past',
    specialization: 'Pediatrics',
    appointmentDate: dateOffset(-1),
    appointmentTime: '08:00',
    reason: 'Earlier visit',
    status: 'Scheduled',
  },
]

describe('appointment dashboard', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows navigation and appointment totals for every status', () => {
    window.localStorage.setItem(
      'careflow-appointments',
      JSON.stringify(dashboardAppointments),
    )
    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByText('Total appointments').closest('article')).toHaveTextContent('4')
    expect(screen.getByText('Upcoming appointments').closest('article')).toHaveTextContent('1')
    expect(screen.getByText('Completed appointments').closest('article')).toHaveTextContent('1')
    expect(screen.getByText('Cancelled appointments').closest('article')).toHaveTextContent('1')
  })

  it('navigates between the overview and appointments sections', async () => {
    const user = userEvent.setup()
    render(<App />)

    const navigation = within(screen.getByRole('navigation', { name: 'Main navigation' }))
    const overviewLink = navigation.getByRole('link', { name: 'Overview' })
    const appointmentsLink = navigation.getByRole('link', { name: /appointments 4/i })

    expect(overviewLink).toHaveAttribute('aria-current', 'page')
    await user.click(appointmentsLink)
    expect(appointmentsLink).toHaveAttribute('aria-current', 'page')
    await user.click(overviewLink)
    expect(overviewLink).toHaveAttribute('aria-current', 'page')
  })

  it('adds a new appointment from the booking form', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /new appointment/i }))
    await user.type(screen.getByLabelText('Patient name'), 'Avery Stone')
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Taylor')
    await user.type(screen.getByLabelText('Reason for appointment'), 'Annual check-up')
    await user.click(screen.getByRole('button', { name: 'Save appointment' }))

    expect(screen.getByText('Avery Stone')).toBeInTheDocument()
    expect(window.localStorage.getItem('careflow-appointments')).toContain('Avery Stone')
  })

  it('closes a new appointment form without saving', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /new appointment/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('careflow-appointments')).not.toContain('Avery Stone')
  })

  it('views, edits, cancels, filters, and deletes an appointment', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'View appointment for Olivia Rhye' }),
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Follow-up consultation')
    await user.click(screen.getByRole('button', { name: 'Edit appointment' }))
    await user.clear(screen.getByLabelText('Doctor name'))
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Casey')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText('Dr. Casey')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Cancel appointment for Olivia Rhye' }),
    )
    await user.click(screen.getByRole('button', { name: 'Cancelled' }))
    expect(screen.getByText('Olivia Rhye')).toBeInTheDocument()
    expect(screen.queryByText('Phoenix Baker')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /all visits/i }))
    await user.click(
      screen.getByRole('button', { name: 'Delete appointment for Olivia Rhye' }),
    )
    expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('careflow-appointments')).not.toContain('Olivia Rhye')
  })

  it('searches appointments by doctor', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Search appointments'), 'darlene')

    expect(screen.getByText('Phoenix Baker')).toBeInTheDocument()
    expect(screen.queryByText('Olivia Rhye')).not.toBeInTheDocument()
  })

  it('shows the empty state when a search has no matches', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Search appointments'), 'no matching visit')

    expect(screen.getByText('No appointments found')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 4 appointments')).toBeInTheDocument()
  })

  it('closes appointment details without changing the appointment', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'View appointment for Olivia Rhye' }),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close appointment details' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Olivia Rhye')).toBeInTheDocument()
  })

  it('filters appointments by each status', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      'careflow-appointments',
      JSON.stringify(dashboardAppointments),
    )
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Scheduled' }))
    expect(screen.getByText('Scheduled Patient')).toBeInTheDocument()
    expect(screen.getByText('Past Scheduled Patient')).toBeInTheDocument()
    expect(screen.queryByText('Completed Patient')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancelled Patient')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('Completed Patient')).toBeInTheDocument()
    expect(screen.queryByText('Scheduled Patient')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancelled' }))
    expect(screen.getByText('Cancelled Patient')).toBeInTheDocument()
    expect(screen.queryByText('Completed Patient')).not.toBeInTheDocument()
  })

  it('persists status changes and restores them on a new mount', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(
      'careflow-appointments',
      JSON.stringify(dashboardAppointments),
    )
    const { unmount } = render(<App />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Update status for Scheduled Patient' }),
      'Completed',
    )

    expect(JSON.parse(window.localStorage.getItem('careflow-appointments') ?? '[]')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'scheduled-1', status: 'Completed' }),
      ]),
    )

    unmount()
    render(<App />)

    expect(screen.getByRole('combobox', { name: 'Update status for Scheduled Patient' }))
      .toHaveValue('Completed')
    expect(screen.getByText('Completed appointments').closest('article')).toHaveTextContent('2')
  })

  it('shows the empty state and zero dashboard statistics for an empty schedule', () => {
    window.localStorage.setItem('careflow-appointments', '[]')
    render(<App />)

    expect(screen.getByText('No appointments found')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 0 appointments')).toBeInTheDocument()
    expect(screen.getByText('Total appointments').closest('article')).toHaveTextContent('0')
    expect(screen.getByText('Upcoming appointments').closest('article')).toHaveTextContent('0')
    expect(screen.getByText('Completed appointments').closest('article')).toHaveTextContent('0')
    expect(screen.getByText('Cancelled appointments').closest('article')).toHaveTextContent('0')
  })
})

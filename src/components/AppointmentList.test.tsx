import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Appointment } from '../types/appointment'
import AppointmentList from './AppointmentList'

const appointment: Appointment = {
  id: 'apt-1',
  patientName: 'Jordan Lee',
  doctorName: 'Dr. Hart',
  specialization: 'Cardiology',
  appointmentDate: '2026-11-02',
  appointmentTime: '10:30',
  reason: 'Heart check-up',
  status: 'Scheduled',
}

describe('appointment list', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows appointment details, status badge, and management actions', async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    const onView = vi.fn()
    const onEdit = vi.fn()
    const onCancel = vi.fn()
    const onDelete = vi.fn()
    render(
      <AppointmentList
        appointments={[appointment]}
        onStatusChange={onStatusChange}
        onView={onView}
        onEdit={onEdit}
        onCancel={onCancel}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByText('Jordan Lee')).toBeInTheDocument()
    expect(screen.getByText('Dr. Hart')).toBeInTheDocument()
    expect(screen.getByText('Scheduled', { selector: 'span' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View appointment for Jordan Lee' }))
    await user.click(screen.getByRole('button', { name: 'Edit appointment for Jordan Lee' }))
    await user.click(screen.getByRole('button', { name: 'Cancel appointment for Jordan Lee' }))
    await user.click(screen.getByRole('button', { name: 'Delete appointment for Jordan Lee' }))
    await user.selectOptions(screen.getByRole('combobox', { name: 'Update status for Jordan Lee' }), 'Completed')

    expect(onView).toHaveBeenCalledWith(appointment)
    expect(onEdit).toHaveBeenCalledWith(appointment)
    expect(onCancel).toHaveBeenCalledWith(appointment.id)
    expect(onDelete).toHaveBeenCalledWith(appointment.id)
    expect(onStatusChange).toHaveBeenCalledWith(appointment.id, 'Completed')
  })

  it('shows an empty state when no appointments match', () => {
    render(
      <AppointmentList
        appointments={[]}
        onStatusChange={vi.fn()}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('No appointments found')).toBeInTheDocument()
  })
})

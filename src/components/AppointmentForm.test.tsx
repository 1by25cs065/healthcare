import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Appointment, NewAppointment } from '../types/appointment'
import AppointmentForm from './AppointmentForm'

describe('appointment booking form', () => {
  afterEach(() => {
    cleanup()
  })

  it('submits booking details and allows the form to be dismissed', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn<(appointment: NewAppointment) => void>()
    const onClose = vi.fn()
    render(<AppointmentForm onSubmit={onSubmit} onClose={onClose} />)

    await user.type(screen.getByLabelText('Patient name'), 'Riley Carter')
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Hart')
    await user.selectOptions(screen.getByLabelText('Specialization'), 'Cardiology')
    await user.clear(screen.getByLabelText('Appointment date'))
    await user.type(screen.getByLabelText('Appointment date'), '2026-11-02')
    await user.clear(screen.getByLabelText('Appointment time'))
    await user.type(screen.getByLabelText('Appointment time'), '10:30')
    await user.type(screen.getByLabelText('Reason for appointment'), 'Heart check-up')
    await user.click(screen.getByRole('button', { name: 'Save appointment' }))

    expect(onSubmit).toHaveBeenCalledWith({
      patientName: 'Riley Carter',
      doctorName: 'Dr. Hart',
      specialization: 'Cardiology',
      appointmentDate: '2026-11-02',
      appointmentTime: '10:30',
      reason: 'Heart check-up',
    })

    await user.click(screen.getByRole('button', { name: 'Close form' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('reports an invalid appointment date without submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AppointmentForm onSubmit={onSubmit} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Patient name'), 'Riley Carter')
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Hart')
    await user.type(screen.getByLabelText('Reason for appointment'), 'Check-up')
    await user.clear(screen.getByLabelText('Appointment date'))
    await user.type(screen.getByLabelText('Appointment date'), '2020-01-01')
    await user.click(screen.getByRole('button', { name: 'Save appointment' }))

    expect(screen.getByLabelText('Appointment date')).toBeInvalid()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('marks every required booking field as required', () => {
    render(<AppointmentForm onSubmit={vi.fn()} onClose={vi.fn()} />)

    for (const label of [
      'Patient name',
      'Doctor name',
      'Specialization',
      'Appointment date',
      'Appointment time',
      'Reason for appointment',
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired()
    }
  })

  it('prevents submission when a required booking field is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AppointmentForm onSubmit={onSubmit} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Save appointment' }))

    expect(screen.getByLabelText('Patient name')).toBeInvalid()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation feedback when a past date reaches the submit handler', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AppointmentForm onSubmit={onSubmit} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText('Patient name'), 'Riley Carter')
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Hart')
    await user.type(screen.getByLabelText('Reason for appointment'), 'Check-up')
    fireEvent.change(screen.getByLabelText('Appointment date'), {
      target: { value: '2020-01-01' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Save appointment' }).closest('form')!)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Appointment date cannot be in the past',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('allows editing a historical appointment without changing its date', async () => {
    const user = userEvent.setup()
    const appointment: Appointment = {
      id: 'past-1',
      patientName: 'Riley Carter',
      doctorName: 'Dr. Hart',
      specialization: 'Cardiology',
      appointmentDate: '2020-01-01',
      appointmentTime: '10:30',
      reason: 'Heart check-up',
      status: 'Completed',
    }
    const onSubmit = vi.fn()
    render(
      <AppointmentForm
        appointment={appointment}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    )

    await user.clear(screen.getByLabelText('Doctor name'))
    await user.type(screen.getByLabelText('Doctor name'), 'Dr. Casey')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSubmit).toHaveBeenCalledWith({
      patientName: 'Riley Carter',
      doctorName: 'Dr. Casey',
      specialization: 'Cardiology',
      appointmentDate: '2020-01-01',
      appointmentTime: '10:30',
      reason: 'Heart check-up',
    })
  })
})

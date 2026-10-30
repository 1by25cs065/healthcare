import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

describe('sidebar navigation and account options', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('updates the active section when a navigation link is selected', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(
      <Sidebar
        appointmentCount={4}
        activeSection="overview"
        onNavigate={onNavigate}
      />,
    )

    expect(screen.getByRole('complementary')).toHaveClass('sticky', 'h-screen')
    await user.click(screen.getByRole('link', { name: /appointments 4/i }))

    expect(onNavigate).toHaveBeenCalledWith('appointments')
  })

  it('opens profile details from the account options menu', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar appointmentCount={4} activeSection="overview" onNavigate={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Account options' }))
    await user.click(screen.getByRole('menuitem', { name: 'My profile' }))

    const profileDialog = screen.getByRole('dialog', { name: 'My profile' })
    expect(profileDialog).toBeInTheDocument()
    expect(within(profileDialog).getByText('Jordan Davis')).toBeInTheDocument()
    expect(within(profileDialog).getByText('Care coordinator')).toBeInTheDocument()
  })

  it('saves notification preference from account options', async () => {
    const user = userEvent.setup()
    render(
      <Sidebar appointmentCount={4} activeSection="overview" onNavigate={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Account options' }))
    await user.click(screen.getByRole('menuitem', { name: 'Notification preferences' }))
    await user.click(screen.getByRole('checkbox', { name: 'Appointment reminders' }))

    expect(window.localStorage.getItem('careflow-appointment-reminders')).toBe('false')
  })
})

import { useEffect, useRef, useState } from 'react'

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>
      </div>
      <div>
        <p className="text-[17px] font-bold tracking-tight text-ink">careflow</p>
        <p className="text-[11px] font-medium tracking-wide text-muted">HEALTH, IN SYNC</p>
      </div>
    </div>
  )
}

interface SidebarProps {
  appointmentCount: number
  activeSection: 'overview' | 'appointments'
  onNavigate: (section: 'overview' | 'appointments') => void
}

export default function Sidebar({
  appointmentCount,
  activeSection,
  onNavigate,
}: SidebarProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [accountPanel, setAccountPanel] = useState<'profile' | 'preferences' | null>(null)
  const [appointmentReminders, setAppointmentReminders] = useState(
    () => window.localStorage.getItem('careflow-appointment-reminders') !== 'false',
  )
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAccountMenuOpen && !accountPanel) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setIsAccountMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
        setAccountPanel(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountPanel, isAccountMenuOpen])

  function navigateTo(section: 'overview' | 'appointments') {
    onNavigate(section)
    setIsAccountMenuOpen(false)
  }

  function updateAppointmentReminders(enabled: boolean) {
    setAppointmentReminders(enabled)
    window.localStorage.setItem('careflow-appointment-reminders', String(enabled))
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 self-start flex-col border-r border-slate-100 bg-white px-5 py-7 lg:flex">
      <BrandMark />
      <div className="mt-12">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        <nav aria-label="Main navigation" className="mt-3 space-y-1">
          <a
            href="#overview"
            aria-current={activeSection === 'overview' ? 'page' : undefined}
            onClick={() => navigateTo('overview')}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              activeSection === 'overview'
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'font-medium text-slate-500 hover:bg-slate-50'
            }`}
          >
            <OverviewIcon />
            Overview
          </a>
          <a
            href="#appointments"
            aria-current={activeSection === 'appointments' ? 'page' : undefined}
            onClick={() => navigateTo('appointments')}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              activeSection === 'appointments'
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'font-medium text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CalendarIcon />
            Appointments
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-brand-700">{appointmentCount}</span>
          </a>
        </nav>
      </div>
      <div className="mt-auto rounded-2xl bg-[#f7faf9] p-4">
        <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M12 3.5 14.6 9l5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8L12 3.5Z"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-ink">A little better, every day</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Your care team is here to make the details feel simple.
        </p>
      </div>
      <div ref={accountMenuRef} className="relative mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e6edf7] text-xs font-bold text-[#55719a]">
          JD
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">Jordan Davis</p>
          <p className="text-xs text-muted">Care coordinator</p>
        </div>
        <button
          type="button"
          aria-label="Account options"
          aria-expanded={isAccountMenuOpen}
          aria-haspopup="menu"
          onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          ···
        </button>
        {isAccountMenuOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute bottom-full right-0 z-30 mb-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-card"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsAccountMenuOpen(false)
                setAccountPanel('profile')
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-slate-50"
            >
              My profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsAccountMenuOpen(false)
                setAccountPanel('preferences')
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-slate-50"
            >
              Notification preferences
            </button>
          </div>
        )}
      </div>
      {accountPanel === 'profile' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                  Account
                </p>
                <h2 id="profile-title" className="mt-2 text-xl font-bold text-ink">
                  My profile
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close account panel"
                onClick={() => setAccountPanel(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e6edf7] text-xs font-bold text-[#55719a]">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Jordan Davis</p>
                <p className="text-xs text-muted">Care coordinator</p>
              </div>
            </div>
          </section>
        </div>
      )}
      {accountPanel === 'preferences' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="preferences-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                  Account
                </p>
                <h2 id="preferences-title" className="mt-2 text-xl font-bold text-ink">
                  Notification preferences
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close account panel"
                onClick={() => setAccountPanel(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <label className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 text-sm font-medium text-ink">
              Appointment reminders
              <input
                type="checkbox"
                checked={appointmentReminders}
                onChange={(event) => updateAppointmentReminders(event.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-muted">
              Save your reminder preference in this browser.
            </p>
          </section>
        </div>
      )}
    </aside>
  )
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  )
}

function OverviewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

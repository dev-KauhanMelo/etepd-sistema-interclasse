import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import EventGate from './EventGate'

export default function PublicLayout() {
  return (
    <EventGate>
      <div className="min-h-screen pb-24 bg-brand-paper">
        <TopBar />
        <div className="max-w-lg mx-auto">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </EventGate>
  )
}

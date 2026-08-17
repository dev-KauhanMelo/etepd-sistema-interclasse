import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import EventGate from './EventGate'
import OfflineBanner from './OfflineBanner'

export default function PublicLayout() {
  return (
    <EventGate>
      <div className="min-h-screen pb-24 bg-arena-bg arena-mesh text-arena-text">
        <TopBar />
        <div className="max-w-lg mx-auto">
          <OfflineBanner />
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </EventGate>
  )
}

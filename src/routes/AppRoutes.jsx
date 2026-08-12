import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../components/layout/PublicLayout'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from './ProtectedRoute'

import Home from '../pages/public/Home'
import LiveScores from '../pages/public/LiveScores'
import MatchDetail from '../pages/public/MatchDetail'
import Schedule from '../pages/public/Schedule'
import Standings from '../pages/public/Standings'
import Announcements from '../pages/public/Announcements'
import Bolao from '../pages/public/Bolao'

import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import ManageMatches from '../pages/admin/ManageMatches'
import UpdateScore from '../pages/admin/UpdateScore'
import ManageAnnouncements from '../pages/admin/ManageAnnouncements'
import ManageStandings from '../pages/admin/ManageStandings'
import ManageBracket from '../pages/admin/ManageBracket'
import ManageClasses from '../pages/admin/ManageClasses'
import ManageSettings from '../pages/admin/ManageSettings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/placar" element={<LiveScores />} />
        <Route path="/placar/:id" element={<MatchDetail />} />
        <Route path="/horarios" element={<Schedule />} />
        <Route path="/ranking" element={<Standings />} />
        <Route path="/avisos" element={<Announcements />} />
        <Route path="/bolao" element={<Bolao />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="jogos" element={<ManageMatches />} />
        <Route path="jogos/:id/placar" element={<UpdateScore />} />
        <Route path="ranking" element={<ManageStandings />} />
        <Route path="chaveamento" element={<ManageBracket />} />
        <Route path="avisos" element={<ManageAnnouncements />} />
        <Route path="cadastro" element={<ManageClasses />} />
        <Route path="config" element={<ManageSettings />} />
      </Route>
    </Routes>
  )
}
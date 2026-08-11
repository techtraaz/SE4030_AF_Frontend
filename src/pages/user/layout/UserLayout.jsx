import { Outlet } from 'react-router-dom'
import NavBar from '@/components/user/NavBar'
import Footer from '@/components/user/Footer'
import AuthModal from '@/components/auth/AuthModal'
import { AuthModalProvider } from '@/context/AuthModalContext'

export default function UserLayout() {
  return (
    <AuthModalProvider>
      <NavBar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      {/* Auth modal is mounted here — renders over the current page */}
      <AuthModal />
    </AuthModalProvider>
  )
}
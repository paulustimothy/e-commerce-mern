import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useRef } from 'react'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUp'
import AdminPage from './pages/AdminPage'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import PurchaseSuccess from './pages/PurchaseSuccess'
import PurchaseCancel from './pages/PurchaseCancel'

import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'
import { useUserStore } from './stores/useUserStore'
import { useCartStore } from './stores/useCartStore'

function App() {

  const {user, checkAuth, checkingAuth} = useUserStore();
  const {getCartItems} = useCartStore();
  const authInitialized = useRef(false);
  
  useEffect(() => {
    // Only run once, even in strict mode (to avoid multiple auth checks)
    if (!authInitialized.current) {
      checkAuth();
      authInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if(user){
      getCartItems();
    }
  }, [user])
  
  if(checkingAuth) return <LoadingSpinner />
  
  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

      <div className='relative z-50 pt-20'>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUpPage />} />
        <Route path="/dashboard" element={user?.role === "admin" ? <AdminPage /> : <Navigate to="/" />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
        <Route path="/purchase-success" element={user ? <PurchaseSuccess /> : <Navigate to="/login" />} />
        <Route path="/purchase-cancel" element={user ? <PurchaseCancel /> : <Navigate to="/login" />} />
      </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App

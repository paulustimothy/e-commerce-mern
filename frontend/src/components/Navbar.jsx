import { Link } from "react-router-dom";
import {ShoppingCart, Lock, LogOut, UserPlus, LogIn, ShoppingBag, Menu, X} from 'lucide-react'
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useState } from "react";

const Navbar = () => {
    const {user, logout} = useUserStore();
    const isAdmin = user?.role === "admin";
    const {cart} = useCartStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to='/' className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex">
                        E-Commerce
                    </Link>

                    {/* Hamburger button */}
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden text-gray-300 hover:text-emerald-400 transition duration-300"
                    >
                        {isMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        <NavLinks user={user} isAdmin={isAdmin} cart={cart} logout={logout} />
                    </nav>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4 flex flex-col gap-4 border-t border-gray-700 mt-3">
                        <NavLinks user={user} isAdmin={isAdmin} cart={cart} logout={logout} mobile />
                    </nav>
                )}
            </div>
        </header>
    );
};

// Separate component for nav links to avoid repetition
const NavLinks = ({ user, isAdmin, cart, logout, mobile }) => (
    <>
        <Link to={"/"} 
            className={`text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out
                ${mobile ? 'block w-full' : ''}`}>
            Home
        </Link>
        
        {user && (
            <>
                <Link to={"/orders"} 
                    className={`text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center
                        ${mobile ? 'w-full' : ''}`}>
                    <ShoppingBag className="inline-block mr-1 group-hover:text-emerald-400" size={20} />
                    Orders
                </Link>
                
                <Link to={"/cart"} 
                    className={`relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out flex items-center
                        ${mobile ? 'w-full' : ''}`}>
                    <ShoppingCart className="inline-block mr-1 group-hover:text-emerald-400" size={20} />
                    <span className="inline">Cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out">
                            {cart.length}
                        </span>
                    )}
                </Link>
            </>
        )}

        {isAdmin && (
            <Link
                className={`bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center
                    ${mobile ? 'w-full justify-center' : ''}`}
                to="/dashboard"
            >
                <Lock className="inline-block mr-1" size={18} />
                <span className="inline">Dashboard</span> 
            </Link>
        )}

        {user ? (
            <>
                <button 
                    onClick={logout} 
                    className={`bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out
                        ${mobile ? 'w-full justify-center' : ''}`}>
                    <LogOut size={18} />
                    <span className="inline ml-2">Log out</span>
                </button>
                <span className="text-gray-300">Hello, {user.name}</span>
            </>
        ) : (
            <>
                <Link 
                    to={'/signup'} 
                    className={`bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out
                        ${mobile ? 'w-full justify-center' : ''}`}>
                    <UserPlus className="mr-2" size={18} />
                    Sign up
                </Link>

                <Link 
                    to={'/login'} 
                    className={`bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out
                        ${mobile ? 'w-full justify-center' : ''}`}>
                    <LogIn className="mr-2" size={18} />
                    Login
                </Link>
            </>
        )}
    </>
);

export default Navbar;
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axiosInstance from '../../lib/axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [userId, setUserId] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tokenParam = searchParams.get('token');
        const userIdParam = searchParams.get('userId');
        
        if (!tokenParam || !userIdParam) {
            setError('Invalid password reset link');
            return;
        }
        
        setToken(tokenParam);
        setUserId(userIdParam);
    }, [location]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                token,
                userId,
                password
            });
            
            setSuccess(true);
            toast.success('Password reset successful');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
                    <div className="text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-6 text-3xl font-bold text-white">Reset Failed</h2>
                        <p className="mt-2 text-sm text-gray-400">{error}</p>
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-6 text-3xl font-bold text-white">Password Reset</h2>
                        <p className="mt-2 text-sm text-gray-400">Your password has been reset successfully.</p>
                        <p className="mt-1 text-sm text-gray-400">You will be redirected to login.</p>
                        <Link to="/login" className="mt-6 inline-flex items-center text-emerald-400 hover:text-emerald-300">
                            Go to Login <ArrowLeft className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
                    Reset your password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                                Confirm New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import axiosInstance from '../lib/axios';
import { useUserStore } from '../stores/useUserStore';

const VerifyEmail = () => {
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, set } = useUserStore();
    
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);
    
    useEffect(() => {
        const verifyEmail = async () => {
            const searchParams = new URLSearchParams(location.search);
            const token = searchParams.get('token');
            const userId = searchParams.get('userId');
            
            if (!token || !userId) {
                setError('Missing verification information');
                setVerifying(false);
                return;
            }
            
            try {
                const response = await axiosInstance.post('/auth/verify-email', { token, userId });
                setSuccess(true);
                toast.success('Email verified successfully!');

                set({user: response.data.user})
                
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                setError(error.response?.data?.message || 'Verification failed');
                toast.error(error.response?.data?.message || 'Verification failed');
            } finally {
                setVerifying(false);
            }
        };
        
        verifyEmail();
    }, [location, navigate]);
    
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
                {verifying ? (
                    <div className="text-center">
                        <Mail className="mx-auto h-12 w-12 text-emerald-400 animate-pulse" />
                        <h2 className="mt-6 text-3xl font-bold text-white">Verifying your email</h2>
                        <p className="mt-2 text-sm text-gray-400">Please wait while we verify your email address...</p>
                        <div className="mt-4 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                        </div>
                    </div>
                ) : success ? (
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-6 text-3xl font-bold text-white">Email Verified!</h2>
                        <p className="mt-2 text-sm text-gray-400">Your email has been successfully verified.</p>
                        <p className="mt-1 text-sm text-gray-400">You are now logged in and will be redirected to the home page.</p>
                        <Link to="/" className="mt-6 inline-flex items-center text-emerald-400 hover:text-emerald-300">
                            Go to Home <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-6 text-3xl font-bold text-white">Verification Failed</h2>
                        <p className="mt-2 text-sm text-gray-400">{error || 'The verification link is invalid or has expired.'}</p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, RefreshCw } from 'lucide-react';
import axiosInstance from '../lib/axios';

const VerificationNeeded = () => {
    const [resending, setResending] = useState(false);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('userId');
    
    const handleResendVerification = async () => {
        if (!userId) {
            toast.error('User ID not found');
            return;
        }
        
        setResending(true);
        try {
            await axiosInstance.post('/auth/resend-verification', { userId });
            toast.success('Verification email resent successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <Mail className="mx-auto h-12 w-12 text-emerald-400" />
                    <h2 className="mt-6 text-3xl font-bold text-white">Verification Required</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Your account needs verification. Please check your email for a verification link.
                    </p>
                    <div className="mt-6 space-y-4">
                        <button
                            onClick={handleResendVerification}
                            disabled={resending}
                            className="w-full flex justify-center items-center px-4 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {resending ? (
                                <>
                                    <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                                    Resending...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend Verification Email
                                </>
                            )}
                        </button>
                        <Link
                            to="/login"
                            className="block w-full text-center px-4 py-2 bg-gray-700 rounded-md text-white hover:bg-gray-600"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationNeeded;
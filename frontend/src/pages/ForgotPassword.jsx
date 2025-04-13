import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Mail, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setEmailSent(true);
            toast.success('Reset link sent to your email');
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response?.data?.message || 'Failed to send reset email');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
                    Reset your password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {emailSent ? (
                        <div className="text-center">
                            <Mail className="mx-auto h-12 w-12 text-emerald-400" />
                            <h3 className="mt-2 text-lg font-medium text-white">Check your email</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                We've sent a password reset link to {email}
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                                >
                                    <ArrowLeft className="inline-block mr-2 h-4 w-4" />
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                            Sending...
                                        </>
                                    ) : (
                                        'Send reset link'
                                    )}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                                >
                                    <ArrowLeft className="inline-block mr-2 h-4 w-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
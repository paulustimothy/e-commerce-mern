import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../stores/useOrderStore';
import { ArrowLeft, Calendar, Clock, Package, CreditCard } from 'lucide-react';

const OrderDetail = () => {
    const { orderId } = useParams();
    const { currentOrder, loading, getOrderById } = useOrderStore();

    useEffect(() => {
        getOrderById(orderId);
    }, [orderId, getOrderById]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl text-white mb-2">Order not found</h2>
                    <Link to="/orders" className="text-emerald-400 hover:underline">
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        to="/orders" 
                        className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Orders
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h1 className="text-2xl font-bold text-white mb-2 md:mb-0">
                            Order #{currentOrder._id.slice(-6)}
                        </h1>
                        <span className="text-xl font-bold text-emerald-400">
                            ${currentOrder.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Order Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm">Order Date</span>
                        </div>
                        <p className="text-white">
                            {new Date(currentOrder.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Order Time</span>
                        </div>
                        <p className="text-white">
                            {new Date(currentOrder.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Order Items</h2>
                    <div className="space-y-6">
                        {currentOrder.products.map((item) => (
                            <div 
                                key={item._id}
                                className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-gray-700 last:border-0 last:pb-0"
                            >
                                <div className="shrink-0">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-medium text-white">
                                        {item.name}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                                        <p>Quantity: {item.quantity}</p>
                                        <span className="hidden md:inline text-gray-600">•</span>
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-sm text-gray-400">Subtotal</p>
                                    <p className="text-lg font-semibold text-emerald-400">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>${currentOrder.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        {currentOrder.coupon && (
                            <div className="flex justify-between text-emerald-400">
                                <span>Discount</span>
                                <span>-${(currentOrder.totalAmount * (currentOrder.coupon.discountPercentage / 100)).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-700">
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold text-white">Total</span>
                                <span className="text-lg font-bold text-emerald-400">
                                    ${currentOrder.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="mt-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Payment processed via </span>
                        <span className="font-medium text-emerald-400">
                            {currentOrder.paymentMethod}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
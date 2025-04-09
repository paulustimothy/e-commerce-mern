import { useEffect } from 'react';
import { useOrderStore } from '../stores/useOrderStore';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Clock, ChevronRight, Eye } from 'lucide-react';

const Orders = () => {
    const { orders, loading, getAllOrders } = useOrderStore();

    useEffect(() => {
        getAllOrders();
    }, [getAllOrders]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBag className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-3xl font-bold text-white">Order History</h1>
                </div>
                
                {orders.length === 0 ? (
                    <div className="text-center py-16 rounded-lg border border-gray-700 shadow-sm">
                        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-xl text-gray-300 mb-4">No orders found</p>
                        <Link 
                            to="/" 
                            className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div 
                                key={order._id} 
                                className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6 hover:border-gray-600 transition-colors"
                            >
                                {/* Order Header */}
                                <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                                    <div>
                                        <p className="text-lg font-semibold text-white">
                                            Order #{order._id.slice(-6)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <p className="text-sm">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Total Amount</p>
                                        <p className="text-xl font-bold text-emerald-400">
                                            ${order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    {order.products.slice(0, 2).map((item) => (
                                        <div 
                                            key={item._id} 
                                            className="flex items-center gap-4"
                                        >
                                            <div className="shrink-0">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="font-medium text-white truncate">
                                                    {item.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-4">
                                                    <p className="text-sm text-gray-400">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <span className="text-gray-600">•</span>
                                                    <p className="text-sm text-gray-400">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {order.products.length > 2 && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            +{order.products.length - 2} more items
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white 
                                        rounded-lg hover:bg-gray-600 transition-colors focus:outline-none 
                                        focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
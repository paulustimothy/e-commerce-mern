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
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                    <ShoppingBag className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Order History</h1>
                </div>
                
                {orders.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 rounded-lg border border-gray-700 shadow-sm">
                        <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-lg sm:text-xl text-gray-300 mb-4">No orders found</p>
                        <Link 
                            to="/" 
                            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {orders.map((order) => (
                            <div 
                                key={order._id} 
                                className="rounded-lg border p-3 sm:p-6 shadow-sm border-gray-700 bg-gray-800 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4 sm:mb-6 border-b border-gray-700 pb-4">
                                    <div>
                                        <p className="text-base sm:text-lg font-semibold text-white">
                                            Order #{order._id.slice(-6)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <p className="text-xs sm:text-sm">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs sm:text-sm text-gray-400">Total Amount</p>
                                        <p className="text-lg sm:text-xl font-bold text-emerald-400">
                                            ${order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {order.products.slice(0, 2).map((item) => (
                                        <div 
                                            key={item._id} 
                                            className="flex items-center gap-3 sm:gap-4"
                                        >
                                            <div className="shrink-0">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-700"
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-sm sm:text-base font-medium text-white truncate">
                                                    {item.name}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2 sm:gap-4">
                                                    <p className="text-xs sm:text-sm text-gray-400">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <span className="text-gray-600">•</span>
                                                    <p className="text-xs sm:text-sm text-gray-400">
                                                        ${item.price.toFixed(2)} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {order.products.length > 2 && (
                                        <p className="text-xs sm:text-sm text-gray-400 mt-2">
                                            +{order.products.length - 2} more items
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 sm:mt-6 flex justify-end">
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 text-white text-sm 
                                        rounded-lg hover:bg-gray-600 transition-colors focus:outline-none 
                                        focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto justify-center"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Details</span>
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
import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axiosInstance from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {

    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const {clearCart} = useCartStore();
	const checkoutProcessed = useRef(false);
	const navigate = useNavigate();

    useEffect(() => {
        const handleCheckoutSuccess = async (sessionId) => {

		if(checkoutProcessed.current) return;

        try {
			checkoutProcessed.current = true;
            const res = await axiosInstance.post("/payments/checkout-success", {sessionId})

			// If order already exists, just show it
			if (res.data.alreadyExists) {
				setOrderId(res.data.orderId);
				setIsProcessing(false);
				return;
			}

            setOrderId(res.data.orderId);
            clearCart();

			// Remove sessionId from URL to prevent refresh issues
			navigate('/purchase-success', { replace: true });

        } catch (error) {
            console.log(error);
        } finally {
            setIsProcessing(false);
        }
    };
//TODO create a history of orders
        const sessionId = new URLSearchParams(window.location.search).get("session_id");

        // If no sessionId and we have an orderId, we're probably refreshing
        if (!sessionId && orderId) {
            return; // Do nothing if we're just refreshing with an existing order
        }

        // If no sessionId and no orderId, redirect to home
        if (!sessionId) {
            navigate('/');
            return;
        }

        handleCheckoutSuccess(sessionId);
    }, [clearCart, navigate, orderId])

    if(isProcessing) return "Processing...";
    if(error) return `Error: ${error}`;

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Order confirmation has been sent to your email.
					</p>
					<div className='bg-gray-700 rounded-lg p-4 mb-6'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-emerald-400'>#{orderId || "N/A"}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full text-white font-bold
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
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
        const handleCheckoutSuccess = async (sessionId, midtransOrderId) => {

		if(checkoutProcessed.current) return;

        try {
			checkoutProcessed.current = true;
			
			const response = await axiosInstance.post("/payments/checkout-success", {sessionId, midtransOrderId})
			
			 // If order already exists or is successful, clear the cart
			if (response.data.success) {
				setOrderId(response.data.orderId);
				
				if (response.data.status === 'completed' || response.data.alreadyExists) {
					await clearCart();
					console.log('Cart cleared successfully');
				}

				// Remove query params from URL
				navigate('/purchase-success', { replace: true });
			} else {
				setError(response.data.message);
			}

		} catch (error) {
			console.error("Checkout error:", error);
			setError(error.response?.data?.message || error.message);
		} finally {
			setIsProcessing(false);
		}
    };
//TODO make all pages responsive
// TODO the refresh token is not working
//TODO make email verification and reset password
       const params = new URLSearchParams(window.location.search)
	   const sessionId = params.get("session_id");
	   const midtransOrderId = params.get("order_id");

	   if(!sessionId && !midtransOrderId && orderId){
			setIsProcessing(false);
			return;
	   }

	   if(!sessionId && !midtransOrderId){
		navigate('/');
		return;
	   }

        handleCheckoutSuccess(sessionId, midtransOrderId);
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
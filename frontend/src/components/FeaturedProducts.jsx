import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCartStore } from '../stores/useCartStore'

const FeaturedProducts = ({featuredProducts}) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    const {addToCart} = useCartStore();

    useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth < 640) setItemsPerPage(1);
            else if(window.innerWidth < 1024) setItemsPerPage(2);
            else if(window.innerWidth < 1280) setItemsPerPage(3);
            else setItemsPerPage(4);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        // remove event listener when component unmounts for memory management
        return () => window.removeEventListener("resize", handleResize);
    }, [])

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
    }
    
    const isStartDisabled = currentIndex === 0;
    const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

  return (
    <div className='py-12'>
			<div className='container mx-auto px-4'>
				<h2 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>Featured</h2>
				<div className='relative'>
					<div className='overflow-hidden'>
						<div
							className='flex transition-transform duration-300 ease-in-out'
							style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
						>
							{featuredProducts?.map((product) => (
								<div key={product._id} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2'>
								<div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
								  {/* Image Container */}
								  <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
									<img 
									  className='object-contain w-full h-full' 
									  src={product.image} 
									  alt={product.name}
									  style={{
										objectPosition: 'center',
										backgroundColor: '#ffffff10',
										padding: '0.5rem'
									  }}
									/>
								  </div>
							  
								  {/* Content */}
								  <div className='mt-4 px-5 pb-5'>
									<h5 className='text-xl font-semibold tracking-tight text-white'>
									  {product.name}
									</h5>
									
									<div className='mt-2 mb-5 flex items-center justify-between'>
									  <p>
										<span className='text-3xl font-bold text-emerald-400'>
										  ${product.price.toFixed(2)}
										</span>
									  </p>
									</div>
							  
									<button
									  onClick={() => addToCart(product)}
									  className='flex w-full items-center justify-center rounded-lg bg-emerald-600 
										px-5 py-2.5 text-center text-sm font-medium text-white 
										hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
									>
									  <ShoppingCart size={22} className='mr-2' />
									  Add to cart
									</button>
								  </div>
								</div>
							  </div>
							))}
						</div>
					</div>
					<button
						onClick={prevSlide}
						disabled={isStartDisabled}
						className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
							isStartDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
						}`}
					>
						<ChevronLeft className='w-6 h-6' />
					</button>

					<button
						onClick={nextSlide}
						disabled={isEndDisabled}
						className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
							isEndDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
						}`}
					>
						<ChevronRight className='w-6 h-6' />
					</button>
				</div>
			</div>
		</div>
  )
}

export default FeaturedProducts
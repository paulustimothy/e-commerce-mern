// Create a new file: components/AnalyticsSkeleton.jsx
import { motion } from 'framer-motion';

const AnalyticsSkeleton = () => {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Cards Skeleton */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {[...Array(4)].map((_, index) => (
          <AnalyticsCardSkeleton key={index} />
        ))}
      </div>

      {/* Chart Skeleton */}
      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className='animate-pulse'>
          {/* Chart placeholder */}
          <div className='h-[400px] bg-gray-700/50 rounded-lg'>
            {/* Fake axes */}
            <div className='h-full w-full flex items-end'>
              <div className='w-[2px] h-full bg-gray-600/30' /> {/* Y axis */}
              <div className='h-[2px] w-full bg-gray-600/30 -ml-[2px]' /> {/* X axis */}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AnalyticsCardSkeleton = () => (
  <motion.div
    className='bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className='animate-pulse'>
      <div className='flex justify-between items-center'>
        <div className='z-10 w-full'>
          {/* Title placeholder */}
          <div className='h-4 w-24 bg-gray-600 rounded mb-3' />
          {/* Value placeholder */}
          <div className='h-8 w-32 bg-gray-600 rounded' />
        </div>
      </div>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 opacity-30' />
      {/* Icon placeholder */}
      <div className='absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-gray-700/30' />
    </div>
  </motion.div>
);

export default AnalyticsSkeleton;
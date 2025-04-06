import { Star, Trash } from 'lucide-react';

const ProductTableRow = ({ product, onToggleFeatured, onDelete }) => {
    const cells = [
        // Product cell with image and name
        {
            id: 'product',
            content: (
                <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                        <img
                            className='h-10 w-10 rounded-full object-cover'
                            src={product.image}
                            alt={product.name}
                        />
                    </div>
                    <div className='ml-4'>
                        <div className='text-sm font-medium text-white'>{product.name}</div>
                    </div>
                </div>
            )
        },
        // Price cell
        {
            id: 'price',
            content: <div className='text-sm text-gray-300'>${product.price.toFixed(2)}</div>
        },
        // Category cell
        {
            id: 'category',
            content: <div className='text-sm text-gray-300'>{product.category}</div>
        },
        // Featured toggle cell
        {
            id: 'featured',
            content: (
                <button
                    onClick={() => onToggleFeatured(product._id)}
                    className={`p-1 rounded-full ${
                        product.isFeatured ? "bg-yellow-400 text-gray-900" : "bg-gray-600 text-gray-300"
                    } hover:bg-yellow-500 hover:cursor-pointer transition-colors duration-200`}
                >
                    <Star className='h-5 w-5' />
                </button>
            )
        },
        // Actions cell
        {
            id: 'actions',
            content: (
                <button
                    onClick={() => onDelete(product._id)}
                    className='text-red-400 hover:text-red-300 hover:cursor-pointer'
                >
                    <Trash className='h-5 w-5' />
                </button>
            )
        }
    ];

    return (
        <tr className='hover:bg-gray-700'>
            {cells.map(cell => (
                <td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
                    {cell.content}
                </td>
            ))}
        </tr>
    );
};

export default ProductTableRow;
import { useProductStore } from "../stores/useProductStore";
import {motion} from "framer-motion";
import ProductTableRow from "./ProductTableRow";

const ProductsList = () => {
  const {products, deleteProduct, toggleFeaturedProduct} = useProductStore();

  const tableHeaders = [
    { id: 'product', label: 'Product' },
    { id: 'price', label: 'Price' },
    { id: 'category', label: 'Category' },
    { id: 'featured', label: 'Featured' },
    { id: 'actions', label: 'Actions' }
];
  
  return (
    <motion.div
    className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
    initial={{opacity: 0, y: 20}}
    animate={{opacity: 1, y: 0}}
    transition={{duration: 0.8}}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className='bg-gray-700'>
            <tr>
              {tableHeaders.map((header) => (
                <th
                key={header.id}
                scope="col"
                className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
              >
                {header.label}
              </th>
              ))}
            </tr>
          </thead>
          
          <tbody className='bg-gray-800 divide-y divide-gray-700'>
            {products?.map((product) => (
                          <ProductTableRow
                              key={product._id}
                              product={product}
                              onToggleFeatured={toggleFeaturedProduct}
                              onDelete={deleteProduct}
                          />
                      ))}
				</tbody>

      </table>
    </motion.div>
  )
}

export default ProductsList
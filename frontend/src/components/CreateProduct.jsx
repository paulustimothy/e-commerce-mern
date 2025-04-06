import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import FormInputProduct from "./FormInputProduct";
import { createProductFields } from "../utils/formFields";
import { useProductStore } from "../stores/useProductStore";

const CreateProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const {createProduct, loading} = useProductStore();

  const handleChange = (field) => (e) => {
    if(field === "image"){
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({...formData, [field]: reader.result})
            }
            reader.readAsDataURL(file);
        }
    } else{
        setFormData({...formData, [field]: e.target.value})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProduct(formData);
    setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
    })
  }
  
    return (
            <motion.div
            className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            >
            <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
                Create New Product
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
            {createProductFields.map(field => (
                    <FormInputProduct
                        key={field.id}
                        {...field}
                        value={formData[field.id]}
                        onChange={handleChange(field.id)}
                    />
                ))}
                <button
                    type='submit'
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                    shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50'
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader className='mr-2 h-5 w-5 animate-spin' />
                            Loading...
                        </>
                    ) : (
                        <>
                            <PlusCircle className='mr-2 h-5 w-5' />
                            Create Product
                        </>
                    )}
                </button>
            </form>
            </motion.div>
  )
}

export default CreateProduct
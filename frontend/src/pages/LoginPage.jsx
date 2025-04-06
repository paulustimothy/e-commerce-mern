import { useState } from "react"
import { Link } from "react-router-dom"
import { LogIn, ArrowRight, Loader } from "lucide-react"
import { motion } from "framer-motion"
import FormInputAuth from "../components/FormInputAuth"
import {loginFields} from "../utils/formFields.js"
import { useUserStore } from "../stores/useUserStore.js"

const LoginPage = () => {
    const [emailOrName, setEmailOrName] = useState("");
    const [password, setPassword] = useState("");
    
    const handleEmailChange = (e) => {
        setEmailOrName(e.target.value)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
    }

    const {login, loading} = useUserStore(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        login({emailOrName, password})
    }

  return (
    <div className="flex flex-col justfiy-center py-12 sm:px-6 lg:px-8">
        <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        >
            <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">Login to your account</h2>
        </motion.div>

        <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        >
            <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {loginFields.map(field => (
                        <FormInputAuth
                            key={field.id}
                            {...field}
                            value={field.id === "emailOrName" ? emailOrName : password}
                            onChange={field.id === "emailOrName" ? handleEmailChange : handlePasswordChange}
                        />
                    ))}
                    <button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
									Loading...
								</>
							) : (
								<>
									<LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
									Login
								</>
							)}
						</button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Don't have an account?{" "} 
                    <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">Sign up here <ArrowRight className="inline h-4 w-4"/>
                    </Link>
                </p>
            </div>
        </motion.div>
    </div>
  )
}

export default LoginPage
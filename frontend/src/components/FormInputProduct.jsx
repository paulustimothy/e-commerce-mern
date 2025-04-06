//TODO learn all the props
const FormInputProduct = ({ 
    label, 
    id, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon,
    required = false,
    isTextArea = false,
    isSelect = false,
    options = [],
    step,
    accept,
    isFileInput = false
}) => {
    return (
        <div>
            <label htmlFor={id} className='block text-sm font-medium text-gray-300'>
                {label}
            </label>
            
            {isFileInput ? (
                <div className='mt-1 flex items-center'>
                    <input 
                        type='file' 
                        id={id} 
                        className='sr-only' 
                        accept={accept}
                        onChange={onChange}
                    />
                    <label
                        htmlFor={id}
                        className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md 
                        shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                    >
                        {Icon && <Icon className='h-5 w-5 inline-block mr-2' />}
                        Upload Image
                    </label>
                    {value && <span className='ml-3 text-sm text-gray-400'>Image uploaded</span>}
                </div>
            ) : (
                <div className="mt-1 relative rounded-md shadow-sm">
                    {Icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className="h-5 w-5 text-gray-400" />
                        </div>
                    )}

                    {isSelect ? (
                        <select
                            id={id}
                            value={value}
                            onChange={onChange}
                            className={`block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
                            py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
                            focus:border-emerald-500 ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
                            required={required}
                        >
                            <option value=''>Select a category</option>
                            {options.map((option) => (
                                <option 
                                    key={option} 
                                    value={option}
                                    className="bg-gray-700"
                                >
                                    {option}
                                </option>
                            ))}
                        </select>
                    ) : isTextArea ? (
                        <div className="relative">
                            {Icon && (
                                <div className="absolute top-3 left-3">
                                    <Icon className="h-5 w-5 text-gray-400" />
                                </div>
                            )}
                            <textarea
                                id={id}
                                value={value}
                                onChange={onChange}
                                rows='3'
                                className={`block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
                                py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                focus:border-emerald-500 ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
                                placeholder={placeholder}
                                required={required}
                            />
                        </div>
                    ) : (
                        <input
                            type={type}
                            id={id}
                            value={value}
                            onChange={onChange}
                            step={step}
                            className={`block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm 
                            py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 
                            focus:border-emerald-500 ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
                            placeholder={placeholder}
                            required={required}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default FormInputProduct;
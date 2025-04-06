import { User, Mail, Lock, Upload, DollarSign, Tag } from 'lucide-react';

export const signUpFields = [
    {
        id: 'name',
        label: 'Full name',
        type: 'text',
        placeholder: 'John Doe',
        icon: User,
        required: true
    },
    {
        id: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        icon: Mail,
        required: true
    },
    {
        id: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        icon: Lock,
        required: true
    },
    {
        id: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: '••••••••',
        icon: Lock,
        required: true
    }
];

export const loginFields = [
    {
        id: 'emailOrName',
        label: 'Email or Name',
        type: 'text',
        placeholder: 'you@example.com',
        icon: Mail,
        required: true
    },
    {
        id: 'password',
        label: 'Password',
        type: 'password',
        placeholder: '••••••••',
        icon: Lock,
        required: true
    },
]

export const createProductFields = [
    {
        id: 'name',
        label: 'Product Name',
        type: 'text',
        placeholder: 'Enter product name',
        required: true
    },
    {
        id: 'description',
        label: 'Description',
        type: 'text',
        placeholder: 'Enter product description',
        required: true,
        isTextArea: true
    },
    {
        id: 'price',
        label: 'Price',
        type: 'number',
        placeholder: '0.00',
        icon: DollarSign,
        required: true,
        step: '0.01'
    },
    {
        id: 'category',
        label: 'Category',
        icon: Tag,
        required: true,
        isSelect: true,
        options: ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"]
    },
    {
        id: 'image',
        label: 'Product Image',
        type: 'file',
        icon: Upload,
        required: true,
        isFileInput: true,
        accept: 'image/*'
    }
];
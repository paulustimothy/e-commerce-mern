import { User, Mail, Lock } from 'lucide-react';

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

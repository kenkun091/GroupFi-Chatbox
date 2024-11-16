import React from 'react';
import { usePrivy } from '@privy-io/react';

const PrivyLoginButton = ({ disableLogin, handleLogin }) => {
    return (
        <button 
            disabled={disableLogin} 
            onClick={handleLogin} 
            className={`px-4 py-2 text-white ${disableLogin ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} rounded`}
        >
            Privy Login
        </button>
    );
};

export default PrivyLoginButton;

import React from 'react';

interface SpinnerProps {
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      {text && <span>{text}</span>}
    </div>
  );
};

export default Spinner;

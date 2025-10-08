'use client';

const Button = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  type = 'button',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

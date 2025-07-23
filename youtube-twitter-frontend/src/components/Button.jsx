import React from "react";

function Button({ 
    children, 
    className = "", 
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    bgColor,
    textColor,
    ...props 
}) {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-gradient-primary text-white hover:shadow-glow",
        secondary: "bg-bg-tertiary text-text-primary border border-border-secondary hover:bg-bg-hover hover:border-accent-primary",
        outline: "border-2 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white",
        ghost: "text-text-secondary hover:text-accent-primary hover:bg-bg-hover",
        danger: "bg-error text-white hover:bg-red-600",
        success: "bg-success text-white hover:bg-green-600"
    };
    
    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-sm rounded-xl",
        lg: "px-6 py-3 text-base rounded-xl",
        xl: "px-8 py-4 text-lg rounded-2xl"
    };

    const customStyles = {};
    if (bgColor) customStyles.backgroundColor = bgColor;
    if (textColor) customStyles.color = textColor;

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button 
            className={classes}
            style={Object.keys(customStyles).length > 0 ? customStyles : undefined}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="loading-spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
            )}
            {children}
        </button>
    );
}

export default Button;

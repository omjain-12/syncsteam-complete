import React, { useId, forwardRef } from "react";

const Input = forwardRef(function Input(
    { label, type = "text", className = "", error, ...props },
    ref
) {
    const id = useId();

    return (
        <div className="w-full">
            {label && (
                <label
                    className="inline-block mb-2 text-sm font-medium text-text-secondary"
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`input-modern w-full ${
                    error ? "border-error focus:border-error" : ""
                } ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
            {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </div>
    );
});

export default Input;

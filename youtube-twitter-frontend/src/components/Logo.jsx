import React from "react";
import { IoIosVideocam } from "react-icons/io";
import { Link } from "react-router-dom";

function Logo({ size = "28" }) {
    return (
        <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative bg-gradient-primary p-2 rounded-xl">
                    <IoIosVideocam
                        size={size}
                        className="text-white"
                    />
                </div>
            </div>
            <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                    STREAMIFY
                </h1>
                <p className="text-xs text-text-muted -mt-1">Share your story</p>
            </div>
        </Link>
    );
}

export default Logo;

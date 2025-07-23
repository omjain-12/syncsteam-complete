import React, { useState } from "react";
import { CiSearch } from "../icons";
import { useNavigate } from "react-router-dom";

function Search() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search/${encodeURIComponent(query.trim())}`);
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full input-modern pl-4 pr-12 py-3 text-sm placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary/20"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 text-text-muted hover:text-accent-primary transition-colors rounded-lg hover:bg-bg-hover"
                >
                    <CiSearch size={20} />
                </button>
            </div>
        </form>
    );
}

export default Search;

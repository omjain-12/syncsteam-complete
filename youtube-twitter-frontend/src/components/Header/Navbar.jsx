import React, { useState } from "react";
import { Search, Button, Logo, SearchForSmallScreen } from "../index.js";
import { Link } from "react-router-dom";
import {
    IoCloseCircleOutline,
    BiLike,
    CiSearch,
    HiOutlineVideoCamera,
    SlMenu,
} from "../icons.js";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { userLogout } from "../../store/Slices/authSlice.js";

function Navbar() {
    const [toggleMenu, setToggleMenu] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const authStatus = useSelector((state) => state.auth.status);
    const username = useSelector((state) => state.auth?.userData?.username);
    const profileImg = useSelector((state) => state.auth.userData?.avatar.url);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = async () => {
        await dispatch(userLogout());
        navigate("/");
    };

    const sidePanelItems = [
        {
            icon: <BiLike size={25} />,
            title: "Liked Videos",
            url: "/liked-videos",
        },
        {
            icon: <HiOutlineVideoCamera size={25} />,
            title: "My Content",
            url: `/channel/${username}`,
        },
    ];

    return (
        <>
            <nav className="w-full bg-bg-secondary/95 backdrop-blur-xl border-b border-border-primary">
                <div className="flex justify-between items-center px-4 sm:px-6 py-3">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <Logo />
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden sm:block flex-1 max-w-2xl mx-8">
                        <Search />
                    </div>

                    {/* Search Icon - Mobile */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setOpenSearch(true)}
                            className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                        >
                            <CiSearch size={24} />
                        </button>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {authStatus ? (
                            <div className="flex items-center gap-3">
                                {/* Profile Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 p-2 rounded-full hover:bg-bg-hover transition-colors">
                                        <img
                                            src={profileImg}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-accent-primary/30"
                                        />
                                        <span className="hidden md:block text-sm font-medium text-text-primary">
                                            {username}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card rounded-xl border border-border-primary shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="p-2">
                                            {sidePanelItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    to={item.url}
                                                    className="flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-accent-primary hover:bg-bg-hover rounded-lg transition-all"
                                                >
                                                    {item.icon}
                                                    <span className="text-sm">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            ))}
                                            <hr className="my-2 border-border-primary" />
                                            <button
                                                onClick={logout}
                                                className="flex items-center gap-3 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-all w-full text-left"
                                            >
                                                <IoMdLogOut size={20} />
                                                <span className="text-sm">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link to="/login">
                                    <Button className="btn-secondary text-sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="btn-primary text-sm">
                                        Sign up
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setToggleMenu(!toggleMenu)}
                            className="sm:hidden p-2 text-text-secondary hover:text-accent-primary transition-colors"
                        >
                            <SlMenu size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {toggleMenu && (
                    <div className="sm:hidden bg-bg-tertiary border-t border-border-primary">
                        <div className="p-4 space-y-2">
                            {!authStatus ? (
                                <div className="flex gap-2">
                                    <Link to="/login" className="flex-1">
                                        <Button className="btn-secondary w-full text-sm">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/signup" className="flex-1">
                                        <Button className="btn-primary w-full text-sm">
                                            Sign up
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sidePanelItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            to={item.url}
                                            className="flex items-center gap-3 px-3 py-3 text-text-secondary hover:text-accent-primary hover:bg-bg-hover rounded-lg transition-all"
                                            onClick={() => setToggleMenu(false)}
                                        >
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => {
                                            logout();
                                            setToggleMenu(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-3 text-error hover:bg-error/10 rounded-lg transition-all w-full text-left"
                                    >
                                        <IoMdLogOut size={20} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Search Overlay */}
            {openSearch && (
                <SearchForSmallScreen
                    open={openSearch}
                    setOpenSearch={setOpenSearch}
                />
            )}
        </>
    );
}

export default Navbar;

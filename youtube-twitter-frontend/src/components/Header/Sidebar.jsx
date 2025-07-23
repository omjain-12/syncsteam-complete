import React from "react";
import {
    BiHistory,
    BiLike,
    CiSettings,
    HiOutlineVideoCamera,
    IoFolderOutline,
    RiHome6Line,
    TbUserCheck,
} from "../icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoMdLogOut } from "react-icons/io";
import { userLogout } from "../../store/Slices/authSlice";

function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.auth?.userData?.username);
    
    const sidebarTopItems = [
        {
            icon: <RiHome6Line size={22} />,
            title: "Home",
            url: "/",
        },
        {
            icon: <BiLike size={22} />,
            title: "Liked Videos",
            url: "/liked-videos",
        },
        {
            icon: <BiHistory size={22} />,
            title: "History",
            url: "/history",
        },
        {
            icon: <HiOutlineVideoCamera size={22} />,
            title: "My Content",
            url: `/channel/${username}`,
        },
        {
            icon: <IoFolderOutline size={22} />,
            title: "Collections",
            url: "/collections",
        },
        {
            icon: <TbUserCheck size={22} />,
            title: "Subscriptions",
            url: "/subscriptions",
        },
    ];

    const bottomBarItems = [
        {
            icon: <RiHome6Line size={22} />,
            title: "Home",
            url: "/",
        },
        {
            icon: <BiHistory size={22} />,
            title: "History",
            url: "/history",
        },
        {
            icon: <IoFolderOutline size={22} />,
            title: "Collections",
            url: "/collections",
        },
        {
            icon: <TbUserCheck size={22} />,
            title: "Subscriptions",
            url: "/subscriptions",
        },
    ];

    const logout = async () => {
        await dispatch(userLogout());
        navigate("/");
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden sm:block w-64 lg:w-72 h-full bg-bg-secondary border-r border-border-primary">
                <div className="flex flex-col h-full p-4">
                    {/* Navigation Items */}
                    <div className="flex-1 space-y-1">
                        {sidebarTopItems.map((item) => (
                            <NavLink
                                key={item.title}
                                to={item.url}
                                className={({ isActive }) =>
                                    `sidebar-item flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-accent-primary transition-all relative ${
                                        isActive ? "active text-accent-primary bg-accent-primary/10" : ""
                                    }`
                                }
                            >
                                <span className="relative z-10">{item.icon}</span>
                                <span className="font-medium relative z-10 hidden lg:block">
                                    {item.title}
                                </span>
                                {/* Active indicator */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-primary rounded-full opacity-0 transition-opacity" />
                            </NavLink>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-border-primary pt-4 space-y-1">
                        <div className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-accent-primary transition-all cursor-pointer">
                            <CiSettings size={22} />
                            <span className="font-medium hidden lg:block">Settings</span>
                        </div>
                        
                        {username && (
                            <button
                                onClick={logout}
                                className="sidebar-item flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-error transition-all w-full text-left"
                            >
                                <IoMdLogOut size={22} />
                                <span className="font-medium hidden lg:block">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-primary">
                <div className="grid grid-cols-4 h-16">
                    {bottomBarItems.map((item) => (
                        <NavLink
                            key={item.title}
                            to={item.url}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-1 text-text-muted hover:text-accent-primary transition-colors ${
                                    isActive ? "text-accent-primary" : ""
                                }`
                            }
                        >
                            {item.icon}
                            <span className="text-xs font-medium">{item.title}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Sidebar;

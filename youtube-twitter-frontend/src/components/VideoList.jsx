import React from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../helpers/timeAgo";

function VideoList({
    thumbnail,
    duration,
    title,
    views = 0,
    avatar,
    channelName,
    createdAt,
    videoId,
}) {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views) => {
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
    };

    return (
        <div className="video-card group fade-in">
            <Link to={`/watch/${videoId}`} className="block">
                {/* Thumbnail Container */}
                <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Duration Badge */}
                    {duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                            {formatDuration(duration)}
                        </div>
                    )}
                    
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Channel Info */}
                    {channelName && avatar && (
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={avatar}
                                alt={channelName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-border-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors">
                                    {channelName}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Video Title */}
                    <h3 className="text-text-primary font-semibold text-base line-clamp-2 mb-2 group-hover:text-accent-primary transition-colors">
                        {title}
                    </h3>

                    {/* Video Stats */}
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                        <span>{formatViews(views)} views</span>
                        <span>•</span>
                        <span>{timeAgo(createdAt)}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default VideoList;

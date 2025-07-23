import React, { useEffect, useState } from "react";
import { VideoList, Container, Loader } from "../components";
import { getAllVideos } from "../store/Slices/videoSlice";
import { useDispatch, useSelector } from "react-redux";

function HomePage() {
    const dispatch = useDispatch();
    const { videos, loading } = useSelector((state) => state.video);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(getAllVideos({ page }));
    }, [dispatch, page]);

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader size="lg" />
                    <p className="text-text-muted">Loading amazing videos...</p>
                </div>
            </div>
        );
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                        Discover Amazing Content
                    </h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Explore the latest videos from creators around the world. Find something new to watch today.
                    </p>
                </div>

                {/* Video Grid */}
                {videos?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoList
                                key={video._id}
                                videoId={video._id}
                                thumbnail={video.thumbnail?.url}
                                duration={video.duration}
                                title={video.title}
                                views={video.views}
                                avatar={video.ownerDetails?.avatar?.url}
                                channelName={video.ownerDetails?.username}
                                createdAt={video.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📹</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            No videos found
                        </h3>
                        <p className="text-text-muted">
                            Be the first to upload some amazing content!
                        </p>
                    </div>
                )}

                {/* Load More Button */}
                {videos?.length > 0 && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            disabled={loading}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {loading && <Loader size="sm" />}
                            Load More Videos
                        </button>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default HomePage;
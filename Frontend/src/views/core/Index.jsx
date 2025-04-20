import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Toast from "../../plugin/Toast";
import Moment from "../../plugin/Moment";
import Masonry from "react-masonry-css";

function Index() {
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        fetchPosts();
        fetchCategory();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await apiInstance.get(`postlist/`);
            setPosts(response.data);
        } catch (error) {
            Toast("error", "Failed to fetch posts", "");
        }
    };

    const fetchCategory = async () => {
        try {
            const response = await apiInstance.get(`post/category/list/`);
            setCategory(response.data);
        } catch (error) {
            Toast("error", "Failed to fetch categories", "");
        }
    };

    const breakpointColumns = {
        default: 4,
        1024: 3,
        768: 2,
        500: 1,
    };

    const filteredPosts =
        selectedCategory === "All"
            ? posts
            : posts.filter((post) => post.category.title === selectedCategory);

    // Function to extract a thumbnail for video (use a placeholder or the first frame of the video)
    const getThumbnail = (videoUrl) => {
        // Here you can replace it with a library or API to fetch a real thumbnail, if needed.
        return `https://img.youtube.com/vi/${videoUrl}/hqdefault.jpg`; // Example for YouTube videos
    };

    return (
        <div>
            <Header />

            {/* Category Navigation */}
            <div className="category-nav">
                <button
                    className={selectedCategory === "All" ? "active" : ""}
                    onClick={() => setSelectedCategory("All")}
                >
                    All
                </button>
                {category.map((c, index) => (
                    <button
                        key={index}
                        className={selectedCategory === c.title ? "active" : ""}
                        onClick={() => setSelectedCategory(c.title)}
                    >
                        {c.title}
                    </button>
                ))}
            </div>

            {/* Pinterest-Style Masonry Grid Layout */}
            <section className="p-4">
                <div className="masonry-container">
                    <Masonry
                        breakpointCols={breakpointColumns}
                        className="masonry-grid"
                        columnClassName="masonry-column"
                    >
                        {filteredPosts.map((p, index) => (
                            <div className="card pinterest-card" key={index}>
                                {/* Check if there's a video */}
                                {p.video ? (
                                    <img
                                        className="card-img"
                                        src={getThumbnail(p.video)} // Display video thumbnail
                                        alt={p.title}
                                    />
                                ) : (
                                    <img className="card-img" src={p.image} alt={p.title} />
                                )}
                                <div className="card-body">
                                    <h4 className="card-title">
                                        <Link to={`/${p.slug}`} className="btn-link text-reset text-decoration-none">
                                            {p.title}
                                        </Link>
                                    </h4>
                                    <p className="text-muted">
                                        <i className="fas fa-calendar"></i> {Moment(p.date)}
                                    </p>
                                    <p className="text-muted">
                                        <i className="fas fa-eye"></i> {p?.view} Views
                                    </p>
                                </div>
                            </div>
                        ))}
                    </Masonry>
                </div>
            </section>

            <Footer />

            {/* CSS Styles for Masonry Grid and Cards */}
            <style>
                {`
                .masonry-container {
                    width: 80%;
                    margin: 0 auto;
                }
                .masonry-grid {
                    display: flex;
                    width: 100%;
                }
                .masonry-column {
                    padding-left: 24px;
                    background-clip: padding-box;
                }

                .pinterest-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin-bottom: 24px;
                    transition: transform 0.2s;
                    width: 100%;
                }
                .pinterest-card:hover {
                    transform: scale(1.05);
                }
                .pinterest-card img {
                    width: 100%;
                    border-radius: 16px 16px 0 0;
                    object-fit: cover;
                }
                .pinterest-card .card-body {
                    padding: 12px;
                }

                .category-nav {
                    display: flex;
                    gap: 10px;
                    padding: 10px;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .category-nav button {
                    border: none;
                    background: none;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 5px 10px;
                }
                .category-nav .active {
                    border-bottom: 2px solid black;
                    font-weight: bold;
                }
                `}
            </style>
        </div>
    );
}

export default Index;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";

function Posts() {
    const [posts, setPosts] = useState([]);
    const userId = useUserData()?.user_id;

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await apiInstance.get(`post-list/${userId}/`);
            setPosts(response?.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            fetchPosts();
            return;
        }
        setPosts(posts.filter(post => post.title.toLowerCase().includes(query)));
    };

    const handleSortChange = (e) => {
        const sortValue = e.target.value;
        let sortedPosts = [...posts];

        if (sortValue === "Newest") {
            sortedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortValue === "Oldest") {
            sortedPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (["Active", "Draft", "Disabled"].includes(sortValue)) {
            sortedPosts = posts.filter(post => post.status === sortValue);
        } else {
            fetchPosts();
            return;
        }
        setPosts(sortedPosts);
    };

    return (
        <>
            <Header />
            <section className="py-4">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card border bg-transparent rounded-3">
                                <div className="card-header bg-transparent border-bottom p-3 d-sm-flex justify-content-between align-items-center">
                                    <h5 className="mb-2 mb-sm-0">
                                        All Posts <span className="badge bg-primary bg-opacity-10 text-primary">{posts?.length}</span>
                                    </h5>
                                    <a href="/add-post/" className="btn btn-sm btn-primary mb-0">
                                        Add New <i className="fas fa-plus"></i>
                                    </a>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3 align-items-center justify-content-between mb-3">
                                        <div className="col-md-8">
                                            <input onChange={handleSearch} className="form-control pe-5 bg-transparent" type="search" placeholder="Search Articles" aria-label="Search" />
                                        </div>
                                        <div className="col-md-3">
                                            <select onChange={handleSortChange} className="form-select z-index-9 bg-transparent" aria-label="Sort">
                                                <option value="">Sort by</option>
                                                <option value="Newest">Newest</option>
                                                <option value="Oldest">Oldest</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="table-responsive border-0">
                                        <table className="table align-middle table-hover">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Name</th>
                                                    <th>Views</th>
                                                    <th>Date</th>
                                                    <th>Category</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {posts?.map(post => (
                                                    <tr key={post.id}>
                                                        <td>
                                                            <Link to={`/detail/${post.slug}/`}>
                                                                <img src={post.image} className="img-thumbnail" alt="" style={{ width: 100, height: 100, objectFit: "cover" }} />
                                                            </Link>
                                                        </td>
                                                        <td>
                                                            <Link to={`/detail/${post.slug}/`} className="text-dark text-decoration-none">
                                                                {post.title}
                                                            </Link>
                                                        </td>
                                                        <td>{post.view} Views</td>
                                                        <td>{moment(post.date).format("DD MMM, YYYY")}</td>
                                                        <td>{post.category?.title}</td>
                                                        <td>
                                                            <span className="badge bg-dark bg-opacity-10 text-dark">{post.status}</span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Link to={`/edit-post/${post.id}/`} className="btn btn-primary btn-sm" title="Edit">
                                                                    <i className="bi bi-pencil-square" />
                                                                </Link>
                                                                <button className="btn btn-danger btn-sm" title="Delete">
                                                                    <i className="bi bi-trash" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Posts;

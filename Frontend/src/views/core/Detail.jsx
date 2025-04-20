import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useParams } from "react-router-dom";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment";
import Toast from "../../plugin/Toast";
import useUserData from "../../plugin/useUserData";

function Detail() {
    const [post, setPost] = useState([]);
    const [tags, setTags] = useState([]);
    const [createComment, setCreateComment] = useState({ comment: "" });
    const [taggedUsers, setTaggedUsers] = useState([]);
    const param = useParams();
    const userData = useUserData();

    const fetchPost = async () => {
        const response = await apiInstance.get(`/postdetail/${param.slug}/`);
        setPost(response.data);
        setTaggedUsers(response?.data?.tagged_users || []);
        const tagArray = response?.data?.tags?.split(",");
        setTags(tagArray);
    };

    useEffect(() => {
        fetchPost();
    }, []);

    const handleCreateCommentChange = (event) => {
        setCreateComment({
            ...createComment,
            [event.target.name]: event.target.value,
        });
    };

    const handleCreateCommentSubmit = async (e) => {
        e.preventDefault();

        if (!post?.id) {
            Toast("error", "Post not found.", "");
            return;
        }

        if (!userData || !userData.email) {
            Toast("error", "You must be logged in to post a comment.", "");
            return;
        }

        const jsonData = {
            post_id: post?.id,
            name: userData.full_name,
            email: userData.email,
            comment: createComment.comment,
        };

        try {
            const response = await apiInstance.post(`viewcomment/`, jsonData);
            if (response.status === 201) {
                Toast("success", "Comment Posted.", "");
                fetchPost();
                setCreateComment({ comment: "" });
            } else {
                Toast("error", "Failed to post comment.", "");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
            Toast("error", "An error occurred while posting the comment.", "");
        }
    };

    const handleLikePost = async () => {
        const json = {
            user_id: 1,
            post_id: post?.id,
        };

        const response = await apiInstance.post(`likepost/`, json);
        Toast("success", response.data.message);
        fetchPost();
    };

    return (
        <>
            <Header />
            <section className="mt-5">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <a href="#" className="badge bg-danger mb-2 text-decoration-none">
                                <i className="small fw-bold" />
                                Vincent
                            </a>
                            <h1 className="text-center" style={{ fontSize: "2.5rem", color: "#333", textTransform: "uppercase", letterSpacing: "2px" }}>
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt-0">
                <div className="container position-relative" data-sticky-container="">
                    <div className="row">
                        <div className="col-lg-2">
                            <div className="text-start text-lg-center mb-5" data-sticky="" data-margin-top={80} data-sticky-for={991}>
                                <div className="position-relative">
                                    <div className="avatar avatar-xl">
                                        <img
                                            className="avatar-img"
                                            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
                                            src={post?.profile?.image}
                                            alt="avatar"
                                        />
                                    </div>
                                    <a href="#" className="h5 fw-bold text-dark text-decoration-none mt-2 mb-0 d-block">
                                        {post?.profile?.full_name}
                                    </a>
                                    <p>{post?.profile?.bio || ""}</p>
                                </div>

                                {taggedUsers.length > 0 && (
                                    <div className="my-4">
                                        <h5>Tagged Users:</h5>
                                        <ul className="list-unstyled">
                                            {taggedUsers.map((user, index) => (
                                                <li key={index} className="fw-bold">
                                                    <i className="fas fa-user text-primary me-2"></i> {user.full_name} ({user.email})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <hr className="d-none d-lg-block" />
                                <ul className="list-inline list-unstyled">
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <i className="fas fa-calendar"></i> {Moment(post.date)}
                                    </li>
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <a href="#" className="text-body">
                                            <i className="fas fa-heart me-1" />
                                        </a>
                                        {post?.likes?.length} Likes
                                    </li>
                                    <li className="list-inline-item d-lg-block my-lg-2 text-start">
                                        <i className="fas fa-eye" />
                                        {post.view} Views
                                    </li>
                                </ul>

                                <ul className="list-inline text-primary-hover mt-0 mt-lg-3 text-start">
                                    {tags?.map((tag, index) => (
                                        <li className="list-inline-item" key={index}>
                                            <a className="text-body text-decoration-none fw-bold" href="#">
                                                #{tag}
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={handleLikePost} className="btn btn-primary">
                                    <i className="fas fa-thumbs-up me-2"></i>
                                    {post?.likes?.length}
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-lg-10 mb-5">
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                                {post.video ? (
                                    <video
                                        controls
                                        style={{ width: 800, height: 800, objectFit: "cover" }}
                                        className="img-thumbnail"
                                    >
                                        <source src={post.video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : post.image ? (
                                    <img
                                        src={post.image}
                                        className="img-thumbnail"
                                        alt=""
                                        style={{ width: 800, height: 800, objectFit: "cover" }}
                                    />
                                ) : null}
                            </div>

                            <p>{post.description}</p>

                            <div>
                                <h3>{post?.comments?.length} comments</h3>
                                {post?.comments?.map((c, index) => (
                                    <div className="my-4 d-flex bg-light p-3 mb-3 rounded" key={index}>
                                        <div>
                                            <div className="mb-2">
                                                <h5 className="m-0">{c?.name}</h5>
                                                <span className="me-3 small">{Moment(c?.date)}</span>
                                            </div>
                                            <p className="fw-bold">{c?.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-light p-3 rounded">
                                <h3 className="fw-bold">Leave a comment</h3>
                                <form className="row g-3 mt-2" onSubmit={handleCreateCommentSubmit}>
                                    <div className="col-12">
                                        <label className="form-label">Write Comment *</label>
                                        <textarea
                                            onChange={handleCreateCommentChange}
                                            value={createComment.comment}
                                            name="comment"
                                            className="form-control"
                                            rows={4}
                                            placeholder="Write your comment here..."
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary">
                                            Post comment <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Detail;

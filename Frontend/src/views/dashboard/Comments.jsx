import { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link } from "react-router-dom";
import useUserData from "../../plugin/useUserData";
import apiInstance from "../../utils/axios";
import Moment from "../../plugin/Moment"
import Toast from "../../plugin/Toast"

function Comments() {

    const [comments, setComments] = useState([])
    const userId = useUserData()?.user_id;
    const [reply, setReply] = useState("");

    const fetchComment = async () => {
        const comment_res = await apiInstance.get(`CommentList/${userId}/`);
        setComments(comment_res.data);
    }

    useEffect(() => {
        fetchComment();
    }, [])


    const handleSubmitReply = async (commentId) => {
        try {
            const response = await apiInstance.post(`CommentReply/`, {
                comment_id: commentId,
                reply: reply,
            });
            console.log(response.data);
            fetchComment();
            Toast("Success", "Reply Sent.", "");
            setReply("");

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Header />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div className="row mt-0 mt-md-4">
                        <div className="col-lg-12 col-md-8 col-12">
                            {/* Card */}
                            <div className="card mb-4">
                                {/* Card header */}
                                <div className="card-header d-lg-flex align-items-center justify-content-between">
                                    <div className="mb-3 mb-lg-0">
                                        <h3 className="mb-0">Comments</h3>
                                        <span>You have full control to manage your own comments.</span>
                                    </div>
                                </div>
                                {/* Card body */}
                                <div className="card-body">
                                    {/* List group */}
                                    <ul className="list-group list-group-flush">
                                        {/* List group item */}
                                        {comments?.map((c, index) => (
                                            <li className="list-group-item p-4 shadow rounded-3 mb-4">
                                                <div className="d-flex">
                                                    <img src="https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg" alt="avatar" className="rounded-circle avatar-lg" style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" }} />
                                                    <div className="ms-3 mt-2">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h4 className="mb-0">{c.name}</h4>
                                                                <span>{Moment(c.date)}</span>
                                                            </div>
                                        
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="mt-2">
                                                                <span className="fw-bold me-2">
                                                                    Comment <i className="fas fa-arrow-right"></i>
                                                                </span>
                                                                {c.comment}
                                                            </p>
                                                            <p className="mt-2">
                                                                <span className="fw-bold me-2">
                                                                    Response <i className="fas fa-arrow-right"></i>
                                                                </span>
                                                                {c.reply || "No reply"}
                                                            </p>
                                                            <p>
                                                            <button class="btn btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target={`#collapseExample${c.id}`} aria-expanded="false" aria-controls={`collapseExample${c.id}`}>
                                                                    Send Response
                                                                </button>
                                                            </p>
                                                            <div class="collapse" id={`collapseExample${c.id.toString()}`}>
                                                                <div class="card card-body">
                                                                    <div>
                                                                        <div class="mb-3">
                                                                            <label for="exampleInputEmail1" class="form-label">
                                                                                Write Response
                                                                            </label>
                                                                            <textarea onChange={(e) => setReply(e.target.value)} value={reply} name="" id="" cols="30" className="form-control" rows="4"></textarea>
                                                                        </div>

                                                                        <button onClick={() => handleSubmitReply(c.id)} type="submit" class="btn btn-primary">
                                                                            Send Response <i className="fas fa-paper-plane"> </i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
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

export default Comments;

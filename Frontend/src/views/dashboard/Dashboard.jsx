import { useState, useEffect } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import moment from "moment";

function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [bookings, setBookings] = useState({});
    const userId = useUserData()?.user_id;

    const fetchEventList = async () => {
        const post_res = await apiInstance.get(`eventlist/${userId}/`);
        setPosts(post_res.data);
    };

    const toggleBookingDropdown = async (eventId) => {
        if (expandedRow === eventId) {
            setExpandedRow(null);
        } else {
            setExpandedRow(eventId);
            if (!bookings[eventId]) {
                const res = await apiInstance.get(`/bookings/${eventId}/`);
                setBookings((prev) => ({ ...prev, [eventId]: res.data }));
            }
        }
    };

    useEffect(() => {
        fetchEventList();
    }, []);

    return (
        <>
            <Header />
            <section className="py-4">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="card border bg-transparent rounded-3">
                                <div className="card-header bg-transparent border-bottom p-3">
                                    <div className="d-sm-flex justify-content-between align-items-center">
                                        <h5 className="mb-2 mb-sm-0">
                                            All Events <span className="badge bg-primary bg-opacity-10 text-primary">{posts.length}</span>
                                        </h5>
                                        <a href="/eventbooking/" className="btn btn-sm btn-primary mb-0">
                                            Add New <i className="fas fa-plus"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive border-0">
                                        <table className="table align-middle mb-0 table-hover">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Date</th>
                                                    <th>Start Time</th>
                                                    <th>End Time</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {posts.map((p) => (
                                                    <>
                                                        <tr key={p.id}>
                                                            <td>{p?.title}</td>
                                                            <td>{moment(p?.date).format("DD MMM, YYYY")}</td>
                                                            <td>{p?.start_time ? moment(p.start_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</td>
                                                            <td>{p?.end_time ? moment(p.end_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</td>
                                                            <td>
                                                                <span className="badge bg-dark bg-opacity-10 text-dark mb-2">{p?.status}</span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={() => toggleBookingDropdown(p.id)}
                                                                    >
                                                                        <i className="bi bi-pencil-square" /> Edit
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {expandedRow === p.id && (
                                                            <tr className="bg-light">
                                                                <td colSpan="6">
                                                                    <strong>Users who booked this event:</strong>
                                                                    <ul className="mt-2 mb-0">
                                                                        {bookings[p.id]?.length > 0 ? (
                                                                            bookings[p.id].map((user, idx) => (
                                                                                <li key={idx}>
                                                                                    {user.username} ({user.email})
                                                                                </li>
                                                                            ))
                                                                        ) : (
                                                                            <li>No bookings for this event.</li>
                                                                        )}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
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

export default Dashboard;

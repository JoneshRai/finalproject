import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import { Link, useNavigate } from "react-router-dom";

import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";
import Toast from "../../plugin/Toast";
import Swal from "sweetalert2";

function Eventbooking() {
    const [event, setCreateEvent] = useState({
        image: "",
        title: "",
        description: "",
        category: "",
        location: "",
        event_date: "",
        start_time: "",
        end_time: "",
        status: "Upcoming",
    });
    const [imagePreview, setImagePreview] = useState("");
    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const userId = useUserData()?.user_id;
    const navigate = useNavigate();

    const fetchCategory = async () => {
        const response = await apiInstance.get(`post/category/list/`);
        setCategoryList(response.data);
        console.log(response.data);
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleCreateEventChange = (e) => {
        setCreateEvent((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };
    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        const reader = new FileReader();
    
        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
            reader.onloadend = () => {
                setCreateEvent((prevState) => ({
                    ...prevState,
                    image: {
                        file: selectedFile,
                        preview: reader.result,
                    },
                }));
                setImagePreview(reader.result);
            };
        }
    };

    const handleCreateEvent = async (e) => {
        setIsLoading(true);
        e.preventDefault();
    
        // Ensure all required fields are filled
        if (!event.title || !event.description || !event.image?.file || !event.category || !event.event_date || !event.location || !event.start_time || !event.end_time) {
            Toast("error", "All Fields Are Required To Create An Event");
            setIsLoading(false);
            return;
        }
    
        const jsonData = {
            user_id: userId,
            title: event.title,
            image: event.image.file,
            description: event.description,
            category: event.category,
            event_date: event.event_date,
            location: event.location,
            start_time: event.start_time,
            end_time: event.end_time,
            event_status: event.status,
        };
    
        const formdata = new FormData();
    
        formdata.append("user_id", userId);
        formdata.append("title", event.title);
        formdata.append("image", event.image.file);
        formdata.append("description", event.description);
        formdata.append("category", event.category);
        formdata.append("event_date", event.event_date);
        formdata.append("location", event.location);
        formdata.append("start_time", event.start_time);
        formdata.append("end_time", event.end_time);
        formdata.append("event_status", event.status);
    
        try {
            const response = await apiInstance.post("/events/", formdata, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response.data);
            setIsLoading(false);
            Swal.fire({
                icon: "success",
                title: "Event created successfully.",
            });
            navigate("/bookevent/");
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };
    

    return (
        <>
            <Header />
            <section className="pt-5 pb-5">
                <div className="container">
                    <div className="row mt-0 mt-md-4">
                        <div className="col-lg-12 col-md-8 col-12">
                            <>
                                <section className="py-4 py-lg-6 bg-primary rounded-3">
                                    <div className="container">
                                        <div className="row">
                                            <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                                                <div className="d-lg-flex align-items-center justify-content-between">
                                                    <div className="mb-4 mb-lg-0">
                                                        <h1 className="text-white mb-1">Create Event</h1>
                                                        <p className="mb-0 text-white lead">Use the builder below to create your event</p>
                                                    </div>
                                                    <div>
                                                        <Link to="/bookevent/" className="btn" style={{ backgroundColor: "white" }}>
                                                            <i className="fas fa-arrow-left"></i> Back to Eventbooking
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <form onSubmit={handleCreateEvent} className="pb-8 mt-5">
                                    <div className="card mb-3">
                                        <div className="card-header border-bottom px-4 py-3">
                                            <h4 className="mb-0">Basic Information</h4>
                                        </div>
                                        <div className="card-body">
                                            <label htmlFor="eventThumbnail" className="form-label">
                                                Preview
                                            </label>
                                            <img
                                                style={{ width: "100%", height: "330px", objectFit: "cover", borderRadius: "10px" }}
                                                className="mb-4"
                                                src={imagePreview || "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"}
                                                alt=""
                                            />
                                            <div className="mb-3">
                                                <label htmlFor="eventThumbnail" className="form-label">
                                                    Thumbnail
                                                </label>
                                                <input onChange={handleFileChange} name="image" id="eventThumbnail" className="form-control" type="file" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Event Title</label>
                                                <input onChange={handleCreateEventChange} name="title" className="form-control" type="text" placeholder="" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Event Type</label>
                                                <select name="category" onChange={handleCreateEventChange} className="form-select">
                                                    <option value="">-------------</option>
                                                    {categoryList?.map((c, index) => (
                                                        <option value={c?.id}>{c?.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Event Description</label>
                                                <textarea onChange={handleCreateEventChange} name="description" className="form-control" id="" cols="30" rows="10"></textarea>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Event Date</label>
                                                <input onChange={handleCreateEventChange} name="event_date" className="form-control" type="date" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Location</label>
                                                <input onChange={handleCreateEventChange} name="location" className="form-control" type="text" placeholder="Event Location" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Start Time</label>
                                                <input onChange={handleCreateEventChange} name="start_time" className="form-control" type="time" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">End Time</label>
                                                <input onChange={handleCreateEventChange} name="end_time" className="form-control" type="time" />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <select onChange={handleCreateEventChange} name="status" className="form-select" value={event.status}>
                                                    <option value="Upcoming">Upcoming</option>
                                                    <option value="Ongoing">Ongoing</option>
                                                    {/* <option value="Completed">Completed</option> */}
                                                </select>

                                            </div>
                                        </div>
                                    </div>

                                    {isLoading ? (
                                        <button className="btn btn-lg btn-secondary w-100 mt-2" disabled>
                                            Creating Event... <i className="fas fa-spinner fa-spin"></i>
                                        </button>
                                    ) : (
                                        <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                                            Create Event <i className="fas fa-check-circle"></i>
                                        </button>
                                    )}
                                </form>
                            </>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}

export default Eventbooking;

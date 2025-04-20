import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import apiInstance from "../../utils/axios";
import useUserData from "../../plugin/useUserData";


function Bookevent() {
  const navigate = useNavigate(); 
  const [events, setEvents] = useState([]);
  const userId = useUserData()?.user_id;

  const [show, setShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [numPeople, setNumPeople] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiInstance.get(`eventlist/`);
      setEvents(response?.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      fetchEvents();
      return;
    }
    setEvents(events.filter((event) => event.title.toLowerCase().includes(query)));
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    let sortedEvents = [...events];

    if (sortValue === "Newest") {
      sortedEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
    } else if (sortValue === "Oldest") {
      sortedEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    } else {
      fetchEvents();
      return;
    }
    setEvents(sortedEvents);
  };

  const handleShowModal = (event) => {
    if (!userId) { // Check if user is logged in
      navigate("/login/"); // Redirect to login if not logged in
      return;
    }
    setSelectedEvent(event);
    setShow(true);
  };

  const handleClose = () => setShow(false);

const buyFunction = async () => {
  try {
      const response = await axios.post("http://localhost:3000/payment", {
          amount: numPeople * (selectedEvent.price || 100), // Send amount
          event_title: selectedEvent.title, // Send event title
      });

      if (response.status === 200) {
          // Save the event title and amount in Django
          await axios.post( `http://localhost:8000/create-booking/${userId}/`, {
              event_title: selectedEvent.title,
              amount: numPeople * (selectedEvent.price || 100),
          });

          window.location.href = response.data.url;
      }
  } catch (error) {
      console.error("Error processing payment:", error);
  }
};

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <section className="py-4 flex-grow-1">
        <div className="container">
          <div className="row g-4">
            <div className="col-12">
              <div className="card border bg-transparent rounded-3">
                <div className="card-header bg-transparent border-bottom p-3 d-sm-flex justify-content-between align-items-center">
                  <h5 className="mb-2 mb-sm-0">
                    All Events <span className="badge bg-primary bg-opacity-10 text-primary">{events?.length}</span>
                  </h5>
                  <a href="/eventbooking/" className="btn btn-sm btn-primary mb-0">
                    Add New <i className="fas fa-plus"></i>
                  </a>
                </div>
                <div className="card-body">
                  <div className="row g-3 align-items-center justify-content-between mb-3">
                    <div className="col-md-8">
                      <input onChange={handleSearch} className="form-control pe-5 bg-transparent" type="search" placeholder="Search Events" />
                    </div>
                    <div className="col-md-3">
                      <select onChange={handleSortChange} className="form-select z-index-9 bg-transparent">
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
                          <th>Name</th>
                          <th>Date</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events?.map((event) => (
                          <tr key={event.id}>
                            <td>
                              <Link to={`/detail/${event.slug}/`} className="text-dark text-decoration-none">
                                {event.title}
                              </Link>
                            </td>
                            <td>{moment(event.event_date).format("DD MMM, YYYY")}</td>
                            <td>{event.start_time ? moment(event.start_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</td>
                            <td>{event.end_time ? moment(event.end_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</td>
                            <td>{event.location}</td>
                            <td>
                              <span className="badge bg-dark bg-opacity-10 text-dark">{event.status}</span>
                            </td>
                            <td>
                              <button onClick={() => handleShowModal(event)} className="btn btn-primary btn-sm" title="Book">
                                <i className="bi bi-pencil-square" /> Book
                              </button>
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

      {selectedEvent && (
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedEvent.title}</p>
            <p><strong>Date:</strong> {moment(selectedEvent.event_date).format("DD MMM, YYYY")}</p>
            <p><strong>Start Time:</strong> {selectedEvent.start_time ? moment(selectedEvent.start_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</p>
            <p><strong>End Time:</strong> {selectedEvent.end_time ? moment(selectedEvent.end_time, "HH:mm:ss").format("hh:mm A") : "N/A"}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <p><strong>Price per person:</strong> Rs.{selectedEvent.price || 100}</p>
            <div className="mb-3">
              <label className="form-label">Number of People:</label>
              <input
                type="number"
                className="form-control"
                value={numPeople}
                onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <h5>Total Amount: Rs.{numPeople * (selectedEvent.price || 100)}</h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button onClick={buyFunction}>Confirm Booking</Button>
          </Modal.Footer>
        </Modal>
      )}
      <Footer />
    </div>
  );
}

export default Bookevent;
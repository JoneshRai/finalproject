import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import logo from "../../assets/logo.png";

function Header() {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const [isLoggedIn, user] = useAuthStore((state) => [state.isLoggedIn, state.user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="navbar-dark bg-dark navbar-sticky header-static">
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img className="navbar-brand-item dark-mode-item" src={logo} style={{ width: "80px" }} alt="logo" />
          </Link>

          <button className="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span className="h6 d-none d-sm-inline-block text-white">Menu</span>
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarCollapse">
            {/* Search Bar */}
            <div className="nav mt-3 mt-lg-0 px-4 flex-nowrap align-items-center">
              <div className="nav-item" style={{ width: "400px" }}>
                <form className="rounded position-relative" onSubmit={handleSearch}>
                  <input
                    className="form-control pe-5 bg-light"
                    type="search"
                    placeholder="Search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button className="btn bg-transparent border-0 px-2 py-0 position-absolute top-50 end-0 translate-middle-y" type="submit">
                    <i className="bi bi-search fs-5"></i>
                  </button>
                </form>
              </div>
            </div>

            {/* Nav Links */}
            <ul className="navbar-nav navbar-nav-scroll ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="http://127.0.0.1:8000/">Messages</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle active" href="#" id="pagesMenu" data-bs-toggle="dropdown">Event</a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/eventbooking/"><i className="fa-solid fa-square-plus"></i> Create Event</Link></li>
                  <li><Link className="dropdown-item" to="/bookevent/"><i className="fa-solid fa-pen-to-square"></i> Book Event</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle active" href="#" id="pagesMenu" data-bs-toggle="dropdown">Dashboard</a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/dashboard/"><i className="fas fa-user"></i> Events</Link></li>
                  <li><Link className="dropdown-item" to="/posts/"><i className="bi bi-grid-fill"></i> Posts</Link></li>
                  <li><Link className="dropdown-item" to="/add-post/"><i className="fas fa-plus-circle"></i> Add Post</Link></li>
                  <li><Link className="dropdown-item" to="/comments/"><i className="bi bi-chat-left-quote-fill"></i> Comments</Link></li>
                  <li><Link className="dropdown-item" to="/profile/"><i className="fas fa-user-gear"></i> Profile</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                {isLoggedIn() ? (
                  <>
                    <Link to={"/logout/"} className="btn btn-danger ms-2">Logout <i className="fas fa-sign-out-alt"></i></Link>
                  </>
                ) : (
                  <>
                    <Link to={"/register/"} className="btn btn-primary">Register <i className="fas fa-user-plus"></i></Link>
                    <Link to={"/login/"} className="btn btn-success ms-2">Login <i className="fas fa-sign-in-alt"></i></Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

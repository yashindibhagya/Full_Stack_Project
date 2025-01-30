import React, { Component } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/img/svg/Logoi.png";
import { FaAlignRight, FaUserCircle } from "react-icons/fa";

export default class Navbar extends Component {
  state = {
    isOpen: false,
    isProfileMenuOpen: false,
  };

  handleToggle = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  handleProfileClick = () => {
    this.setState((prevState) => ({
      isProfileMenuOpen: !prevState.isProfileMenuOpen,
    }));
  };

  handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  render() {
    const user = JSON.parse(localStorage.getItem("userData"));
    const isAdmin = user && user.email === "admin@gmail.com";

    return (
      <nav className="navbar">
        <div className="nav-center">
          <div className="nav-header">
            <Link to="/">
              <img src={Logo} alt="Reach Resort" />
            </Link>
            <button
              type="button"
              className="nav-btn"
              onClick={this.handleToggle}
            >
              <FaAlignRight className="nav-icon" />
            </button>
          </div>
          <ul
            className={this.state.isOpen ? "nav-links show-nav" : "nav-links"}
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/rooms">Rooms</Link>
            </li>
            <li>
              <Link to="/about-us">About Us</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin">Admin Panel</Link>
              </li>
            )}
          </ul>

          <div className="user-profile">
            <FaUserCircle
              size={40}
              color="var(--primaryColor)"
              onClick={this.handleProfileClick}
            />
            {this.state.isProfileMenuOpen && (
              <div className="profile-dropdown">
                {user ? (
                  <>
                    <Link to="/profile">View Profile</Link>
                    <button onClick={this.handleLogout}>Logout</button>
                  </>
                ) : (
                  <Link to="/login">Login</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }
}
// Footer component for the blog and habit tracker
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>My Blog & Habits</h3>
            <p>
              A personal space for thoughts, stories, and tracking daily habits.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/habits">Habits</Link>
              </li>
              <li>
                <Link to="/create">Create Post</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} My Blog & Habits. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

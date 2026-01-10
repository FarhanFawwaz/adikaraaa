import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return "";
    return location.pathname.startsWith(path) ? "active" : "";
  };

  const handleNavClick = (e, sectionId) => {
    // Only handle hash navigation on landing page
    if (location.pathname === "/" && sectionId) {
      e.preventDefault();
      const section = document.getElementById(sectionId);
      if (section) {
        const navbarHeight = 80;
        const targetPosition = section.offsetTop - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <i className="fas fa-hand-sparkles"></i>
            <span>
              NeuroRehab<span className="gradient-text">AI</span>
            </span>
          </Link>

          <div className={`nav-links ${isMobileMenuOpen ? "mobile-active" : ""}`} id="navLinks">
            <Link 
              to="/" 
              className={`nav-link ${isActive("/")}`}
              onClick={(e) => handleNavClick(e, "home")}
            >
              Beranda
            </Link>
        
              <>
                <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`}>
                  Dashboard
                </Link>
                <a 
                  href="#features" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, "features")}
                >
                  Fitur
                </a>
                <a 
                  href="#games" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, "games")}
                >
                  Game Terapi
                </a>
                <a 
                  href="#technology" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, "technology")}
                >
                  Teknologi
                </a>
                <a 
                  href="#about" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, "about")}
                >
                  Tentang
                </a>
              </>
           
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              <i className="fas fa-user-plus"></i> Daftar
            </Link>
          </div>

          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

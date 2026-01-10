import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await loginUser(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      {/* Visual Side */}
      <div className="auth-visual">
        <div className="visual-content">
          <div className="logo-large">
            <i className="fas fa-hand-sparkles"></i>
            <h1>
              NeuroRehab<span className="gradient-text">AI</span>
            </h1>
          </div>
          <p className="tagline">Rehabilitasi Stroke Lebih Cerdas</p>

          <div className="features-mini">
            <div className="feature-mini">
              <i className="fas fa-gamepad"></i>
              <span>Game Terapi Interaktif</span>
            </div>
            <div className="feature-mini">
              <i className="fas fa-heartbeat"></i>
              <span>Monitoring Jantung Real-time</span>
            </div>
            <div className="feature-mini">
              <i className="fas fa-brain"></i>
              <span>AI Detection 98% Akurat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Selamat Datang Kembali</h2>
            <p>Masuk ke akun Anda untuk melanjutkan rehabilitasi</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span>Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="link-primary">
                Lupa password?
              </Link>
            </div>

            <div className="form-group">
              <label>Login sebagai</label>
              <div className="role-selector">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === "patient"}
                    onChange={handleChange}
                  />
                  <div className="role-card">
                    <i className="fas fa-user"></i>
                    <span>Pasien</span>
                  </div>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="therapist"
                    checked={formData.role === "therapist"}
                    onChange={handleChange}
                  />
                  <div className="role-card">
                    <i className="fas fa-user-md"></i>
                    <span>Fisioterapis</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Memproses...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Belum punya akun?{" "}
              <Link to="/register" className="link-primary">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <div className="divider">
            <span>atau</span>
          </div>

          <div className="demo-section">
            <p className="demo-text">Coba demo tanpa login:</p>
            <button
              type="button"
              className="btn btn-outline btn-full"
              onClick={handleDemoMode}
            >
              <i className="fas fa-play-circle"></i>
              Mode Demo
            </button>
          </div>
        </div>

        <div className="back-to-home">
          <Link to="/">
            <i className="fas fa-arrow-left"></i>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

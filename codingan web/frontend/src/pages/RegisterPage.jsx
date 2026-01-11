import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { HealthProfileModal } from "../components/HealthProfileModal";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHealthModal, setShowHealthModal] = useState(false);

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
    
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    
    if (!formData.agreeTerms) {
      setError("Anda harus menyetujui syarat dan ketentuan");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      
      // Show health profile modal only for patients
      if (formData.role === "patient") {
        setShowHealthModal(true);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthModalComplete = () => {
    setShowHealthModal(false);
    navigate("/dashboard");
  };

  const handleHealthModalSkip = () => {
    setShowHealthModal(false);
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
            <h2>Buat Akun Baru</h2>
            <p>Daftarkan diri Anda untuk memulai rehabilitasi</p>
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
              <label htmlFor="name">Nama Lengkap</label>
              <div className="input-wrapper">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Daftar sebagai</label>
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

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span>
                  Saya setuju dengan{" "}
                  <Link to="/terms" className="link-primary">
                    Syarat & Ketentuan
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Memproses...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Daftar
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Sudah punya akun?{" "}
              <Link to="/login" className="link-primary">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="back-to-home">
          <Link to="/">
            <i className="fas fa-arrow-left"></i>
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Health Profile Modal */}
      <HealthProfileModal
        isOpen={showHealthModal}
        onClose={handleHealthModalSkip}
        onComplete={handleHealthModalComplete}
      />
    </div>
  );
};

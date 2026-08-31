import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/layout/AuthShell.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start auditing your websites for WCAG 2.2 compliance">
      <form onSubmit={handleSubmit} noValidate>
        {error ? (
          <p role="alert" className="alert-error">{error}</p>
        ) : null}

        <div className="form-group">
          <label htmlFor="register-name" className="form-label">Name</label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email" className="form-label">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group-last">
          <label htmlFor="register-password" className="form-label">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className="form-input"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="form-hint">At least 8 characters.</p>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Creating account\u2026" : "Create account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}

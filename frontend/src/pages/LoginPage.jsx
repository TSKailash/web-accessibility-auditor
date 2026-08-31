import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/layout/AuthShell.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Log in" subtitle="Access your accessibility scan dashboard">
      <form onSubmit={handleSubmit} noValidate>
        {error ? (
          <p role="alert" className="alert-error">{error}</p>
        ) : null}

        <div className="form-group">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="form-label">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Logging in\u2026" : "Log in"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don\u2019t have an account?{" "}
        <Link to="/register">Create one</Link>
      </p>
    </AuthShell>
  );
}

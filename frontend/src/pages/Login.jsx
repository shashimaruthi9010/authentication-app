import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { isProfileComplete } from '../utils/profile';
import AlertBanner from '../components/AlertBanner';
import { Field, TextInput } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields) {
  const errors = {};
  if (!fields.email.trim())              errors.email    = 'Email is required.';
  else if (!EMAIL_RE.test(fields.email)) errors.email    = 'Enter a valid email address.';
  if (!fields.password)                  errors.password = 'Password is required.';
  return errors;
}

const BRAND_FEATURES = [
  { icon: 'sparkles', text: 'Personalized nutrition insights, built around you' },
  { icon: 'bowl', text: 'Track meals, symptoms and lab work in one calm space' },
  { icon: 'shield', text: 'Your health data stays private and secure' },
];

export default function Login() {
  const navigate = useNavigate();

  const [fields, setFields]     = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const data = await loginUser(fields);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(isProfileComplete() ? '/dashboard' : '/onboarding');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth" id="login-page">
      {/* Brand panel */}
      <div className="auth__brand">
        <div className="auth__brand-inner">
          <div className="auth__brand-logo">
            <Logo size="md" theme="light" />
            <span>NutriSense</span>
          </div>

          <div className="auth__brand-text">
            <h1 className="auth__brand-title">
              Nutrition,<br />
              understood <em>personally.</em>
            </h1>
            <p className="auth__brand-sub">
              NutriSense turns your meals, symptoms and lab results into clear,
              actionable guidance — designed around your body, not a template.
            </p>
            <div className="auth__features">
              {BRAND_FEATURES.map((f) => (
                <div className="auth__feature" key={f.text}>
                  <span className="auth__feature-icon">
                    <Icon name={f.icon} />
                  </span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth__brand-foot">
          Built for people who care about how they feel.
        </div>
      </div>

      {/* Form panel */}
      <div className="auth__form">
        <div className="auth__box">
          <div className="auth__box-logo">
            <Logo size="sm" />
            <span className="logo-word">NutriSense</span>
          </div>

          <h2 className="auth__box-title">Welcome back</h2>
          <p className="auth__box-sub">Sign in to continue to your health space.</p>

          <div className="auth__card">
            <AlertBanner type="error" message={apiError} />

            <form onSubmit={handleSubmit} noValidate id="login-form">
              <Field label="Email address" htmlFor="login-email" error={errors.email}>
                <TextInput
                  id="login-email"
                  name="email"
                  type="email"
                  icon="mail"
                  placeholder="you@example.com"
                  value={fields.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                  autoFocus
                />
              </Field>

              <Field label="Password" htmlFor="login-password" error={errors.password}>
                <TextInput
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  icon="lock"
                  placeholder="Enter your password"
                  value={fields.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                  toggle={
                    <button
                      type="button"
                      className="field__toggle"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      id="toggle-login-password"
                    >
                      <Icon name={showPass ? 'eyeSlash' : 'eye'} />
                    </button>
                  }
                />
              </Field>

              <Button
                id="login-submit"
                type="submit"
                block
                size="lg"
                loading={loading}
                className="auth__submit"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          <div className="auth__divider">
            <span>Don&apos;t have an account?</span>
          </div>
          <p className="auth__switch">
            <Link to="/signup" id="go-to-signup">Create an account</Link> — it takes a minute.
          </p>
        </div>
      </div>
    </main>
  );
}

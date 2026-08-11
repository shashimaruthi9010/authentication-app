import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupUser } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import { Field, TextInput } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields) {
  const errors = {};
  if (!fields.first_name.trim())          errors.first_name = 'First name is required.';
  if (!fields.last_name.trim())           errors.last_name  = 'Last name is required.';
  if (!fields.email.trim())               errors.email      = 'Email is required.';
  else if (!EMAIL_RE.test(fields.email))  errors.email      = 'Enter a valid email address.';
  if (!fields.password)                   errors.password   = 'Password is required.';
  else if (fields.password.length < 8)    errors.password   = 'Password must be at least 8 characters.';
  if (!fields.confirm_password)           errors.confirm_password = 'Please confirm your password.';
  else if (fields.password !== fields.confirm_password)
                                          errors.confirm_password = 'Passwords do not match.';
  return errors;
}

const BRAND_FEATURES = [
  { icon: 'sparkles', text: 'Personalized nutrition insights, built around you' },
  { icon: 'bowl', text: 'Track meals, symptoms and lab work in one calm space' },
  { icon: 'shield', text: 'Your health data stays private and secure' },
];

export default function Signup() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
  });
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);

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
      const data = await signupUser(fields);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/onboarding');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth" id="signup-page">
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

          <h2 className="auth__box-title">Create your account</h2>
          <p className="auth__box-sub">Set up your secure profile — it only takes a minute.</p>

          <div className="auth__card">
            <AlertBanner type="error" message={apiError} />

            <form onSubmit={handleSubmit} noValidate id="signup-form">
              <div className="auth__form-grid">
                <Field label="First name" htmlFor="first_name" error={errors.first_name}>
                  <TextInput
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Jane"
                    value={fields.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    autoComplete="given-name"
                  />
                </Field>

                <Field label="Last name" htmlFor="last_name" error={errors.last_name}>
                  <TextInput
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    value={fields.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    autoComplete="family-name"
                  />
                </Field>
              </div>

              <Field label="Email address" htmlFor="signup-email" error={errors.email}>
                <TextInput
                  id="signup-email"
                  name="email"
                  type="email"
                  icon="mail"
                  placeholder="jane@example.com"
                  value={fields.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                />
              </Field>

              <Field label="Password" htmlFor="signup-password" error={errors.password}>
                <TextInput
                  id="signup-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  icon="lock"
                  placeholder="Min. 8 characters"
                  value={fields.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                  toggle={
                    <button
                      type="button"
                      className="field__toggle"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      id="toggle-signup-password"
                    >
                      <Icon name={showPass ? 'eyeSlash' : 'eye'} />
                    </button>
                  }
                />
              </Field>

              <Field label="Confirm password" htmlFor="confirm_password" error={errors.confirm_password}>
                <TextInput
                  id="confirm_password"
                  name="confirm_password"
                  type={showConf ? 'text' : 'password'}
                  icon="lock"
                  placeholder="Repeat your password"
                  value={fields.confirm_password}
                  onChange={handleChange}
                  error={errors.confirm_password}
                  autoComplete="new-password"
                  toggle={
                    <button
                      type="button"
                      className="field__toggle"
                      onClick={() => setShowConf((v) => !v)}
                      aria-label={showConf ? 'Hide confirm password' : 'Show confirm password'}
                      id="toggle-confirm-password"
                    >
                      <Icon name={showConf ? 'eyeSlash' : 'eye'} />
                    </button>
                  }
                />
              </Field>

              <Button
                id="signup-submit"
                type="submit"
                block
                size="lg"
                loading={loading}
                className="auth__submit"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </div>

          <div className="auth__divider">
            <span>Already have an account?</span>
          </div>
          <p className="auth__switch">
            <Link to="/login" id="go-to-login">Sign in instead</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

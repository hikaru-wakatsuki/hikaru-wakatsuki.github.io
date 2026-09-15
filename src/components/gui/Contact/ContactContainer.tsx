import { useState, useEffect, useCallback, useId } from 'react';
import { useForm } from '@formspree/react';
import { useAppState } from '../../../context/AppStateContext';
import type { Language } from '../../../types/portfolio';
import Toast from './Toast';

// ─── Formspree form ID ───────────────────────────────────────────────────────
const FORM_ID = 'maqgankk';

// ─── Inline i18n fallback ─────────────────────────────────────────────────────
// Used when public/locales/*.json hasn't loaded yet or doesn't carry the keys.
const FALLBACK: Record<Language, Record<string, string>> = {
  en: {
    'contact.heading': 'Contact',
    'contact.subheading': "Let's work together",
    'contact.nameLabel': 'Name',
    'contact.namePlaceholder': 'Your name',
    'contact.emailLabel': 'Email',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.messageLabel': 'Message',
    'contact.messagePlaceholder': 'Your message...',
    'contact.submit': 'Send Message',
    'contact.submitting': 'Sending...',
    'contact.success': 'Message sent successfully!',
    'contact.errorRequired': 'Required',
    'contact.errorEmail': 'Invalid email address',
    'contact.errorMinLength': 'At least 10 characters required',
    'contact.errorNetwork': 'Failed to send — please try again.',
  },
  ja: {
    'contact.heading': 'お問い合わせ',
    'contact.subheading': 'お気軽にご連絡ください',
    'contact.nameLabel': 'お名前',
    'contact.namePlaceholder': 'お名前を入力',
    'contact.emailLabel': 'メールアドレス',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.messageLabel': 'メッセージ',
    'contact.messagePlaceholder': 'メッセージを入力...',
    'contact.submit': '送信する',
    'contact.submitting': '送信中...',
    'contact.success': 'メッセージを送信しました！',
    'contact.errorRequired': '必須項目です',
    'contact.errorEmail': '有効なメールアドレスを入力してください',
    'contact.errorMinLength': '10文字以上で入力してください',
    'contact.errorNetwork': '送信に失敗しました。もう一度お試しください。',
  },
};

// ─── Field error codes (language-independent) ─────────────────────────────────
// Storing codes rather than strings lets onChange logic work without depending
// on the current locale string value.
type ErrorCode = 'required' | 'email' | 'minLength';
type FieldName = 'name' | 'email' | 'message';

interface Field {
  value: string;
  /** true once the user has left the field or attempted to submit */
  touched: boolean;
  error: ErrorCode | null;
}

const initField = (): Field => ({ value: '', touched: false, error: null });

function errorMessage(code: ErrorCode | null, ct: (k: string) => string): string | null {
  if (!code) return null;
  switch (code) {
    case 'required':  return ct('contact.errorRequired');
    case 'email':     return ct('contact.errorEmail');
    case 'minLength': return ct('contact.errorMinLength');
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────
// TLD must be ≥2 chars → rejects .c but passes .jp, .io, .co.jp, etc.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateField(field: FieldName, value: string): ErrorCode | null {
  switch (field) {
    case 'name':
      return value.trim() ? null : 'required';
    case 'email':
      if (!value.trim()) return 'required';
      if (!EMAIL_RE.test(value.trim())) return 'email';
      return null;
    case 'message':
      if (!value.trim()) return 'required';
      if (value.trim().length < 10) return 'minLength';
      return null;
  }
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: 'contact-spin 0.8s linear infinite', display: 'block', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── ContactContainer ─────────────────────────────────────────────────────────

export default function ContactContainer() {
  const { t, theme, language, triggerHoverLog, clearHoverLog } = useAppState();
  const isDark = theme === 'dark';
  const uid = useId();

  // Formspree hook – handles the actual HTTP submission
  const [formState, formspreeSubmit] = useForm(FORM_ID);

  // Translation helper: locale file first, inline fallback second
  const ct = useCallback(
    (key: string): string => {
      const val = t(key);
      return val !== key ? val : (FALLBACK[language]?.[key] ?? FALLBACK.en[key] ?? key);
    },
    [t, language],
  );

  // ── Form field state ──────────────────────────────────────────────────────
  const [fields, setFields] = useState<Record<FieldName, Field>>({
    name:    initField(),
    email:   initField(),
    message: initField(),
  });
  const [toastVisible, setToastVisible] = useState(false);

  // ── Success: clear fields + show toast ───────────────────────────────────
  useEffect(() => {
    if (!formState.succeeded) return;
    setFields({ name: initField(), email: initField(), message: initField() });
    setToastVisible(true);
  }, [formState.succeeded]);

  // ── Toast auto-dismiss ────────────────────────────────────────────────────
  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  // ── onChange: only CLEARS errors, never adds new ones ────────────────────
  // This keeps the UX non-aggressive while the user is still typing.
  const handleChange = useCallback((field: FieldName, value: string) => {
    setFields((prev) => {
      const f = prev[field];
      let code: ErrorCode | null = f.error;

      if (code === 'required' && value.trim()) {
        // User started typing → clear the "required" complaint
        code = null;
      } else if (code === 'email') {
        // User is fixing the email → stop showing format error; re-check on blur
        code = null;
      } else if (code === 'minLength' && value.trim().length >= 10) {
        // Message now meets the minimum → clear
        code = null;
      }

      return { ...prev, [field]: { value, touched: f.touched, error: code } };
    });
  }, []);

  // ── onBlur: run full validation ───────────────────────────────────────────
  const handleBlur = useCallback((field: FieldName) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
        error: validateField(field, prev[field].value),
      },
    }));
  }, []);

  // ── onSubmit: validate all → Formspree ───────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // 1. Client-side validation
      const errs = {
        name:    validateField('name',    fields.name.value),
        email:   validateField('email',   fields.email.value),
        message: validateField('message', fields.message.value),
      } as const;

      setFields((prev) => ({
        name:    { ...prev.name,    touched: true, error: errs.name },
        email:   { ...prev.email,   touched: true, error: errs.email },
        message: { ...prev.message, touched: true, error: errs.message },
      }));

      if (errs.name || errs.email || errs.message) return;

      // 2. Delegate to Formspree (reads FormData from e.target via name= attrs)
      await formspreeSubmit(e);
    },
    [fields, formspreeSubmit],
  );

  // ─── Derived colors ───────────────────────────────────────────────────────
  const textColor  = isDark ? '#00FF66' : '#1A1A1A';
  const dimColor   = isDark ? 'rgba(0,255,102,0.65)' : 'rgba(26,26,26,0.55)';
  const sectionBorder = isDark ? 'rgba(0,255,102,0.15)' : 'rgba(26,26,26,0.12)';

  const fieldBorderColor = (f: Field) => {
    if (!f.touched) return isDark ? 'rgba(0,255,102,0.25)' : 'rgba(26,26,26,0.22)';
    if (f.error)   return isDark ? '#FF4444' : '#ef4444';
    return isDark ? '#00FF66' : '#22c55e';
  };

  const fieldShadow = (f: Field) => {
    if (!f.touched) return 'none';
    if (f.error)
      return isDark ? '0 0 0 2px rgba(255,68,68,0.15)' : '0 0 0 2px rgba(239,68,68,0.12)';
    return isDark ? '0 0 0 2px rgba(0,255,102,0.12)' : '0 0 0 2px rgba(34,197,94,0.12)';
  };

  const inputStyle = (f: Field): React.CSSProperties => ({
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${fieldBorderColor(f)}`,
    borderRadius: '6px',
    color: textColor,
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: fieldShadow(f),
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    opacity: formState.submitting ? 0.6 : 1,
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: dimColor,
    marginBottom: '0.375rem',
    fontFamily: "'Courier New', Courier, monospace",
  };

  const errorMsgStyle: React.CSSProperties = {
    margin: '0.3rem 0 0',
    fontSize: '0.7rem',
    color: isDark ? '#FF4444' : '#ef4444',
    fontFamily: "'Courier New', Courier, monospace",
    minHeight: '1rem',
    lineHeight: 1.3,
  };

  const sectionTagStyle: React.CSSProperties = {
    display: 'inline-block',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.65rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: isDark ? 'rgba(0,255,102,0.5)' : 'rgba(26,26,26,0.45)',
    border: `1px solid ${isDark ? 'rgba(0,255,102,0.2)' : 'rgba(26,26,26,0.18)'}`,
    borderRadius: '3px',
    padding: '1px 6px',
  };

  // Formspree server-side error (null when no error or already succeeded)
  const serverError: string | null = (!formState.succeeded && formState.errors)
    ? ct('contact.errorNetwork')
    : null;

  const nameId       = `${uid}-name`;
  const emailId      = `${uid}-email`;
  const messageId    = `${uid}-message`;
  const nameErrId    = `${uid}-name-err`;
  const emailErrId   = `${uid}-email-err`;
  const messageErrId = `${uid}-message-err`;

  return (
    <>
      {/* Component-scoped keyframes & placeholder styling */}
      <style>{`
        @keyframes contact-spin { to { transform: rotate(360deg); } }
        [data-contact-form] input::placeholder,
        [data-contact-form] textarea::placeholder {
          color: ${isDark ? 'rgba(0,255,102,0.3)' : 'rgba(26,26,26,0.3)'};
          font-family: 'Courier New', Courier, monospace;
        }
        [data-contact-form] input:disabled,
        [data-contact-form] textarea:disabled { cursor: not-allowed; }
        [data-contact-form] button:hover:not(:disabled) { opacity: 0.85 !important; }
      `}</style>

      <section
        data-contact-form
        onMouseEnter={() => triggerHoverLog('contact')}
        onMouseLeave={() => clearHoverLog()}
        style={{ padding: '2rem', borderBottom: `1px solid ${sectionBorder}` }}
        aria-label="Contact"
      >
        {/* ── Section label ── */}
        <span style={sectionTagStyle}>$ vim contact.form</span>

        <p
          style={{
            margin: '0 0 1.75rem',
            fontSize: '0.875rem',
            color: dimColor,
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {ct('contact.subheading')}
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ maxWidth: '36rem' }}
          aria-label={ct('contact.heading')}
        >
          {/* ── Name ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor={nameId} style={labelStyle}>
              {ct('contact.nameLabel')}
            </label>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              value={fields.name.value}
              placeholder={ct('contact.namePlaceholder')}
              disabled={formState.submitting}
              aria-required="true"
              aria-invalid={fields.name.touched && !!fields.name.error}
              aria-describedby={fields.name.error ? nameErrId : undefined}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              style={inputStyle(fields.name)}
            />
            {fields.name.touched && fields.name.error && (
              <p id={nameErrId} role="alert" style={errorMsgStyle}>
                {errorMessage(fields.name.error, ct)}
              </p>
            )}
          </div>

          {/* ── Email ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor={emailId} style={labelStyle}>
              {ct('contact.emailLabel')}
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={fields.email.value}
              placeholder={ct('contact.emailPlaceholder')}
              disabled={formState.submitting}
              aria-required="true"
              aria-invalid={fields.email.touched && !!fields.email.error}
              aria-describedby={fields.email.error ? emailErrId : undefined}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              style={inputStyle(fields.email)}
            />
            {fields.email.touched && fields.email.error && (
              <p id={emailErrId} role="alert" style={errorMsgStyle}>
                {errorMessage(fields.email.error, ct)}
              </p>
            )}
          </div>

          {/* ── Message ── */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor={messageId} style={labelStyle}>
              {ct('contact.messageLabel')}
            </label>
            <textarea
              id={messageId}
              name="message"
              value={fields.message.value}
              placeholder={ct('contact.messagePlaceholder')}
              disabled={formState.submitting}
              rows={5}
              aria-required="true"
              aria-invalid={fields.message.touched && !!fields.message.error}
              aria-describedby={fields.message.error ? messageErrId : undefined}
              onChange={(e) => handleChange('message', e.target.value)}
              onBlur={() => handleBlur('message')}
              style={{ ...inputStyle(fields.message), resize: 'vertical', minHeight: '7rem' }}
            />
            {fields.message.touched && fields.message.error && (
              <p id={messageErrId} role="alert" style={errorMsgStyle}>
                {errorMessage(fields.message.error, ct)}
              </p>
            )}
          </div>

          {/* ── Server / network error ── */}
          {serverError && (
            <p role="alert" style={{ ...errorMsgStyle, fontSize: '0.8rem', marginBottom: '1rem' }}>
              {serverError}
            </p>
          )}

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={formState.submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.5rem',
              background: isDark ? '#00FF66' : '#1A1A1A',
              color: isDark ? '#000' : '#fff',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: formState.submitting ? 'not-allowed' : 'pointer',
              opacity: formState.submitting ? 0.7 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {formState.submitting && <Spinner color={isDark ? '#000' : '#fff'} />}
            {formState.submitting ? ct('contact.submitting') : ct('contact.submit')}
          </button>
        </form>
      </section>

      {/* ── Toast notification (fixed, outside form flow) ── */}
      <Toast
        message={ct('contact.success')}
        visible={toastVisible}
        isDark={isDark}
      />
    </>
  );
}

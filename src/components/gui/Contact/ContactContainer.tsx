import { useState, useCallback, useEffect, useId } from 'react';
import { useAppState } from '../../../context/AppStateContext';
import type { Language } from '../../../types/portfolio';
import Toast from './Toast';

// ─── Base64-encoded destination ────────────────────────────────────────────
// Keeps the address off HTML surface; decoded only at send time.
// atob(DEST_B64) === 'waka9648hika46@gmail.com'
const DEST_B64 = 'd2FrYTk2NDhoaWthNDZAZ21haWwuY29t';

// Set to btoa('https://formspree.io/f/YOUR_FORM_ID') when deploying for real.
// Empty string → demo mode (simulated 1.5s network delay).
const ENDPOINT_B64 = '';

// ─── Inline fallbacks ──────────────────────────────────────────────────────
// Active when public/locales/*.json don't yet carry the contact keys.
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

// ─── Types ────────────────────────────────────────────────────────────────

type FieldName = 'name' | 'email' | 'message';

interface Field {
  value: string;
  touched: boolean;
  error: string | null;
}

const initField = (): Field => ({ value: '', touched: false, error: null });

// ─── Network layer ────────────────────────────────────────────────────────

async function postForm(name: string, email: string, message: string): Promise<void> {
  const replyTo = atob(DEST_B64);

  if (!ENDPOINT_B64) {
    // Demo mode — simulates a real round-trip
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    return;
  }

  const endpoint = atob(ENDPOINT_B64);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ name, email, message, _replyto: replyTo }),
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? 'Network error');
  }
}

// ─── Spinner ─────────────────────────────────────────────────────────────

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

// ─── ContactContainer ─────────────────────────────────────────────────────

export default function ContactContainer() {
  const { t, theme, language, triggerHoverLog, clearHoverLog } = useAppState();
  const isDark = theme === 'dark';
  const uid = useId();

  // Translation helper: locale file first, inline fallback second
  const ct = useCallback(
    (key: string): string => {
      const val = t(key);
      return val !== key ? val : (FALLBACK[language]?.[key] ?? FALLBACK.en[key] ?? key);
    },
    [t, language],
  );

  // ── Form state ────────────────────────────────────────────────────────
  const [fields, setFields] = useState<Record<FieldName, Field>>({
    name: initField(),
    email: initField(),
    message: initField(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────
  const getError = useCallback(
    (field: FieldName, value: string): string | null => {
      switch (field) {
        case 'name':
          return value.trim() ? null : ct('contact.errorRequired');
        case 'email':
          if (!value.trim()) return ct('contact.errorRequired');
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
            return ct('contact.errorEmail');
          return null;
        case 'message':
          if (!value.trim()) return ct('contact.errorRequired');
          if (value.trim().length < 10) return ct('contact.errorMinLength');
          return null;
      }
    },
    [ct],
  );

  const handleChange = useCallback(
    (field: FieldName, value: string) => {
      setFields((prev) => ({
        ...prev,
        [field]: { value, touched: true, error: getError(field, value) },
      }));
      setSubmitError(null);
    },
    [getError],
  );

  const handleBlur = useCallback(
    (field: FieldName) => {
      setFields((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          touched: true,
          error: getError(field, prev[field].value),
        },
      }));
    },
    [getError],
  );

  // ── Toast auto-dismiss after 3 s ──────────────────────────────────────
  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: { preventDefault(): void }) => {
      e.preventDefault();

      // Touch-all and validate
      const errs = {
        name: getError('name', fields.name.value),
        email: getError('email', fields.email.value),
        message: getError('message', fields.message.value),
      };
      setFields((prev) => ({
        name: { ...prev.name, touched: true, error: errs.name },
        email: { ...prev.email, touched: true, error: errs.email },
        message: { ...prev.message, touched: true, error: errs.message },
      }));

      if (errs.name || errs.email || errs.message) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await postForm(fields.name.value, fields.email.value, fields.message.value);
        setFields({ name: initField(), email: initField(), message: initField() });
        setToastVisible(true);
      } catch {
        setSubmitError(ct('contact.errorNetwork'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, getError, ct],
  );

  // ─── Derived colors ─────────────────────────────────────────────────
  const textColor = isDark ? '#00FF66' : '#1A1A1A';
  const dimColor = isDark ? 'rgba(0,255,102,0.65)' : 'rgba(26,26,26,0.55)';
  const sectionBorder = isDark ? 'rgba(0,255,102,0.15)' : 'rgba(26,26,26,0.12)';

  const fieldBorderColor = (f: Field) => {
    if (!f.touched) return isDark ? 'rgba(0,255,102,0.25)' : 'rgba(26,26,26,0.22)';
    if (f.error) return isDark ? '#FF4444' : '#ef4444';
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
    opacity: isSubmitting ? 0.6 : 1,
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

  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const messageId = `${uid}-message`;
  const nameErrId = `${uid}-name-err`;
  const emailErrId = `${uid}-email-err`;
  const messageErrId = `${uid}-message-err`;

  return (
    <>
      {/* Component-scoped keyframes & placeholder color */}
      <style>{`
        @keyframes contact-spin { to { transform: rotate(360deg); } }
        [data-contact-form] input::placeholder,
        [data-contact-form] textarea::placeholder {
          color: ${isDark ? 'rgba(0,255,102,0.3)' : 'rgba(26,26,26,0.3)'};
          font-family: 'Courier New', Courier, monospace;
        }
        [data-contact-form] input:disabled,
        [data-contact-form] textarea:disabled { cursor: not-allowed; }
        [data-contact-form] button:hover:not(:disabled) {
          opacity: 0.85 !important;
        }
      `}</style>

      <section
        data-contact-form
        onMouseEnter={() => triggerHoverLog('contact')}
        onMouseLeave={() => clearHoverLog()}
        style={{
          padding: '2rem',
          borderBottom: `1px solid ${sectionBorder}`,
        }}
        aria-label="Contact"
      >
        {/* ── Section label ── */}
        <span style={sectionTagStyle}>$ vim contact.form</span>

        <h2
          style={{
            margin: '1.25rem 0 0.25rem',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: textColor,
            fontFamily: "'Courier New', Courier, monospace",
            letterSpacing: '0.02em',
          }}
        >
          {ct('contact.heading')}
        </h2>
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
              type="text"
              autoComplete="name"
              value={fields.name.value}
              placeholder={ct('contact.namePlaceholder')}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={fields.name.touched && !!fields.name.error}
              aria-describedby={fields.name.error ? nameErrId : undefined}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              style={inputStyle(fields.name)}
            />
            {fields.name.touched && fields.name.error && (
              <p id={nameErrId} role="alert" style={errorMsgStyle}>
                {fields.name.error}
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
              type="email"
              autoComplete="email"
              inputMode="email"
              value={fields.email.value}
              placeholder={ct('contact.emailPlaceholder')}
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={fields.email.touched && !!fields.email.error}
              aria-describedby={fields.email.error ? emailErrId : undefined}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              style={inputStyle(fields.email)}
            />
            {fields.email.touched && fields.email.error && (
              <p id={emailErrId} role="alert" style={errorMsgStyle}>
                {fields.email.error}
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
              value={fields.message.value}
              placeholder={ct('contact.messagePlaceholder')}
              disabled={isSubmitting}
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
                {fields.message.error}
              </p>
            )}
          </div>

          {/* ── Network error ── */}
          {submitError && (
            <p
              role="alert"
              style={{ ...errorMsgStyle, fontSize: '0.8rem', marginBottom: '1rem' }}
            >
              {submitError}
            </p>
          )}

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={isSubmitting}
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
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {isSubmitting && <Spinner color={isDark ? '#000' : '#fff'} />}
            {isSubmitting ? ct('contact.submitting') : ct('contact.submit')}
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

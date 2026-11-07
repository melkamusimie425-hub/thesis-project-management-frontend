import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * A password input with show/hide toggle.
 * Accepts all standard <input> props.
 */
export default function PasswordInput({ value, onChange, placeholder = '••••••••', required, ...rest }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...rest}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="input"
        style={{ paddingRight: 42, ...(rest.style || {}) }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(226,240,232,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, transition: 'color .15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#e2f0e8')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,240,232,.45)')}
        title={show ? 'Hide password' : 'Show password'}
      >
        {show
          ? <EyeOff size={16} />
          : <Eye    size={16} />}
      </button>
    </div>
  );
}

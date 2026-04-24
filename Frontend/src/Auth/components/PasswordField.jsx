import React from 'react'


const PasswordField = ({ label, value, onChange, show, onToggle, placeholder }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ color: '#aaa', fontSize: '0.95rem' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                style={{
                    padding: '1rem',
                    paddingRight: '5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #333',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '1rem',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
            />
            <button
                type="button"
                onClick={onToggle}
                style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#ff2d78',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {show ? 'Hide' : 'Show'}
            </button>
        </div>
    </div>
)

export default PasswordField;
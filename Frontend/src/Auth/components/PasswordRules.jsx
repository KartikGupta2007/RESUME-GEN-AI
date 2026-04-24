import React from 'react'

const PASSWORD_RULES = [
    {
        id: "length",
        label: "At least 8 characters",
        isValid: (value) => value.length >= 8,
    },
    {
        id: "uppercase",
        label: "At least one uppercase letter",
        isValid: (value) => /[A-Z]/.test(value),
    },
    {
        id: "lowercase",
        label: "At least one lowercase letter",
        isValid: (value) => /[a-z]/.test(value),
    },
    {
        id: "number",
        label: "At least one number",
        isValid: (value) => /[0-9]/.test(value),
    },
    {
        id: "special",
        label: "At least one special character",
        isValid: (value) => /[^A-Za-z0-9]/.test(value),
    },
]


const PasswordRules = ({ value, shouldShow, additionalRules = [] }) => {
    if (!shouldShow) {
        return null
    }

    const combinedRules = [...PASSWORD_RULES, ...additionalRules]

    return (
        <ul style={{
            margin: '0.25rem 0 0',
            paddingLeft: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            fontSize: '0.85rem',
            listStyleType: 'none',
        }}>
            {combinedRules.map((rule) => {
                const valid = rule.isValid(value)
                return (
                    <li key={rule.id} style={{ color: valid ? '#059669' : '#d97706' }}>
                        {valid ? '[OK]' : '[X]'} {rule.label}
                    </li>
                )
            })}
        </ul>
    )
}
export default PasswordRules;
export { PASSWORD_RULES }
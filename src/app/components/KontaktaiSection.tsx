'use client'

import React, { useState } from 'react'

interface CopyTextProps {
    text: string
}

const CopyText: React.FC<CopyTextProps> = ({ text }) => {
    const [hover, setHover] = useState(false)
    return (
        <span
            onClick={() => navigator.clipboard.writeText(text)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                cursor: 'pointer',
                color: hover ? '#14b8a6' : 'inherit',
            }}
            title="Kopijuoti"
        >
            COPY
        </span>
    )
}

interface Contact {
    label: string
    value: string
    copyable?: boolean
    link?: string
    icon?: string
}

export const KontaktaiSection: React.FC = () => {
    const contacts: Contact[] = [
        {
            label: 'Įmonės kodas',
            value: '302151534',
            copyable: true,
            icon: '/icons/company.svg',
        },
        {
            label: 'PVM mokėtojo kodas',
            value: 'LT10000482916',
            copyable: true,
            icon: '/icons/pvm.svg',
        },
        {
            label: 'Direktorius',
            value: 'Andrius Urnikis',
            icon: '/icons/user.svg',
        },
        {
            label: 'Adresas',
            value: 'A. Juozapavičiaus pr. 7B, LT-45251 Kaunas',
            copyable: true,
            icon: '/icons/location.svg',
        },
        {
            label: 'Mobilus telefonas',
            value: '+370 616 44551',
            icon: '/icons/phone.svg',
        },
    ]

    const sectionStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem 0',
    }

    const containerStyle: React.CSSProperties = {
        maxWidth: '600px',
        width: '100%',
        backgroundColor: '#f6f6f6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1rem',
    }

    return (
        <section style={sectionStyle}>
            <div style={containerStyle}>
                {contacts.map((item, idx) => {
                    const rowStyle: React.CSSProperties = {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                    }
                    const labelContainerStyle: React.CSSProperties = {
                        marginRight: '1rem',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                    }
                    const valueContainerStyle: React.CSSProperties = {
                        display: 'flex',
                        alignItems: 'center',
                    }
                    const linkStyle: React.CSSProperties = {
                        color: '#3b82f6',
                        textDecoration: 'none',
                    }
                    return (
                        <div key={idx} style={rowStyle}>
                            <div style={labelContainerStyle}>
                                <span>{item.label}:</span>
                            </div>
                            <div style={valueContainerStyle}>
                                {item.link ? (
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={linkStyle}
                                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <span>{item.value}</span>
                                )}
                            </div>
                            {item.copyable && (
                                <div style={{ marginLeft: 'auto' }}>
                                    <CopyText text={item.value} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

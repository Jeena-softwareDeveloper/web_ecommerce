import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fdf8 0%, #e8f5e9 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textAlign: 'center',
            padding: '2rem',
        }}>
            {/* 404 Number */}
            <div style={{
                fontSize: 'clamp(5rem, 20vw, 9rem)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #1b5e20, #43a047)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                marginBottom: '0.5rem',
                letterSpacing: '-4px',
            }}>
                404
            </div>

            {/* Icon */}
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>

            <h1 style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: 700,
                color: '#1b5e20',
                marginBottom: '0.75rem',
            }}>
                Page Not Found
            </h1>

            <p style={{
                color: '#555',
                maxWidth: '380px',
                marginBottom: '2.5rem',
                lineHeight: 1.7,
                fontSize: '0.95rem',
            }}>
                Looks like this page doesn't exist or has been moved.
                Let's get you back to the marketplace.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                    to="/"
                    style={{
                        background: 'linear-gradient(135deg, #1b5e20, #43a047)',
                        color: '#fff',
                        padding: '0.8rem 2rem',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(67,160,71,0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(67,160,71,0.4)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(67,160,71,0.3)'; }}
                >
                    🏠 Go to Home
                </Link>
                <Link
                    to="/products"
                    style={{
                        background: '#fff',
                        color: '#1b5e20',
                        padding: '0.8rem 2rem',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        border: '2px solid #43a047',
                        transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.background = '#f1f8e9'; }}
                    onMouseLeave={e => { e.target.style.background = '#fff'; }}
                >
                    🛍️ Browse Products
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

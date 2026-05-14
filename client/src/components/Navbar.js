import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = {
    student: [
      { to: '/dashboard', label: 'Home' },
      { to: '/submit', label: 'Submit Complaint' },
      { to: '/my-complaints', label: 'My Complaints' }
    ],
    admin: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/complaints', label: 'All Complaints' },
      { to: '/users', label: 'Users' }
    ],
    department: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/complaints', label: 'Assigned Complaints' }
    ]
  };

  const links = navLinks[user?.role] || [];
  const isActive = (to) => location.pathname === to;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    nav('/login');
  };

  return (
    <>
      <nav style={{
        background: '#1C1714',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        height: '58px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link
          to="/dashboard"
          style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: -0.3, flexShrink: 0 }}
          onClick={() => setMenuOpen(false)}
        >
          CampusDesk
        </Link>

        {/* desktop links */}
        <div className="nav-links" style={{ display: 'flex', gap: 4, flex: 1, marginLeft: 20 }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.5)',
                background: isActive(link.to) ? 'rgba(255,255,255,0.12)' : 'transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* desktop user info */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#fff'
          }}>
            {user?.initials}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>

        {/* mobile: avatar + hamburger */}
        <div className="nav-hamburger" style={{ display: 'none', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12, color: '#fff'
          }}>
            {user?.initials}
          </div>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'transparent', border: 'none',
              padding: '6px', display: 'flex', flexDirection: 'column', gap: 5
            }}
          >
            <span style={{
              display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2,
              transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              transition: 'transform 0.2s'
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2,
              opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s'
            }} />
            <span style={{
              display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2,
              transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              transition: 'transform 0.2s'
            }} />
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 10
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15, color: '#fff'
          }}>
            {user?.initials}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: isActive(link.to) ? 700 : 500,
              color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive(link.to) ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            {link.label}
          </Link>
        ))}

        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '12px',
            fontSize: 14, fontWeight: 600, width: '100%'
          }}
        >
          Logout
        </button>
      </div>
    </>
  );
}

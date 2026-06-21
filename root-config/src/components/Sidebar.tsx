import { NavLink } from 'react-router-dom';

type NavItem = {
    to: string;
    label: string;
};

const links: NavItem[] = [
    { to: '/mfe-one', label: 'MFE One' },
    { to: '/mfe-two', label: 'MFE Two' },
];

export default function Sidebar() {
    return (
        <nav className="sidebar">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
            </NavLink>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}

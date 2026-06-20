type NavLink = {
    href: string;
    label: string;
};

const links: NavLink[] = [
    { href: '/mfe-one', label: 'MFE One' },
    { href: '/mfe-two', label: 'MFE Two' },
];

type SidebarProps = {
    currentPath: string;
};

export default function Sidebar({ currentPath }: SidebarProps) {
    return (
        <nav className="sidebar">
            <a href="/" className={currentPath === '/' ? 'active' : ''}>
                Home
            </a>
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className={currentPath.startsWith(link.href) ? 'active' : ''}
                >
                    {link.label}
                </a>
            ))}
        </nav>
    );
}

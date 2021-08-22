import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [];

  if (currentUser) {
    links.push({
      label: 'Sign Out',
      href: '/auth/signout'
    });
  } else {
    links.push({
      label: 'Sign Up',
      href: '/auth/signup'
    });

    links.push({
      label: 'Sign In',
      href: '/auth/signin'
    });
  }

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brad">Ticketing</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links?.map(({ label, href }) => (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Header;
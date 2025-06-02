import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

const Navbar = ({ showLinks = true }) => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="text-green-500 text-xl font-bold">Rakshak</span>
          </Link>
        </div>
        {showLinks && (
          <div className="flex gap-x-12">
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-semibold leading-6 text-gray-900">
              Testimonials
            </a>
            <a href="#stats" className="text-sm font-semibold leading-6 text-gray-900">
              Impact
            </a>
          </div>
        )}
        <div className="flex flex-1 justify-end">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm font-semibold leading-6 text-primary-600"
            >
              Dashboard <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : location.pathname !== '/login' && (
            <Link
              to="/login"
              className="text-sm font-semibold leading-6 text-primary-600"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

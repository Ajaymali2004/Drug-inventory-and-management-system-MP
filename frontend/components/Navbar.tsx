import { useRouter } from 'next/navigation';

interface NavbarProps {
  userName: string;
  userRole: string;
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('auth//login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">DIS</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <span className="border-transparent text-gray-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-500 mr-4">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

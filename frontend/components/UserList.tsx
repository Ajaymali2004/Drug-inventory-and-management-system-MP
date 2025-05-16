'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface UserListProps {
  userRole: string;
}

export default function UserList({ userRole }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const targetRole = userRole === 'hospital' ? 'suppliers' : 'hospitals';
      const response = await fetch(`http://localhost:5000/api/users/${targetRole}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateChat = (userId: string) => {
    // Handle chat initiation
    console.log('Initiating chat with user:', userId);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Available {userRole === 'hospital' ? 'Suppliers' : 'Hospitals'}
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="group relative bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => initiateChat(user._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Chat
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Verified {user.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

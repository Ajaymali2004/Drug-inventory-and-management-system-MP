'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StockGraph from './StockGraph';

type PendingUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  verificationDocument: string;
};

type RegisteredUser = {
  _id: string;
  name: string;
  role: string;
  email: string;
};

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch pending users');
      const data = await res.json();
      setPendingUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch registered users');
      const data = await res.json();
      setRegisteredUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/auth/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });
      if (!res.ok) throw new Error('Failed to update user status');

      await Promise.all([fetchPendingUsers(), fetchRegisteredUsers()]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchRegisteredUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'pending'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              Pending Users
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'registered'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              Registered Users
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
          {activeTab === 'pending' ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Approvals
              </h2>
              <div className="grid gap-4">
                {pendingUsers.length > 0 ? pendingUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center justify-center text-indigo-600 font-semibold mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'hospital' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApproval(user._id, true)}
                        className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApproval(user._id, false)}
                        className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-600"
                      >
                        Reject
                      </motion.button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No pending approvals</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {registeredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user._id)}
                    className={`bg-gray-50 rounded-lg p-6 cursor-pointer transform transition-all hover:scale-[1.02] ${
                      selectedUser === user._id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {user.role}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div className="mt-8">
                  <StockGraph
                    userId={selectedUser}
                    userName={registeredUsers.find(u => u._id === selectedUser)?.name || ''}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

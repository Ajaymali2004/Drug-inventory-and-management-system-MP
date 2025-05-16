'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'hospital',
  });
  const [document, setDocument] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (document) {
        formDataToSend.append('verificationDocument', document);
      }
  
      const res = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message);
  
      setSuccess('Registration successful! Please wait for admin approval.');
  
      localStorage.setItem('token', data.token);
  
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };
  

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create an Account</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg">{success}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-600">
            Role
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="hospital">Hospital</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-600">
            Verification Document (PDF/Image)
          </label>
          <input
            id="document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            onChange={(e) => setDocument(e.target.files?.[0] || null)}
            className="mt-1 w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}

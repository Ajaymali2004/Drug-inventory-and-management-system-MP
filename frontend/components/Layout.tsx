import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export default function Layout({ children, userName, userRole }: LayoutProps) {
  return (
    <>
      <Navbar userName={userName} userRole={userRole} />
      <main className="p-4">{children}</main>
    </>
  );
}

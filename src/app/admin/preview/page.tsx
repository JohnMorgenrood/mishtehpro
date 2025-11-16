'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Eye, User, Heart, Handshake, ArrowLeft } from 'lucide-react';

export default function AdminPreviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.userType !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const dashboards = [
    {
      title: 'Donor Dashboard',
      description: 'Preview how donors see their dashboard with donations history and saved requests',
      icon: Heart,
      href: '/dashboard',
      color: 'bg-green-500',
      note: 'View as: Donor perspective'
    },
    {
      title: 'Requester Dashboard',
      description: 'Preview how requesters manage their help requests and view donations received',
      icon: User,
      href: '/dashboard',
      color: 'bg-blue-500',
      note: 'View as: Requester perspective'
    },
    {
      title: 'Sponsor Dashboard',
      description: 'Preview how sponsors view their sponsorships and investment opportunities',
      icon: Handshake,
      href: '/dashboard',
      color: 'bg-purple-500',
      note: 'View as: Sponsor perspective'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Dashboard Previews</h1>
              <p className="text-gray-600">Test and preview different user dashboard experiences</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> These previews show you what each user type sees. Some features may be limited in preview mode. To fully test functionality, create test accounts for each user type.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.href}
              href={dashboard.href}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-primary-300 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${dashboard.color} w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-4`}>
                  <dashboard.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {dashboard.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                <div className="mt-auto">
                  <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {dashboard.note}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Testing Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">1.</span>
              <span>Create test accounts for each user type to fully test all features and permissions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">2.</span>
              <span>Check mobile responsiveness by resizing your browser or using developer tools</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">3.</span>
              <span>Test all interactive elements like buttons, forms, and navigation menus</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-600 font-bold">4.</span>
              <span>Verify that user-specific data and features are properly restricted based on user type</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

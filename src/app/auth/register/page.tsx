'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/countries';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'DONOR' as 'DONOR' | 'REQUESTER' | 'SPONSOR',
    countryCode: '+27',
    phone: '',
    location: '',
    sponsorType: '' as '' | 'BUSINESS' | 'INDIVIDUAL',
    companyName: '',
    industry: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/auth/callback' });
  };

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initAutocomplete();
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is missing');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initAutocomplete();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initAutocomplete = () => {
    if (!locationInputRef.current) {
      console.log('Location input ref not ready');
      return;
    }
    
    if (!window.google) {
      console.log('Google Maps not loaded yet');
      return;
    }

    console.log('Initializing autocomplete...');

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['geocode', 'establishment'],
          fields: ['address_components', 'formatted_address', 'geometry'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('Place selected:', place);
        
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, location: place.formatted_address }));
        }
      });
      
      console.log('Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (!formData.phone || formData.phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate location is required
    if (!formData.location) {
      setError('Location is required');
      return;
    }

    // Validate sponsor-specific fields
    if (formData.userType === 'SPONSOR') {
      if (!formData.sponsorType) {
        setError('Please select whether you are a business or individual');
        return;
      }
      if (formData.sponsorType === 'BUSINESS') {
        if (!formData.companyName.trim()) {
          setError('Company name is required for business sponsors');
          return;
        }
        if (!formData.industry) {
          setError('Industry is required for business sponsors');
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('userType', formData.userType);
      submitData.append('phone', `${formData.countryCode}${formData.phone}`);
      submitData.append('location', formData.location);

      // Add sponsor-specific data
      if (formData.userType === 'SPONSOR') {
        submitData.append('sponsorType', formData.sponsorType);
        if (formData.sponsorType === 'BUSINESS') {
          submitData.append('companyName', formData.companyName);
          submitData.append('industry', formData.industry);
        }
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success - sign in and redirect to profile page
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard/profile');
      } else {
        router.push('/auth/login');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join MISHTEH and start making a difference
          </p>
        </div>

        <form className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-gray-100" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'DONOR' })}
                  className={`px-4 py-3 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    formData.userType === 'DONOR'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  💝 Donate
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'REQUESTER' })}
                  className={`px-4 py-3 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    formData.userType === 'REQUESTER'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  🙏 Request Help
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'SPONSOR' })}
                  className={`px-4 py-3 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    formData.userType === 'SPONSOR'
                      ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  🤝 Sponsor MISHTEH
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full sm:w-32 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="123456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                Location *
              </label>
              <input
                ref={locationInputRef}
                id="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="Start typing your address..."
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Required - Start typing to search for your address
              </p>
            </div>

            {/* Sponsor-specific questions */}
            {formData.userType === 'SPONSOR' && (
              <div className="space-y-4 p-3 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-primary-900">Sponsorship Details</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Are you a business or an individual? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sponsorType: 'BUSINESS' })}
                      className={`px-3 py-3 sm:px-4 sm:py-4 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        formData.sponsorType === 'BUSINESS'
                          ? 'border-primary-600 bg-white text-primary-700 shadow-md scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">🏢</span>
                        <span className="text-xs sm:text-sm">Business/Organization</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, sponsorType: 'INDIVIDUAL', companyName: '', industry: '' })}
                      className={`px-3 py-3 sm:px-4 sm:py-4 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        formData.sponsorType === 'INDIVIDUAL'
                          ? 'border-primary-600 bg-white text-primary-700 shadow-md scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">👤</span>
                        <span className="text-xs sm:text-sm">Individual</span>
                      </div>
                    </button>
                  </div>
                </div>

                {formData.sponsorType === 'BUSINESS' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-800 mb-2">
                        Company/Organization Name *
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all"
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-800 mb-2">
                        Industry/Sector *
                      </label>
                      <select
                        id="industry"
                        required
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all"
                      >
                        <option value="">Select your industry</option>
                        <option value="TECH">Technology & IT</option>
                        <option value="FINANCE">Finance & Banking</option>
                        <option value="HEALTHCARE">Healthcare & Medical</option>
                        <option value="RETAIL">Retail & E-commerce</option>
                        <option value="MANUFACTURING">Manufacturing</option>
                        <option value="HOSPITALITY">Hospitality & Tourism</option>
                        <option value="EDUCATION">Education & Training</option>
                        <option value="REAL_ESTATE">Real Estate & Property</option>
                        <option value="AGRICULTURE">Agriculture & Farming</option>
                        <option value="MEDIA">Media & Entertainment</option>
                        <option value="NONPROFIT">Non-Profit & NGO</option>
                        <option value="PROFESSIONAL_SERVICES">Professional Services</option>
                        <option value="CONSTRUCTION">Construction & Engineering</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.sponsorType === 'INDIVIDUAL' && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm border-2 border-primary-200 rounded-lg shadow-sm animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">Thank you for your generosity!</p>
                        <p className="text-xs text-gray-600">
                          Your contribution as an individual sponsor will help us empower communities and create lasting change.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FICA Documents Section - Only for REQUESTER users */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? '⏳ Creating Account...' : '✨ Create Account'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="text-center text-sm pt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

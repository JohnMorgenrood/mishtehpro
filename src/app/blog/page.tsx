'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  isExternal: boolean;
  publishedAt: string;
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [internalPosts, setInternalPosts] = useState<BlogPost[]>([]);
  const [externalPosts, setExternalPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(posts);
      setInternalPosts(posts.filter(p => !p.isExternal));
      setExternalPosts(posts.filter(p => p.isExternal));
    } else {
      const filtered = posts.filter(post => post.category === selectedCategory);
      setFilteredPosts(filtered);
      setInternalPosts(filtered.filter(p => !p.isExternal));
      setExternalPosts(filtered.filter(p => p.isExternal));
    }
  }, [selectedCategory, posts]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data: BlogPost[] = await response.json();
        setPosts(data);
        
        // Extract unique categories
        const categorySet = new Set(data.map((post) => post.category));
        const uniqueCategories: string[] = ['All', ...Array.from(categorySet)];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFeeds = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/blog/sync', {
        method: 'POST',
      });
      
      const result = await response.json();
      console.log('Sync result:', result);
      
      if (response.ok) {
        // Refresh posts immediately
        await fetchPosts();
        
        alert(`Success! Processed ${result.totalProcessed} articles.\nAdded ${result.totalAdded} new posts.\nDeleted ${result.deletedOld} old posts.\n\nDetails:\n${result.feedResults.map((f: any) => `${f.category}: ${f.added || 0} added${f.error ? ' (ERROR)' : ''}`).join('\n')}`);
      } else {
        alert(`Failed to sync feeds: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing feeds:', error);
      alert('Error syncing feeds. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            MISHTEH Stories & News
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories of hope, generosity, and faith-based news from around the world
          </p>
          {session?.user?.userType === 'ADMIN' && (
            <button
              onClick={syncFeeds}
              disabled={syncing}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync RSS Feeds'}
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                category === selectedCategory
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-soft-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Internal Blog Posts - Our Stories */}
        {internalPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {internalPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all hover:scale-105"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-primary-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full mb-3">
                      {post.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* External News - Carousel */}
        {externalPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News from Around the World</h2>
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div className="flex gap-6 pb-4" style={{ 
                  transform: `translateX(-${carouselIndex * 33.33}%)`,
                  transition: 'transform 0.5s ease-in-out'
                }}>
                  {externalPosts.map((post) => (
                    <article
                      key={post.id}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all"
                    >
                      {/* Image with gradient overlay */}
                      <div className="h-40 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
                        <img
                          src={post.imageUrl || 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800&h=400&fit=crop'}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{post.author}</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <a
                          href={post.sourceUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
                        >
                          Read Full Article
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {externalPosts.length > 3 && (
                <>
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    disabled={carouselIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(Math.min(externalPosts.length - 3, carouselIndex + 1))}
                    disabled={carouselIndex >= externalPosts.length - 3}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {externalPosts.length > 3 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.ceil(externalPosts.length / 3) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        carouselIndex === idx ? 'bg-primary-600 w-8' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {internalPosts.length === 0 && externalPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { socialApi } from '../services/api';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  platform: 'twitter' | 'facebook';
  media?: {
    type: string;
    url: string;
  }[];
}

interface SocialOperations {
  twitter: {
    post: (content: string, media?: File[]) => Promise<void>;
    timeline: () => Promise<Post[]>;
    delete: (id: string) => Promise<void>;
  };
  facebook: {
    post: (content: string, media?: File[]) => Promise<void>;
    feed: () => Promise<Post[]>;
    delete: (id: string) => Promise<void>;
  };
}

interface SocialHook extends SocialOperations {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  selectedPlatform: 'twitter' | 'facebook';
  setSelectedPlatform: (platform: 'twitter' | 'facebook') => void;
}

const useSocial = (): SocialHook => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<'twitter' | 'facebook'>('twitter');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await socialApi.twitter.timeline();
      setPosts(response.data);
    } catch (error) {
      setError('Failed to fetch timeline');
      console.error('Error fetching timeline:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await socialApi.facebook.feed();
      setPosts(response.data);
    } catch (error) {
      setError('Failed to fetch feed');
      console.error('Error fetching feed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const twitter = {
    post: async (content: string, media?: File[]) => {
      try {
        setIsLoading(true);
        setError(null);
        await socialApi.twitter.post(content, media);
        await fetchTimeline(); // Refresh the timeline
      } catch (error) {
        setError('Failed to post to Twitter');
        console.error('Error posting to Twitter:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    timeline: fetchTimeline,
    delete: async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await socialApi.twitter.delete(id);
        await fetchTimeline(); // Refresh the timeline
      } catch (error) {
        setError('Failed to delete Twitter post');
        console.error('Error deleting Twitter post:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };

  const facebook = {
    post: async (content: string, media?: File[]) => {
      try {
        setIsLoading(true);
        setError(null);
        await socialApi.facebook.post(content, media);
        await fetchFeed(); // Refresh the feed
      } catch (error) {
        setError('Failed to post to Facebook');
        console.error('Error posting to Facebook:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    feed: fetchFeed,
    delete: async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await socialApi.facebook.delete(id);
        await fetchFeed(); // Refresh the feed
      } catch (error) {
        setError('Failed to delete Facebook post');
        console.error('Error deleting Facebook post:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };

  return {
    posts,
    isLoading,
    error,
    selectedPlatform,
    setSelectedPlatform,
    twitter,
    facebook,
  };
};

export default useSocial; 
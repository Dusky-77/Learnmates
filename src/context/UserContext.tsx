import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface RecentTopic {
  id: string;
  topic_id: string;
  topic_title: string;
  topic_progress: number;
  topic_type: string | null;
  board: string | null;
  subject: string | null;
  topic_group: string | null;
  opened_at: string;
}

interface User {
  name: string;
  progress: Record<string, number>;
  recentCourses: Array<{
    id: string;
    title: string;
    progress: number;
    type: string;
    board?: string;
    subject?: string;
    group?: string;
  }>;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProgress: (courseId: string, progress: number) => void;
  addRecentCourse: (course: any) => void;
  refreshRecentCourses: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lm_user_progress', JSON.stringify(user.progress));
      localStorage.setItem('lm_user_recentCourses', JSON.stringify(user.recentCourses));
    }
  }, [user?.progress, user?.recentCourses]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lm_user_progress', JSON.stringify(user.progress));
    }
  }, [user?.progress]);

  // Fetch recent topics from DB when user is set
  useEffect(() => {
    if (user) {
      refreshRecentCourses();
    }
  }, [user?.name]);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const updateProgress = (courseId: string, progress: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        progress: { ...user.progress, [courseId]: progress }
      };
      updateUser(updatedUser);
    }
  };

  const addRecentCourse = async (course: any) => {
    if (!user) return;
    
    const existingIndex = user.recentCourses.findIndex(c => c.id === course.id);
    let updatedCourses = [...user.recentCourses];
    
    if (existingIndex >= 0) {
      updatedCourses[existingIndex] = course;
    } else {
      updatedCourses.unshift(course);
      updatedCourses = updatedCourses.slice(0, 3);
    }
    
    const updatedUser = { ...user, recentCourses: updatedCourses };
    updateUser(updatedUser);

    // Also save to Supabase
    try {
      await supabase.rpc('add_recent_topic', {
        p_topic_id: course.id,
        p_topic_title: course.title,
        p_topic_progress: course.progress || 0,
        p_topic_type: course.type || null,
        p_board: course.board || null,
        p_subject: course.subject || null,
        p_topic_group: course.group || null
      });
    } catch (err) {
      console.error('Failed to save recent topic to DB:', err);
    }
  };

  const refreshRecentCourses = async () => {
    if (!user) return;
    setLoadingRecent(true);
    try {
      const { data, error } = await supabase.rpc('get_recent_topics');
      if (error) throw error;
      
      const recentTopics = data as RecentTopic[];
      if (recentTopics.length > 0) {
        const updatedCourses = recentTopics.map(t => ({
          id: t.topic_id,
          title: t.topic_title,
          progress: t.topic_progress,
          type: t.topic_type || '',
          board: t.board || undefined,
          subject: t.subject || undefined,
          group: t.topic_group || undefined
        }));
        updateUser({ ...user, recentCourses: updatedCourses });
      }
    } catch (err) {
      console.error('Failed to fetch recent topics:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: updateUser, updateProgress, addRecentCourse, refreshRecentCourses }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
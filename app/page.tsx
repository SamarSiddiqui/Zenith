"use client";

import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { StatCard } from '../components/StatCard';
import { StatusCircle, StatusType } from '../components/StatusCircle';
import { Target, Calendar, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { getProfile } from '../lib/api/profile';
import { authApi } from '../lib/api/auth';

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (data.profile && data.profile.display_name) {
          setUserName(data.profile.display_name);
        } else {
          setUserName(authApi.getUser()?.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error("Failed to load profile", error);
        setUserName(authApi.getUser()?.email?.split('@')[0] || 'User');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Sample data for today's habits
  const todaysHabits = [
    {
      id: '1',
      name: 'Morning Meditation',
      status: 'completed' as StatusType,
      time: '07:00 AM',
    },
    {
      id: '2',
      name: 'Drink Water (2L)',
      status: 'completed' as StatusType,
      time: 'All day',
    },
    {
      id: '3',
      name: 'Read 30 mins',
      status: 'unlogged' as StatusType,
      time: '08:00 PM',
    },
    {
      id: '4',
      name: 'No Screen Time',
      status: 'unlogged' as StatusType,
      time: '09:30 PM',
    },
  ];

  if (isLoading) {
    return (
      <Layout userName={userName || 'User'}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zen-bg">
          <img src="/svgZenith.svg" alt="Loading Zenith..." className="w-24 h-24 animate-pulse opacity-80" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout userName={userName || 'User'}>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8 block">
            <h1 className="font-heading text-4xl md:text-5xl text-zen-text-primary mb-2 transition-opacity duration-300">
              {getGreeting()},{` ${userName}`}
            </h1>
            <p className="text-zen-text-secondary text-lg">{formattedDate}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Habits" value="6" icon={Target} delay={0.1} />
            <StatCard
              label="Completed Today"
              value="2/4"
              subtitle="50% completion rate"
              icon={Activity}
              trend="neutral"
              delay={0.2}
            />
            <StatCard
              label="Current Streak"
              value="12"
              subtitle="Days in a row"
              icon={Calendar}
              trend="up"
              delay={0.3}
            />
            <StatCard
              label="Weekly Rate"
              value="78%"
              subtitle="+5% from last week"
              icon={TrendingUp}
              trend="up"
              delay={0.4}
            />
          </div>

          {/* Today's Focus Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-zen-text-primary">Today's Focus</h2>
              <button className="text-sm text-zen-primary hover:text-zen-primary-hover font-medium">
                View all
              </button>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5,
                  },
                },
              }}>
              {todaysHabits.map((habit) => (
                <motion.div
                  key={habit.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="bg-zen-surface p-4 rounded-xl border border-zen-border flex items-center justify-between hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center">
                    <StatusCircle status={habit.status} size={24} interactive={false} />
                    <div className="ml-4">
                      <h3
                        className={`font-medium ${habit.status === 'completed'
                          ? 'text-zen-text-muted line-through'
                          : 'text-zen-text-primary'
                          }`}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-zen-text-muted">{habit.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}

"use client";

import React, { useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { HabitGrid } from '../../components/HabitGrid';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusType } from '../../components/StatusCircle';
import { Layout } from '../../components/Layout';

// Mock user context
const MOCK_USER = { name: 'Alex' };

export default function HabitsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate dates for the current week view
  const getWeekDates = (baseDate: Date) => {
    const dates = [];
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay()); // Start on Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString(
      'en-US',
      options
    )}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Sample Data Management
  const [habits, setHabits] = useState([
    {
      id: '1',
      name: 'Meditation',
      history: {
        [new Date().toISOString().split('T')[0]]: 'completed' as StatusType,
      },
    },
    { id: '2', name: 'Exercise', history: {} },
    { id: '3', name: 'Reading', history: {} },
    { id: '4', name: 'Journaling', history: {} },
    { id: '5', name: 'Hydration', history: {} },
    { id: '6', name: 'Sleep 8hrs', history: {} },
  ]);

  const handleToggleStatus = (habitId: string, dateStr: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const currentStatus = habit.history[dateStr] || 'unlogged';
        let nextStatus: StatusType = 'completed';

        if (currentStatus === 'completed') nextStatus = 'missed';
        else if (currentStatus === 'missed') nextStatus = 'unlogged';

        const newHistory = { ...habit.history };
        if (nextStatus === 'unlogged') {
          delete newHistory[dateStr];
        } else {
          newHistory[dateStr] = nextStatus;
        }

        return { ...habit, history: newHistory };
      })
    );
  };

  const handleAddHabit = () => {
    const name = prompt('Enter new habit name:');
    if (name) {
      setHabits([
        ...habits,
        {
          id: Date.now().toString(),
          name,
          history: {},
        },
      ]);
    }
  };

  return (
    <Layout userName={MOCK_USER.name}>
      <PageTransition>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-heading text-4xl text-zen-text-primary">Habit Planner</h1>

            <div className="flex items-center bg-zen-surface rounded-lg border border-zen-border p-1 self-start">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-zen-bg rounded-md text-zen-text-secondary transition-colors">
                <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
              </button>
              <span className="px-4 font-medium text-zen-text-primary min-w-[140px] text-center">
                {formatDateRange(weekStart, weekEnd)}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-zen-bg rounded-md text-zen-text-secondary transition-colors">
                <ChevronRight className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zen-border p-6 overflow-hidden">
            <HabitGrid
              habits={habits}
              weekDates={weekDates}
              onToggleStatus={handleToggleStatus}
              onAddHabit={handleAddHabit}
            />
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}

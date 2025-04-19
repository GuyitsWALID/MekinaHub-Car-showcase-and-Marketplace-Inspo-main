import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BlurText from '../components/BlurText';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Stat {
  title: string;
  value: number | string;
}

interface Monthly {
  month: string;
  views: number;
}

export default function DealerAnalytics() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [chartData, setChartData] = useState<Monthly[]>([]);

  const loadStats = async () => {
    // Fetch counts
    const listingsRes = await supabase
      .from('listings')
      .select('*', { count: 'exact' });
    const favoritesRes = await supabase
      .from('favorites')
      .select('*', { count: 'exact' });
    const leadsRes = await supabase
      .from('messages')
      .select('*', { count: 'exact' });

    const totalListings = listingsRes.count ?? 0;
    const totalFavorites = favoritesRes.count ?? 0;
    const totalLeads = leadsRes.count ?? 0;

    setStats([
      { title: 'Total Listings', value: totalListings },
      { title: 'Total Favorites', value: totalFavorites },
      { title: 'Leads Generated', value: totalLeads }
    ]);

    // Fetch view events for chart
    const { data } = await supabase
      .from('post_engagements')
      .select('created_at')
      .eq('engagement_type', 'view')
      .order('created_at', { ascending: true });

    if (data) {
      const byMonth = data.reduce((acc: Record<string, number>, row) => {
        const month = new Date(row.created_at).toLocaleString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      setChartData(
        Object.entries(byMonth).map(([month, views]) => ({ month, views }))
      );
    }
  };

  useEffect(() => {
    loadStats();

    // Realtime subscription for new messages (leads)
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    // Realtime subscription for view events
    const viewsChannel = supabase
      .channel('views-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_engagements', filter: 'engagement_type=eq.view' },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <BlurText
          text="Dealer Analytics"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl font-bold text-gray-900 dark:text-white"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {s.value}
            </div>
            <div className="text-gray-600 dark:text-gray-400">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Monthly Views Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Growth in Views
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

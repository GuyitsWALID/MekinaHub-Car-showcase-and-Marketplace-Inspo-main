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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch counts with proper error handling
      const [listingsRes, favoritesRes, leadsRes] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact' }),
        supabase.from('favorites').select('*', { count: 'exact' }),
        supabase.from('messages').select('*', { count: 'exact' })
      ]);

      // Check for errors in any of the responses
      if (listingsRes.error) throw new Error(`Listings error: ${listingsRes.error.message}`);
      if (favoritesRes.error) throw new Error(`Favorites error: ${favoritesRes.error.message}`);
      if (leadsRes.error) throw new Error(`Leads error: ${leadsRes.error.message}`);

      const totalListings = listingsRes.count ?? 0;
      const totalFavorites = favoritesRes.count ?? 0;
      const totalLeads = leadsRes.count ?? 0;

      setStats([
        { title: 'Total Listings', value: totalListings },
        { title: 'Total Favorites', value: totalFavorites },
        { title: 'Leads Generated', value: totalLeads }
      ]);

      // Fetch view events for chart
      const viewsRes = await supabase
        .from('post_engagements')
        .select('created_at')
        .eq('engagement_type', 'view')
        .order('created_at', { ascending: true });

      if (viewsRes.error) throw new Error(`Views error: ${viewsRes.error.message}`);

      if (viewsRes.data) {
        const byMonth = viewsRes.data.reduce((acc: Record<string, number>, row) => {
          const month = new Date(row.created_at).toLocaleString('en-US', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        setChartData(
          Object.entries(byMonth).map(([month, views]) => ({ month, views }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Improved realtime subscription for new messages (leads)
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload);
          loadStats();
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
      });

    // Improved realtime subscription for view events
    const viewsChannel = supabase
      .channel('views-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_engagements', filter: 'engagement_type=eq.view' },
        (payload) => {
          console.log('New view event:', payload);
          loadStats();
        }
      )
      .subscribe((status) => {
        console.log('Views subscription status:', status);
      });

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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
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
            {chartData.length > 0 ? (
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
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500">
                No view data available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
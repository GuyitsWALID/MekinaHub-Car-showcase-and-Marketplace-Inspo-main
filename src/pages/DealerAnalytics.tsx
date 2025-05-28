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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import GradientText from '../components/GradientText';

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
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get current user's ID and role from auth and users table
    const getCurrentDealer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setDealerId(user?.id || null);

      if (user?.id) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('type')
          .eq('id', user.id)
          .single();
        if (!error && userData) {
          setRole(userData.type);
        }
      }
    };
    getCurrentDealer();
  }, []);

  const loadStats = async () => {
    if (!dealerId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch counts specific to dealer
      const [listingsRes, favoritesRes, leadsRes] = await Promise.all([
        supabase
          .from('cars')
          .select('*', { count: 'exact' })
          .eq('dealer_id', dealerId),
        supabase
          .from('favorites')
          .select('id, listing_id', { count: 'exact' })
          .in('listing_id', 
            (await supabase
              .from('cars')
              .select('id')
              .eq('dealer_id', dealerId)
            ).data?.map(car => car.id) || []
          ),
        supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('dealer_id', dealerId)
      ]);

      if (listingsRes.error) throw new Error(`Listings error: ${listingsRes.error.message}`);
      if (favoritesRes.error) throw new Error(`Favorites error: ${favoritesRes.error.message}`);
      if (leadsRes.error) throw new Error(`Leads error: ${leadsRes.error.message}`);

      setStats([
        { title: 'Your Active Listings', value: listingsRes.count ?? 0 },
        { title: 'Buyer Favorites', value: favoritesRes.count ?? 0 },
        { title: 'Leads Generated', value: leadsRes.count ?? 0 }
      ]);

      // Fetch view events for dealer's listings
      const viewsRes = await supabase
        .from('post_engagements')
        .select('created_at, cars!inner(*)')
        .eq('engagement_type', 'view')
        .eq('cars.dealer_id', dealerId)
        .order('created_at', { ascending: true });

      if (viewsRes.error) throw new Error(`Views error: ${viewsRes.error.message}`);

      if (viewsRes.data) {
        const byMonth = viewsRes.data.reduce((acc: Record<string, number>, row) => {
          const month = new Date(row.created_at).toLocaleString('en-US', { month: 'short', year: '2-digit' });
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
    if (dealerId) {
      loadStats();

      const messagesChannel = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `dealer_id=eq.${dealerId}`
          },
          () => loadStats()
        )
        .subscribe();

      const viewsChannel = supabase
        .channel('views-channel')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'post_engagements',
            filter: `engagement_type=eq.view`
          },
          () => loadStats()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(viewsChannel);
      };
    }
  }, [dealerId]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
      <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="font-sans font-extrabold text-4xl"
        >
          Dealer Analytics
        </GradientText>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {stats.map((s) => (
              <div
                key={s.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {s.value}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300">{s.title}</div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Listing Views Over Time
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#3B82F6"
                    fill="url(#colorViews)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                No view data available yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
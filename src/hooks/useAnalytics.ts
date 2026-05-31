import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface AnalyticsData {
  revenueData: { name: string; value: number; forecast: boolean }[];
  totalRevenue: number;
  avgRevenuePerSlot: number;
  totalViews: number;
  propertiesSold: number;
  newEnquiries: number;
  districtVolume: { name: string; volume: string; searches: number; percentage: number }[];
  leadSourceData: { name: string; value: number; color: string }[];
  categoryData: { category: string; listings: string; leads: string; conversion: string; trend: 'up'|'down'; trendColor: string }[];
  loading: boolean;
  empty: boolean;
  rawLeadsCount: number;
}

export function useAnalytics(dateRange: string) {
  const [data, setData] = useState<AnalyticsData>({
    revenueData: [],
    totalRevenue: 0,
    avgRevenuePerSlot: 0,
    totalViews: 0,
    propertiesSold: 0,
    newEnquiries: 0,
    districtVolume: [],
    leadSourceData: [],
    categoryData: [],
    loading: true,
    empty: true,
    rawLeadsCount: 0
  });

  const fetchData = async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      // Calculate start date based on selected range
      const now = new Date();
      let startDate = new Date();
      if (dateRange === 'today') {
        startDate.setHours(0,0,0,0);
      } else if (dateRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else if (dateRange === '90d') {
        startDate.setDate(now.getDate() - 90);
      } else if (dateRange === '12m') {
        startDate.setMonth(now.getMonth() - 12);
      } else {
        startDate.setDate(now.getDate() - 30); // default 30d
      }
      const dateString = startDate.toISOString();

      // 1. REVENUE (payments table)
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .gte('paid_at', dateString);

      let totalRev = 0;
      let monthMap: Record<string, number> = {};
      if (payments && payments.length > 0) {
        payments.forEach(p => {
          totalRev += Number(p.amount_lkr || 0);
          const monthName = new Date(p.paid_at).toLocaleString('default', { month: 'short' }).toUpperCase();
          monthMap[monthName] = (monthMap[monthName] || 0) + Number(p.amount_lkr || 0) / 1000000; // in Millions
        });
      }
      const avgRev = payments?.length ? totalRev / payments.length : 0;
      
      let revData = Object.entries(monthMap).map(([name, val]) => ({ name, value: val, forecast: false }));
      
      // If we don't have enough data, mock a bit of structure or just show empty
      // Forecast = avg of last 3 months * 1.1
      if (revData.length > 0) {
        const last3 = revData.slice(-3);
        const avg3 = last3.reduce((sum, item) => sum + item.value, 0) / last3.length;
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        revData.push({ name: `${nextMonth.toLocaleString('default', { month: 'short' }).toUpperCase()} (FORECAST)`, value: avg3 * 1.1, forecast: true });
        
        const next2Month = new Date(now);
        next2Month.setMonth(next2Month.getMonth() + 2);
        revData.push({ name: `${next2Month.toLocaleString('default', { month: 'short' }).toUpperCase()} (FORECAST)`, value: avg3 * 1.21, forecast: true });
      }

      // 2. TOTAL VIEWS (property_views table)
      // Since it's a large table potentially, we just count
      const { count: totalViewsCount } = await supabase
        .from('property_views')
        .select('*', { count: 'exact', head: true })
        .gte('viewed_at', dateString);

      // 3. PROPERTIES SOLD
      const { count: soldCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold')
        .gte('created_at', dateString);

      // 4. NEW ENQUIRIES & LEAD SOURCES
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .gte('created_at', dateString);
      
      const newEnquiries = leads?.length || 0;
      let sourceCounts: Record<string, number> = { organic: 0, social_media: 0, direct: 0, referral: 0 };
      if (leads) {
        leads.forEach(l => {
          const s = (l.source || 'organic').toLowerCase();
          sourceCounts[s] = (sourceCounts[s] || 0) + 1;
        });
      }
      
      const totalSources = Object.values(sourceCounts).reduce((a,b)=>a+b, 0) || 1;
      const leadSourceData = [
        { name: 'Organic', value: Math.round((sourceCounts['organic'] / totalSources) * 100), color: '#004f31' },
        { name: 'Social', value: Math.round((sourceCounts['social_media'] / totalSources) * 100), color: '#00c389' },
        { name: 'Direct', value: Math.round((sourceCounts['direct'] / totalSources) * 100), color: '#4a5568' },
        { name: 'Referral', value: Math.round((sourceCounts['referral'] / totalSources) * 100), color: '#e53e3e' }
      ].filter(d => d.value > 0);

      // 5. SEARCH VOLUME BY DISTRICT
      const { data: districtViews } = await supabase
        .from('property_views')
        .select('district')
        .gte('viewed_at', dateString);
      
      let districtCounts: Record<string, number> = {};
      let maxSearches = 0;
      if (districtViews) {
        districtViews.forEach(v => {
          const d = v.district || 'Unknown';
          districtCounts[d] = (districtCounts[d] || 0) + 1;
          if (districtCounts[d] > maxSearches) maxSearches = districtCounts[d];
        });
      }
      const topDistricts = Object.entries(districtCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5)
        .map(d => ({
          name: d[0].toUpperCase(),
          volume: d[1].toLocaleString(),
          searches: d[1],
          percentage: maxSearches > 0 ? (d[1] / maxSearches) * 100 : 0
        }));

      // 6. TOP CATEGORIES
      const { data: catProperties } = await supabase.from('properties').select('id, property_category');
      const catsMap: Record<string, { listings: number; leads: number }> = {};
      
      if (catProperties) {
        catProperties.forEach(p => {
          const cat = p.property_category || 'Other';
          if (!catsMap[cat]) catsMap[cat] = { listings: 0, leads: 0 };
          catsMap[cat].listings++;
        });
      }

      if (leads && catProperties) {
        leads.forEach(l => {
          const prop = catProperties.find(p => String(p.id) === String(l.property_id));
          if (prop) {
            const cat = prop.property_category || 'Other';
            if (!catsMap[cat]) catsMap[cat] = { listings: 0, leads: 0 };
            catsMap[cat].leads++;
          }
        });
      }

      // Views per category for conversion rate
      const { data: catViews } = await supabase.from('property_views').select('property_category');
      const viewCatsMap: Record<string, number> = {};
      if (catViews) {
        catViews.forEach(v => {
          const cat = v.property_category || 'Other';
          viewCatsMap[cat] = (viewCatsMap[cat] || 0) + 1;
        });
      }

      const categoryData = Object.entries(catsMap)
        .map(([category, stats]) => {
          const catViewsTotal = viewCatsMap[category] || 0;
          const convRate = catViewsTotal > 0 ? ((stats.leads / catViewsTotal) * 100).toFixed(1) : '0.0';
          return {
            category,
            listings: stats.listings.toLocaleString(),
            leads: stats.leads.toLocaleString(),
            conversion: `${convRate}%`,
            trend: 'up' as 'up'|'down', // Mock trend for now as we'd need historical month comparison
            trendColor: 'text-green-500'
          };
        })
        .sort((a, b) => parseInt(b.leads.replace(/,/g,'')) - parseInt(a.leads.replace(/,/g,'')));

      const isEmpty = !payments?.length && !leads?.length && !districtViews?.length;

      setData({
        revenueData: revData,
        totalRevenue: totalRev,
        avgRevenuePerSlot: avgRev,
        totalViews: totalViewsCount || 0,
        propertiesSold: soldCount || 0,
        newEnquiries,
        districtVolume: topDistricts,
        leadSourceData,
        categoryData,
        loading: false,
        empty: isEmpty,
        rawLeadsCount: leads?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();

    // Setup auto-refresh every 60s
    const interval = setInterval(fetchData, 60000);

    // Setup real-time subscription for leads
    const channel = supabase.channel('leads-analytics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, () => {
        fetchData(); // Refetch when a new lead comes in
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [dateRange]);

  return data;
}

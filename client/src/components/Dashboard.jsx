import React, { useState, useEffect, lazy, Suspense } from 'react'
import { FaUser } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { LuDollarSign } from "react-icons/lu";
import { MdShoppingCartCheckout } from "react-icons/md";
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import Loader from './Loader';

// Lazy load only Chart component
const Chart = lazy(() => import('./Chart'));

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_SERVER_URL 
 
  let url
  if (API_BASE_URL) url = `${API_BASE_URL}/api/dashboard/analytics`
  else {
    url = 'http://localhost:3000/api/dashboard/analytics'
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${url}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setData(data)
      setLoading(false)
      return data;
    } catch (error) {
      setError(error)
      setLoading(false)
      console.error('Error fetching analytics:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <Loader />
  if (error) return (
    <div className="p-4 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error.message}
      </div>
    </div>
  )

  return (
    <div className='p-4 min-h-screen'>
      <h1 className='text-2xl sm:text-4xl text-center font-bold text-slate-600'>Dashboard</h1>

      <div className='w-full sm:w-10/12 mx-auto my-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Stats cards */}
        <StatsCard 
          data={data?.activeUsers} 
          Icon={FaUser} 
          title="Active Users"
        />

        <StatsCard 
          data={data?.totalProducts} 
          Icon={MdOutlineInventory2} 
          title='Total Products'
        />

        <StatsCard 
          data={data?.totalRevenue} 
          Icon={LuDollarSign} 
          title='Total Revenue'
        />

        <StatsCard 
          data={data?.conversionRate} 
          Icon={MdShoppingCartCheckout} 
          title='Conversion Rate(%)'
        />
      </div>

      {/* Sales Chart */}
      <SalesChart />

      {/* Lazy loaded Chart */}
      <Suspense fallback={<Loader />}>
        <Chart 
          monthlySalesData={data?.monthlySalesData} 
          averageRevenue={data?.customerSegment?.averageOrderValueFromAll} 
          totalOrders={data?.totalOrders}
        />
      </Suspense>
    </div>
  )
}
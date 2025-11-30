import React, { useState,useEffect } from 'react'
import axios from 'axios'
import { FaUser } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import { LuDollarSign } from "react-icons/lu";
import { MdShoppingCartCheckout } from "react-icons/md";
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import Chart from './Chart';
import Loader from './Loader';




export default function Dashboard() {
    const [data,setData] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_SERVER_URL 
  // 'http://localhost:3000/api/dashboard/analytics'
 
  let url
  if(API_BASE_URL) url = `${API_BASE_URL}/api/dashboard/analytics`
  else {
    url = 'http://localhost:3000/api/dashboard/analytics'
  }



   const fetchAnalytics = async () => {
  try {
    const response = await fetch(`${url}`, {
      method: 'GET',
      credentials: 'include', // Important for CORS
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
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchAnalytics();
      console.log(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };
  
  loadData();
}, []);
  if (loading) return <Loader/>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className='p-4  min-h-screen'>
      <h1 className=' text-2xl sm:text-4xl text-center font-bold text-slate-400'>Dashboard</h1>


      <div className='w-full sm:w-10/12 mx-auto my-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>

       

        

         {/* stats card */}

         <StatsCard data={data?.activeUsers} Icon={FaUser} title="Active Users"/>
         <StatsCard data={data?.totalProducts} Icon={MdOutlineInventory2} title='Total Products'/>
         <StatsCard data={data?.totalRevenue} Icon={LuDollarSign} title='Total Revenue'/>
         <StatsCard data={data?.conversionRate} Icon={MdShoppingCartCheckout} title='Conversion Rate(%)'/>

        </div>


        {/* sales Chart */}

       <SalesChart />

       {/* chart */}
       <Chart monthlySalesData={data?.monthlySalesData} averageRevenue={data?.customerSegment?.averageOrderValueFromAll} totalOrders={data?.totalOrders}/>

      </div>

   )
}

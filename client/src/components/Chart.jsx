import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ monthlySalesData, averageRevenue,totalOrders }) {
  // Format the data to show "Month Year" on X-axis and clean revenue
  const formattedData = monthlySalesData.map(item => ({
    ...item,
    monthYear: new Date(item.year, item.month - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    }),
    revenue: Number(item.revenue.toFixed(2)) // Ensure clean number
  }));

  const highest = monthlySalesData.sort((a, b) => b.revenue - a.revenue)[0];

  // Sort by year and month just in case
  const sortedData = formattedData.sort((a, b) => a.year - b.year || a.month - b.month);

  return (
    <div className="w-full  md:max-w-6xl mx-auto mt-10 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Monthly Revenue Trend (2024)
      </h2>

      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={sortedData}
          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
          
          <XAxis 
            dataKey="monthYear" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 16 }}
          />
          
        <YAxis 
  tickFormatter={(value) => `$${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`}
  label={{ 
    
    angle: -90, 
    position: 'insideLeft',
    style: { fontSize: 14, fill: '#666' }
  }}
/>
          
          <Tooltip 
          contentStyle={{backgroundColor:"#1abc9c"}}
            formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            labelStyle={{ color: 'black', fontWeight: 'bold' , }}
           
          />

          <Line 
          
            type="monotone" 
            dataKey="revenue" 
            stroke="#ecf0f1" 
            strokeWidth={3}
            dot={{ fill: 'green', r: 6 }}
            activeDot={{ r: 8 }}
            name="Revenue"
          />
        </LineChart>

      
      </ResponsiveContainer>

<div className='flex flex-col md:flex-row px-5 items-center gap-y-5 md:gap-y-0 md:justify-between '>

<div className=' space-y-3'>
        <h4 className='text-2xl text-stone-700 font-medium'>Highest Revenue</h4>
        <p className='text-xl text-stone-600'>${highest.revenue}</p>

      </div>
<div className=' space-y-3'>
        <h4 className='text-2xl text-stone-700 font-medium'>Average Revenue</h4>
        <p className='text-xl text-stone-600'>${averageRevenue}</p>

      </div>
<div className=' space-y-3'>
        <h4 className='text-2xl text-stone-700 font-medium'>Total Orders</h4>
        <p className='text-xl text-stone-600'>{totalOrders}</p>

      </div>

</div>
        

    
    </div>
  );
}
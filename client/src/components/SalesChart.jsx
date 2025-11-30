import React from 'react'

export default function SalesChart() {
  return (
    <div className='w-full md:w-10/12 mx-auto p-4 border border-gray-500 rounded-lg shadow-lg mt-6 '>

        <div className='flex justify-between items-center mb-4'>

            <div>
                <h4 className='text-xl font-medium text-stone-800'>Monthly Sales </h4>
                <p className='sm:text-lg text-stone-700'>Revenue Performence Over Time</p>
            </div>


            <div className='flex justify-between items-center '>
                <span className='w-2 h-2 bg-green-700 rounded-full mr-1'></span>
                <p className='font-medium text-stone-700'>Revenue</p>
            </div>

        </div>

    </div>
  )
}

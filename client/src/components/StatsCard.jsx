import React from 'react'

export default function StatsCard({ data, Icon, title }) {
  return (
    <div className='w-full flex flex-col mx-auto   border border-gray-400 rounded-lg p-4 shadow-md justify-between items-between hover:shadow-lg duration-300  my-5'>
      <div className='text-center  bg-gray-200 shadow-md w-fit p-2 rounded-full mx-auto'><Icon className=' text-gray-500 w-10 h-10' /></div>

      <div className='flex py-3 px-5 justify-between items-center'>
        <h4 className='text-xl font-medium text-stone-700'>{title}</h4>
        <span className='text-xl font-semibold text-stone-800'>{data}</span>
      </div>
    </div>
  )
}

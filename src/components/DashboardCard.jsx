import React from 'react'

const DashboardCard = ({count,label}) => {
  return (
    <div className="w-80 h-32 py-6 bg-white rounded-md relative font-qimano flex-auto">
   <h5 className='absolute top-2 right-4 5xl:text-6xl text-5xl font-medium '>
    {count}
   </h5>
   <h3 className="absolute top-[68%] left-2 text-[20px] xl:text-[23px]">{label}</h3>
    </div>
  )
}

export default DashboardCard

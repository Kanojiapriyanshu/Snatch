import React from 'react'

const DashboardCard = ({count,label}) => {
  return (
    <div className="w-[291px] 4xl:w-[320px] 5xl:w-[400px] h-[112px] 4xl:h-[120px] 5xl:h-[120px] bg-white rounded-md relative font-qimano flex-auto">
   <h5 className='absolute top-2 right-4 5xl:text-6xl text-5xl font-medium '>
    {count}
   </h5>
   <h3 className="absolute top-[68%] left-2 text-[23px]">{label}</h3>
    </div>
  )
}

export default DashboardCard

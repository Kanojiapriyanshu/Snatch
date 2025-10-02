import React from 'react'
import useFontSize from "@/hooks/useFontSize";

const DashboardCard = ({count,label}) => {
    // scale values (tweak numbers as needed)
  const countSize = useFontSize(28, 58, 1100, 1920); // count scales from 28px → 56px
  const labelSize = useFontSize(22, 28, 1100, 1920); // label scales from 16px → 24px
  return (
    <div className="w-full h-full py-6 bg-white rounded-md relative font-qimano flex-auto">
   <h5   style={{ fontSize: countSize }} className='absolute top-2 right-4 font-medium '>
    {count}
   </h5>
   <h3  style={{ fontSize: labelSize }} className="absolute top-[68%] left-2 ">{label}</h3>
    </div>
  )
}

export default DashboardCard

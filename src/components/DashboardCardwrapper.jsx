import React from 'react'
import DashboardCard from './DashboardCard'
const DashboardCardwrapper = ({count,label, plan}) => {
    return <DashboardCard count={count} label={label} plan={plan}  />;
 
}

export default DashboardCardwrapper
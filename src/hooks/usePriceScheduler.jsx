import React, { useContext } from 'react'
import { PriceScheduleContext } from '../contexts/PriceScheduleContext'
export default function usePriceScheduler() {
    const context = useContext(PriceScheduleContext);
    if(!context){
        throw new Error('usePriceScheduler must be used within a PriceSchedulerProvider.')
    }

    return context;
}

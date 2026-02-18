"use client"

import JobsChart from './JobsChart'
import Link from 'next/link'

export default function AnalyticsClient({id, income, expenses}){

    return(
        <div className='flex flex-col gap-2 items-center'>
            <section className='flex flex-col feature-card-container items-center'>
                <h2 className='text-2xl'>Analytics</h2>
                <p className='feature-card'>The data in the chart below shows your total income and expenses.</p>
            </section>
            <JobsChart id={id} income={income} expenses={expenses}/>
        </div>
    )
}

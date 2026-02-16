"use client"

import JobsChart from './JobsChart'
import Link from 'next/link'

export default function JobsClient({id}){

  async function income() {
    console.log("Income for job:", id);
  }

    return(
        <div className='flex flex-col gap-2'>
            <section className='flex flex-col feature-card-container'>
                <h2 className='text-2xl'>Job Expenses and Income</h2>
                <p className='feature-card'>Job details...</p>
            </section>
            <section className='flex flex-row'>
                <section className='flex flex-col'>
                    <h3 className='text-lg'>Expenses</h3>
                    <Link href={`/freelancer/jobs/${id}/expense-form`}>Add expense</Link>
                    <section className='flex flex-col feature-card-container'>
                        <p className='feature-card'>Expense 1</p>
                        <p className='feature-card'>Expense 2</p>
                        <p className='feature-card'>Expense 3</p>
                    </section>
                </section>
                <section className='flex flex-col'>
                    <h3 className='text-lg'>Income</h3>
                    <Link href={`/freelancer/jobs/${id}/income-form`}>Add Income</Link>
                    <section className='feature-card-container'>
                        <p className='feature-card'>Income 1</p>
                    </section>
                    <JobsChart />
                </section>
            </section>
        </div>
    )
}

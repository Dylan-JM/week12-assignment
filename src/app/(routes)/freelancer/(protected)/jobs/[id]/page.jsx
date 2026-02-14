export default function JobsId(){
    return(
        <div className='flex flex-col'>
            <uppersection className='feature-card-container'>
                <h2 className='text-2xl'>Job Expenses and Income</h2>
                <p className='feature-card'>Job details...</p>
            </uppersection>
            <lowersection className='flex-row'>
                <leftsection className='flex-col'>
                    <h3 className='text-lg'>Expenses</h3>
                    <subsection className='feature-card-container'>
                        <p className='feature-card'>Expense 1</p>
                        <p className='feature-card'>Expense 2</p>
                        <p className='feature-card'>Expense 3</p>
                    </subsection>
                </leftsection>
                <rightsection className='flex-col'>
                    <h3 className='text-lg'>Income</h3>
                    <subsection className='feature-card-container'>
                        <p className='feature-card'>Income 1</p>
                    </subsection>
                    <canvas className='feature-card'>
                        Chart JS
                    </canvas>
                </rightsection>
            </lowersection>
        </div>
    )
}
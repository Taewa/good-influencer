'use client'

export default function MainPage() {
  const goToDemo = () => {
    window.location.href = '/influencer/0xE0Ef806ce1de350fA0E0203301e1Feb6EeA147C3'; 
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
       <button 
       className='p-6 mb-4 rounded-md bg-teal-700'
       onClick={goToDemo}>Go to Demo page</button>
    </main>
  )
}

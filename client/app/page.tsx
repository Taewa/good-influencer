'use client'

import { ArrowRightIcon } from '@heroicons/react/24/solid';

export default function MainPage() {
  const goToDemo = () => {
    window.location.href = '/influencer/0xE0Ef806ce1de350fA0E0203301e1Feb6EeA147C3'; 
  }

  const goToRegistration = () => {
    window.location.href = '/influencer/register'; 
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
      <div className="max-w-xl mb-10">
        <h1 className="text-2xl font-bold mb-2">Good Influencer</h1>
        <p>
          Have you ever felt that a simple "thank you" isn't enough for a colleague who consistently 
          supports you at work? I've created an app where influencers can receive Ether donations and 
          a trophy (ERC20 token) permanently recorded on the Blockchain as proof of their impactful 
          contributions to the project.
        </p>
      </div>
      
      <button 
        className='flex justify-between w-full p-6 mb-4 rounded-md bg-teal-700 hover:bg-teal-900 text-teal-500 hover:text-white bg-transparent border border-teal-500'
        onClick={goToDemo}>
          Go to Demo page
          <ArrowRightIcon className="flex h-6 w-6" />

      </button>
      <button 
        className='flex justify-between w-full p-6 mb-4 rounded-md bg-purple-700 hover:bg-purple-900 text-purple-500 hover:text-white bg-transparent border border-purple-500'
        onClick={goToRegistration}>Go to Influencer registration page
        <ArrowRightIcon className="flex h-6 w-6" />
      </button>
    </main>
  )
}

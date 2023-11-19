'use client'

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
          Have you ever felt like "thank you so much!" is not enough for someone who constantly helps you at work? 
          Sometimes you have a co-worker who is passionate and encourages other co-workers which leads your project much in positive ways. 
          I call them good influencers and believe they deserve more. Therefore I created this app which influencers can receive 
          donations as Ether. Also the influencers will receive a trophy (it's actually ERC20 token) whenever they get a donation which will permanently carved in 
          the Blockchain and this can be a proof of great team player!
        </p>
      </div>
      
      <button 
        className='p-6 mb-4 rounded-md bg-teal-700 hover:bg-teal-800'
        onClick={goToDemo}>Go to Demo page
      </button>
      <button 
        className='p-6 mb-4 rounded-md bg-purple-700 hover:bg-purple-800'
        onClick={goToRegistration}>Go to Influencer registration page
      </button>
    </main>
  )
}

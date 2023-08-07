'use client'

import { useState } from "react";

export default function RegisterInfluencer() {
  const [userDesc, setUserDesc] = useState('');
  const [userAddr, setUserAddr] = useState('');

  const uploadInfluencerInfo = async (e:Event, addr: string, userDesc:string) => {
    e.preventDefault();

    if(!addr || !userDesc) return; // TODO: throw an error

    const body = {
      addr,
      desc: userDesc,
    }
    await fetch('http://localhost:8888/influencer/register', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
      <form className="block w-full">
      <label htmlFor='influencerAccount' className="block pb-4">Your wallet account</label>
        <input 
          required
          name="influencerAccount" 
          className="w-full p-6 text-black"
          onChange={e => setUserAddr(e.currentTarget.value)} />
        
        <label htmlFor='influencerDesc' className="block pb-4">Tell us who you are!</label>
        <textarea 
          required
          name="influencerDesc" 
          className="w-full h-60 p-6 text-black" 
          value={userDesc}
          onChange={e => setUserDesc(e.currentTarget.value) }
        />

        <button 
          className='p-6 mb-4 rounded-md bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
          onClick={e => uploadInfluencerInfo(e, userAddr, userDesc)}>
          Register
        </button>
      </form>
    </main>
  )
}

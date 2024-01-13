'use client'
import { useState, useEffect } from "react";
import Image from 'next/image'
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import Spinner from './components/Spinner';

interface InfluencerInfo {
  addr: string;
  desc: string;
  photo: File | string | undefined;
}

export default function MainPage() {
  const [influencers, setInfluencers] = useState<InfluencerInfo[]>([]);  // from Backend
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const goToDemo = () => {
    window.location.href = '/influencer/0xE0Ef806ce1de350fA0E0203301e1Feb6EeA147C3'; 
  }

  const goToRegistration = () => {
    window.location.href = '/influencer/register'; 
  }

  const goToInfluencer = (address: string) => {
    window.location.href = `influencer/0x${address}`;
  }

  const domain = process.env.API_DOMAIN;
  const getInfluencersList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${domain}/influencer/list`, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
      });

      const influencerInfo = await response.json();

      setInfluencers(influencerInfo);
      setIsLoading(false);
    } catch(e) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getInfluencersList();
  }, []);

  return (
    <main className="flex min-h-screen justify-center items-center p-10 pt-10">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Good Influencer</h1>
        <p className='mb-10'>
          Have you ever felt that a simple "thank you" isn't enough for a colleague who consistently 
          supports you at work? I've created an app where influencers can receive Ether donations and 
          a trophy (ERC20 token) permanently recorded on the Blockchain as proof of their impactful 
          contributions to the project.
        </p>

        <ul className="flex flex-wrap justify-center gap-x-4 py-4">
          {influencers.map((influencer, index) => {
            return (
              <li 
                key={index}
                onClick={() => goToInfluencer(influencer.addr)}
                className="pb-4 cursor-pointer">
                <Image
                  src={influencer?.photo as string}
                  alt="Influencer image"
                  width={120}
                  height={24}
                  priority
                  className='rounded-full'
                />
              </li>
            )
          })}
        </ul>

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
      </div>

      {
        isLoading? <Spinner></Spinner> : ''
      }
    </main>
  )
}

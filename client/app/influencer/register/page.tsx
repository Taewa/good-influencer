'use client'

import { useState } from "react";
import ImageHandlerInstance from '../../services/ImageHandler';

export default function RegisterInfluencer() {
  const [userDesc, setUserDesc] = useState('');
  const [userAddr, setUserAddr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);

  const domain = process.env.API_DOMAIN;
  const uploadInfluencerInfo = async (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, addr: string, userDesc:string, file: File | null) => {
    e.preventDefault();

    if(!addr || !userDesc || !file) {
      // TODO: throw an error
      console.log('need to fill the form');
      return;
    }; 
    const base64 = await ImageHandlerInstance.toBase64(file as File);
    
    setBase64(base64 as string);

    const body = {
      addr: addr.slice(2),
      desc: userDesc,
      photo: base64,
    }

    await fetch(`${domain}/influencer/register`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      }
    });

    setFile(null);
    setBase64(null);
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
  
    setFile(e.target.files[0]);
  };

  const onPhotoUploadClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.value = "";
  };

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

        <label htmlFor='photo' className="block pb-4">Add your beautiful photo!</label>
        <input 
          type="file" 
          name="photo" 
          accept="image/*" 
          className="block"
          onChange={onFileChange}
          onClick={onPhotoUploadClick} />

        <button 
          className='w-full p-6 my-4 rounded-md bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
          onClick={(e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {uploadInfluencerInfo(e, userAddr, userDesc, file)}}>
          Register
        </button>
      </form>
    </main>
  )
}

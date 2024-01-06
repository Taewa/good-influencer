'use client'

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ImageHandlerInstance from '../../services/ImageHandler';
import Spinner from '../../components/Spinner';
import GoodInfluencerManager from '../../../utils/GoodInfluencerManager.json';
import { TransactionReceipt } from 'alchemy-sdk/dist/src/types/ethers-types';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

export default function RegisterInfluencer() {
  const [ethereum, setEthereum] = useState<Window['ethereum']>(undefined);
  const [userDesc, setUserDesc] = useState('');
  const [userAddr, setUserAddr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [managerContract, setManagerContract] = useState<ethers.Contract>();

  const domain = process.env.API_DOMAIN;
  const managerContractAddress = process.env.INFLUENCER_MANAGER_CONTRACT_ADDRESS;
  const uploadInfluencerInfo = async (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, addr: string, userDesc:string, file: File | null) => {
    e.preventDefault();

    if(!addr || !userDesc || !file) {
      // TODO: throw an error
      console.log('need to fill the form');
      return;
    }; 

    try {
      setIsLoading(true);
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

      await registerInfluencer(addr);

      setFile(null);
      setBase64(null);
      setIsLoading(false);
      window.location.href = `/influencer/${addr}`; 

    } catch(e) {
      setIsLoading(false);
    }
  }

  const init = () => {
    setEthereum(window.ethereum);
  }

  // TODO: make service for all contracts interaction
  const setContracts = async () => {
    if (ethereum) {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const managerContract: ethers.Contract = new ethers.Contract(managerContractAddress as string, GoodInfluencerManager.abi, signer);

      setManagerContract(managerContract);
    }
  }

  const registerInfluencer = async (account: string) => {
    if (!managerContract) return;

    const tx = await managerContract.registerInfluencer(account);
    const res: TransactionReceipt = await tx.wait();
    
    console.log("Transaction:", res, tx);
    res.logs.forEach((log) => console.log(managerContract.interface.parseLog(log)));
    // isRegisterInfluencer();
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

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setContracts();
  }, [ethereum]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
      <div className="w-full max-w-xl">
        <form>
          <label htmlFor='influencerAccount' className="block pb-4">Your wallet account</label>
          <input 
            required
            name="influencerAccount" 
            className="w-full p-6 text-black bg-slate-300"
            onChange={e => setUserAddr(e.currentTarget.value)} />
          
          <label htmlFor='influencerDesc' className="block pb-4">Tell us who you are!</label>
          <textarea 
            required
            name="influencerDesc" 
            className="w-full h-60 p-6 text-black bg-slate-300" 
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
            className='flex justify-between w-full p-6 my-4 rounded-md bg-teal-700 hover:bg-teal-900 text-teal-500 hover:text-white bg-transparent border border-teal-500 isabled:cursor-not-allowed'
            onClick={(e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {uploadInfluencerInfo(e, userAddr, userDesc, file)}}>
            Register influencer
            <ArrowRightIcon className="flex h-6 w-6" />
          </button>
        </form>

        {
          isLoading? <Spinner></Spinner> : ''
        }
      </div>
    </main>
  )
}

'use client'

import Image from 'next/image'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import GoodInfluencer from '../../../utils/GoodInfluencer.json';
import GoodInfluencerManager from '../../../utils/GoodInfluencerManager.json';

export default function Influencer({params} : {params : {account: string}}) { // param: to get url params
  const [ethereum, setEthereum] = useState(undefined);
  const [connectedAccount, setConnectedAccount] = useState<string>('');    // connected wallet account
  const [influencerAddress, setInfluencerAddress] = useState<string>(''); // infuencer. account from the url param
  const [goodInfluencerContract, setGoodInfluencerContract] = useState<ethers.Contract>();
  const [managerContract, setManagerContract] = useState<ethers.Contract>();
  const [isRegistered, setRegistration] = useState<boolean>(false);
  const [numTrophy, setNumTrophy] = useState<number>(0);
  const [donationPrice, setDonationPrice] = useState<number>(0);
  const [convertedToEthDonationPrice, setConvertedToEthDonationPrice] = useState<string | number>(0);

  // TODO: if any contract address has problem, throw an error
  const goodInfluencerContractAddress = process.env.INFLUENCER_CONTRACT_ADDRESS;
  const managerContractAddress = process.env.INFLUENCER_MANAGER_CONTRACT_ADDRESS;
  const handleAccounts = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length > 0) {
      const account = accounts[0];
      console.log('Connected account: ', account);

      setConnectedAccount(account);
    } else {
      console.log("No authorized accounts yet");
    }
  };

  const setContracts = async () => {
    if (ethereum && connectedAccount) {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const goodInfluencerContract: ethers.Contract = new ethers.Contract(goodInfluencerContractAddress as string, GoodInfluencer.abi, signer);
      const managerContract: ethers.Contract = new ethers.Contract(managerContractAddress as string, GoodInfluencerManager.abi, signer);

      setManagerContract(managerContract);
      setGoodInfluencerContract(goodInfluencerContract);
    }
  }

  const donate = async(price: number) => {
    if (!price || 0 > price ) {
      // throw an error
      return;
    }
    const tx = await managerContract.donate(influencerAddress, {value: price});
    const res = await tx.wait();

    console.log("Transaction:", res, tx);
    
    // To check event emitting
    // res.logs.forEach((log) => console.log(managerContract.interface.parseLog(log)));
    getTrophy();
    setDonationPrice(0);
  };
  
  const connectAccount = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    handleAccounts(accounts);
  };

  const registerInfluencer = async () => {
    const tx = await managerContract.registerInfluencer(connectedAccount, {gasLimit: 1000000}); // TODO: what's the proper gas estimation?
    const res = await tx.wait();
    
    console.log("Transaction:", res, tx);
    res.logs.forEach((log) => console.log(managerContract.interface.parseLog(log)));
    isRegisterInfluencer();
  }
  
  const isRegisterInfluencer = async () => {
    const isRegistered = await managerContract.isRegisteredInfluencer(influencerAddress, {gasLimit: 1000000}); // TODO: what's the proper gas estimation?
    setRegistration(isRegistered);
  }

  const getTrophy = async () => {
    const { account } = params; 
    const numTrophy = await goodInfluencerContract.balanceOf(account);

    setNumTrophy(numTrophy.toString());
  }

  const init = () => {
    const { account } = params; 
    if (account) {
      setEthereum(window.ethereum)
      setInfluencerAddress(account);
    } else {
      // TODO: throw an error => redirect to other page
    }
  }

  const formatEther = (val: number) => {
    if (!val) {
      setConvertedToEthDonationPrice(0);
      return;
    }

    const converted = ethers.formatEther(val);
    setConvertedToEthDonationPrice(converted);
  }

  const attachEvents = () => {
    ethereum.on("accountsChanged", (args) => {
      console.log(`accountsChanged from ${connectedAccount} to ${args[0]}`);
      if (args[0] !== connectedAccount) {
        setConnectedAccount(args[0]);
      }
    });

    managerContract.on("RegisteringInfluencer", (_influencer, _when) => {
      console.log("RegisteringInfluencer event", _influencer, _when);
    });

    managerContract.on("Donate", (_donator, _influencer, _donation) => {
      console.log("Donate event", _donator, _influencer, _donation);
    });
  }
  
  useEffect(() => {
    init();
  }, []);
  
  useEffect(() => {
    if (ethereum) {
      handleAccounts();
    }
  }, [ethereum]);

  useEffect(() => {
    if (managerContract) return;
    setContracts();
  }, [connectAccount]);

  useEffect(() => {
    if (managerContract) {
      attachEvents();
      getTrophy();
      isRegisterInfluencer();
    }
  }, [managerContract]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
      <section>
      <Image
        src="/influencer.jpeg"
        alt="Influencer image"
        width={200}
        height={24}
        priority
        className='rounded-full'
      />
      </section>

      <p className='py-8 text-xl'>🏆 Trophy: {numTrophy}</p>
      {isRegistered ? <p className='text-green-600'>Currently registered influencer</p> : <p className='text-red-600'>Currently not registered influencer</p>}

      <p id='description' className='py-8 text-lg'>Hi! I am a software engineer and love helping my coworkers!</p>

      <section className='mb-4'>
        <div id='donationBlock' className='flex rounded-md overflow-hidden'>
          <input 
            type="number" 
            value={donationPrice}
            onChange={e => { setDonationPrice(e.currentTarget.value); formatEther(e.currentTarget.value); }}
            id="donationPrice" 
            className='p-4 text-black' />
          
          <button 
            id='donateButton' 
            className='p-6 bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
            disabled={!connectedAccount || 0 >= donationPrice}
            onClick={_ => {donate(donationPrice)}}>
            Donate (wei)
          </button>
        </div>
        <p className='text-center text-sm'>equivalent to {convertedToEthDonationPrice} ETH</p>
      </section>

      <button 
        className='p-6 mb-4 rounded-md bg-teal-700'
        disabled={isRegistered}
        onClick={registerInfluencer}>
        Register me as an influencer
      </button>
      {isRegistered && <p className='text-gray-600'>You are already registered influencer :)</p>}
     
      {!connectedAccount && <p className='text-red-600'>Please connect to your wallet.</p>}
    </main>
  )
}

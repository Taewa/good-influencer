'use client'

import Image from 'next/image'
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import GoodInfluencer from '../../../utils/GoodInfluencer.json';
import GoodInfluencerManager from '../../../utils/GoodInfluencerManager.json';

export default function Influencer({params} : {params : {account: string}}) { // param: to get url params
  const [ethereum, setEthereum] = useState(undefined);
  const [connectedAccount, setConnectedAccount] = useState(undefined);
  const [goodInfluencerContract, setGoodInfluencerContract] = useState(undefined);
  const [managerContract, setManagerContract] = useState(undefined);
  const [isRegistered, setRegistration] = useState(false);
  const [influencerAddress, setInfluencerAddress] = useState<string>('');
  const [numTrophy, setNumTrophy] = useState<number>(0);
  const [donationPrice, setDonationPrice] = useState<number>(0);
  const [convertedToEthDonationPrice, setConvertedToEthDonationPrice] = useState<string | number>(0);

  // TODO: make dynamic contract addresses
  const goodInfluencerContractAddress:string = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c';
  const managerContractAddress:string = '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d';

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
      const goodInfluencerContract: ethers.Contract = new ethers.Contract(goodInfluencerContractAddress, GoodInfluencer.abi, signer);
      const managerContract: ethers.Contract = new ethers.Contract(managerContractAddress, GoodInfluencerManager.abi, signer);

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
    const tx = await managerContract.registerInfluencer(influencerAddress, {gasLimit: 1000000}); // TODO: what's the proper gas estimation?
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
      // throw an error
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

  const watchEvents = () => {
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
      watchEvents();
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

      {/* {!connectedAccount &&
        <button 
          id='connectButton' 
          className='p-6 my-6 rounded-md bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
          onClick={connectAccount}>
          Connect to wallet
        </button>
      } */}
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
     
      {/* <button 
        className='p-6 mb-4 rounded-md bg-green-600'
        disabled={!connectedAccount}
        onClick={isRegisterInfluencer}>
        Check registration
      </button> */}

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

'use client'

declare global {
  interface Window {
    ethereum: any
  }
}

import Image from 'next/image'
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, modal } from "@nextui-org/react";
import { ethers } from "ethers";
import { serializeError } from '@metamask/rpc-errors';
import GoodInfluencer from '../../../utils/GoodInfluencer.json';
import GoodInfluencerManager from '../../../utils/GoodInfluencerManager.json';
import { TransactionReceipt } from 'alchemy-sdk/dist/src/types/ethers-types';
import ImageHandlerInstance from '../../services/ImageHandler';
import Spinner from '../../components/Spinner';
import { ExclamationTriangleIcon, HandThumbUpIcon } from '@heroicons/react/24/solid'

interface InfluencerInfo {
  addr: string;
  desc: string;
  photo: File | string | undefined;
}

type ModalContents = {
  title: string;
  content: string;
  icon?: React.ReactElement;
}

export default function Influencer({params} : {params : {account: string}}) { // param: to get url params
  const [ethereum, setEthereum] = useState<Window['ethereum']>(undefined);
  const [connectedAccount, setConnectedAccount] = useState<string>('');    // connected wallet account
  const [influencerAddress, setInfluencerAddress] = useState<string>(''); // infuencer. account from the url param
  const [goodInfluencerContract, setGoodInfluencerContract] = useState<ethers.Contract>();
  const [managerContract, setManagerContract] = useState<ethers.Contract>();
  const [isRegistered, setRegistration] = useState<boolean>(false);
  const [numTrophy, setNumTrophy] = useState<number>(0);
  const [donationPrice, setDonationPrice] = useState<string>('0');
  const [convertedToEthDonationPrice, setConvertedToEthDonationPrice] = useState<string | number>(0);
  const [influencerInfo, setInfluencerInfo] = useState<InfluencerInfo>({addr: '', desc: '', photo: undefined} );  // from Backend
  const [influencerPrize, setInfluencerPrize] = useState<string | number>(0);                                     // from Blockchain
  const [isEventInited, setIsEventInited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isOpen: isModalOpen, onOpen: openModal, onOpenChange: onOpenModalChange } = useDisclosure();
  const [modalMessage, setModalMessage] = useState<ModalContents>({title: '', content: ''});
  
  // TODO: if any contract address has problem, throw an error
  const goodInfluencerContractAddress = process.env.INFLUENCER_CONTRACT_ADDRESS;
  const managerContractAddress = process.env.INFLUENCER_MANAGER_CONTRACT_ADDRESS;
  const domain = process.env.API_DOMAIN;

  const getInfluencerInfo = async () => {
    try {
      setIsLoading(true);
      const addr = params.account.slice(2);
      const response = await fetch(`${domain}/influencer?address=${addr}`, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
      });
      const influencerInfo = await response.json();
      setInfluencerInfo(influencerInfo);
      setIsLoading(false);
    } catch(e) {
      setIsLoading(false);
    }
  }

  const handleAccounts = async () => {
    if(!ethereum) return;

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length > 0) {
      const account = accounts[0];
      console.log('Connected account: ', account);

      setConnectedAccount(account);
    } else {
      console.log("No authorized accounts yet. Request accounts.");
      await ethereum.request({ method: 'eth_requestAccounts' });
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

  const showModal = (contents: ModalContents) => {
    setModalMessage({
      title: contents.title, 
      content: contents.content, 
      icon: contents.icon,
    });
    openModal();
  };

  const donate = async(price: number) => {

    try {
      if (!price || 0 > price ) {
        // TODO: throw an error
        return;
      }
      
      if (!managerContract) return;
      setIsLoading(true);
      try {
        const tx = await managerContract.donate(influencerAddress, {value: price});
        const res = await tx.wait();
        const updatedPrize = Number(influencerPrize) + price;
        
        console.log("Transaction donate:", res, tx);

        // To check event emitting
        // res.logs.forEach((log) => console.log(managerContract.interface.parseLog(log)));
        getTrophy();
        setDonationPrice('0');
        formatEther('0');
        setInfluencerPrize(updatedPrize);

        showModal({
          title: 'Transferred', 
          content: 'Thanks for your donation!', 
          icon: <HandThumbUpIcon className="flex h-6 w-6 text-blue-500" />
        });
      } catch(e: unknown) {
        // TODO: not sure why 'cause' doesn't exist in 'Json & ExactOptionalGuard' type
        // https://github.com/MetaMask/rpc-errors/issues/129
        const err: any = serializeError(e);

        showModal({
          title: 'Oops...something went wrong', 
          content: err?.data?.cause?.reason,
          icon: <ExclamationTriangleIcon className="flex h-6 w-6 text-red-500" />
        });
      }
      
      setIsLoading(false);
    } catch(e) {
      setIsLoading(false);
    } 
  };

  const withdraw = async() => {
    if(connectedAccount.toLowerCase() !== influencerAddress.toLowerCase()) {
      // TODO: display error UI
      console.log('current wallet account should match with this page influencer');
      return;  // only this page's influencer can withdraw
    }
    
    if(!influencerPrize || influencerPrize === 0 || influencerPrize === '0') {
      // TODO: display error UI
      console.log('prize should be greater than 0');
      return;
    }
    
    if (!managerContract) return;

    try {
      setIsLoading(true);
      const tx = await managerContract.withdraw(influencerPrize);
      const res: TransactionReceipt = await tx.wait();

      console.log("Transaction:", res, tx);
      res.logs.forEach((log) => console.log(managerContract.interface.parseLog(log)));

      getDonatedPrize(influencerAddress);
      setIsLoading(false);
    } catch(e) {
      setIsLoading(false);
    }
  }
  
  const isRegisterInfluencer = async () => {
    if (!managerContract) return;

    const isRegistered = await managerContract.isRegisteredInfluencer(influencerAddress);

    setRegistration(isRegistered);
  }

  const getTrophy = async () => {
    if (!goodInfluencerContract) return;
    
    const { account } = params; 
    const numTrophy = await goodInfluencerContract.balanceOf(account);

    setNumTrophy(numTrophy.toString());
  }

  const getDonatedPrize = async (influencerAddress: string) => {
    if (!managerContract) return;

    const [_, totalDonatedPrize] = await managerContract.achievements(influencerAddress);
    
    setInfluencerPrize(totalDonatedPrize);
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

  const updateDonationPrice = (price: string) => {
    setDonationPrice(price); 
    formatEther(price);
  } 

  const formatEther = (val: string) => {
    if (!val) {
      setConvertedToEthDonationPrice(0);
      return;
    }

    const converted = ethers.formatEther(val);
    setConvertedToEthDonationPrice(converted);
  }

  const attachEvents = () => {
    if (!managerContract) return;
    if (isEventInited) return;

    ethereum.on("accountsChanged", (args: string[]) => {
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

    setIsEventInited(true);
  }

  const onModalClose = () => {
    setModalMessage({title: '', content: ''});
  }
  
  useEffect(() => {
    getInfluencerInfo();
    init();
  }, []);
  
  useEffect(() => {
    if (ethereum) {
      handleAccounts();
    }
  }, [ethereum]);

  useEffect(() => {
    setContracts();
  }, [connectedAccount]);

  useEffect(() => {
    if (managerContract) {
      attachEvents();
      getTrophy();
      isRegisterInfluencer();
      getDonatedPrize(influencerAddress);
    }
  }, [managerContract]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-10">
      <section>
        {
          ImageHandlerInstance && influencerInfo?.photo &&
          <Image
            src={influencerInfo?.photo as string}
            alt="Influencer image"
            width={200}
            height={24}
            priority
            className='rounded-full'
          />
        }
      </section>

      <p className='py-8 text-xl'>🏆 Trophy: {numTrophy}</p>
      {isRegistered ? <p className='text-green-600'>Currently registered influencer</p> : <p className='text-red-600'>Currently not registered influencer</p>}

      <p id='description' className='py-8 text-lg'>{influencerInfo?.desc}</p>

      <section className='mb-4'>
        <div id='donationBlock' className='flex rounded-md overflow-hidden'>
          <input 
            type="number" 
            value={donationPrice}
            min='0'
            onChange={e => { updateDonationPrice(e.currentTarget.value); }}
            id="donationPrice" 
            className='p-4 text-black bg-slate-300' />
          
          <button 
            id='donateButton' 
            className='p-6 bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
            disabled={!connectedAccount || 0 >= parseInt(donationPrice)}
            onClick={_ => {donate(parseInt(donationPrice))}}>
            Donate (wei)
          </button>
        </div>
        <p className='text-center text-sm'>equivalent to {convertedToEthDonationPrice} ETH</p>
      </section>

      <section className='w-full mb-4'>
        <button
          className='w-full p-6 rounded-md bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed'
          disabled={connectedAccount.toLowerCase() !== influencerAddress.toLowerCase() || influencerPrize == 0}
          onClick={withdraw}>
            Withdraw {influencerPrize.toString()} wei
        </button>
        <p className='text-sm'>Ether: {ethers.formatEther(influencerPrize)}</p>
      </section>
     
      {!connectedAccount && <p className='text-red-600'>Please connect to your wallet.</p>}
      {
        isLoading? <Spinner></Spinner> : ''
      }

      <Modal isOpen={isModalOpen} onOpenChange={onOpenModalChange} onClose={onModalClose}>
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="flex gap-1">
                {modalMessage.icon}
                <span>{modalMessage.title}</span>
              </ModalHeader>
              <ModalBody>
                <p>{modalMessage.content}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onModalClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  )
}

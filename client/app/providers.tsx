'use client'
import { useState, useEffect } from "react";
import { NextUIProvider } from '@nextui-org/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, } from "@nextui-org/react";
import DeviceDetector from "./services/environmentDetector";

type ModalContents = {
  title: string;
  content: string;
  icon?: React.ReactElement;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const { isOpen: isModalOpen, onOpen: openModal, onOpenChange: onOpenModalChange } = useDisclosure();
  const [modalMessage, setModalMessage] = useState<ModalContents>({title: '', content: ''});
  const isMobileOrTablet = DeviceDetector.checkMobileOrTablet();
  const hasMetaMask = DeviceDetector.hasMetaMask();
  
  const showModal = (contents: ModalContents) => {
    setModalMessage({
      title: contents.title, 
      content: contents.content, 
      icon: contents.icon,
    });
    openModal();
  };

  const onModalClose = () => {
    setModalMessage({title: '', content: ''});
  }

  const goToMetaMaskPage = () => {
    window.location.href = 'https://support.metamask.io/hc/en-us/articles/6356387482523-How-to-use-the-MetaMask-Mobile-Browser'; 
  }

  useEffect(() => {
    if(!hasMetaMask) {
      showModal({
        title: 'No Metamask detected :/', 
        content: 'If you use a laptop or desktop browser, please install Metamask plug-in. If you use a mobile phone browser, please use in-app browser in MetaMask.',
        icon: <ExclamationTriangleIcon className="flex h-6 w-6 text-red-500" />
      });
    }
  }, []);

  return (
    <NextUIProvider>
        <NextThemesProvider
            attribute='class'
            defaultTheme='dark'
            themes={['light', 'dark', 'modern']}>
            {children}
        </NextThemesProvider>

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
                {isMobileOrTablet ? 
                  <Button color="secondary" onPress={goToMetaMaskPage}>
                    How to use in-app browser in MetaMask
                  </Button>
                : 
                  <Button color="danger" variant="light" onPress={onModalClose}>
                    Close
                  </Button>
                }
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
    </NextUIProvider>
  )
}
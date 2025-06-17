import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
}

export default function AuthModals({ 
  isLoginOpen, 
  isRegisterOpen, 
  onCloseLogin, 
  onCloseRegister 
}: AuthModalsProps) {
  const switchToRegister = () => {
    onCloseLogin();
    setTimeout(() => {
      // Small delay to prevent modal overlap
    }, 100);
  };

  const switchToLogin = () => {
    onCloseRegister();
    setTimeout(() => {
      // Small delay to prevent modal overlap
    }, 100);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onSwitchToRegister={() => {
          onCloseLogin();
          // Trigger register modal after a short delay
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('openRegisterModal'));
          }, 150);
        }}
      />
      
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={onCloseRegister}
        onSwitchToLogin={() => {
          onCloseRegister();
          // Trigger login modal after a short delay
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('openLoginModal'));
          }, 150);
        }}
      />
    </>
  );
} 
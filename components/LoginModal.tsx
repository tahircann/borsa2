import { useState, useContext } from 'react';
import { useAuth, LoginCredentials } from '../utils/auth';
import { FiX, FiUser, FiLock, FiMail } from 'react-icons/fi';
import { LanguageContext } from '../pages/_app';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language } = useContext(LanguageContext);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const credentials: LoginCredentials = { email, password };
    const result = await login(credentials);
    
    setLoading(false);
    
    if (result.success) {
      console.log('Login successful:', result.user);
      setEmail('');
      setPassword('');
      onClose();
      // Refresh the page to update UI with user data
      window.location.reload();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-center">
          {language === 'en' ? 'Login' : 'Giriş Yap'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              {language === 'en' ? 'Email' : 'E-posta'}
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiMail className="text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 outline-none"
                placeholder={language === 'en' ? 'Enter your email' : 'Email adresinizi girin'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {language === 'en' ? 'Password' : 'Şifre'}
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiLock className="text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 outline-none"
                placeholder={language === 'en' ? 'Enter your password' : 'Şifrenizi girin'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading 
              ? (language === 'en' ? 'Logging in...' : 'Giriş yapılıyor...') 
              : (language === 'en' ? 'Login' : 'Giriş Yap')
            }
          </button>
          
          {onSwitchToRegister && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {language === 'en' ? "Don't have an account? " : 'Hesabınız yok mu? '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  {language === 'en' ? 'Register' : 'Kayıt ol'}
                </button>
              </p>
            </div>
          )}
          

        </form>
      </div>
    </div>
  );
} 
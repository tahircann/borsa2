import { useState } from 'react';
import { useAuth, RegisterCredentials } from '../utils/auth';
import { FiX, FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const credentials: RegisterCredentials = {
      email,
      username,
      password,
      confirmPassword
    };
    
    const result = register(credentials);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(result.message);
      // Clear form
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // Auto-switch to login after 2 seconds
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        } else {
          onClose();
        }
      }, 2000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <FiX className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-center">Hesap Oluştur</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email *
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiMail className="text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 outline-none"
                placeholder="Email adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Kullanıcı Adı *
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiUser className="text-gray-500" />
              </div>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 outline-none"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Şifre *
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiLock className="text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 outline-none"
                placeholder="Şifrenizi girin (min. 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Şifreyi Tekrarla *
            </label>
            <div className="flex items-center border rounded-md">
              <div className="px-3 py-2 bg-gray-100 border-r">
                <FiLock className="text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 outline-none"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
          </button>
          
          {onSwitchToLogin && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Giriş yap
                </button>
              </p>
            </div>
          )}
          
          <div className="text-center mt-4 text-xs text-gray-500">
            <p>
              Hesap oluşturarak{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Kullanım Şartları
              </a>{' '}
              ve{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Gizlilik Politikası
              </a>
              'nı kabul etmiş olursunuz.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const hasError = touched && email.length > 0 && !isValidEmail(email);
  const isFormValid = email.length > 0 && isValidEmail(email);

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);

    if (!isFormValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Password reset email sent to:', email);

      // Show success state
      setIsSuccess(true);

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('Error sending reset email:', error);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur}
              disabled={isLoading}
              autoComplete="email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                hasError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter your email"
              autoFocus
            />
            {hasError && (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please enter a valid email address</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>Send reset link</span>
            )}
          </button>

          {/* Secondary Link */}
          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to login</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-green-600 font-medium mb-4">
            Password reset email sent! Please check your inbox and follow the instructions.
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to login</span>
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
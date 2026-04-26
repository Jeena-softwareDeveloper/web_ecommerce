import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You could also send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo }) => {
  const navigate = useNavigate();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Something went wrong</h1>
        <p className="text-[13px] font-medium text-gray-500 mb-8 leading-relaxed px-4">
          We encountered an unexpected error. Please try refreshing the page or head back to home.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="w-full bg-[#e11955] text-white font-black uppercase text-[12px] tracking-widest py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Page
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-900 text-white font-black uppercase text-[12px] tracking-widest py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go to Home
          </button>
        </div>

        {/* Debug info hidden from customers but kept for devs in console */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            If this persists, please try again later
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

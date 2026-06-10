import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // We log the error quietly but never show it to the user
    console.error("ErrorBoundary caught an error:", error);
  }

  handleRetry = () => {
    // Clear the error state and force a reload to attempt auto-recovery
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center animate-in zoom-in duration-300">
            <div className="mx-auto h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
              Oups, un imprévu !
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              Nous avons rencontré un problème temporaire. Ne vous inquiétez pas, aucune donnée n'a été perdue. Veuillez réessayer ou rafraîchir la page.
            </p>
            <button
              onClick={this.handleRetry}
              className="w-full py-4 text-sm font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 shadow-lg transition-all flex justify-center items-center gap-2"
            >
              <RefreshCcw size={16} />
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

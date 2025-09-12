import React from 'react';
import { logger } from '../utils/logger';

/**
 * ErrorBoundary
 * Catches render errors to prevent app-wide crashes and displays a fallback.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('UI error boundary caught', { error: error?.message, stack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 border rounded bg-red-50 text-red-800">
          <h2 className="font-bold mb-2">Something went wrong.</h2>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;



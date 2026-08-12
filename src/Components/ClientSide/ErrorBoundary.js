import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('AirEase UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <h1 className="h3 text-danger">Something went wrong</h1>
          <p className="text-muted">Please refresh the page or return home.</p>
          <a href="/" className="btn btn-primary">
            Go home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

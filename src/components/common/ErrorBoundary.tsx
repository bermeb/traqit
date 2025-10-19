/**
 * ErrorBoundary Component
 * Catches and displays errors in child components
 */

import { Component, ReactNode } from 'react';
import { Card, Button } from './';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <Card className="error-boundary__card">
            <div className="error-boundary__icon">⚠️</div>
            <h2 className="error-boundary__title">Etwas ist schiefgelaufen</h2>
            <p className="error-boundary__message">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuche die Seite neu zu laden.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Fehlerdetails (nur im Entwicklungsmodus)</summary>
                <pre className="error-boundary__stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <Button variant="primary" size="md" onClick={this.handleReload}>
                Seite neu laden
              </Button>
              <Button variant="ghost" size="md" onClick={this.handleReset}>
                Erneut versuchen
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("JalSheti Pro ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center p-6 font-primary text-center">
            <div className="bg-surface-card rounded-xl shadow-md p-8 max-w-md">
              <h2 className="text-heading text-danger-600 mb-3">
                काहीतरी चूक झाली
              </h2>
              <p className="text-body text-secondary-700 mb-4">
                अॅपमध्ये अनपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.
              </p>
              <p className="text-label text-secondary-500 mb-6">
                {this.state.error?.message || "Unknown error"}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/auth";
                }}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-cta font-bold"
                style={{ minHeight: "56px" }}
              >
                पुन्हा सुरू करा
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

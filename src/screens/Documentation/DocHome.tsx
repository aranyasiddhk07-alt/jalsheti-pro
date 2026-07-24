import { Link } from 'react-router-dom';
import { Card } from '../../components';

export default function DocHome() {
  return (
    <div className="min-h-screen bg-surface-bg font-primary">
      <header className="bg-primary-700 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-primary-200 hover:text-white text-sm">← Home</Link>
          <h1 className="text-2xl font-bold mt-2">Documentation</h1>
          <p className="text-primary-200 text-sm mt-1">Complete product and technical documentation for JalSheti Pro</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/documentation/product">
            <Card elevation="shadow" className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="text-center py-6">
                <div className="text-5xl mb-4">📘</div>
                <h2 className="text-xl font-bold text-secondary-800 mb-2">Product Documentation</h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Vision, mission, problem statement, target users, features, AI capabilities, business model, roadmap, and success metrics.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Product Strategy</span>
                  <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">User Personas</span>
                  <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">AI Features</span>
                  <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">Business Model</span>
                </div>
                <div className="mt-4 text-primary-600 font-semibold text-sm">Read PRODUCT.md →</div>
              </div>
            </Card>
          </Link>

          <Link to="/documentation/implementation">
            <Card elevation="shadow" className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🏗</div>
                <h2 className="text-xl font-bold text-secondary-800 mb-2">Technical Implementation</h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Architecture, database design, Edge Functions, AI engines, security, performance, scalability, deployment, and testing.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-secondary-50 text-secondary-700 text-xs px-2 py-1 rounded-full">Architecture</span>
                  <span className="bg-secondary-50 text-secondary-700 text-xs px-2 py-1 rounded-full">Database</span>
                  <span className="bg-secondary-50 text-secondary-700 text-xs px-2 py-1 rounded-full">Edge Functions</span>
                  <span className="bg-secondary-50 text-secondary-700 text-xs px-2 py-1 rounded-full">Security</span>
                </div>
                <div className="mt-4 text-primary-600 font-semibold text-sm">Read IMPLEMENTATION.md →</div>
              </div>
            </Card>
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-secondary-500">
            These documents are also available in the GitHub repository at{' '}
            <a href="https://github.com/aranyasiddhk07-alt/jalsheti-pro/tree/main/MVP" target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">
              MVP/
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

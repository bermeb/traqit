/**
 * Main App Component
 * Handles routing and layout
 */

import { useAppContext } from './context';
import { Header, Navigation } from './components/layout';
import { Loading } from './components/common';
import { HomePage, EntriesPage, BackupPage, ViewConfigsPage, AnalyticsPage } from './pages';
import './App.css';

function App() {
  const { currentRoute, isLoading, error } = useAppContext();

  if (isLoading) {
    return <Loading fullScreen text="Lade Daten..." />;
  }

  // Render current page based on route
  let PageComponent;
  switch (currentRoute) {
    case '/':
      PageComponent = HomePage;
      break;
    case '/entries':
      PageComponent = EntriesPage;
      break;
    case '/analytics':
      PageComponent = AnalyticsPage;
      break;
    case '/backup':
      PageComponent = BackupPage;
      break;
    case '/view-configs':
      PageComponent = ViewConfigsPage;
      break;
    // Legacy routes - redirect to new combined pages
    case '/fields':
      PageComponent = EntriesPage; // Fields are now in Entries page
      break;
    case '/charts':
    case '/image-compare':
      PageComponent = AnalyticsPage; // Charts and image comparison are now in Analytics page
      break;
    default:
      PageComponent = HomePage;
  }

  return (
    <div className="app">
      <Header />
      <Navigation />

      <main className="app__main">
        {error && (
          <div className="app__error animate-slide-in-down">
            <p>{error}</p>
          </div>
        )}
        <div className="app__page animate-fade-in" key={currentRoute}>
          <PageComponent />
        </div>
      </main>
    </div>
  );
}

export default App;

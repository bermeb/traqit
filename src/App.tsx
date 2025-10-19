/**
 * Main App Component
 * Handles routing and layout
 */

import { useAppContext } from './context';
import { Header, Navigation } from './components/layout';
import { Loading } from './components/common';
import { HomePage, FieldsPage, EntriesPage, ChartsPage, BackupPage, ViewConfigsPage, ImageComparisonPage } from './pages';
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
    case '/fields':
      PageComponent = FieldsPage;
      break;
    case '/entries':
      PageComponent = EntriesPage;
      break;
    case '/charts':
      PageComponent = ChartsPage;
      break;
    case '/backup':
      PageComponent = BackupPage;
      break;
    case '/view-configs':
      PageComponent = ViewConfigsPage;
      break;
    case '/image-compare':
      PageComponent = ImageComparisonPage;
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

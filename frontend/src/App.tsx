import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsProvider } from './context/DesignsContext';
import UploadScreen from './components/UploadScreen';
import DesignsList from './components/DesignsList';
import DesignDetail from './components/DesignDetail';

const App = () => (
  <BrowserRouter>
    <DesignsProvider>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/designs" element={<DesignsList />} />
        <Route path="/designs/:id" element={<DesignDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DesignsProvider>
  </BrowserRouter>
);

export default App;

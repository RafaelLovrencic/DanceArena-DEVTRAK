import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Naslovnica from './stranice/naslovnica.jsx'
import UnosPodataka from './stranice/unospodataka.jsx';
import { AuthProvider } from "./kontekst/AuthContext";
import Natjecanja from './stranice/natjecanja.jsx';
import PojedinoNatjecanje from './stranice/pojedinoNatjecanje.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Naslovnica />} />
          <Route path="/unospodataka" element={<UnosPodataka />} />
          <Route path="/natjecanja" element={<Natjecanja />} />
          <Route path="/natjecanje/:id" element={<PojedinoNatjecanje />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Naslovnica from './stranice/naslovnica.jsx'
import UnosPodataka from './stranice/unospodataka.jsx';
import Profil from './stranice/profil.jsx';
import ObavijestSucu from './stranice/obavijestSucu.jsx';
import { AuthProvider } from "./kontekst/AuthContext";
import Natjecanja from './stranice/natjecanja.jsx';
import PojedinoNatjecanje from './stranice/pojedinoNatjecanje.jsx';
import UnosPodatakaSudac from './stranice/unospodatakaSudac.jsx'
import OAuthCallback from "./stranice/OAuthCallback";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Naslovnica />} />
          <Route path="/unospodataka" element={<UnosPodataka />} />
          <Route path="/unospodatakasuci" element={<UnosPodatakaSudac />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/natjecanja" element={<Natjecanja />} />
          <Route path="/natjecanje/:id" element={<PojedinoNatjecanje />} />
          <Route path="/obavijestsucu" element={<ObavijestSucu />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

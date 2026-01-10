import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Naslovnica from './stranice/naslovnica.jsx'
import UnosPodataka from './stranice/unospodataka.jsx';
<<<<<<< HEAD
=======
import Profil from './stranice/profil.jsx';
import ObavijestSucu from './stranice/obavijestSucu.jsx';
>>>>>>> feature/22-mail
import { AuthProvider } from "./kontekst/AuthContext";
import Natjecanja from './stranice/natjecanja.jsx'
import UnosPodatakaSudac from './stranice/unospodatakaSudac.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Naslovnica />} />
          <Route path="/unospodataka" element={<UnosPodataka />} />
<<<<<<< HEAD
=======
          <Route path="/unospodatakasuci" element={<UnosPodatakaSudac />} />
          <Route path="/profil" element={<Profil />} />
>>>>>>> feature/22-mail
          <Route path="/natjecanja" element={<Natjecanja />} />
          <Route path="/obavijestsucu" element={<ObavijestSucu />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

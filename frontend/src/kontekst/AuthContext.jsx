import { createContext, useContext, useState, useEffect } from "react";
import { BACKEND_IP } from "../config";
import { generateFingerprint } from "../kontekst/fingerprint";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [korisnik, setKorisnik] = useState(null);
  const [klub, setKlub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [fp, setFingerprint] = useState(generateFingerprint());

  const azurirajKorisnika = (noviPodaci) => setKorisnik(prev => ({ ...prev, ...noviPodaci }));
  const azurirajKlub = (noviPodaci) => setKlub(prev => ({ ...prev, ...noviPodaci }));

  const postaviToken = (noviToken) => {
    localStorage.setItem("token", noviToken);
    setToken(noviToken);
  };

  const provjeriKorisnika = async () => {
    if (!token) {
      setKorisnik(null);
      setKlub(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
        headers: { Authorization: `Bearer ${token}`, "X-Fingerprint": fp, },
      });

      if (!res.ok) {
        setKorisnik(null);
        setKlub(null);
      } else {
        const data = await res.json();
        setKorisnik(data.korisnik);
        setKlub(data.klub);
      }
    } catch (err) {
      console.error("Greška pri provjeri korisnika:", err);
      setKorisnik(null);
      setKlub(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    provjeriKorisnika();
  }, [token]);

  const odjava = () => {
    localStorage.removeItem("token"); 
    setKorisnik(null);
    setKlub(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ korisnik, setKorisnik, loading, odjava, azurirajKorisnika, klub, azurirajKlub, token, postaviToken, fp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
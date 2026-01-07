import { createContext, useContext, useState, useEffect } from "react";
import { BACKEND_IP } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [korisnik, setKorisnik] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const provjeriKorisnika = async () => {
      try {
        const response = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
          credentials: "include", 
        });

        if (!response.ok) {
          setKorisnik(null);
        } else {
          const data = await response.json();
          setKorisnik(data.korisnik);
        }
      } catch (err) {
        console.error("Greška pri provjeri korisnika:", err);
        setKorisnik(null);
      } finally {
        setLoading(false);
      }
    };

    provjeriKorisnika();
  }, []);

  const odjava = async () => {
    try {
      await fetch(`${BACKEND_IP}/auth/logout`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      window.location.replace("/");
    } catch (err) {
      console.error("Greška pri odjavi:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ korisnik, setKorisnik, loading, odjava }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
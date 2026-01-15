import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_IP } from "../config";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash; 
    const token = new URLSearchParams(hash.slice(1)).get("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    localStorage.setItem("token", token);

    window.history.replaceState({}, "", "/");

    const provjeriKorisnika = async () => {
      try {
        const res = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Neuspjela provjera");

        const data = await res.json();
        const { korisnik} = data;

        if (!korisnik.role) {
            navigate("/unospodataka");
        } else {
            navigate("/");
        }

      } catch (err) {
        console.error(err);
        navigate("/"); 
      }
    };

    provjeriKorisnika();

  }, [navigate]);

  return <div>Prijava u tijeku...</div>;
}
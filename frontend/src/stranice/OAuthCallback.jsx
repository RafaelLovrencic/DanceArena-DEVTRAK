import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";
import { generateFingerprint } from "../kontekst/fingerprint";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { postaviToken } = useAuth();
    
    useEffect(() => {  
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const state = params.get("state");
        console.log("Token iz URL-a:", token);
        console.log("State iz URL-a:", state);
        const fp = generateFingerprint();
        console.log("Fingerprint koji šaljemo:", fp);
        const provjeriKorisnika = async () => {
            if (!token) {
            console.error("Nema tokena u URL-u");
            navigate("/");
            return;
            }
            try {
                const res = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-Fingerprint": fp,
                },
                });

                if (!res.ok) throw new Error("Neuspjela provjera");

                const data = await res.json();
                postaviToken(token);

                const { korisnik } = data;
                console.log(korisnik.role, state);
                if (!korisnik.role || !korisnik) {
                    if (state === "normal-login") window.location.href = "/unospodataka";
                    else if (state === "judge-invite") window.location.href = "/unospodatakasuci";
                } else {
                    window.history.replaceState({}, "", "/");
                    navigate("/");
                }

            } catch (err) {
                console.error("Greška pri provjeri korisnika:", err);
                navigate("/");
            }
        };

        provjeriKorisnika();
    }, [navigate]);

  return <div>Prijava u tijeku...</div>;
}
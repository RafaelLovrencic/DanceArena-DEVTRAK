import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";
import { generateFingerprint } from "../kontekst/fingerprint";


export default function OAuthCallback() {
    const navigate = useNavigate();
    const { postaviToken, fp } = useAuth();

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (!hash) {
            console.error("Hash nedostaje, nema tokena");
            window.location.href = "/";
            return;
        }
        const params = new URLSearchParams(hash);

        const token = params.get("token");
        const state = params.get("state");
        console.log("TOken", token);
        console.log("Stanje", state);

        if (!token) {
        window.location.href = "/";
        return;
        }

        window.history.replaceState({}, "", "/");

        const provjeriKorisnika = async () => {
        try {
            console.log("Fingerprint koji šaljemo:", fp);
            const res = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-Fingerprint": fp,
            },
            });
        
            if (!res.ok) throw new Error("Neuspjela provjera");

            const data = await res.json();
            postaviToken(data.token || token);
            console.log("Token", token);
            const { korisnik} = data;

            if (!korisnik.role) {
            if(state === "normal-login")
                navigate("/unospodataka");
            else if (state === "judge-invite")
                navigate("/unospodatakasuci")
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error(err);
            navigate("/"); 
        }
        };

        provjeriKorisnika();

    }, [navigate, postaviToken]);

    return <div>Prijava u tijeku...</div>;
}
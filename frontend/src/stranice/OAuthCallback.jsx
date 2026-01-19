import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";


export default function OAuthCallback() {
    const navigate = useNavigate();
    const { postaviToken } = useAuth();

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const token = params.get("token");
        const state = params.get("state");

        if (!token) {
        window.location.href = "/";
        return;
        }

        postaviToken(token);

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

    }, [navigate]);

    return <div>Prijava u tijeku...</div>;
}
import { useState, useEffect } from "react";
import NavigacijskaTraka from "./navigacijskatraka.jsx";
import { useAuth } from "../kontekst/AuthContext";
import { BACKEND_IP } from "../config";

export default function Profil() {
    const { korisnik, odjava, loading } = useAuth();
    const [clanarinaAktivna, setClanarinaAktivna] = useState(false);
    const [vrijediDo, setVrijediDo] = useState(null);
    const [ucitavanje, setUcitavanje] = useState(true);
    const [greska, setGreska] = useState(null);

    useEffect(() => {
        if (!korisnik) return;

        if (korisnik.role !== "organizator") {
            setUcitavanje(false);
            return;
        }

        const statusClanarine = async () => {
            try {
                const res = await fetch(`${BACKEND_IP}/napravi-transakciju/status-clanarine`, {
                    credentials: "include",
                });
                const data = await res.json();
                setClanarinaAktivna(data.active);
                setVrijediDo(data.vrijediDo || null);
            } catch (err) {
                console.error(err);
                setGreska("Greška pri dohvaćanju statusa članarine");
            } finally {
                setUcitavanje(false);
            }
        };

        statusClanarine();
    }, [korisnik]);

    const napraviTransakciju = async () => {
        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/clanarina`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Greška kod Stripe sesije");
            }
        } catch (err) {
            console.error(err);
            alert("Greška kod plaćanja članarine");
        }
    };

    const otkaziClanarinu = async () => {
        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/otkazi-clanarinu`, {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                setClanarinaAktivna(false);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Greška pri otkazivanju članarine");
        }
    };

    if (loading || ucitavanje) return <p>Učitavanje...</p>;

    return (
        <>
        <nav>
            <NavigacijskaTraka />
        </nav>

        <div className="korisnikPodaci">
            <p>Ime i prezime: {korisnik.ime}</p>
            <p>Email: {korisnik.email}</p>
            <p>Uloga: {korisnik.role || "Nije odabrana"}</p>
            <button onClick={odjava}>Odjavi se</button>
        </div>

        {/* Samo za organizatore */}
        {korisnik.role === "organizator" && (
        <div className="clanarinaStatus">
            <h3>Godišnja članarina:</h3>
            <p>
            {clanarinaAktivna && vrijediDo
                ? `Plaćeno (vrijedi do ${new Date(vrijediDo).toLocaleDateString("hr-HR")})`
                : "Nije plaćeno"}
            </p>
            {!clanarinaAktivna && (
                <button onClick={napraviTransakciju}>Plati članarinu</button>
            )}

            {clanarinaAktivna && (
                <button onClick={otkaziClanarinu}>Otkaži članarinu</button>
            )}

            {greska && <p style={{ color: "red" }}>{greska}</p>}
        </div>
        )}
        </>
    );
}

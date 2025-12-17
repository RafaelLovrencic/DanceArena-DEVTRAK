import NavigacijskaTraka from "./navigacijskatraka.jsx";
import { useAuth } from "../kontekst/AuthContext";

export default function Profil(){
    const { korisnik, odjava, loading } = useAuth();
    if (loading) return <p>Učitavanje...</p>;
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
            <button>Tests</button>
            </div>
        </>
    )
}


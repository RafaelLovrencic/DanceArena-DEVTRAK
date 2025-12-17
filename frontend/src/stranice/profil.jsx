import { useAuth } from "../kontekst/AuthContext";
import "../izgled/profil.css";

export default function Profil({ onClose }){
    const { korisnik, odjava, loading } = useAuth();
    if (loading) return <p>Učitavanje...</p>;
    return (
        <>
            <div className="profilSucelje">
                <p>Ime i prezime: {korisnik.ime}</p>
                <p>Email: {korisnik.email}</p>
                <p>Uloga: {korisnik.role || "Nije odabrana"}</p>
                <div className="profilTipke">
                    <button onClick={odjava}>Odjavi se</button>
                    <button type='button' onClick={onClose}>Odustani</button>
                </div>
            </div>
        </>
    )
}


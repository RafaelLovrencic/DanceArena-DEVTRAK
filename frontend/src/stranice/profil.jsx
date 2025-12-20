import { useAuth } from "../kontekst/AuthContext";
import { useState } from "react";
import "../izgled/profil.css";

export default function Profil({ onClose }){
    const { korisnik, odjava } = useAuth();
    const [editiranje, setEditiranje] = useState(false);
    const [ime, prezime] = korisnik.ime.split(" ");
    const [podaciOKorisniku, setPodaciOKorisniku] = useState({
        ime: ime,
        prezime: prezime,
        email: korisnik.email,
        role: korisnik.role,
        imeKluba: korisnik.role === "voditelj" ? korisnik.imeKluba || "" : "",
        lokacijaKluba: korisnik.role === "voditelj" ? korisnik.lokacijaKluba || "" : "",
    });
    console.log(korisnik);
    const promijeniPodatke = (e) => {
        const { name, value } = e.target;
        setPodaciOKorisniku(prev => ({ ...prev, [name]: value }));
    };

    const pohraniProfil = async () => {
        setEditiranje(false);
    };
    return (
        <>
            <div className="profilSucelje">
                <div className="podaciKorisnik">
                    <div>
                        <span>Ime:</span>
                        {editiranje ? (
                            <input name="ime" value={podaciOKorisniku.ime} onChange={promijeniPodatke} />
                        ) : (
                            <span>{podaciOKorisniku.ime}</span>
                        )}
                    </div>

                    <div>
                        <span>Prezime:</span>
                        {editiranje ? (
                            <input name="prezime" value={podaciOKorisniku.prezime} onChange={promijeniPodatke} />
                        ) : (
                            <span>{podaciOKorisniku.prezime}</span>
                        )}
                    </div>

                    <div>
                        <span>Email:</span>
                        {editiranje ? (
                            <input name="email" value={podaciOKorisniku.email} onChange={promijeniPodatke} />
                        ) : (
                            <span>{podaciOKorisniku.email}</span>
                        )}
                    </div>

                    <div>
                        <span>Uloga:</span>
                        {editiranje ? (
                            <select name="role" value={podaciOKorisniku.role} onChange={promijeniPodatke}>
                            <option value="organizator">Organizator</option>
                            <option value="voditelj">Voditelj</option>
                            <option value="sudac">Sudac</option>
                            </select>
                        ) : (
                            <span>{podaciOKorisniku.role || "Nije odabrana"}</span>
                        )}
                    </div>

                    {podaciOKorisniku.role === "voditelj" && (
                        <>
                            <div>
                                <span>Ime kluba:</span>
                                {editiranje ? (
                                    <input name="imeKluba" value={podaciOKorisniku.imeKluba} onChange={promijeniPodatke} />
                                ) : (
                                    <span>{podaciOKorisniku.imeKluba || "Nije uneseno"}</span>
                                )}
                            </div>
                            <div>
                                <span>Lokacija kluba:</span>
                                {editiranje ? (
                                    <input
                                        name="lokacijaKluba"
                                        value={podaciOKorisniku.lokacijaKluba}
                                        onChange={promijeniPodatke}
                                    />
                                ) : (
                                    <span>{podaciOKorisniku.lokacijaKluba || "Nije uneseno"}</span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="profilTipke">
                {editiranje ? (
                    <>
                        <button onClick={pohraniProfil}>Spremi</button>
                        <button onClick={() => setEditiranje(false)}>Odustani</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setEditiranje(true)}>Uredi</button>
                        <button onClick={onClose}>Zatvori</button>
                        <button onClick={odjava}>Odjava</button>
                    </>
                )}
                </div>
            </div>
        </>
    )
}


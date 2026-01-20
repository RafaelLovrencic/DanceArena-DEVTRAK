import { useState, useEffect } from "react";
import { useAuth } from "../kontekst/AuthContext";
import { BACKEND_IP } from "../config";
import "../izgled/profil.css";

export default function Profil({ onClose }) {
    const { korisnik, odjava, azurirajKorisnika, klub, azurirajKlub, loading, token, fp } = useAuth();
    const [clanarinaAktivna, setClanarinaAktivna] = useState(false);
    const [vrijediDo, setVrijediDo] = useState(null);
    const [ucitavanje, setUcitavanje] = useState(true);
    const [greska, setGreska] = useState(null);
    const [editiranje, setEditiranje] = useState(false);

    const imePrezime = korisnik?.ime?.split(" ") || ["", ""];
    const [podaciOKorisniku, setPodaciOKorisniku] = useState({
        ime: imePrezime[0],
        prezime: imePrezime[1],
        email: korisnik?.email || "",
        role: korisnik?.role || "",
        imeKluba: klub?.ime || "",
        lokacijaKluba: klub?.lokacija || "",
    });

    const promijeniPodatke = (e) => {
        const { name, value } = e.target;
        setPodaciOKorisniku(prev => ({ ...prev, [name]: value }));
    };

    const pohraniProfil = async () => {
        if (!token) {
            alert("Niste prijavljeni");
            return;
        }

        if (!podaciOKorisniku.imeKluba.trim() && podaciOKorisniku.role === "voditelj") {
            alert("Ime kluba je obavezno!");
            return;
        }
        if (!podaciOKorisniku.lokacijaKluba.trim() && podaciOKorisniku.role === "voditelj") {
            alert("Lokacija kluba je obavezna!");
            return;
        }

        const punoIme = `${podaciOKorisniku.ime} ${podaciOKorisniku.prezime}`.trim();
        const noviPodaci = {
            ime: punoIme,
            email: podaciOKorisniku.email,
            role: podaciOKorisniku.role,
        };
        const noviPodaciKlub = {};

        if (podaciOKorisniku.role === "voditelj") {
            noviPodaci.imeKluba = podaciOKorisniku.imeKluba;
            noviPodaci.lokacija = podaciOKorisniku.lokacijaKluba;
            noviPodaciKlub.ime = podaciOKorisniku.imeKluba;
            noviPodaciKlub.lokacija = podaciOKorisniku.lokacijaKluba;
        }

        try {
            await fetch(`${BACKEND_IP}/unospodataka/${korisnik._id}/${klub?._id || ""}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-Fingerprint": fp,
                },
                body: JSON.stringify(noviPodaci),
            });
            setEditiranje(false);
        } catch (error) {
            console.error("Greška pri spremanju:", error);
            alert("Greška pri spremanju podataka.");
        }

        azurirajKorisnika(noviPodaci);
        azurirajKlub(noviPodaciKlub);
        setEditiranje(false);
    };

    useEffect(() => {
        if (!korisnik || korisnik?.role !== "organizator" || !token) {
            setUcitavanje(false);
            return;
        }

        const statusClanarine = async () => {
            try {
                const res = await fetch(`${BACKEND_IP}/napravi-transakciju/status-clanarine`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "X-Fingerprint": fp,
                    }
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
    }, [korisnik, token]);

    const napraviTransakciju = async () => {
        if (!token) {
            alert("Niste prijavljeni");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/clanarina`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-Fingerprint": fp,
                }
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
        if (!token) {
            alert("Niste prijavljeni");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/otkazi-clanarinu`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-Fingerprint": fp,
                }
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

    return (
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
                    <span>{podaciOKorisniku.email}</span>
                </div>

                <div>
                    <span>Uloga:</span>
                    <span>{podaciOKorisniku.role || "Nije odabrana"}</span>
                </div>

                {podaciOKorisniku.role === "voditelj" && (
                    <>
                        <div>
                            <span>Ime kluba:</span>
                            {editiranje ? (
                                <input name="imeKluba" value={podaciOKorisniku.imeKluba} onChange={promijeniPodatke}/>
                            ) : (
                                <span>{podaciOKorisniku.imeKluba || "Nije uneseno"}</span>
                            )}
                        </div>
                        <div>
                            <span>Lokacija kluba:</span>
                            {editiranje ? (
                                <input name="lokacijaKluba" value={podaciOKorisniku.lokacijaKluba} onChange={promijeniPodatke}/>
                            ) : (
                                <span>{podaciOKorisniku.lokacijaKluba || "Nije uneseno"}</span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {korisnik?.role === "organizator" && (
            <div className="clanarinaStatus">
                <h3>Godišnja članarina:</h3>
                <p>
                    {clanarinaAktivna && vrijediDo
                        ? `Plaćeno (vrijedi do ${new Date(vrijediDo).toLocaleDateString("hr-HR")})`
                        : "Nije plaćeno"}
                </p>
                {!clanarinaAktivna && <button onClick={napraviTransakciju}>Plati članarinu</button>}
                {clanarinaAktivna && <button onClick={otkaziClanarinu}>Otkaži članarinu</button>}
                {greska && <p style={{ color: "red" }}>{greska}</p>}
            </div>
            )}

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
    );
}
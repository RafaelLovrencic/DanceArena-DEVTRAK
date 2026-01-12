import '../izgled/natjecanja.css'
import NavigacijskaTraka from './navigacijskatraka.jsx'
import DodajNatjecanje from "./suceljeDodajNatjecanje.jsx";
import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";

export default function Natjecanja() {
    const { korisnik } = useAuth();
    const [loading, setLoading] = useState(true);
    const [competitions, setCompetitions] = useState([]);
    const [pokaziSucelje, setPokaziSucelje] = useState(false);
    const [odabranoNatjecanje, setOdabranoNatjecanje] = useState(null);
    const [podaciZaUredi, setPodaciZaUredi] = useState(null);
    const [kotizacijaPlacena, setKotizacijaPlacena] = useState(false);

    const [clanarinaAktivna, setClanarinaAktivna] = useState(false);
    const [vrijediDo, setVrijediDo] = useState(null);
    const [ucitavanje, setUcitavanje] = useState(true);

    const dohvatiPodatkeONatjecanju = async () => {
        if (!odabranoNatjecanje) return;
        if (!(await provjeriClanarinuSvjeze())) return;
        const response = await fetch(`${BACKEND_IP}/natjecanja/${odabranoNatjecanje._id}`, {credentials: "include"});
        const data = await response.json();
        console.log(data);

        if (data.organizatorId._id !== korisnik._id) {
            alert('Nemate dopuštenje uređivati ovo natjecanje.');
            return;
        }

        setPodaciZaUredi(data);
        setPokaziSucelje(true);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BACKEND_IP}/natjecanja`, {credentials: "include"});
                const data = await response.json();
                setCompetitions(data);
            } catch (err) {
                console.error('Greška kod dohvaćanja natjecanja:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [competitions]);

    useEffect(() => {
        if (!odabranoNatjecanje || korisnik?.role !== "voditelj") {
            setKotizacijaPlacena(false);
            return;
        }

        const provjeriKotizaciju = async () => {
            try {
                const res = await fetch(`${BACKEND_IP}/napravi-transakciju/status-kotizacije/${odabranoNatjecanje._id}`, {
                    credentials: "include",
                });
                const data = await res.json();
                setKotizacijaPlacena(data.placeno);
            } catch (err) {
                console.error("Greška pri dohvaćanju statusa kotizacije:", err);
            }
        };

        provjeriKotizaciju();
    }, [odabranoNatjecanje, korisnik]);

    const dodajNatjecanje = async () => {
        if (!(await provjeriClanarinuSvjeze())) return;
        setPokaziSucelje(true);
    };


   const obrisiNatjecanje = async () => {
        if (!odabranoNatjecanje) return;
        if (!(await provjeriClanarinuSvjeze())) return;
        const response = await fetch(`${BACKEND_IP}/natjecanja/${odabranoNatjecanje._id}`, {credentials: "include"});
        const data = await response.json();
        console.log(data.organizatorId._id);
        console.log(korisnik._id);
        if (data.organizatorId._id !== korisnik._id) {
            alert('Nemate dopuštenje brisati ovo natjecanje.');
            return;
        }

        try {
            const response = await fetch (`${BACKEND_IP}/natjecanja/${odabranoNatjecanje._id}`, {
                method: "DELETE",
                credentials: "include"
            });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.poruka || "Greška pri brisanju natjecanja");
        };
        setCompetitions((prev) => 
            prev.filter((comp) => comp._id !== odabranoNatjecanje._id));
        setOdabranoNatjecanje(null);
        /*alert("Natjecanje uspješno obrisano");*/
    } catch (err){
        console.error("Greška", err);
        /*alert("Došlo je do greške pri brisanju natjecanja");*/
    };
    };
    const osvjeziNatjecanja = async () => {
        try {
            const response = await fetch(`${BACKEND_IP}/natjecanja`, {credentials: "include"}, {credentials: "include"});
            const data = await response.json();
            setCompetitions(data);
        } catch (err) {
            console.error('Greška kod dohvaćanja natjecanja:', err);
        }
    };

    const napraviTransakciju = async () => {
        if (!odabranoNatjecanje) return;

        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/kotizacija`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    natjecanjeId: odabranoNatjecanje._id,
                    korisnikId: korisnik._id,
                }),
            });

            const { url } = await res.json();
            console.log(url);
            if (url) {

                window.location.href = url;
            } else {
                console.error("Nema URL-a za checkout");
            }
        } catch (err) {
            console.error("Greška pri plaćanju:", err);
        }
    };

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

    const provjeriClanarinuSvjeze = async () => {
        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/status-clanarine`, {
                credentials: "include",
            });
            const data = await res.json();

            setClanarinaAktivna(data.active);

            if (!data.active) {
                alert("Nemate aktivnu članarinu!");
                return false;
            }

            return true;
        } catch (err) {
            alert("Greška pri provjeri članarine");
            return false;
        }
    };

    return (
    <>
        <nav>
            <NavigacijskaTraka />
        </nav>
        <div className="boja">
            <section className="naslov-sekcija">
            <h1 className="naslov">Popis natjecanja</h1>
        </section>
        <section className="sekcija">
            <div className="tablica-container">
                {loading ? (
                    <p className="loader">Učitavanje...</p>
                ) : competitions.length > 0 ? (
                    <table className="tablica">
                    <thead>
                        <tr>
                            <th>Naziv</th>
                            <th>Datum</th>
                            <th>Mjesto</th>
                            <th>Stil plesa</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitions.map((comp) => (
                            <tr key={comp._id} onClick={() => {
                            if (odabranoNatjecanje?._id === comp._id) {
                            setOdabranoNatjecanje(null); 
                            } else {
                            setOdabranoNatjecanje(comp); 
                            }}} className={odabranoNatjecanje?._id === comp._id ? 'selected' : ''}>
                                <td>{comp.ime}</td>
                                <td>{new Date(comp.datum).toLocaleDateString('hr-HR')}</td>
                                <td>{comp.lokacija}</td>
                                <td>{comp.kategorije?.[0]?.stil || '-'}</td>
                                <td><Link to={`/natjecanje/${comp._id}`} className="link" title="Više informacija o natjecanju.">+</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                ) : (
                    <p className="nema">Nema natjecanja!</p>
                )}
            </div> 
            <div className="gumbovi">
                {korisnik?.role === "organizator" && (
                <>
                    <button className="dodaj" onClick={dodajNatjecanje}>Dodaj natjecanje</button>
                    <button className="uredi" onClick={dohvatiPodatkeONatjecanju} style={{backgroundColor: odabranoNatjecanje ? '#2CDE32' : 'rgba(23, 101, 25, 1)', cursor: odabranoNatjecanje ? 'pointer' : 'not-allowed'}}>Uredi natjecanje</button>
                    <button className="obrisi" onClick={obrisiNatjecanje} style={{backgroundColor: odabranoNatjecanje ? '#2CDE32' : 'rgba(23, 101, 25, 1)', cursor: odabranoNatjecanje ? 'pointer' : 'not-allowed'}}>Obriši natjecanje</button>
                </>
                )}
                {korisnik?.role === "voditelj" && odabranoNatjecanje && !kotizacijaPlacena && (
                    <button className='prijava'
                        onClick={napraviTransakciju}
                        style={{ backgroundColor: '#2CDE32', cursor: 'pointer' }}
                    >
                        Plati kotizaciju
                    </button>
                )}
                {korisnik?.role === "voditelj" && kotizacijaPlacena && (
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Kotizacija plaćena</p>
                )}
            </div>
        </section>
        </div>
        {pokaziSucelje && (
            <DodajNatjecanje onClose={() => {
                    setPokaziSucelje(false);
                    setPodaciZaUredi(null);
                    setOdabranoNatjecanje(null);
                    osvjeziNatjecanja();
                }}
                natjecanjeZaUredi={podaciZaUredi}
            />
        )}
        
    </>
    )
}
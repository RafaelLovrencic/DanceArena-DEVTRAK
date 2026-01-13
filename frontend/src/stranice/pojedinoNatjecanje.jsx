import '../izgled/pojedinoNatjecanje.css'
import NavigacijskaTraka from './navigacijskatraka.jsx'
import {useState, useEffect} from 'react'
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";
import { useParams } from "react-router-dom";
import PrijavaNaNatjecanje from './suceljePrijava.jsx';

export default function pojedinoNatjecanje(){
    const { korisnik, klub } = useAuth();
    const { id } = useParams();
    const [natjecanje, setNatjecanje] = useState(null);
    const [pokaziSucelje, setPokaziSucelje] = useState(false);
    const [prijavaPodaci, setPrijavaPodaci] = useState(null);
    const [prijave, setPrijave] = useState([]);
    const [urediPrijavu, setUrediPrijavu] = useState(null);
    const [clanarinaAktivna, setClanarinaAktivna] = useState(false);
    const [kotizacijaPlacena, setKotizacijaPlacena] = useState(false);


    const otvoriPrijavu = () => {
        setPrijavaPodaci({
            natjecanjeId: natjecanje._id,
            kotizacija: natjecanje.kotizacija,
            kategorije: natjecanje.kategorije,

            nazivKoreografije: "",
            trajanje: "",
            koreograf: "",
            dob: "",
            stil: "",
            velicina: "",
            glazba: ""
        });

        setPokaziSucelje(true);
    }

    const fetchPrijave = async () => {
            try {
                const res = await fetch(`${BACKEND_IP}/prijave/natjecanje/${id}`, {credentials: "include"});
                const data_prijava = await res.json();

                const dodanaOcjena = data_prijava.map(nastup => {
                const jeOcijenio = Array.isArray(nastup.bodovi) 
                    ? nastup.bodovi.some(b => b.sudacId?.toString() === korisnik?._id)
                    : false;

                return {
                    ...nastup,
                    ocijenio: jeOcijenio
                };
            });
                setPrijave(dodanaOcjena);
            } catch(err){
                console.error("Greška kod dohvaćanja prijava:", err);
            }
        };
    
    const ponistiPrijavu = async (idNastupa) => {
        if(!window.confirm("Jeste li sigurni da želite poništiti ovu prijavu?")) return;
    
        try {
            const res = await fetch(`${BACKEND_IP}/prijave/application/del/${idNastupa}`, {method: "DELETE", credentials: "include"});

            if(!res.ok){
                const text = await res.text();
                throw new Error(`${res.status}: ${text}`);
            }
            alert("Prijava uspješno poništena!");
            fetchPrijave();
        } catch(err){
            console.error(err);
            alert("Došlo je do greške pri poništavanju prijave!")
        }
    }

    useEffect(() => {
        fetchPrijave();
    }, [id, natjecanje])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch (`${BACKEND_IP}/natjecanja/${id}`, {credentials: "include"});
                const data = await response.json();
                setNatjecanje(data);
            } catch (err){
                console.error("Greška kod dohvaćanja podataka o natjecanju:", err);
            }
        };
        fetchData();
    }, [id])


    const glasaj = async (nastupId, nastup) => {
        const postojeca = Array.isArray(nastup.bodovi) 
            ? nastup.bodovi.find(b => b.sudacId?.toString() === korisnik._id)
            : undefined;

        const staraOcjena = postojeca?.ocjena ?? "";
        const unos = prompt("Unesite ocjenu (0 – 30):", staraOcjena);

        if (unos === null) return; 

        const broj = Number(unos);

        if (isNaN(broj) || broj < 0 || broj > 30) {
            alert("Ocjena mora biti broj između 0 i 30.");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_IP}/nastup/slanjeocjene/${nastupId}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ocjena: broj,
                        sudacId: korisnik._id,
                    }),
                }
            );

            if (!res.ok) throw new Error("Greška pri slanju ocjene");

            alert("Nastup uspješno ocijenjen!");
            await fetchPrijave();
            console.log(natjecanje, korisnik, nastup);
        } catch (err) {
            console.error(err);
            alert("Došlo je do greške pri glasanju.");
        }
    };

    const promijeniStanje = async (novoStanje) => {
        if (!natjecanje) return;
        if (!(await provjeriClanarinuSvjeze())) return;
        if(novoStanje === "zaključano") if (!window.confirm("Jeste li sigurni da želite zaključati natjecanje?")) return;
        if (novoStanje === "zatvoreno") {
            if (!sviSuciGlasali()) {
                alert("Nije moguće zatvoriti natjecanje jer svi suci još nisu ocijenili sve prijave!");
                return;
            }
            if (!window.confirm("Jeste li sigurni da želite zatvoriti natjecanje? Ovo će onemogućiti glasanje i prikazati poredak.")) return;
        }
        try {
            const res = await fetch(`${BACKEND_IP}/natjecanja/stanje/${natjecanje._id}/${novoStanje}`, {
                method: "PUT",
                credentials: "include",
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Greška pri zaključavanju natjecanja");
            }

            const data = await res.json();

            setNatjecanje((prev) => ({ ...prev, stanje: novoStanje }));

            if (novoStanje === "zaključano") alert("Natjecanje je zaključano!");
            if (novoStanje === "zatvoreno") alert("Natjecanje je zatvoreno!");
        } catch (err) {
            console.error(err);
            alert("Došlo je do greške pri zaključavanju natjecanja.");
        }
    };

    const sviSuciGlasali = () => {
        if(prijave.lenght == 0) return true;
        if (!natjecanje || !Array.isArray(natjecanje.suci)) return false;

        return natjecanje.suci.every(sudac => 
            prijave.every(nastup =>
                Array.isArray(nastup.bodovi) &&
                nastup.bodovi.some(b => b.sudacId?.toString() === sudac._id)
            )
        );
    };

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

    const napraviTransakciju = async () => {
        if (!natjecanje._id) return;

        try {
            const res = await fetch(`${BACKEND_IP}/napravi-transakciju/kotizacija`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    natjecanjeId: natjecanje._id,
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
        if (!natjecanje?._id || korisnik?.role !== "voditelj") {
            setKotizacijaPlacena(false);
            return;
        }

        const provjeriKotizaciju = async () => {
            try {
                const res = await fetch(`${BACKEND_IP}/napravi-transakciju/status-kotizacije/${natjecanje._id}`, {
                    credentials: "include",
                });
                const data = await res.json();
                setKotizacijaPlacena(data.placeno);
            } catch (err) {
                console.error("Greška pri dohvaćanju statusa kotizacije:", err);
            }
        };

        provjeriKotizaciju();
    }, [natjecanje, korisnik]);

    const imamSvojNastup =
        Array.isArray(prijave) &&
        prijave.length > 0 &&
        !!klub?._id &&
        prijave.some(p => String(p.klubId?._id) === String(klub._id));

    return (
        <>
            <nav>
                <NavigacijskaTraka />
            </nav>
            <div className="boja">
                <section className="naslov-sekcija">
                    <h1 className = "naslov">{natjecanje?.ime}</h1>
                    {natjecanje?.stanje !== "otvoreno" &&
                        <h3 className='stanje'>Natjecanje je {natjecanje?.stanje}!</h3>
                    }
                </section>
                <div className="prvi_blok">
                    <p className="opis">{natjecanje?.opis}</p>
                    <p className="kotizacija">Kotizacija: {natjecanje?.kotizacija} eura</p>
                </div>
                <div className="informacije">
                    <div className="osnovne_info">
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Mjesto:</p>
                            </div>
                            <div className="ime_mjesta">
                                <p className="ime_mjesta2">{natjecanje?.lokacija}</p>
                            </div>
                        </div>
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Datum:</p>
                            </div>
                            <div className="vrijeme_dog">
                                <p className="vrijeme2">{new Date(natjecanje?.datum).toLocaleDateString('hr-HR')}</p>
                            </div>
                        </div>
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Sudci:</p>
                            </div>
                            <div className="popis_sud">
                                {natjecanje?.suci?.map((sudac) => (
                                <p className="ime_sud" key={sudac._id}>
                                {sudac.ime} {sudac.prezime}
                                </p> ))}
                            </div>
                        </div>
                    </div>
                    <div className="kategorije_info">
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Dob:</p>
                            </div>
                            <div className="popis">
                                {natjecanje?.kategorije?.map((kat) => (
                                <p className="kat" key={kat._id}>
                                {kat.godiste}
                                </p> ))}
                            </div>
                        </div>
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Stil:</p>
                            </div>
                            <div className="popis">
                                {natjecanje?.kategorije?.map((kat) => (
                                <p className="kat" key={kat._id}>
                                {kat.stil}
                                </p> ))}
                            </div>
                        </div>
                        <div className="prvi">
                            <div className="drugi">
                                <p className="treci">Veličina grupe:</p>
                            </div>
                            <div className="popis">
                                {natjecanje?.kategorije?.map((kat) => (
                                <p className="kat" key={kat._id}>
                                {kat.velicina}
                                </p> ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="prijava_box">
                    {korisnik?.role === "organizator" && natjecanje?.stanje === "otvoreno" && korisnik._id === natjecanje.organizatorId?._id && (
                        <button className="gumb_zakljucaj" onClick={() => promijeniStanje("zaključano")}>
                            Zaključaj!
                        </button>
                    )}
                    {korisnik?.role === "organizator" && natjecanje?.stanje === "zaključano" && korisnik._id === natjecanje.organizatorId?._id && (
                        <button className="gumb_zatvori" onClick={() => promijeniStanje("zatvoreno")}>
                            Zatvori!
                        </button>
                    )}

                    {korisnik?.role === "voditelj" && natjecanje?.stanje === "otvoreno" && (
                        <>
                            {imamSvojNastup && !kotizacijaPlacena && (
                                <button
                                    className='gumb_kotizacija'
                                    onClick={napraviTransakciju}
                                    style={{ backgroundColor: '#2CDE32', cursor: 'pointer' }}
                                >
                                    Plati kotizaciju!
                                </button>
                            )}

                            {imamSvojNastup && kotizacijaPlacena && (
                                <p style={{ color: 'green', fontWeight: 'bold' }}>
                                    Kotizacija plaćena
                                </p>
                            )}
                            <button className="gumb_prijava" onClick={otvoriPrijavu}>
                                Prijavi se!
                            </button>
                        </>
                    )}
                </div>
                <div className="prijave">
                    <div className="naslov_prijava">
                        <p className="tekst_prijava">Prijave:</p>
                    </div>
                    <div className="lista_prijava">
                        {prijave.length === 0 &&(
                            <p className="nema_prijava">Nema prijava.</p>
                        )}
                        {prijave.map((nastup) => (
                            <div key={nastup._id} className="red_prijave">
                                <span className="tekst_prijave_red">{nastup.klubId?.ime} ; {nastup.imekoreografije}</span>
                                {natjecanje?.stanje === "otvoreno" && (
                                    (korisnik?.role === "organizator" && korisnik._id === natjecanje.organizatorId?._id) ||
                                    (korisnik?.role === "voditelj" && nastup.klubId?._id === klub?._id)
                                ) && (
                                    <>
                                        <button className="gumb_uredi" onClick={async () => {
                                            if (korisnik?.role === "organizator") {
                                                const clanarinaOk = await provjeriClanarinuSvjeze();
                                                if (!clanarinaOk) return;
                                            }

                                            setUrediPrijavu(nastup);
                                            setPrijavaPodaci({natjecanjeId: natjecanje._id, kotizacija: natjecanje.kotizacija,
                                                            kategorije: natjecanje.kategorije, nazivKoreografije: nastup.imekoreografije,
                                                            trajanje: nastup.trajanje, koreograf: nastup.imekoreografa,
                                                            dob: nastup.kategorijaId?.godiste || "", stil: nastup.kategorijaId?.stil || "",
                                                            velicina: nastup.kategorijaId?.velicina || "", glazba: nastup.glazbaUrl || "" })
                                            setPokaziSucelje(true);
                                        }}>Uredi</button>
                                        <button type="button" className="gumb_ponisti" onClick={async () => {
                                            if (korisnik?.role === "organizator") {
                                                const clanarinaOk = await provjeriClanarinuSvjeze();
                                                if (!clanarinaOk) return;
                                            }
                                            ponistiPrijavu(nastup._id)
                                        }
                                        }>Poništi</button> 
                                    </>
                                )
                                }
                            </div>
                        ))}
                    </div>
                </div>
                <div className="koreografije">
                    <div className="naslov_koreografija">
                        <p className="tekst_koreografija">Koreografije:</p>
                    </div>
                    <div className="lista_koreografija">
                        {prijave.length === 0 &&(
                            <p className="nema_koreografija">Nema koreografija.</p>
                        )}
                        {prijave.map((nastup) => (
                            <div key={nastup._id} className="red_koreografije">
                                <span className="tekst_koreografije_red">{nastup.imekoreografije} ; {nastup.imekoreografa}</span>
                                <button className="gumb_detalji">Detalji</button>
                                {korisnik?.role === "sudac" && natjecanje?.suci?.some(s => s._id === korisnik._id) && natjecanje?.stanje === "zaključano" && (
                                    nastup.ocijenio ? (
                                        <button
                                            className="gumb_glasajUredi"
                                            onClick={() => glasaj(nastup._id, nastup)}
                                        >
                                            Uredi ocjenu
                                        </button>
                                    ) : (
                                        <button
                                            className="gumb_glasaj"
                                            onClick={() => glasaj(nastup._id, nastup)}
                                        >
                                            Ocijeni
                                        </button>
                                    )
                                )
                                }
                            </div>
                        ))}
                    </div>
                </div>
                {natjecanje?.stanje === "zatvoreno" && (
                    <div className='poredak'>
                        <div className="naslov_poredak">
                            <p className="tekst_poredak">Rezultati:</p>
                        </div>
                        <div className='lista_poredak'>
                            {prijave
                                .map(nastup => ({
                                    ...nastup,
                                    ukupno: Array.isArray(nastup.bodovi)
                                        ? nastup.bodovi.reduce((sum, b) => sum + (b.ocjena || 0), 0)
                                        : 0
                                }))
                                .sort((a, b) => b.ukupno - a.ukupno)
                                .map((nastup, index) => (
                                    <div className='red_poredak' key={nastup._id}>
                                        <span className='tekst_poredak_red'>{index + 1}. {nastup.imekoreografije} ({nastup.imekoreografa})
                                            {korisnik?.role === "voditelj" && nastup.klubId?._id === klub?._id
                                                ? ` - ${nastup.ukupno} bodova`
                                                : ""}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
                }
            </div>
            {pokaziSucelje && (
                <PrijavaNaNatjecanje onClose={() => {
                    setPokaziSucelje(false)
                    setUrediPrijavu(null)
                }}
                prijavaPodaci={prijavaPodaci}
                urediPrijavu={urediPrijavu}
                onSuccess={fetchPrijave}
                />
            )}
        </>
             )
}
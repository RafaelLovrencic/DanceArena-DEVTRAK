import '../izgled/pojedinoNatjecanje.css'
import NavigacijskaTraka from './navigacijskatraka.jsx'
import {useState, useEffect} from 'react'
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";
import { useParams } from "react-router-dom";
import PrijavaNaNatjecanje from './suceljePrijava.jsx';

export default function pojedinoNatjecanje(){
    const { korisnik } = useAuth();
    const { id } = useParams();
    const [natjecanje, setNatjecanje] = useState(null);
    const [pokaziSucelje, setPokaziSucelje] = useState(false);
    const [prijavaPodaci, setPrijavaPodaci] = useState(null);
    const [prijave, setPrijave] = useState([]);
    const [urediPrijavu, setUrediPrijavu] = useState(null);

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
                setPrijave(data_prijava);
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
    }, [id])

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

    return (
        <>
            <nav>
                <NavigacijskaTraka />
            </nav>
            <div className="boja">
                <section className="naslov-sekcija">
                    <h1 className = "naslov">{natjecanje?.ime}</h1>
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
                <button className="gumb_prijava" onClick={otvoriPrijavu}>Prijavi se!</button>                 
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
                                <button className="gumb_uredi" onClick={() => {
                                    setUrediPrijavu(nastup);
                                    setPrijavaPodaci({natjecanjeId: natjecanje._id, kotizacija: natjecanje.kotizacija,
                                                     kategorije: natjecanje.kategorije, nazivKoreografije: nastup.imekoreografije,
                                                     trajanje: nastup.trajanje, koreograf: nastup.imekoreografa,
                                                     dob: nastup.kategorijaId?.godiste || "", stil: nastup.kategorijaId?.stil || "",
                                                     velicina: nastup.kategorijaId?.velicina || "", glazba: nastup.glazbaUrl || "" })
                                    setPokaziSucelje(true);
                                }}>Uredi</button>
                                <button type="button" className="gumb_ponisti" onClick={() => ponistiPrijavu(nastup._id)}>Poništi</button>
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
                                <button className="gumb_glasaj">Glasaj</button>
                            </div>
                        ))}
                    </div>
                </div>
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
import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../izgled/suceljePrijava.css';
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";

export default function PrijavaNaNatjecanje({onClose, prijavaPodaci, urediPrijavu, onSuccess}){
    const{ korisnik, token } = useAuth();

    const dobneKategorije = [...new Set(prijavaPodaci.kategorije.map(k => k.godiste))];
    const stilovi = [...new Set(prijavaPodaci.kategorije.map(k => k.stil))];
    const velicine = [...new Set(prijavaPodaci.kategorije.map(k => k.velicina))];

    const [forma, setForma] = useState({
        nazivKor: '',
        trajanje: '',
        imeKor: '',
        dob: '',
        stil: '',
        velicina: '',
        glazba: ''
    });

    useEffect(() => {
        if (!prijavaPodaci) return;

        setForma({
            nazivKor: urediPrijavu ? urediPrijavu.imekoreografije || "" : prijavaPodaci.nazivKoreografije || "",
            trajanje: urediPrijavu ? urediPrijavu.trajanje || "" : prijavaPodaci.trajanje || "",
            imeKor: urediPrijavu ? urediPrijavu.imekoreografa || "" : prijavaPodaci.koreograf || "",
            dob: urediPrijavu ? urediPrijavu.kategorijaId?.godiste || "" : prijavaPodaci.dob || "",
            stil: urediPrijavu ? urediPrijavu.kategorijaId?.stil || "" : prijavaPodaci.stil || "",
            velicina: urediPrijavu ? urediPrijavu.kategorijaId?.velicina || "" : prijavaPodaci.velicina || "",
            glazba: ""
        });
    }, [urediPrijavu, prijavaPodaci]);

    const obaviPromjenu = (e) => {
        const {name, value, files} = e.target;
        setForma(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const obaviSubmit = async (e) => {
        e.preventDefault();

        if (!prijavaPodaci) return alert("Nema podataka za prijavu!");

        if(!forma.nazivKor || !forma.imeKor) return alert("Nisu unešeni svi podaci o koreografiji!")

        if(!forma.dob || !forma.stil || !forma.velicina){
            return alert("Nisu odabrane sve kategorije!");
        }

        if(!forma.glazba){
            return alert("Nije odabrana audio datoteka!")
        }

        const trajanjeBroj = Number(forma.trajanje);
        if(forma.trajanje === '' || Number.isNaN(trajanjeBroj) || trajanjeBroj < 0){
            return alert("Pogrešan unos trajanja izvedbe!")
        }

        const podaci = {
            natjecanjeId: prijavaPodaci.natjecanjeId,
            kotizacija: prijavaPodaci.kotizacija,
            kategorije: prijavaPodaci.kategorije,
            nazivKoreografije: forma.nazivKor,
            trajanje: trajanjeBroj,
            koreograf: forma.imeKor,
            dob: forma.dob,
            stil: forma.stil,
            velicina: forma.velicina,
            glazba: forma.glazba ? forma.glazba.name : ""
        };

        try {
            let url = `${BACKEND_IP}/prijave/application`;
            let method = "POST";

            if(urediPrijavu){
                url = `${BACKEND_IP}/prijave/application/edit/${urediPrijavu._id}`;
                method = "PUT";
            }
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(podaci)
            });

            if (!res.ok) {
                const text = await res.json();
                if (res.status === 409) {
                    return alert(text.poruka)
                }
                throw new Error(`${res.status}: ${text}`);
            }

            if (onSuccess) await onSuccess();

            onClose();
        } catch (err){
            console.error(err);
            alert("Došlo je do greške pri prijavi.");
        }
    };

    return(
        <>
            <div className="sucelje">
                <form className="formaZaPrijavu" onSubmit={obaviSubmit}>
                    <div className="nazivKor">
                        <label>Naziv koreografije:</label>
                        <input name="nazivKor" type="text" value={forma.nazivKor} onChange={obaviPromjenu}/>
                    </div>
                    <div className="trajanje">
                        <label>Duljina trajanja:</label>
                        <input name="trajanje" type="text" placeholder="Unesite trajanje u minutama:" value={forma.trajanje} onChange={obaviPromjenu}/>
                    </div>
                    <div className="imeKor">
                        <label>Ime koreografa:</label>
                        <input name="imeKor" type="text" value={forma.imeKor} onChange={obaviPromjenu}/>
                    </div>
                    <div className="dobKat">
                        <label>Dobna kategorija:</label>
                        <select name="dob" value={forma.dob} onChange={obaviPromjenu}>
                            <option value=""></option>
                            {dobneKategorije.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="stilPlesa">
                        <label>Stil plesa:</label>
                        <select name="stil" value={forma.stil} onChange={obaviPromjenu}>
                            <option value=""></option>
                            {stilovi.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="velGrupe">
                        <label>Veličina grupe:</label>
                        <select name="velicina" value={forma.velicina} onChange={obaviPromjenu}>
                            <option value=""></option>
                            {velicine.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="glazba">
                        <label>Glazba:</label>
                        <input type="file" name="glazba" accept="audio/*" onChange={obaviPromjenu}></input>
                    </div>
                    <div className="kotizacija">
                        <label>Kotizacija:</label>
                        <p className="kotizacija_iznos">
                            {prijavaPodaci.kotizacija} €
                        </p>
                    </div>
                    <div className="gumbovi">
                        <button type="submit">Prijava</button>
                        <button type="button" onClick={onClose}>Zatvori</button>
                    </div>
                </form>
            </div>
        </>
    )
}
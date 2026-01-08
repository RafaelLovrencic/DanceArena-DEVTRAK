import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../izgled/suceljePrijava.css';
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";

export default function PrijavaNaNatjecanje({onClose, prijavaPodaci}){
    const{ korisnik } = useAuth();
    const dobneKategorije = [...new Set(prijavaPodaci.kategorije.map(k => k.godiste))];
    const stilovi = [...new Set(prijavaPodaci.kategorije.map(k => k.stil))];
    const velicine = [...new Set(prijavaPodaci.kategorije.map(k => k.velicina))];

    return(
        <>
            <div className="sucelje">
                <form className="formaZaPrijavu" onSubmit={(e) => e.preventDefault()}>
                    <div className="nazivKor">
                        <label>Naziv koreografije:</label>
                        <input name="naziv" type="text" value={prijavaPodaci.nazivKoreografije}/>
                    </div>
                    <div className="trajanje">
                        <label>Duljina trajanja:</label>
                        <input name="duljina_trajanja" type="text" value={prijavaPodaci.trajanje}/>
                    </div>
                    <div className="imeKor">
                        <label>Ime koreografa:</label>
                        <input name="ime" type="text" value={prijavaPodaci.koreograf}/>
                    </div>
                    <div className="dobKat">
                        <label>Dobna kategorija:</label>
                        <select name="dob" value={prijavaPodaci.dob}>
                            <option value=""></option>
                            {dobneKategorije.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="stilPlesa">
                        <label>Stil plesa:</label>
                        <select name="stil" value={prijavaPodaci.dob}>
                            <option value=""></option>
                            {stilovi.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="velGrupe">
                        <label>Veličina grupe:</label>
                        <select name="velicina" value={prijavaPodaci.dob}>
                            <option value=""></option>
                            {velicine.map(d => (
                            <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div className="glazba">
                        <label>Glazba:</label>
                        <input type="file" name="glazba" accept="audio/*"></input>
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
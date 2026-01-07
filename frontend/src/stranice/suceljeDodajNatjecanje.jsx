import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../izgled/suceljeDodajNatjecanja.css';
import { BACKEND_IP } from "../config";
import { useAuth } from "../kontekst/AuthContext";

export default function DodajNatjecanje({onClose, natjecanjeZaUredi}) {
    const { korisnik } = useAuth();
    const [podaciNatjecanje, setPodaciNatjecanje] = useState(() => {
        if (natjecanjeZaUredi) {
            return {
                ime: natjecanjeZaUredi.ime || '',
                opis: natjecanjeZaUredi.opis || '',
                datum: natjecanjeZaUredi.datum ? new Date(natjecanjeZaUredi.datum) : null,
                lokacija: natjecanjeZaUredi.lokacija || '',
                kotizacija: natjecanjeZaUredi.kotizacija || '',
                dobnaKategorija: natjecanjeZaUredi.kategorije?.[0]?.godiste || '',
                stilPlesa: natjecanjeZaUredi.kategorije?.[0]?.stil || '',
                velicinaGrupa: natjecanjeZaUredi.kategorije?.[0]?.velicina.replace('_', ' ') || '',
                suci: (natjecanjeZaUredi.suci || []).map(s => s.ime).join('\n'),
            };
        }
        return {
            ime: '', opis: '', datum: null, lokacija: '', kotizacija: '',
            dobnaKategorija: '', stilPlesa: '', velicinaGrupa: '', suci: ''
        };
    });
    const napraviPromjenu = (e) => {
        const { name, value } = e.target;
        setPodaciNatjecanje(prev => ({ ...prev, [name]: value }));
    };
    
    const pohraniPromjene = async (e) => {
        e.preventDefault();
        const suciPolje = podaciNatjecanje.suci
                    .split('\n')
                    .map(s => s.trim())
                    .filter(s => s !== '')
        if (suciPolje.length < 3) return alert('Morate unijeti najmanje 3 suca.');
        if (suciPolje.length % 2 === 0) return alert('Broj sudaca mora biti neparan.');

        const method = natjecanjeZaUredi ? 'PUT' : 'POST';
        const url = natjecanjeZaUredi 
        ? `${BACKEND_IP}/natjecanja/${natjecanjeZaUredi._id}`
        : `${BACKEND_IP}/natjecanja/add`;

        const kategorijePolje = [
            podaciNatjecanje.dobnaKategorija,
            podaciNatjecanje.stilPlesa,
            podaciNatjecanje.velicinaGrupa.replace(' ', '_')
        ];
        const podaci = {
            ime: podaciNatjecanje.ime,
            opis: podaciNatjecanje.opis,
            datum: podaciNatjecanje.datum ? podaciNatjecanje.datum.toISOString() : null,
            lokacija: podaciNatjecanje.lokacija,
            organizatorId: korisnik._id, 
            kotizacija: podaciNatjecanje.kotizacija,
            kategorije: kategorijePolje,
            suci: suciPolje
        };

        try {
            const response = await fetch(url, { 
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(podaci),
                credentials: "include"
            }); 
            if (!response.ok) {
                throw new Error('Greška pri slanju podataka');
            }
            const result = await response.json();
            console.log('Uspješno poslano:', result);
            onClose(); 
        } catch (error) {
            console.error(error);
            alert('Došlo je do pogreške pri slanju podataka');
        }
    }
    return (
        <>
            <div className="sucelje">
                <form className='formaZaNatjecanja' onSubmit={pohraniPromjene}>
                    <div className="imeNatj">
                        <label>Ime natjecanja:</label>
                        <input name="ime" type="text" value={podaciNatjecanje.ime} onChange={napraviPromjenu} required/>
                    </div>
                    <div className="opisNatj">
                        <label>Opis natjecanja:</label>
                        <textarea name="opis" value={podaciNatjecanje.opis} onChange={napraviPromjenu} required/>
                    </div>
                    <div className="datumNatj">
                        <label>Datum natjecanja:</label>
                        <DatePicker selected={podaciNatjecanje.datum} onChange={(date) => setPodaciNatjecanje(prev => ({ ...prev, datum: date }))} dateFormat="dd.MM.yyyy" minDate={new Date()} required/>
                    </div>
                    <div className="lokacijaNatj">
                        <label>Lokacija:</label>
                        <input name="lokacija" type='text' value={podaciNatjecanje.lokacija} onChange={napraviPromjenu} required/>
                    </div>
                    <div className='dobnaKategorija'>
                        <label>Dobna kategorija:</label>
                        <select name="dobnaKategorija" value={podaciNatjecanje.dobnaKategorija} onChange={napraviPromjenu} required>
                            <option value=""></option>
                            <option value="djeca">Djeca</option>
                            <option value="juniori">Juniori</option>
                            <option value="seniori">Seniori</option>
                        </select>
                    </div>
                    <div className='stilPlesa'>
                        <label>Stil plesa:</label>
                        <select name="stilPlesa" value={podaciNatjecanje.stilPlesa} onChange={napraviPromjenu} required>
                            <option value=""></option>
                            <option value="balet">Balet</option>
                            <option value="hiphop">Hiphop</option>
                            <option value="jazz">Jazz</option>
                            <option value="step">Step</option>
                            <option value="break">Break</option>
                        </select>
                    </div>
                    <div className='velicinaGrupa'>
                        <label>Veličina grupa:</label>
                        <select name="velicinaGrupa" value={podaciNatjecanje.velicinaGrupa} onChange={napraviPromjenu} required>
                            <option value=""></option>
                            <option value="solo">Solo</option>
                            <option value="duo">Duo</option>
                            <option value="mala grupa">Mala grupa (3-8)</option>
                            <option value="formacija">Formacija ({'>'}9)</option>
                        </select>
                    </div>
                    <div className='kotizacija'>
                        <label>Kotizacija - €:</label>
                        <input name="kotizacija" type='text' value={podaciNatjecanje.kotizacija} onChange={napraviPromjenu} required/>
                    </div>
                    <div className='suci'>
                        <label>Suci:</label>
                        <textarea name="suci" type='text' placeholder={'Ivan Horvat\nAna Kovač\nMarko Babić\n...'} value={podaciNatjecanje.suci} onChange={napraviPromjenu} required/>
                    </div>
                    <div className='submitOdustani'>
                        <button type="submit">Pohrani podatke</button>
                        <button type='button' onClick={onClose}>Odustani</button>
                    </div>
                </form>
            </div>
        
        </>
    )
}
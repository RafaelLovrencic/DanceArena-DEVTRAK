import { BACKEND_IP } from '../config.js';
import '../izgled/obavijestsucu.css'
import { generateFingerprint } from "../kontekst/tokenZastita.js";

export default function ObavijestSucu(){
    return (
        <div className='okvirPozivnice'>
            <div className='pozivnica'>
                <h2>
                Pozvani ste na sudjelovanje u ocjenjivanju natjecanja! 
                </h2>
                <p>
                Kliknite tipku da biste nastavili dalje.
                </p>
            </div>
            <button className="registracijaSuca" onClick={() => window.location.href=`${BACKEND_IP}/auth/google?state=judge-invite&fp=${encodeURIComponent(generateFingerprint())}`}>Registriraj se!</button>
        </div>
    )
}


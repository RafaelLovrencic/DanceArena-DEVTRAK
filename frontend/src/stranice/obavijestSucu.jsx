import { BACKEND_IP } from '../config.js';

export default function ObavijestSucu(){
    return (
        <>
            <div>
                Pozvani ste da sudjelujete u ocjenjivanju natjecanja. Kliknite gumb da biste nastavili dalje.
            </div>
            <button className="prijava" onClick={() => window.location.href=`${BACKEND_IP}/auth/google?state=judge-invite`}>Prijava</button>
        </>
    )
}


import '../izgled/navigacijskatraka.css'
import logo from '../izgled/pozadine/logo.png';
import profil from '../izgled/pozadine/profilIkona.png';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { BACKEND_IP } from '../config.js';
import { useAuth } from "../kontekst/AuthContext";

export default function NavigacijskaTraka() {
  const [burgerKlasa, setBurgerKlasa] = useState("burgerBar nekliknut");
  const [meniKlasa, setMeniKlasa] = useState("meni skriven");
  const [meniAktivan, setMeniAktivan] = useState(false);
  const { korisnik } = useAuth();

  const azurirajMeni = () => {
    if(!meniAktivan) {
        setBurgerKlasa("burgerBar kliknut")
        setMeniKlasa("meni vidljiv")
    }
    else {
        setBurgerKlasa("burgerBar nekliknut")
        setMeniKlasa("meni skriven")
    }
    setMeniAktivan(!meniAktivan)
  }

  const lokacija = useLocation();
  return (
  <>
    <div className='logo'>
      <Link to="/" className='start'><img src={logo} alt="Logo" className='logoImg'/></Link>
      <p className='DanceArena'>DanceArena</p>
    </div>
    <div className='tipke'>
      {!korisnik && lokacija.pathname !== '/unospodataka' && lokacija.pathname !== 'profil' && (
        <button className="prijava" onClick={() => window.location.href=`${BACKEND_IP}/auth/google`}>Prijava</button>
      )}
      {korisnik && lokacija.pathname !== '/unospodataka' && lokacija.pathname !== '/profil' && (
        <Link to="/profil" className='profil'><img src={profil} alt="Profil" className='profilImg'/></Link>
      )}
      {/* {lokacija.pathname !== '/unospodataka' && (
        <div className='burgerMeni' onClick={azurirajMeni}>
          <div className={burgerKlasa}></div>
          <div className={burgerKlasa}></div>
          <div className={burgerKlasa}></div>
        </div>  
      )} */}
      </div>
    <div className={meniKlasa}></div>
  </>
  )
}
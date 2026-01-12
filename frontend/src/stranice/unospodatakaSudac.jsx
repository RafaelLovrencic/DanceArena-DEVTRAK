import '../izgled/unospodataka.css'
import NavigacijskaTraka from './navigacijskatraka.jsx';
import { useState, useEffect } from 'react';
import { BACKEND_IP } from '../config.js';
import { useAuth } from "../kontekst/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UnosPodatakaSudac() {
  const { korisnik, loading } = useAuth();
  const [ime, setIme] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !korisnik) {
      navigate("/", { replace: true });
      return;
    }

    if (!loading && korisnik?.role) {
      navigate("/", { replace: true });
      return;
    }

    if (korisnik) {
      setIme(korisnik.ime || "");
    }
  }, [korisnik, loading]);

  const posaljiPodatke = async (e) => {
    e.preventDefault(); 
    if (!ime) {
      alert("Molimo popunite sva polja!");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_IP}/unospodataka`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ime,
          uloga : "sudac"
        }),
        iskljucivoSudac : true,
      });

      if (!response.ok) {
        setError("Greška pri ažuriranju profila");
        return;
      }

      window.location.replace("/");
    } catch (err) {
      console.error(err);
      setError("Greška pri komunikaciji sa serverom.");
    }
  };

  if (loading) return <p>Učitavanje...</p>;

  return (
  <>
    <nav>
      <NavigacijskaTraka />
    </nav>
    <section className='okvirZaPocetakPrijave'>
        <h1 className='dovrsiPrijavu'>Dovrši prijavu!</h1>
        <p className='uputeZaPrijavu'>Za prijavu je potrebno popuniti podatke.</p>
      </section>
      <div className='okvirZaFormu'>
        <form className="unosPodataka" onSubmit={posaljiPodatke}>
            {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
            
            <div className="ulogaSudac">
              <label>Uloga:</label>
              <input type="text" value="Sudac" disabled />
            </div>
            <div className='tekstOpcije'>
                <div className="ime">
                <label>Ime i prezime:</label>
                <input 
                    type="text" 
                    placeholder="Unesite svoje ime i prezime"
                    value={ime}
                    onChange={(e) => setIme(e.target.value)}
                />
                </div>
            </div>

        <div className='okvirZaPotvrdu'>
          <button type="submit">Potvrdi</button>  
        </div>
      </form>
    </div>
  </>
  )
}
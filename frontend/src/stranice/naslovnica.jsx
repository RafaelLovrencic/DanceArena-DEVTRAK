import "../izgled/naslovnica.css";
import NavigacijskaTraka from "./navigacijskatraka.jsx";
import {Link} from 'react-router-dom';
import { useAuth } from "../kontekst/AuthContext";
import {useState, useEffect} from 'react'
import { BACKEND_IP } from "../config";


export default function Naslovnica() {
    const { loading } = useAuth();
    const { korisnik } = useAuth();
    const [loadingNat, setLoadingNat] = useState(true);
    const [competitions, setCompetitions] = useState([]);
    useEffect(() => {
        if (!korisnik || loading) return;
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token"); // JWT token koji je frontend spremio
                const response = await fetch(`${BACKEND_IP}/natjecanja/user`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                if (!response.ok) {
                    throw new Error("Nema pristupa natjecanjima");
                }
                const data = await response.json();
                setCompetitions(data);
            } catch (err) {
                console.error('Greška kod dohvaćanja natjecanja:', err);
            } finally {
                setLoadingNat(false);
            }
        };
        fetchData();
    }, [korisnik, loading]);

    const otvoriPDF = async (competitionId) => {
        try {
            const response = await fetch(`${BACKEND_IP}/export/${competitionId}`, {
                credentials: "include"
            });

            if (!response.ok) throw new Error("Greška pri dohvaćanju PDF-a");

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);

            window.open(url, "_blank");

        } catch (err) {
            console.error("Greška kod dohvaćanja PDF-a:", err);
        }
    };
  return (
    <>
      <nav>
          {!loading && <NavigacijskaTraka />}
      </nav>
      <section className="brziStart">
        <h1 className="dobrodoslica">Dobrodošli u DanceArenu!</h1>
        <div className='precaci'>
        <Link to="/natjecanja" className="svaNatjecanja">Sva natjecanja</Link>
        {/* <button className='noviDogadaj'>Stvori novi događaj</button> */}
      </div>
    </section>
    <div className="obavijesti">
      <h1 className="obavijestiTekst">Natjecanja na kojima sudjelujete</h1>
    </div>
    <div className="animacijaTablice">
      <section className="sekcija">
              <div className="tablica-container">
                  {loadingNat ? (
                      <p className="loader">Učitavanje...</p>
                  ) : competitions.length > 0 ? (
                      <table className="tablica">
                      <thead>
                          <tr>
                              <th></th>
                              <th>Naziv</th>
                              <th>Datum</th>
                              <th>Mjesto</th>
                              <th>Stil plesa</th>
                              <th></th>
                              <th></th>
                          </tr>
                      </thead>
                      <tbody>
                          {competitions.map((comp) => (
                              <tr key={comp._id}>
                                <td>
                                {comp.stanje === "zaključano" && "🔒"}
                                {comp.stanje === "zatvoreno" && "🏁"}
                                </td>
                                  <td>{comp?.ime}</td>
                                  <td>{new Date(comp.datum).toLocaleDateString('hr-HR')}</td>
                                  <td>{comp.lokacija}</td>
                                  <td>{comp.kategorije?.[0]?.stil || '-'}</td>
                                  <td><Link to={`/natjecanje/${comp._id}`} className="link" title="Više informacija o natjecanju.">+</Link></td>
                                  <td>{comp.stanje === "otvoreno" ?
                                    "" :
                                    <button className="pdfButton" onClick={() => otvoriPDF(comp._id)}>PDF</button>
                                  }
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  ) : (
                      <p className="nema">Nema natjecanja!</p>
                  )}
              </div> 
      </section>
    </div>
    </>
  );
}

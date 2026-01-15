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
        if (!korisnik) {
            setCompetitions([]);
            setLoadingNat(false);
            return;
        }
        if (loading) return;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${BACKEND_IP}/natjecanja/user`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                if (response.status === 404) {
                    setCompetitions([]);
                } else if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.poruka || "Greška kod dohvaćanja natjecanja");
                } else {
                    const data = await response.json();
                    setCompetitions(data || []);
                }

            } catch (err) {
                console.error('Greška kod dohvaćanja natjecanja:', err);
                setCompetitions([]);
            } finally {
                setLoadingNat(false);
            }
        };

        fetchData();
    }, [korisnik, loading, competitions]);

    const otvoriPDF = async (competitionId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BACKEND_IP}/export/${competitionId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) throw new Error("Greška pri dohvaćanju PDF-a");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");

        } catch (err) {
            console.error("Greška kod dohvaćanja PDF-a:", err);
            alert("Greška pri dohvaćanju PDF-a");
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
                  ) : competitions.length > 0 && competitions ? (
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
                        {competitions.map((comp) => {
                            if (!comp) return null;

                            const ime = comp?.ime || "-";
                            const datum = comp?.datum ? new Date(comp?.datum).toLocaleDateString('hr-HR') : "-";
                            const lokacija = comp?.lokacija || "-";
                            const stil = comp?.kategorije?.[0]?.stil || "-";

                            return (
                            <tr key={comp?._id}>
                                <td>{comp?.stanje === "zaključano" ? "🔒" : comp?.stanje === "zatvoreno" ? "🏁" : ""}</td>
                                <td>{ime}</td>
                                <td>{datum}</td>
                                <td>{lokacija}</td>
                                <td>{stil}</td>
                                <td>
                                <Link to={`/natjecanje/${comp?._id}`} className="link" title="Više informacija o natjecanju.">+</Link>
                                </td>
                                <td>
                                {comp?.stanje !== "otvoreno" && (
                                    <button className="pdfButton" onClick={() => otvoriPDF(comp?._id)}>PDF</button>
                                )}
                                </td>
                            </tr>
                            )
                        })}
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

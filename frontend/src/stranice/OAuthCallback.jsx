import { useEffect } from "react";
import { BACKEND_IP } from "../config";

export default function OAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash; // "#token=..."
    const token = new URLSearchParams(hash.slice(1)).get("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    // ukloni token iz URL-a
    window.history.replaceState({}, "", "/");

    // 1️⃣ Pošalji token backendu da postavi cookie
    fetch(`${BACKEND_IP}/auth/store-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Neuspjelo spremanje tokena");

        // 2️⃣ Provjeri korisnika i klub
        const check = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
          credentials: "include",
        });

        if (!check.ok) {
          // Ako korisnik još nije u bazi, redirect na unos podataka
          window.location.href = "/unospodataka";
          return;
        }

        const data = await check.json();

        // 3️⃣ Ako korisnik postoji i ima role/klub → redirect na glavni
        if (data.korisnik.role) {
          window.location.href = "/";
        } else {
          // Korisnik postoji, ali još nema rolu/klub → unospodataka
          window.location.href = "/unospodataka";
        }
      })
      .catch((err) => {
        console.error("Greška pri prijavi:", err);
        window.location.href = "/login";
      });
  }, []);

  return <div>Prijava u tijeku...</div>;
}
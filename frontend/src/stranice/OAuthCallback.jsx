import { useEffect } from "react";
import { BACKEND_IP } from "../config";

export default function OAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash; // "#token=..."
    const token = new URLSearchParams(hash.slice(1)).get("token");

    console.log("OAuthCallback: token iz URL-a =", token);

    if (!token) {
      console.log("Nema tokena, redirect na /");
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
        console.log("POST /store-token status =", res.status);
        if (!res.ok) throw new Error("Neuspjelo spremanje tokena");

        // 2️⃣ Provjeri korisnika i klub
        const check = await fetch(`${BACKEND_IP}/auth/provjera-autentifikacije`, {
          credentials: "include",
        });

        console.log("GET /provjera-autentifikacije status =", check.status);

        if (!check.ok) {
          console.log("Korisnik nije u bazi, redirect na /unospodataka");
          window.location.href = "/unospodataka";
          return;
        }

        const data = await check.json();
        console.log("Provjera korisnika:", data);

        // 3️⃣ Redirect logika
        if (data.korisnik.role) {
          console.log("Korisnik postoji i ima role, redirect na /");
          window.location.href = "/";
        } else {
          console.log("Korisnik postoji, ali nema role/klub, redirect na /unospodataka");
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
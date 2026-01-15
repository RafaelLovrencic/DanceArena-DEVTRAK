import { useEffect } from "react";

export default function OAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash; // "#token=..."
    const token = new URLSearchParams(hash.slice(1)).get("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    // Spremi token u localStorage
    localStorage.setItem("token", token);

    // očisti URL
    window.history.replaceState({}, "", "/");

    // Redirect na glavnu stranicu
    window.location.href = "/";
  }, []);

  return <div>Prijava u tijeku...</div>;
}
import { useEffect } from "react";
import { BACKEND_IP } from "../config";

export default function OAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.slice(1)).get("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    // očisti URL
    window.history.replaceState({}, "", "/oauth-callback");

    // prava navigacija prema backendu
    window.location.href = `${BACKEND_IP}/auth/store-token?token=${token}`;
  }, []);

  return <div>Prijava u tijeku...</div>;
}
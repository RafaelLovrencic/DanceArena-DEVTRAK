export function generateFingerprint() {
  const raw = [
    navigator.userAgent,                        // browser i OS
    navigator.language,                         // jezik
    navigator.hardwareConcurrency,              // broj CPU jezgri
    Intl.DateTimeFormat().resolvedOptions().timeZone // vremenska zona
  ].join("::");
  console.log("Raw fingerprint string:", raw);
  return btoa(raw); 
}
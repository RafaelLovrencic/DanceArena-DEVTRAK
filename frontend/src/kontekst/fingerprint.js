export function generateFingerprint() {
  const raw = [
    navigator.userAgent,                        // browser i OS
    navigator.language,                         // jezik
    navigator.platform,                         // platforma (Win/Linux/Mac)
    navigator.hardwareConcurrency,              // broj CPU jezgri
    Intl.DateTimeFormat().resolvedOptions().timeZone // vremenska zona
  ].join("::");

  return btoa(raw); 
}
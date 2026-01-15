const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));const { generirajPozivToken } = require("./token.service");
const { generirajPozivToken } = require("./token.service");

async function posaljiPozivNaEmail(email, imeNatjecanja) {
    const token = generirajPozivToken({ email, imeNatjecanja });
    const link = `https://dancearena-devtrak-backend.onrender.com/unospodataka/prijaviSuca?token=${token}`;

    const payload = {
        sender: {
            name: "DanceArena",
            email: process.env.EMAIL_USER, 
        },
        to: [
            {
                email,
            },
        ],
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        htmlContent: `
            <h1>Pozdrav ${email}</h1>
            <p>Pozvani ste da sudjelujete kao sudac u ocjenjivanju nastupa na natjecanju <b>${imeNatjecanja}</b> 🎉</p>
            <a href="${link}">Registriraj se!</a>
        `,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        console.error("Brevo error:", data);
        throw new Error("Greška pri slanju emaila");
    }

    console.log("Email poslan:", data);
}

module.exports = { posaljiPozivNaEmail };
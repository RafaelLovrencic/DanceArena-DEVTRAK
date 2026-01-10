const { sendEmail } = require("../../utils/mailer");
const { generirajPozivToken } = require("./token.service");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function posaljiPozivNaEmail(email, imeNatjecanja) {

    const token = generirajPozivToken({
        email: email,
        imeNatjecanja: imeNatjecanja
    });

    const link = `https://dancearena-devtrak-backend.onrender.com/unospodataka/prijaviSuca?token=${token}`;

    await resend.emails.send({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: 
            `<h1>Hello ${email}</h1>
            <p>Pozvani ste da sudjelete kao sudac u ocjenjivanju nastupa na natjecanju ${imeNatjecanja} 🎉</p>
            <a href="${link}">Registriraj se!</a>`
    });
}

module.exports = { posaljiSucuPoziv, posaljiPozivNaEmail };

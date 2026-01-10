const { sendEmail } = require("../../utils/mailer");
const { generirajPozivToken } = require("./token.service");

async function posaljiSucuPoziv(user) {
    return sendEmail({
        to: user.email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: `<h1>Hello ${user.ime}</h1><p>Welcome to our app 🎉</p>`
    });
}

async function posaljiPozivNaEmail(email, imeNatjecanja) {

    const token = generirajPozivToken({
        email: email,
        imeNatjecanja: imeNatjecanja
    });

    const link = `http://localhost:5001/unospodataka/prijaviSuca?token=${token}`;

    return sendEmail({
        to: email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: 
            `<h1>Hello ${email}</h1>
            <p>Pozvani ste da sudjelete kao sudac u ocjenjivanju nastupa na natjecanju ${imeNatjecanja} 🎉</p>
            <a href="${link}">Registriraj se!</a>`
    });
}

module.exports = { posaljiSucuPoziv, posaljiPozivNaEmail };
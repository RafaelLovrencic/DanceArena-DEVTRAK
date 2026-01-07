const { sendEmail } = require("../../utils/mailer");

async function posaljiSucuPoziv(user) {
    return sendEmail({
        to: user.email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: `<h1>Hello ${user.ime}</h1><p>Welcome to our app 🎉</p>`
    });
}

async function posaljiPozivNaEmail(email) {
    return sendEmail({
        to: email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: 
            `<h1>Hello ${email}</h1>
            <p>Welcome to our app 🎉</p>
            <a href="https://www.youtube.com">Registriraj se!</a>`
    });
}

module.exports = { posaljiSucuPoziv, posaljiPozivNaEmail };
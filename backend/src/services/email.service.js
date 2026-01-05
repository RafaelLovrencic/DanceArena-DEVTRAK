const { sendEmail } = require("../../utils/mailer");

async function posaljiSucuPoziv(user) {
    return sendEmail({
        to: user.email,
        subject: "Dobrodošli u DanceArenu-DEVTRAK!",
        html: `<h1>Hello ${user.ime}</h1><p>Welcome to our app 🎉</p>`
    });
}

module.exports = { posaljiSucuPoziv };
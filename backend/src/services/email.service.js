const { sendEmail } = require("../../utils/mailer");
const { generirajPozivToken } = require("./token.service");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function posaljiPozivNaEmail(email, imeNatjecanja) {
  try {
    const token = generirajPozivToken({
      email,
      imeNatjecanja
    });

    const link = `https://dancearena-devtrak-backend.onrender.com/unospodataka/prijaviSuca?token=${token}`;

    console.log("Šaljem mail:", {
      email,
      RESEND_API_KEY: process.env.RESEND_API_KEY?.slice(0, 8) + "..."
    });

    const response = await resend.emails.send({
      from: "Devtrak <onboarding@resend.dev>",
      to: email,
      subject: "Dobrodošli u DanceArenu-DEVTRAK!",
      html: `
        <h1>Pozdrav!</h1>
        <p>Pozvani ste da sudjelujete kao sudac na natjecanju <b>${imeNatjecanja}</b> 🎉</p>
        <a href="${link}">Registriraj se</a>
      `
    });

    console.log("Resend response:", response);
  } catch (err) {
    console.error("Resend error:", err);
  }
}


module.exports = { posaljiPozivNaEmail };

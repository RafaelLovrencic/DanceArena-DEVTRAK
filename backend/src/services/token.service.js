const jwt = require("jsonwebtoken");

function generirajPozivToken({ email, imeNatjecanja }) {
    return jwt.sign(
        {
            email,
            imeNatjecanja,
            role: "sudac",
            type: "judge-invite"
        },
        process.env.INVITE_SECRET,
        { expiresIn: "48h" }
    );
}

module.exports = { generirajPozivToken };
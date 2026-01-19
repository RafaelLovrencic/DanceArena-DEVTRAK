const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

const homeRuter = require('./src/routes/home.routes')
const authRuter = require("./src/routes/auth.routes");
const unosRuter = require("./src/routes/unos.routes");
const usersRouter = require("./src/routes/users.routes");
const natjecanjaRuter = require("./src/routes/natjecanja.routes");
const prijaveRuter = require("./src/routes/prijave.routes");
const transakcijeRouter = require("./src/routes/transakcije.routes");
const nastupRouter = require("./src/routes/nastup.routes");
const { FRONTEND_URL } = require("./config");
const exportRuter = require("./src/routes/export.routes");


const app = express();

// VAŽNO!!!
// ovo mora biti prije app.use(express.json()) zbog Stripe Webhook-a
app.post('/napravi-transakciju/webhook', 
    express.raw({type: 'application/json'}), 
    transakcijeRouter
);

app.use(express.json()); // da dopustimo JSON body u POST requestu
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_URL, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Fingerprint"],
  })
);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Google OAuth konfiguracija
require("./src/config/passport")(passport);
app.use(passport.initialize());

app.use('/', homeRuter)
app.use("/auth", authRuter);
app.use("/unospodataka", unosRuter);
app.use("/natjecanja", natjecanjaRuter);
app.use("/prijave", prijaveRuter);
app.use("/napravi-transakciju", transakcijeRouter);
app.use("/export", exportRuter);
app.use("/users", usersRouter);
app.use("/nastup", nastupRouter);

const SERVER_PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Povezani ste s MongoDB Atlasom"))
    .catch(err => console.error("Greška pri povezivanju s MongoDB Atlasom:", err));

app.listen(SERVER_PORT, () => {
  console.log(`Server radi na http://localhost:${SERVER_PORT}`);
});
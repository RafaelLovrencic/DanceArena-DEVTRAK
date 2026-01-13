const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
const { FRONTEND_URL } = require("../../config");

const User = require("../models/user");
const Natjecanje = require("../models/natjecanje");

const GODISNJA_CLANARINA_PRICE_ID = process.env.STRIPE_GODISNJA_CLANARINA_PRICE_ID;

function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Niste prijavljeni" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.korisnik = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Neispravan token" });
    }
}

router.post("/clanarina", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.korisnik.id);

        if (user.stripePayment?.subscription?.active) {
            return res.status(409).json({
                error: "Već imate aktivnu godišnju članarinu",
            });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: GODISNJA_CLANARINA_PRICE_ID,
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            success_url: `${FRONTEND_URL}`,
            cancel_url: `${FRONTEND_URL}`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška kod Stripe sesije", details: err.message });
    }
});

router.post("/otkazi-clanarinu", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.korisnik.id);
        const subscriptionId = user?.stripePayment?.subscription?.subscriptionId;

        if (!subscriptionId) {
            return res.status(400).json({ error: "Nemate aktivnu članarinu" });
        }

        // Otkazivanje na kraju plaćenog perioda
        //await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

        await stripe.subscriptions.cancel(subscriptionId);

        res.json({ message: "Članarina uspješno otkazana" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/status-clanarine", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.korisnik.id);
        
        res.json({ 
            active: user?.stripePayment?.subscription?.active || false,
            vrijediDo: user?.stripePayment?.subscription?.vrijediDo || null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/kotizacija", authMiddleware, async (req, res) => {
    try {
        const korisnik = await User.findById(req.korisnik.id);
        const { natjecanjeId } = req.body;
        if (!natjecanjeId) return res.status(400).json({ error: "Nije poslan ID natjecanja" });

        const natjecanje = await Natjecanje.findById(natjecanjeId);
        if (!natjecanje) return res.status(404).json({ error: "Natjecanje ne postoji" });

        if (korisnik.role !== "voditelj") {
            return res.status(403).json({ error: "Nemate dopuštenje za plaćanje kotizacije" });
        }

        const kotizacija = parseInt(natjecanje.kotizacija);
        if (isNaN(kotizacija) || kotizacija <= 0) {
            return res.status(400).json({ error: "Neispravna kotizacija natjecanja" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            /*/invoice_creation: {
                enabled: true,
            },/*/
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Kotizacija za natjecanje: ${natjecanje.ime}`,
                        },
                        unit_amount: kotizacija * 100, // Stripe koristi cent kao osnovnu jedinicu
                    },
                    quantity: 1,
                },
            ],
            customer_email: korisnik.email,
            metadata: {
                korisnikId: korisnik._id.toString(),
                natjecanjeId: natjecanje._id.toString(),
            },
            success_url: `${FRONTEND_URL}/natjecanje/${natjecanjeId}`,
            cancel_url: `${FRONTEND_URL}/natjecanje/${natjecanjeId}`,
        });
a
        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Greška kod Stripe sesije", details: err.message });
    }
});

router.get("/status-kotizacije/:natjecanjeId", authMiddleware, async (req, res) => {
    try {
        const { natjecanjeId } = req.params;
        const korisnikId = req.korisnik.id;

        const natjecanje = await Natjecanje.findById(natjecanjeId);
        if (!natjecanje) return res.status(404).json({ error: "Natjecanje ne postoji" });

        const placeno = natjecanje.platitelji?.includes(korisnikId) || false;

        res.json({ placeno });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send("Invalid signature");
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            // za plaćanje članarine
            if (session.mode === "subscription") {
                const vrijediDo = new Date();
                vrijediDo.setFullYear(vrijediDo.getFullYear() + 1); //do kad vrijedi članarina

                await User.findOneAndUpdate(
                    { email: session.customer_email },
                    {
                        "stripePayment.stripeCustomerId": session.customer,
                        "stripePayment.subscription.active": true,
                        "stripePayment.subscription.subscriptionId": session.subscription || null,
                        "stripePayment.subscription.vrijediDo": vrijediDo,
                    }
                );
            }

            // za plaćanje kotizacije za natjecanje
            if (session.mode === "payment") {
                const { korisnikId, natjecanjeId } = session.metadata;

                await Natjecanje.findByIdAndUpdate(natjecanjeId, {
                    $addToSet: { platitelji: korisnikId }
                });

                //console.log("Uspješno plaćanje kotizacije");
            }
        }

        // za otkazivanje članarine
        if (event.type === "customer.subscription.deleted") {
            await User.findOneAndUpdate(
                { "stripePayment.subscription.subscriptionId": event.data.object.id },
                {
                    "stripePayment.subscription.active": false,
                    "stripePayment.subscription.subscriptionId": null,
                    "stripePayment.subscription.vrijediDo": null,
                }
            );
        }

        res.json({ received: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const pdfkit = require("pdfkit");
const express = require("express");
const Nastup = require("../models/nastup");
const Natjecanje = require("../models/natjecanje");
const path = require("path");

var doc = new pdfkit({
    margin: 50,
    size: 'A4'
});
const router = express.Router();

router.get('/:id', async (req, res) => {
    try {

        doc.registerFont('SedanSC', path.resolve(__dirname, '../fonts/SedanSC-Regular.ttf'));
        doc.font('SedanSC');
        doc.pipe(res);

        const natjecanjeId = req.params.id;
        
        /*
        const natjecanje = await Natjecanje.findById(id)
            .populate('kategorije')
            .populate('organizatorId', 'ime email')
            .lean();

        const nastupi = await Nastup.find({
            natjecanjeId
        }).populate("kategorijaId", "godiste stil velicina")
          .populate("klubId", "ime lokacija")
          .lean();
       
        const grupiranoPoKat = nastupi.reduce((acc, nastup) => {
            const kat = nastup.kategorijaId;
            const kljuc = `${kat.godiste}_${kat.stil}_${kat.velicina}`;

            if (!acc[kljuc])
                acc[kljuc] = {kategorija: kat, nastupi: []};

            acc[kljuc].nastupi.push(nastup);
            return acc;
        }, {});
        
        const rez = Object.values(grupiranoPoKat).map(grupa => {
            grupa.nastupi
                .sort((a, b) => a.klubId.ime.localeCompare(b.klubId.ime, "hr"))
                .forEach((nastup, index) => { nastup.redniBroj = index + 1; });
            
            return grupa;
        });
        console.log(rez);
        */
        
        const natjecanje = {
            "naziv": "probno natjecanje"
        };
        
        const rez = [
            {
                "kategorija": {
                    "_id": "...",
                    "godiste": "juniori",
                    "stil": "hiphop",
                    "velicina": "formacija"
                },
                "nastupi": [
                    {
                        "redniBroj": 1,
                        "imekoreografije": "Break the Floor",
                        "klubId": {
                            "ime": "Dance Studio Alpha"
                        }
                    },
                    {
                        "redniBroj": 2,
                        "imekoreografije": "Street Power",
                        "klubId": {
                            "ime": "Urban Crew"
                        }
                    }
                ]
            },
            {
                "kategorija": {
                    "_id": "...",
                    "godiste": "seniori",
                    "stil": "hiphop",
                    "velicina": "formacija"
                },
                "nastupi": [
                    {
                        "redniBroj": 1,
                        "imekoreografije": "Break the Floor",
                        "klubId": {
                            "ime": "Dance Studio Alpha"
                        }
                    },
                    {
                        "redniBroj": 2,
                        "imekoreografije": "Street Power",
                        "klubId": {
                            "ime": "Urban Crew"
                        }
                    }
                ]
            }
        ];
        
        doc.fontSize(25).fillColor('#ab58c7').text(`${natjecanje.naziv} - STARTNA LISTA`);
        doc.fontSize(13).fillColor('black').text(`ID: ${natjecanjeId}`);
        doc.moveDown();
        doc.fontSize(15);
        
        rez.forEach(kategorija => {
            var podaci = [
                ["REDNI BROJ NASTUPA", "IME KLUBA", "IME KOREOGRAFIJE"]
            ];
            
            for (let i = 0; i < 2; i++) {
                doc.strokeColor('black')
                    .lineWidth(1)
                    .moveTo(doc.page.margins.left, doc.y)
                    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
                    .stroke()
                    .moveDown(0.3);
            }
            doc.text(`Stil:            ${kategorija.kategorija.stil}`);
            doc.text(`Veličina:    ${kategorija.kategorija.velicina}`);
            doc.text(`Godište:     ${kategorija.kategorija.godiste}`);
            doc.moveDown(0.4);
            
            kategorija.nastupi.forEach(nastup => {
                podaci.push([nastup.redniBroj, nastup.klubId.ime, nastup.imekoreografije]);
            });

            doc.table({
                columnStyles: (ind) => {
                    if (ind === 0)
                        return { maxWidth: 100 };
                },
                rowStyles: (ind) => {
                    if (ind === 0)
                        return {
                            border: {right: 1, bottom: 2, left: 1, top: 0},
                            borderColor: { bottom:'#1e1e1e', left: 'white', right: 'white' }, 
                            backgroundColor: '#ab58c7', textColor: 'white', align: 'center'
                        };
                    else
                        return { border: [0, 0, 1, 0], borderColor: '#ab58c7' };
                },
                data: podaci
            });
            doc.moveDown(2);
        });
        doc.end();

    } catch (err) {
        console.error("Greška pri izvozu startne liste");
        console.error(err);
        res.status(500).json( {error: "Greška pri izvozu startne liste"} );
    }
});

module.exports = router;
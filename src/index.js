const express    = require("express")
const cors       = require("cors")
const fs         = require("fs")
const config     = require("./config")
const generator  = require("./generator")
const lib        = require("./lib")
const launcher   = require("./launcher")
const fhirServer = require("./fhir-server")
const {
    rejectXml,
    blackList,
    globalErrorHandler
} = require("./middlewares")
const v3 = require("./v3/fhir-server").default


const app = express();

// CORS everywhere :)
app.use(cors({ origin: true, credentials: true }));

// Block some IPs
app.use(blackList(process.env.IP_BLACK_LIST || ""));

// reject xml
app.use(rejectXml);

// We use Pug as view engine
app.set('view engine', 'pug');
app.set('views', __dirname + "/v3/views");

// Host public keys for backend services JWKS auth
app.get("/keys", (req, res) => {
    let key = {}
    Object.keys(config.oidcKeypair).forEach(p => {
        if (p != "d") key[p] = config.oidcKeypair[p];
    });
    res.json({"keys":[key]})
});

// Also host the public key as PEM
app.get("/public_key", (req, res) => {
    fs.readFile(__dirname + "/../public-key.pem", "utf8", (err, key) => {
        if (err) {
            return res.status(500).end("Failed to read public key");
        }
        res.type("text").send(key);
    });
});

// FHIR servers
app.use(["/v/:fhir_release/sim/:sim", "/v/:fhir_release"], fhirServer)

app.use("/v3", v3);

// The launcher used by the SMART App Gallery
app.get("/launcher", launcher);

// generate random strings or RS384 JWKs
app.use("/generator", generator);

// Provide some env variables to the frontend
app.use("/env.js", (req, res) => {
    const out = {
        PICKER_ORIGIN: "https://patient-browser.smarthealthit.org",
        STU2_ENABLED : true,
        STU3_ENABLED : true,
        STU4_ENABLED : true
    };

    const whitelist = {
        "NODE_ENV"                : String,
        "DISABLE_BACKEND_SERVICES": lib.bool,
        "GOOGLE_ANALYTICS_ID"     : String,
        "CDS_SANDBOX_URL"         : String,
        "PICKER_CONFIG_R2"        : String,
        "PICKER_CONFIG_R3"        : String,
        "PICKER_CONFIG_R4"        : String,
        "PICKER_ORIGIN"           : String,
        "STU2_ENABLED"            : lib.bool,
        "STU3_ENABLED"            : lib.bool,
        "STU4_ENABLED"            : lib.bool,
        "FHIR_SERVER_R2"          : String,
        "FHIR_SERVER_R3"          : String,
        "FHIR_SERVER_R4"          : String
    };

    Object.keys(whitelist).forEach(key => {
        if (process.env.hasOwnProperty(key)) {
            out[key] = whitelist[key](process.env[key]);
        }
    });

    res.type("application/javascript").send(`var ENV = ${JSON.stringify(out, null, 4)};`);
});



// static assets
app.use(express.static("static"));

app.use(globalErrorHandler);

// Start the server if ran directly (tests import it and start it manually)
/* istanbul ignore if */
if (require.main?.filename === __filename) {
    app.listen(config.port, () => {
        console.log(`SMART launcher listening on port ${config.port}!`)
    });

    if (process.env.SSL_PORT) {
        require('pem').createCertificate({
            days: 100,
            selfSigned: true
        }, (err, keys) => {
            if (err) {
                throw err
            }
            require("https").createServer({
                key : keys.serviceKey,
                cert: keys.certificate
            }, app).listen(process.env.SSL_PORT, () => {
                console.log(`SMART launcher listening on port ${process.env.SSL_PORT}!`)
            });
        });
    }
}

module.exports = app;

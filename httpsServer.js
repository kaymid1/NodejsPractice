const https = require("https");
const fs = require("fs");
const path = require("path"); // Import the path module

const privateKeyPath = path.join(__dirname, "env", "private.key");
const certificatePath = path.join(__dirname, "env", "certificate.crt");

const options = {
  key: fs.readFileSync(privateKeyPath), // Path to your private key file
  cert: fs.readFileSync(certificatePath), // Path to your certificate file
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("Hello, HTTPS!");
});

server.listen(443, () => {
  console.log("Server running on port 443");
});

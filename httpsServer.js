const https = require("https");
const fs = require("fs");
const path = require("path"); // Import the path module

const privateKeyPath = path.join(__dirname, "private.key"); // Modify the path to your private key file
const certificatePath = path.join(__dirname, "certificate.crt"); // Modify the path to your certificate file

const options = {
  key: fs.readFileSync(privateKeyPath), // Read the private key file
  cert: fs.readFileSync(certificatePath), // Read the certificate file
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end("Hello, HTTPS!");
});

server.listen(443, () => {
  console.log("Server running on port 443");
});

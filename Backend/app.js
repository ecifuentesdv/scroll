require("dotenv").config({ path: `${__dirname}/./env/.env` });

const Server = require('./config/server');
const server = new Server();
server.listen();
const _ = require('lodash');
const _dbURL = process.env.DATABASE_URL || "postgres://uitkglgtmtapiq:a91bd500e3954e1cd41d715e9bcf0e6d91ed17c11c7c94a0017176d63b93e835@ec2-54-221-244-196.compute-1.amazonaws.com:5432/ddjshokmu0gqsh";

const parse = require('pg-connection-string').parse;
let config = parse(_dbURL);
_.extend(config,{
    ssl: true,
    max: 20,
    min: 4,
    idleTimeoutMillis: 1000
});

module.exports = config;
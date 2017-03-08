const _ = require('lodash');
const cfenv = require('cfenv');
const assert = require('assert');
const util = require('util');

let localConfig = {
    "services": {
        "compose-for-postgresql": [
            {
                "credentials": {
                    "db_type": "postgresql",
                    "name": "bmix-dal-yp-89e0ca60-984d-479a-8de9-39d0e95b721d",
                    "uri_cli": "psql \"sslmode=require host=sl-us-dal-9-portal.6.dblayer.com port=21046 dbname=compose user=admin\"",
                    "ca_certificate_base64": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURmekNDQW1lZ0F3SUJBZ0lFV01CcHJEQU5CZ2txaGtpRzl3MEJBUTBGQURCQk1UOHdQUVlEVlFRREREWjAKYVdGbmJ5NXViMkp5WldkaFFEbGlaV1V1YVhRdE1tSmpaR1JpWmpneU1tVTNZamd4WldabFpHSTJaakpsTlRCagpNRGcxWmpRd0hoY05NVGN3TXpBNE1qQXlPVE15V2hjTk16Y3dNekE0TWpBd01EQXdXakJCTVQ4d1BRWURWUVFECkREWjBhV0ZuYnk1dWIySnlaV2RoUURsaVpXVXVhWFF0TW1KalpHUmlaamd5TW1VM1lqZ3haV1psWkdJMlpqSmwKTlRCak1EZzFaalF3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRGtSZ043Wm0vRwo2RGdCak1hbDBPdnpWUm15Vi80TEN4cG03WFpYZzhLbHFSYVZWa2JXMVdDbDBoUFIwVjNlalpZQjVBSTNEOGxaClYwOERRUXptaGxzK3NIdmw2N2xhNzN6S1N4d2xmUjhudWRPSGxOeVl0NDBwY1VnTVI4cXVpVENiMk1TaHBPcHMKTzBGU0ZMU2R1THo4dG1CMEJBakpTNzhlQjVYRzhCNERBT0ZEZ2J5cFptMXE2K3VvSE5CMFJEUlA3QzNhTnFhdgpEQWVWY2Vqb0x4b1A0cGIxRDJpMDl2cTdyL2doa0NnaEo4UGo2VHZ6a3ZyUDZYSTZhTk9CRWxZTGRadzVrSEZRClJXVllVM1UwbXllczZEbGtSYlNDMkpHZS82OEdLdFN5TVpQZWhkVG5iMUdiN2xvdTNiMFlRYVVpMDhnYy9lR0sKY0dOQitIR0RRSWwvQWdNQkFBR2pmekI5TUIwR0ExVWREZ1FXQkJScGlFS29Yam8vV3R2MjFZbDc2MmpWUFo5VgpRakFPQmdOVkhROEJBZjhFQkFNQ0FnUXdIUVlEVlIwbEJCWXdGQVlJS3dZQkJRVUhBd0VHQ0NzR0FRVUZCd01DCk1Bd0dBMVVkRXdRRk1BTUJBZjh3SHdZRFZSMGpCQmd3Rm9BVWFZaENxRjQ2UDFyYjl0V0plK3RvMVQyZlZVSXcKRFFZSktvWklodmNOQVFFTkJRQURnZ0VCQURjaXhjcmowd3doWXNEVHU2RnJGL0JBYkUyWk5RUlE5aFByeHpqVQpGM3phdk14TDJsT0JESWJnaHlIT1lZeW9IYjR4QWZQOG9MT25qRTV3OEtBSDVYTFkvdVVCQllNQ0tiOVFWNTNBCllOT3VJWkFaODhzQUN4UVMzcy96K3JoQzA0MHNrQm9vcUtBTWplQjlUSFNCT05nVjV5ZC9QK3h5cWp6Y09LUlIKQy9aSW5kYUVva2lwZ3loZ0R1a1ZVdVduUVcvUFB6WndJUG96QVBXN0FrTE1XandFMXg0cXNtQTF2VEZ0N3UyUQpjWjI1YjdBUUJJQTRIQkRCakhtSC9wMzYvd2NjdW5tR3pGSDFrWlNaMXNoVTJPcjcweUdTWjAySmJIVUpJWGZRCmlrTlFRRzFRRFQ4MnFGNUNRTktJVFlOUUJXbHVURXFhTHRjM0svYzdtZXRQWWhBPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==",
                    "deployment_id": "58c069a7cb316400180001c9",
                    "uri": "postgres://admin:BMKNFJTLPHPIRTUO@sl-us-dal-9-portal.6.dblayer.com:21046/compose"
                },
                "syslog_drain_url": null,
                "label": "compose-for-postgresql",
                "provider": null,
                "plan": "Standard",
                "name": "postgre-lasapaodeq",
                "tags": [
                    "big_data",
                    "data_management",
                    "ibm_created"
                ]
            }
        ]
    }
};

const appenv = cfenv.getAppEnv();
if(appenv.isLocal){
    _.extend(appenv,localConfig);
}

console.log('appenv:',appenv);

// Within the application environment (appenv) there's a services object
const services = appenv.services;
// The services object is a map named by service so we extract the one for PostgreSQL
const pg_services = services["compose-for-postgresql"];
// This check ensures there is a services for PostgreSQL databases
assert(!util.isUndefined(pg_services), "Must be bound to compose-for-postgresql services");
// We now take the first bound PostgreSQL service and extract it's credentials object
const credentials = pg_services[0].credentials;

// Within the credentials, an entry ca_certificate_base64 contains the SSL pinning key
// We convert that from a string into a Buffer entry in an array which we use when
// connecting.
let ca = new Buffer(credentials.ca_certificate_base64, 'base64');
let connString = credentials.uri;

const parse = require('pg-connection-string').parse;

let config = parse(connString);
_.extend(config,{
    ssl: {
        rejectUnauthorized: false,
        ca: ca
    },
    max: 20,
    min: 4,
    idleTimeoutMillis: 1000
});

module.exports = config;
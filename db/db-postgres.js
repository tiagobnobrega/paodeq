const pg = require('pg');
const Pool = require('pg-pool');
const url = require('url');
const _dbURL = process.env.DATABASE_URL || "postgres://uitkglgtmtapiq:a91bd500e3954e1cd41d715e9bcf0e6d91ed17c11c7c94a0017176d63b93e835@ec2-54-221-244-196.compute-1.amazonaws.com:5432/ddjshokmu0gqsh";

const createDbScript = [
    'CREATE TABLE IF NOT EXISTS \"USUARIOS\"('
    +' \"CO_USUARIO\" Varchar NOT NULL,'
    +' \"IN_MODO_MENSAGEM\" Bigint,'
    +' \"DH_ULTIMA_MENSAGEM\" Timestamp'
    +');'
    ,
    'ALTER TABLE "USUARIOS" ADD COLUMN IF NOT EXISTS DH_INCLUSAO Timestamp;',
    'ALTER TABLE "USUARIOS" DROP CONSTRAINT IF EXISTS "PK_USUARIOS";',
    'ALTER TABLE "USUARIOS" ADD CONSTRAINT "PK_USUARIOS" PRIMARY KEY ("CO_USUARIO");'
];

const dbPg = function(dbURL){
    let me = {};
    const params = url.parse(dbURL);
    const auth = params.auth.split(':');

    const dbConfig = {
        user: auth[0],
        password: auth[1],
        host: params.hostname,
        port: params.port,
        database: params.pathname.split('/')[1],
        ssl: true,
        max: 20,
        min: 4,
        idleTimeoutMillis: 1000
    };

    const pool = new Pool(dbConfig);

    me.init = function(cb) {
        doTestConnection()
            .then(doCreateDb)
            .then(cb)
            .catch(function(err){
            console.error(err.stack);
        });
    };

    const doTestConnection = function doTestConnection(cb){
        console.log('Testando conexão com o banco...');
        return pool.query('SELECT NOW()');
    };

    const doCreateDb = function createDb(){
        console.log('Criando database...');
        let loopPromisse = null;
        createDbScript.forEach(function(query){
            console.log('register query: %s',query);
            if(loopPromisse ===null){
                loopPromisse = pool.query(query);
            }else{
                loopPromisse = loopPromisse.then(function(){return pool.query(query)})
            }
        });

        return loopPromisse;
        // return pool.query(createDbScript[0])
    };

    me.pool = pool;
    me.query = function(test,values){
        return pool.query(text, values)
    };

    return me;
}(_dbURL);

module.exports = dbPg;
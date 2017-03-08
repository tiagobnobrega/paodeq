const pg = require('pg');
const Pool = require('pg-pool');
const url = require('url');


// const config = require('./heroku-pg-config');
const config = require('./bluemix-pg-config');

const createDbScript = [
    'CREATE TABLE IF NOT EXISTS \"USUARIOS\"('
    +' \"CO_USUARIO\" Varchar(80) NOT NULL,'
    +' \"IN_MODO_MENSAGEM\" Varchar(10),'
    +' \"DH_ULTIMA_MENSAGEM\" Timestamp,'
    +' \"DH_INCLUSAO\" Timestamp'
    +');'
    ,
    'ALTER TABLE "USUARIOS" DROP CONSTRAINT IF EXISTS "PK_USUARIOS";',
    'ALTER TABLE "USUARIOS" ADD CONSTRAINT "PK_USUARIOS" PRIMARY KEY ("CO_USUARIO");'
];

const dbPg = function(dbConfig){
    let me = {};

    const pool = new Pool(dbConfig);

    me.init = function(cb) {
        doTestConnection()
            .then(doCreateDb)
            .then(function(){cb(null)})
            .catch(function(err){
                cb(err);
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
    me.query = function(text,values){
        return pool.query(text, values)
    };

    return me;
}(config);

module.exports = dbPg;
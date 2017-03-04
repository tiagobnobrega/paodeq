const _db = require('./db-postgres');

const usuariosStore = function(db){
    var me = {};
    var data = {
        'users':{}
    };

    const NOTIFY_MODES ={
        'NEVER':'NEVER',
        'ONCE':'ONCE',
        'ALWAYS':'ALWAYS'
    };

    /**
     * var user = ( data.users[userId] || {'id':userId, 'context':{}, 'mode':NOTIFY_MODES.NEVER} );
     user.dtInclusao = new Date();
     user.lastMsg = new Date();
     data.users[userId] = user;
     */


    let fnQueryErr = function(err){
        console.error('QUERY_ERR', err.message, err.stack)
    };

    let parseUser = function parseUser(row){
        console.log('parseUser, row:',row);
    };

    me.updateUser = function(user){
        let params = [user.id.toString(), user.mode, user.lastMsg];
        db.query('UPDATE "USUARIOS" SET (CO_USUARIO, IN_MODO_MENSAGEM, DH_ULTIMA_MENSAGEM) = ($1,$2,$3) WHERE CO_USUARIO=$1',params)
            .then(cb).catch(fnQueryErr);
    };

    me.addUser = function(userId,cb){
        let params = [userId, NOTIFY_MODES.NEVER, new Date(), new Date()];
        db.query('INSERT INTO (CO_USUARIO, IN_MODO_MENSAGEM, DH_ULTIMA_MENSAGEM, DH_INCLUSAO) "USUARIOS" VALUES($1,$2,$3,$4)',params)
            .then(function(res){return parseUser(res.rows[0])})
            .then(cb).catch(fnQueryErr);
    };

    me.getUsers = function(cb){
        db.query('SELECT * FROM "USUARIOS"')
            .then(function(res){return parseUser(res.rows[0])})
            .then(cb).catch(fnQueryErr);
    };

    me.getUser = function (userId, cb) {
        let params = [userId.toString()];
        db.query('SELECT * FROM "USUARIOS" WHERE CO_USUARIO=$1::text', params)
            .then(function (res) {
                    return res.rows.map( function (row) { return parseUser(row); });
                }
            )
            .then(cb).catch(fnQueryErr);
    };
    me.NOTIFY_MODES = NOTIFY_MODES;
    return me;
}(_db);

module.exports = usuariosStore;

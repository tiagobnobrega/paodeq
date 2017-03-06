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

    const USER_MAP = {
        'id':{'i':0,'col':'CO_USUARIO'},
        'mode':{'i':1,'col':'IN_MODO_MENSAGEM'},
        'lastIteration':{'i':2,'col':'DH_ULTIMA_MENSAGEM'},
        'dtInclusao':{'i':3,'col':'DH_INCLUSAO'},
    };
    /**
     * var user = ( data.users[userId] || {'id':userId, 'context':{}, 'mode':NOTIFY_MODES.NEVER} );
     user.dtInclusao = new Date();
     user.lastMsg = new Date();
     data.users[userId] = user;
     */
    let parseUser = function parseUser(arg){
        if(!arg) return null;
        let mapAttr = 'col';
        let user = {};
        if(Array.isArray(arg)){
            mapAttr = 'i';
        }
        for(let attr in USER_MAP){
            user[attr] = arg[USER_MAP[attr][mapAttr]];
        }
        return user;
        //return {id:'Fakeid'};
    };

    let parseAllUsers = function(rows){
        return rows.map( function (row) { return parseUser(row); });
    };

    me.updateUser = function(user, cb){
        let params = [user.id.toString(), user.mode, user.lastMsg];
        db.query('UPDATE "USUARIOS" SET ("CO_USUARIO", "IN_MODO_MENSAGEM", "DH_ULTIMA_MENSAGEM") = ($1,$2,$3) WHERE "CO_USUARIO"=$1',params)
            .then(function(){cb(null,user)})
            .catch(function(err){cb(err)});
    };

    let chainCallback = function(promise,callback){
        if(!callback) return promise;
        if(callback instanceof Function){
           return promise
                .then(function(data){callback(null,data)})
                .catch(function(err){callback(err)});
        }
        return promise;
    };

    let buildInStmt = function(params,start){
        let startInd = (start || 1);
      return params.reduce(function(prev,curr,ind){return prev+(ind===0?"":",")+"$"+(ind+startInd)},'');
    };

    me.updateMode = function(fromModes,toMode,cb){
        let params = [toMode];
        params = params.concat(fromModes);
        let strInFromModes = buildInStmt(fromModes,2);
        return chainCallback(
            db.query('UPDATE "USUARIOS" SET ("IN_MODO_MENSAGEM") = ($1) WHERE "IN_MODO_MENSAGEM" IN ('+strInFromModes+')',params)
            ,cb
        );
    };

    me.updateNotifiedByMode =function(modes,cb){
        let strInFromModes = buildInStmt(modes);
        console.log('updateNotifiedByMode, strInFromModes:',strInFromModes);
        return chainCallback(
            db.query('UPDATE "USUARIOS" SET ("DH_ULTIMA_MENSAGEM") = (NOW()) WHERE "IN_MODO_MENSAGEM" IN ('+strInFromModes+')',modes)
            ,cb
        );
    };

    me.getUsersByMode = function(modes,cb){
        let strInModes = buildInStmt(modes);
        return chainCallback(
            db.query('SELECT * FROM "USUARIOS" WHERE "IN_MODO_MENSAGEM" IN ('+strInModes+')', modes)
            .then(function(res){return parseAllUsers(res.rows)})
            ,cb
        );
    };

    me.addUser = function(userId, cb){
        console.log('StoreUsuarios.addUser');
        let user = {'id':userId,'mode':NOTIFY_MODES.NEVER, 'dtInclusao':new Date(),'lastIteration':new Date()};
        let params = [user.id, user.mode, user.dtInclusao, user.lastIteration];
        return chainCallback(
            db.query('INSERT INTO "USUARIOS" ("CO_USUARIO", "IN_MODO_MENSAGEM", "DH_ULTIMA_MENSAGEM", "DH_INCLUSAO") VALUES ($1,$2,$3,$4)',params)
            .then(function(res){return parseUser(res.rows[0])})
            .then(function(){return user})
            ,cb
        )
    };

    me.getUsers = function(cb){
        return chainCallback(
            db.query('SELECT * FROM "USUARIOS"')
            .then(function(res){parseAllUsers(res.rows)})
            ,cb
        );
    };

    me.getUser = function (userId, cb) {
        let params =[userId];
        return chainCallback(
        db.query('SELECT * FROM "USUARIOS" WHERE "CO_USUARIO"=$1::text', params)
            .then(function(res){return parseUser(res.rows[0]);})
            ,cb
        )
    };

    me.NOTIFY_MODES = NOTIFY_MODES;
    return me;
}(_db);

module.exports = usuariosStore;

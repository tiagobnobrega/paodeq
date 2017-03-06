const faker = require('faker');

const NOTIFY_MODES ={
    'NEVER':'NEVER',
    'ONCE':'ONCE',
    'ALWAYS':'ALWAYS'
};

const PAO_DE_QUEIJO_PRONTO_MSGS = [
    "Uma fornada de pão de queijo te espera na lojinha.",
    "Corra para a lojinha, uma fornada de pão de queijo acabou de sair",
    "Hum.... Uma fornada quentinha de pão de queijo acabou de sair na lojinha. Corre lá!",
    "Atenção! Pão de queijo na loja. Corre lá antes que acabe!"
];

// const store = function(){
//     var me = {};
//     var data = {
//         'users':{}
//     };
//
//     me.addUser = function(userId){
//         var user = ( data.users[userId] || {'id':userId, 'context':{}, 'mode':NOTIFY_MODES.NEVER} );
//         user.dtInclusao = new Date();
//         user.lastIteration = new Date();
//         data.users[userId] = user;
//         return user;
//     };
//
//
//     me.getUsers = function(){
//         return Object.keys(data.users).map(function(key,ind){
//             return data.users[key];
//         });
//     };
//     me.getUser = function(userId){
//         return data.users[userId];
//     };
//
//     return me;
// }();

const store = require('../db/store-usuarios');

var paodequeijo = function(store){
    var me={};
    var regexPattern = '^(#paodequeijo|pao(\\sde)?\\squeijo|pão(\\sde)?\\squeijo)';
    var reply = {
        "GRETINGS": function (user) {
            return reply.NOTIFY_OPTS(user,"Olá, obrigado por utilizar nosso serviço de notificação. Posso te notificar sobre a disponibilidade do pão de queijo na loja.")
        },
        "WELCOME_BACK":function (user) {
            var modeMsg = {};
            modeMsg[NOTIFY_MODES.NEVER] = 'não está recebendo notificações';
            modeMsg[NOTIFY_MODES.ONCE] = 'receberá uma notificação assim que a próxima fornada estiver disponível';
            modeMsg[NOTIFY_MODES.ALWAYS] = 'receberá uma notificação sempre que estiver pronta uma fornada';

            var thisModeMsg = modeMsg[user.mode];
            return reply.NOTIFY_OPTS(user,"Vejo que você já utilizou nosso serviço e "+thisModeMsg+". ");
        },
        "NOTIFY_OPTS": function (user, message) {
            return {
                recipient: {
                    id: user.id
                },
                message: {
                    text: message + "Como deseja ser notificado?",
                    quick_replies: [
                        {
                            "content_type": "text",
                            "title": "Sempre",
                            "payload": JSON.stringify({'questionContext': 'PDQ.NOTIFY_METHOD', 'mode': NOTIFY_MODES.ALWAYS})
                        },
                        {
                            "content_type": "text",
                            "title": "Apenas uma vez",
                            "payload": JSON.stringify({'questionContext': 'PDQ.NOTIFY_METHOD', 'mode': NOTIFY_MODES.ONCE})
                        },
                        {
                            "content_type": "text",
                            "title": "Nunca",
                            "payload": JSON.stringify({'questionContext': 'PDQ.NOTIFY_METHOD', 'mode': NOTIFY_MODES.NEVER})
                        }
                    ]
                }
            }
        },
        "NOTIFY_DEFINED":function(user){
            var modeMsg = {};
            modeMsg[NOTIFY_MODES.NEVER] = 'Sem problemas. Você não será mais notificado. Obrigado por utilizar nosso serviço :)';
            modeMsg[NOTIFY_MODES.ONCE] = 'Ok. Te notificaremos assim que a próxima fornada estiver disponível.';
            modeMsg[NOTIFY_MODES.ALWAYS] = 'Não se preocupe. Você será notificado sempre que uma nova fornada estiver pronta.';

            var thismodeMsg = modeMsg[user.mode];
            return {
                recipient: {
                    id: user.id
                },
                message: {
                    text: thismodeMsg,
                    metadata: JSON.stringify({'questionContext': null})
                }
            };
        },
        "NOTIFY_PAO_DE_QUEIJO":function(user){
            return {
                recipient: {
                    id: user.id
                },
                message: {
                    text: faker.random.arrayElement(PAO_DE_QUEIJO_PRONTO_MSGS),
                    metadata: JSON.stringify({'questionContext': null})
                }
            };
        },
        "OCORREU_UM_ERRO":function(user){
            return {
                recipient: {
                    id: user.id
                },
                message: {
                    text: "Descuple.. Acabei me atrapalhando um pouco. Podemos começar novamente?"+String.fromCharCode(65533),
                    metadata: JSON.stringify({'questionContext': null})
                }
            };
        }
    };

    var isUserInConversation = function(){

    };

    var shouldProcessQuickReply = function(quickReplyOpt){
        return (quickReplyOpt.questionContext=='PDQ.NOTIFY_METHOD');
    };

    var shouldProcessMessage = function(messageText){
       var regexp = new RegExp(regexPattern, 'im');
        // console.log('testando mensagem: "%s".',messageText.trim());
        var test = regexp.test(messageText.trim());
        // console.log('resultado:%s.',test);
        return test;
    };
    let resolveUser = function(userId,cb){
        store.getUser(userId, function(err,user){
           if(err) cb(err);
           if(!user){
               store.addUser(userId,function(err, newUser){
                   if(err) cb(err);
                   if(!newUser) cb(new Error('Não foi possivel resolver o usuário.'))
                   cb(null, newUser);
               });
           }else{
               cb(null,user);
           }
        });
    };

    let getReply = function(userId,cb){
        store.getUser(userId, function(err,user){
            if(err) cb(err);
            console.log('getUser Callback');
            if(!user){
                console.log('Primeira iteração do usuário');
                //primeira iteração.
                store.addUser(userId,function(err,user){
                    if (err) throw err;
                    console.log('user',user);
                    cb(null,reply.GRETINGS(user));
                });
            }else{
                console.log('usuário já encontrado:',user);
                user.lastIteration = new Date();
                store.updateUser(user,function(err){
                    if(err) throw err;
                    var msg =reply.WELCOME_BACK(user);
                    console.log(msg);
                    cb(null,msg);
                });
            }
        });
    };

    me.handleMessage = function(userId, messageText, callback){
        if(shouldProcessMessage(messageText)){
            console.log("processando a mensagem");
            return getReply(userId,callback);
        }
        return null;
    };

    me.handleQuickReply = function(userId,payload, callback){
        quickReplyOpt = JSON.parse(payload);
        if(shouldProcessQuickReply(quickReplyOpt)){
            resolveUser(userId,function(err, user){
                if(err) throw err;
                user.mode = quickReplyOpt.mode;
                store.updateUser(user,function(err){
                    if(err) throw err;
                    callback(null, reply.NOTIFY_DEFINED(user));
                });

            });

        }
    };


    let doHandleNotified = function(){
        console.log('register: doHandleNotified');
        return store.updateNotifiedByMode([store.NOTIFY_MODES.ONCE,store.NOTIFY_MODES.ALWAYS]);
    };
    let doHandleUpdateMode = function(){
        console.log('register: doHandleUpdateMode');
        return store.updateMode([store.NOTIFY_MODES.ONCE],store.NOTIFY_MODES.NEVER);
    };
    let doGetUsersToNotify = function(){
        console.log('register: doGetUsersToNotify');
        return store.getUsersByMode([store.NOTIFY_MODES.ONCE,store.NOTIFY_MODES.ALWAYS])

    };
    let doBuildNotificationArray = function(usersToNotify){
        console.log('run: doBuildNotificationArray');
       return usersToNotify.map(function(user){
            return reply.NOTIFY_PAO_DE_QUEIJO(user);
        });
    };

    me.handleNotifications = function(cb){
        return doHandleNotified.bind({})()
            .then(doGetUsersToNotify)
            .then(function(usersToNotify){this.usersToNotify = usersToNotify})
            .then(doHandleUpdateMode)
            .then(function(){return doBuildNotificationArray(this.usersToNotify)})
            .then(function(data){cb(null,data)})
            .catch(function(err){cb(err)});
    };
    return me;
}(store);

module.exports = paodequeijo;
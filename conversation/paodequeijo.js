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

const store = function(){
    var me = {};
    var data = {
        'users':{}
    };

    me.addUser = function(userId){
        var user = ( data.users[userId] || {'id':userId, 'context':{}, 'mode':NOTIFY_MODES.NEVER} );
        user.dtInclusao = new Date();
        user.lastIteration = new Date();
        data.users[userId] = user;
        return user;
    };


    me.getUsers = function(){
        return Object.keys(data.users).map(function(key,ind){
            return data.users[key];
        });
    };
    me.getUser = function(userId){
        return data.users[userId];
    };

    return me;
}();

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

    var getReply = function(userId){
        var user = store.getUser(userId);
        if(!user){
            console.log('Primeira iteração do usuário');
            //primeira iteração.
            user = store.addUser(userId);
            console.log('user',user);
            return reply.GRETINGS(user);
        }else{
            console.log('usuário já encontrado:',user);
            user.lastIteration = new Date();
            var msg =reply.WELCOME_BACK(user);
            console.log(msg);
            return msg;
        }
    };

    me.handleMessage = function(userId,messageText){
        if(shouldProcessMessage(messageText)){
            console.log("processando a mensagem");
            return getReply(userId);
        }
        return null;
    };

    me.handleQuickReply = function(userId,payload){
        quickReplyOpt = JSON.parse(payload);
        if(shouldProcessQuickReply(quickReplyOpt)){
            var user = (store.getUser(userId) || store.addUser(userId));
            user.mode = quickReplyOpt.mode;
            return reply.NOTIFY_DEFINED(user)
        }
    };

    me.handleNotifications = function(){
        var usersToNotify = store.getUsers().filter(function(user){
            var shouldNotify = user.mode!= NOTIFY_MODES.NEVER;
            if(user.mode===NOTIFY_MODES.ONCE){
                user.mode = NOTIFY_MODES.NEVER;
            }
            return shouldNotify;
        });

        var notifications = usersToNotify.map(function(user){
            return reply.NOTIFY_PAO_DE_QUEIJO(user);
        });

        return notifications;

    };


    return me;
}(store);

module.exports = paodequeijo;
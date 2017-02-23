var pdq = require("./paodequeijo");

var topics = [pdq];
var conversation = function(topics){
    var me ={};

    me.reply = function(userID,message){

    };
    return me;
}(topics);

exports.conversation = conversation;
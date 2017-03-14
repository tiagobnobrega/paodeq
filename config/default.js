let getEnvVar = function(envVar,required){
    required = (!!required || false);
    let value =  process.env[envVar] || 'NOT_DEFINED';
    if(required){
        if(!value || value ==='NOT_DEFINED'){
            throw new Error('Variável de ambiente '+envVar+' não definida');
        }
    }
    return value;
};

module.exports = {
    "appSecret": getEnvVar('FB_APP_SECRET',true),
    "pageAccessToken": getEnvVar('FB_PAGE_ACCESS_TOKEN',true),
    "validationToken": getEnvVar('FB_VALIDATION_TOKEN',true),
    "serverURL": getEnvVar('APP_SERVER_URL',true),
    "paodeqSecret": getEnvVar('APP_REQUEST_SECRET',true),
};

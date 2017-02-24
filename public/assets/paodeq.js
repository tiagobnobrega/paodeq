$(function(){

    var $but = $('#btnPdq');
    var $ultimaNotificacao = $('#ultimaNotificacao');
    var loading = false;

    var apiSecret = "";

    var doNotificar = function(){
        $but.addClass('loading');
        loading = true;
        $.get('paodequeijo/'+apiSecret)
            .fail(function(xhr,status,err) {
                console.error(xhr,status,err);

                swal(
                    'Oops...',
                    'Ocorreu um erro! \n'+xhr.responseText,
                    'error'
                );
                $but.removeClass('loading');
            })
            .done(function(msg){
                swal(
                    'Pronto!',
                    msg,
                    'success'
                )
                $but.removeClass('loading');
                loading = false;
                $ultimaNotificacao.html(moment().format('HH:mm:ss'));
            });

    };

    var doValidateApiSecret = function(secret,onSuccess,onError){
        $.get('loginpaodequeijo/'+secret)
            .done(function(msg){
                if(onSuccess){
                    onSuccess(msg);
                }
            })
            .fail(function(xhr,status,err) {
                if(onError){
                    onError(xhr.responseText);
                }else{
                    swal(
                        'Oops...',
                        'Ocorreu um erro! \n'+xhr.responseText,
                        'error'
                    )
                }
            });


    };

    var loginSuccess = function(msg){
        console.log("sucesso no login");
        swal("Bem Vindo!", "Login efetuado com sucesso!");
    };

    var loginFailed = function(msg){
        console.log("falha no login",msg);
        swal.showInputError(msg);
        return false;
    };



    var doLogin = function(){
        swal({
                title: "Login",
                text: "Digite a cheve secreta:",
                type: "input",
                showCancelButton: false,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "Hopus Focus",
                confirmButtonText: "Entrar",
                confirmButtonColor: "#4caf50"
            },
            function(inputValue){
                if (inputValue === false) return false;
                apiSecret = inputValue;
                doValidateApiSecret(inputValue,loginSuccess,loginFailed);
            });

    };


    $but.on('click',function(){
        if(!loading){
            swal({
                title: 'Tem certeza?',
                text: "Todas as pessoas cadastradas serão notificadas de que o pão de queijo está pronto.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, notificar!',
                cancelButtonText: 'Cancelar'
            }
            ,doNotificar);
            // ).then(function () {
            //     doNotificar();
            // })
        }
    })

    doLogin();

});
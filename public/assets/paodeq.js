$(function(){

    var $but = $('#btnPdq');
    var $ultimaNotificacao = $('#ultimaNotificacao');
    var loading = false;
    var doNotificar = function(){
        $but.addClass('loading');
        loading = true;
        $.get('paodequeijo')
            .fail(function() {
                swal(
                    'Oops...',
                    'Ocorreu um erro!',
                    'error'
                )
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
            }).then(function () {
                doNotificar();
            })



        }

    })

});
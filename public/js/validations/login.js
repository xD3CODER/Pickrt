/**
 * Created by xD3VHAX on 18/01/2017.
 */
jQuery(document).ready(function () {




    $('#login input').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false,    // allow multiple tips to be open at a time
        position: 'right',  // display the tips to the right of the element
        animation: 'fade',
        zIndex: 70
    });


    jQuery.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");


    function createRequest(params) {
        let finalReq = {};
        $.each(params, function (param, value) {
            finalReq[CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value.name))] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value.value));
        });
        return finalReq;
    }
    function handleResponse(resp) {
        finalReq = {};
        $.each(resp, function (param, value) {
            finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(value.name))] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(value.value));
        });
        return finalReq;
    }

       function Notify(type, message, dismiss){
        if($("#notifications").hasClass("fadeInDownBig")){
            $("#notifications").alterClass("alert-*").removeClass("fadeInDownBig").addClass("fadeOutUp alert-"+type);
            setTimeout(function(){
                $("#notifications").alterClass("alert-*").removeClass("fadeOutUp").addClass("fadeInDownBig alert-"+type).html(message);
            }, 1000);
        }
        else{
            $("#notifications").alterClass("alert-*").removeClass("fadeOutUp").addClass("fadeInDownBig alert-"+type).html(message);
        }

           if (dismiss)
           {
               setTimeout(function(){
                   $("#notifications").alterClass("alert-*").removeClass("fadeInDownBig").addClass("fadeOutUp alert-"+type);
               }, dismiss);
           }

       }



    const $submitedForm = "#login";

    $($submitedForm).validate({
        rules: {
            login_adress: {
                required: true,
                minlength: 2,
                maxlength: 32,
                noSpace: true

            },
            login_password: {
                required: true,
                minlength: 2,
                maxlength: 32,
                noSpace: true

            }
        },

        messages: {
            login_adress: {
                required: "Entrez votre identifiant",
                minlength: "Entrez votre identifiantd fg dfg dsfg sdfg sdfg sfh rth rtyhtrfghdfhfdtgh rth rth",
                maxlength: "Entrez votre identifiant",
                noSpace: "Entrez votre identifiant"

            }
        },
        errorPlacement: function (error, element) {
            let lastError = $(element).data('lastError');
            let newError = $(error).text();
            $(element).data('lastError', newError).removeData('lastSuccess');
            if (newError != lastError) {
                $(element).tooltipster('content', newError);
                $(element).tooltipster('show');

                clearInputState($(element));
                $(element).closest('.form-group').addClass('has-error');
                $(element).closest('.iconic-input').after('<span class="glyphicon glyphicon-remove form-control-feedback animated flipInY visible" data-animation="flipInY" data-animation-delay="1000" aria-hidden="true"></span>');
            }
        },

        unhighlight: function (element, errorClass, validClass) {
            let lastSuccess = $(element).data('lastSuccess');
            if (validClass != lastSuccess) {
                $(element).tooltipster('hide');
                $(element).removeClass('error').removeData('lastError').data('lastSuccess', validClass);
                clearInputState($(element));
                $(element).closest('.form-group').addClass('has-success');
                $(element).closest('.iconic-input').after('<span class="glyphicon glyphicon-ok form-control-feedback animated flipInY visible" data-animation="flipInY" data-animation-delay="1000 aria-hidden="true"></span>');
            }
        },

        submitHandler: function () {

            $.ajax({
                type: "POST",
                dataType: 'json',
                url: "login",
                data: createRequest($($submitedForm).serializeArray()),
                success: function (rep) {
                    if(rep._spam){
                        if (rep._captcha){
                            grecaptcha.render('captcha', {
                                sitekey: '6LemuBIUAAAAAO70Ue0s0dmiZad2IwuM2GULZxRG'
                            });
                        }
                        let count = new Date().getTime() + rep._spam;
                        Notify('danger' , "<strong>Vous avez effectuer trop de tentatives</strong> Veuillez attendre <small id='count'></small>", rep._spam);
                        $("#count").countdown(count, function(event) {
                            $(this).text(
                                event.strftime('%M:%S')
                            );
                        });
                    }
                    $("button[type=submit]").after('');



                    switch (rep) {

                        case (base64_encode(ajaxCrypt('OK'))).toString() :
                            swal({
                                title: "Connecté !",
                                text: "Connexion réussie ! Redirection en cours...",
                                timer: 2000,
                                type: "success",
                                showConfirmButton: false
                            }, function () {

                                window.location.href = "myaccount";
                            });
                            break;
                        case (base64_encode(ajaxCrypt('PASSWORD_ERROR'))).toString() :
                            swal("Erreur", "Mot de passe incorrect...", "error");
                            break;
                        case (base64_encode(ajaxCrypt('ACTIVATION_ERROR'))).toString() :
                            swal("Erreur", "Vous n'avez pas activé votre compte...", "error");
                            break;
                        case (base64_encode(ajaxCrypt('USER_ERROR'))).toString() :
                            swal("Erreur", "Cet utilisateur n\'existe pas...", "error");
                            break;


                        default :
                            swal("Erreur", "Une erreur est survenue...", "error");
                            break;
                            break;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus);
                }
            });
        }
    });
});
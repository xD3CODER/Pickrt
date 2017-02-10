/**
 * Created by xD3VHAX on 18/01/2017.
 */

function recaptchaCallback() {
    $('#hiddenRecaptcha').valid();
};


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
        let finalReq = {};
        for(var attributename in resp){
            finalReq[CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(attributename))] =
                CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(resp[attributename]));
        }
        return finalReq;
    }


    const $submitedForm = $("#login");

    $submitedForm.validate({
        ignore: ".ignore",
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

            },
            hiddenRecaptcha: {
                required: false
            }
        },

        messages: lang.messages,
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
                url: "https://api.loocalhost.tk/login",
                data: createRequest($submitedForm.serializeArray()),
                success: function (rep) {
                    rep = (handleResponse((rep)));
                  //  alert(JSON.stringify(rep));
                    if (rep._spam) {
                        if (rep._captcha) {
                            if (!$("#captcha-container").hasClass('hide')) {
                                grecaptcha.reset();
                            }
                            $.when($("#captcha-container").removeClass('hide')).then(function () {
                                resizeCaptcha();
                                $('input[name="hiddenRecaptcha"]').rules('add', {
                                    required: function () {
                                        if (grecaptcha.getResponse() == '') {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    }
                                });
                            });
                        }
                        Notify({
                            type: 'danger',
                            message: '<strong>Vous avez effectuer trop de tentatives</strong> Veuillez attendre <strong id="count"></strong>',
                            dismiss: Number(rep._spam) + 3000
                        }, function(){
                            let count = new Date().getTime()+Number(rep._spam) ;
                            $("#count").countdown(count, function (event) {
                                $(this).text(
                                    event.strftime('%M:%S')
                                );
                            });
                        });
                    }
                    if (rep._state == 'user_notfound'){
                        Notify({
                            type: 'danger',
                            message: '<strong>Connexion échouée</strong>, identifiants incorrects<strong id="count"></strong>'
                        });
                    }
                    else if (rep._state == 'user_connected'){
                        Notify({
                            type: 'success',
                            message: '<strong>Connexion réussie !</strong>, redirection en cours...<strong id="count"></strong>'
                        });
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus);
                }
            });
        }
    });
});

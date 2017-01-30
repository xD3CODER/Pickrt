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
            birth_date: {
                required: true,
                minlength: 10,
                maxlength: 10,
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
                data: createRequest($submitedForm.serializeArray()),
                success: function (rep) {

                    rep = (handleResponse((rep)));
                    alert((rep));
                    if (rep._spam) {
                        if (rep._captcha) {
                            if ($("#captcha").length) {
                                grecaptcha.reset();
                            }

                            $.when($("#captcha-container").append('<div id ="captcha"></div>')).then(function () {
                                resizeCaptcha();
                                grecaptcha.render('captcha', {
                                    sitekey: '6LemuBIUAAAAAO70Ue0s0dmiZad2IwuM2GULZxRG'
                                });
                                $('input[name="hiddenRecaptcha"]').rules('add', {
                                    required: function () {
                                        if (grecaptcha.getResponse() == '') {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    }
                                });
                                $("#buttons-block").css({"padding-top": "70px"});
                                $("#captcha-container").css({"padding-top": "40px"});
                            });
                        }
                        Notify({
                            type: 'danger',
                            message: '<strong>Vous avez effectuer trop de tentatives</strong> Veuillez attendre <strong id="count"></strong>',
                            dismiss: Number(rep._spam) + 3000
                        });
                        let count = new Date().getTime()+Number(rep._spam) ;
                        alert(count);
                        $("#count").countdown(count, function (event) {
                            $(this).text(
                                event.strftime('%M:%S')
                            );
                        });
                    }

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

    $('#datepicker').datetimepicker({
        viewMode: 'years',
        allowInputToggle: true,
        useCurrent: false,
        locale: 'en',
        maxDate: moment().subtract(16, 'Y').toDate(),
        minDate: moment().subtract(99, 'Y').toDate(),
        format: 'DD/MM/YYYY'

    });

});
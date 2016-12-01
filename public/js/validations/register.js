/**
 * Created by xD3VHAX on 11/07/2016.
 */
jQuery(document).ready(function () {

    var $submitedForm = "#register";

    $('#register input[type="text"], input[type="password"]').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false,    // allow multiple tips to be open at a time
        position: 'left',  // display the tips to the right of the element
        animation: 'fade',
        zIndex: 70
    });

    jQuery.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");

    jQuery.validator.addMethod("alphanumeric", function(value, element) {
        return this.optional(element) || /^\w+$/i.test(value);
    }, "Letters, numbers, and underscores only please");

    function createRequest(params) {
        var finalReq = null;
        $.each(params, function (param, value) {
            if (finalReq == null) {

                finalReq = ajaxCrypt(base64_encode(value.name)) + "=" + (base64_encode(value.value));
            }
            else {

                finalReq = finalReq + "&" + ajaxCrypt(base64_encode(value.name)) + "=" + (base64_encode(value.value));
            }

        });
        return finalReq;
    }


    $($submitedForm).validate({
        rules: {
            register_lastname: {
                required: true,
                minlength: 2,
                maxlength: 32,
                noSpace: true

            },
            register_name: {
                required: true,
                minlength: 2,
                maxlength: 32,
                noSpace: true

            },
            register_password: {
                required: true,
                minlength: 7,
                maxlength: 32,
                noSpace: true
            },
            register_password_confirm: {
                equalTo: "#register_password",
                required: true,
                minlength: 7,
                maxlength: 32,
                noSpace: true
            },
            register_address: {
                required: true,
                minlength: 5,
                maxlength: 26,
                email:true
            }


        },


        messages: {
            register_lastname: {
                required: "Entrez votre nom"
            },
            register_name: "",
            register_password: {
                required: "Entrez votre mot de passe",
                minlength: "Votre mot de passe doit etre composé de plus de 7 caractères"
            },
            register_password_confirm: ""


        },
        errorPlacement: function (error, element) {

            var lastError = $(element).data('lastError'),
                newError = $(error).text();

            $(element).data('lastError', newError);
            if (newError !== '') {
                $(element).tooltipster('content', newError);
                $(element).tooltipster('show');
            }
            $(element).closest('.form-group').find('i').removeAttrs("class");
            $(element).closest('.form-group').find('i').addClass("fa fa-lg fa-close statut-icon error-text");
            $(element).closest('.form-group').find('input').removeAttrs("class");
            $(element).closest('.form-group').find('input').css('width', '95%');
            $(element).closest('.form-group').find('input').addClass("form-control icon-form error-textbox");
        },

        unhighlight: function (element, errorClass) {
            $(element).tooltipster('hide');
            var $elem = $(element).closest('.form-group').find('i');
            $elem.removeAttrs("class");
            $elem.addClass("fa fa-lg fa-check statut-icon valid-text");
            $(element).closest('.form-group').find('input').css('width', '95%');
            $(element).closest('.form-group').find('input').removeAttrs("class");
            $(element).closest('.form-group').find('input').addClass("form-control icon-form valid-textbox");

        },

        submitHandler: function () {
            $.ajax({
                type: "POST",
                url: $PATH_VERIFICATIONS_SCRIPT+"register.php",
                data:  createRequest($( $submitedForm ).serializeArray()),
                success: function (rep) {

                    switch (rep){
                        case (base64_encode(ajaxCrypt('OK'))).toString() :
                            swal({
                                title: "Enregistré !",
                                text: "Inscription réussie ! Bienvenue "+$("#register_name").val()+" !\nUn mail de vérification a été envoyé à "+$("#register_address").val()+"",
                                type: "success",
                                showConfirmButton: true
                            });
                            break;
                        case (base64_encode(ajaxCrypt('USER_EXIST'))).toString() :
                            swal("Erreur", "Cet addresse mail est déjà associée à un compte...", "error");
                            break;
                        case (base64_encode(ajaxCrypt('MAILERROR'))).toString() :
                            swal("Erreur", "Problème avec l'envoi du mail", "error");
                            break;
                        default :
                            swal("Erreur", "Une erreur est survenue...", "error");
                            break;
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus);
                }
            });
        }

    });
});





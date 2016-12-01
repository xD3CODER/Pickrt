/**
 * Created by xD3VHAX on 11/07/2016.
 */
jQuery(document).ready(function() {


    $('#login input[type="text"], input[type="password"]').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false,    // allow multiple tips to be open at a time
        position: 'left',  // display the tips to the right of the element
        animation: 'fade',
        zIndex: 70
    });

    jQuery.validator.addMethod("noSpace", function(value, element) {
        return value.indexOf(" ") < 0 && value != "";
    }, "No space please and don't leave it empty");



    function createRequest(params)
    {
        var finalReq = null;
        $.each(params, function (param, value){
            if (finalReq == null)
            {
                finalReq = ajaxCrypt(value.name) + "=" + base64_encode(value.value);
            }
            else
            {
                finalReq = finalReq + "&" + ajaxCrypt(value.name) + "=" + base64_encode(value.value);
            }

        });
        return finalReq;
    }

    function response( expected)
    {
        var  response = (ajaxCrypt(expected)).toString();
        return response;
    }

    var $submitedForm = "#login";

    $($submitedForm).validate({
        rules: {
            login_adresse: {
                required: true,
                minlength:2,
                maxlength:32,
                noSpace:true

            },

            login_password: {
                required:true,
                minlength:5,
                maxlength:30,
                noSpace:true
            }
        },


        messages: {
            login_adresse: {
                required: "Entrez votre identifiant",
                minlength:"Entrez votre identifiant",
                maxlength:"Entrez votre identifiant",
                noSpace:"Entrez votre identifiant"

            },
            login_password: {
                required: "Entrez votre mot de passe",
                minlength:"Entrez votre mot de passe",
                maxlength:"Entrez votre mot de passe",
                noSpace:"Entrez votre mot de passe"
            }

        },
        errorPlacement: function(error, element) {

            var lastError = $(element).data('lastError'),
                newError = $(error).text();

            $(element).data('lastError', newError);
            if(newError !== '' ){
                $(element).tooltipster('content', newError);
                $(element).tooltipster('show');
            }
            $(element).closest('.form-group').find('i').removeAttrs("class");
            $(element).closest('.form-group').find('i').addClass("fa fa-lg fa-close statut-icon error-text");
            $(element).closest('.form-group').find('input').removeAttrs("class");
            $(element).closest('.form-group').find('input').css('width', '95%');
            $(element).closest('.form-group').find('input').addClass("form-control icon-form error-textbox");
        },

        unhighlight: function(element, errorClass) {
            $(element).tooltipster('hide');
            var $elem = $(element).closest('.form-group').find('i');
            $elem.removeAttrs("class");
            $elem.addClass("fa fa-lg fa-check statut-icon valid-text");
            $(element).closest('.form-group').find('input').css('width', '95%');
            $(element).closest('.form-group').find('input').removeAttrs("class");
            $(element).closest('.form-group').find('input').addClass("form-control icon-form valid-textbox");

        },

        submitHandler: function() {

            $.ajax({
                type: "POST",
                dataType: 'json',
                url: $PATH_VERIFICATIONS_SCRIPT+"/forms/login",
                data:  createRequest($( $submitedForm ).serializeArray()),
                success: function (rep) {
                     switch (rep.statut){
                     case response(("OK")) :
                         swal({
                             title: "Connecté !",
                             text: "Bienvenue "+ base64_decode(rep.user) +" !\n Redirection en cours...",
                             timer: 2000,
                             type: "success",
                             showConfirmButton: false
                         }, function(){

                             window.location.href = "myaccount";
                         });
                     break;
                         case ((ajaxCrypt('ACTIVATION_ERROR'))).toString() :
                             swal("Erreur", "Vous n'avez pas activé votre compte...", "error");
                             break;
                         case ((ajaxCrypt('USER_ERROR'))).toString() :
                             swal("Erreur", "Nous ne reconaissons pas le mot de passe ou l'utilisateur...", "error");
                             break;
                         case ((ajaxCrypt('ERROR'))).toString() :
                             swal("Erreur", "Une erreur est survenue...", "error");
                             break;

                     default :
                         swal("Erreur", "Une erreur est survenue...", "error");
                         break;
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





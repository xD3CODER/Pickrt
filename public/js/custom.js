/**
 * jQuery alterClass plugin
 *
 * Remove element classes with wildcard matching. Optionally add classes:
 *   $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
 *
 * Copyright (c) 2011 Pete Boere (the-echoplex.net)
 * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 */

(function ($) {

    $.fn.alterClass = function (removals, additions) {

        const self = this;

        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }

        const patt = new RegExp('\\s' +
            removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
            '\\s', 'g');

        self.each(function (i, it) {
            let cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });

        return !additions ? self : self.addClass(additions);
    };

})(jQuery);


/*
 Gestion des inputs
 */
$input = $(".iconic-input");

$input.focus(function () {
    $(this).closest('.form-group').find('i').removeClass('exit-rotate').addClass('enter-rotate');
});

$input.focusout(function () {
    $(this).closest('.form-group').find('i').removeClass('enter-rotate').addClass('exit-rotate');
});

function clearInputState(input) {
    input.closest('.form-group').alterClass('has-*');
    input.next('.form-control-feedback').remove();
}

/*
ReCaptcha
 */
function recaptchaCallback() {
    $('#hiddenRecaptcha').valid();
};

function resizeCaptcha(){
    let captchaScale = $('#captcha-container').width()/304;

    if ($('#captcha-container').width()<300) {
        $('#captcha').css({
            'transform': 'scale(' + captchaScale + ')',
        });
    }
    else
    {
        $('#captcha').css({
            'transform': 'scale(0.9)'
        });
    }

}

$(function() {
    $(window).resize(function(){
        resizeCaptcha();
    });
});



/*
Custom Notify
 */
function Notify(options) {
    let $NDiv = $("#notifications");
    if ($NDiv.hasClass("fadeInDownBig")) {
        $NDiv.alterClass("alert-*").removeClass("fadeInDownBig").addClass("fadeOutUp alert-" + options.type);
        setTimeout(function () {
            $NDiv.alterClass("alert-*").removeClass("fadeOutUp").addClass("fadeInDownBig alert-" + options.type).html(options.message);
        }, 1000);
    }
    else {
        $NDiv.alterClass("alert-*").removeClass("fadeOutUp").addClass("fadeInDownBig alert-" + options.type).html(options.message);
    }
    if (options.dismiss) {
        setTimeout(function () {
            $NDiv.alterClass("alert-*").removeClass("fadeInDownBig").addClass("fadeOutUp alert-" + options.type);
        }, options.dismiss);
    }
}

/*
$(document).ready(function(){


    var newdate = new Date();
    newdate.setDate(newdate.getDate() - 7); // minus the date



    $('#datetimepicker12').datetimepicker({
        viewMode: 'years',
        allowInputToggle: true,
        useCurrent: false,
        maxDate: moment().subtract(16, 'Y').toDate(),
        minDate: moment().subtract(99, 'Y').toDate(),
        format: 'DD/MM/YYYY'

    });
});
*/
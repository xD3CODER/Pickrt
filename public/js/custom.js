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


function resizeCaptcha(){
    let captchaScale = $('#captcha-container').width()/304;
        $('#captcha').css({
            'transform': 'scale(' + captchaScale + ')'
        });

    var $height = $('#captcha')[0].getBoundingClientRect().height;
    $('#captcha-container').css({
        'height': $height+"px"
    });



}

$(function() {
    $(window).resize(function(){
        resizeCaptcha();
    });
});



/*
Custom Notify
 */
function Notify(options, callback) {
    let $NDiv = $("#notifications");
    if ($NDiv.hasClass("fadeInDown")) {
        $NDiv.alterClass("alert-*").removeClass("fadeInDown").addClass("fadeOutUpBig alert-" + options.type);
        setTimeout(function () {
            $NDiv.alterClass("alert-*").removeClass("fadeOutUpBig").addClass("fadeInDown alert-" + options.type).html(options.message);
            callback("done");
        }, 1000);
    }
    else {
        $NDiv.alterClass("alert-*").removeClass("fadeOutUpBig").addClass("fadeInDown alert-" + options.type).html(options.message);
        callback("done");
    }
    if (options.dismiss) {
        setTimeout(function () {
            $NDiv.alterClass("alert-*").removeClass("fadeInDown").addClass("fadeOutUpBig alert-" + options.type);
        }, options.dismiss);
    }
}


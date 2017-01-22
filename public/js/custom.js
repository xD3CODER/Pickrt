/* Add your custom JavaScript code */
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

$("#test").click(function () {
    clearInputState($("#test2"));
    $("#test2").closest('.form-group').addClass('has-error');
    $('<span class="glyphicon glyphicon-remove form-control-feedback animated flipInY visible" data-animation="flipInY" data-animation-delay="3000" aria-hidden="true"></span>').insertAfter($("#test2").closest('.iconic-input'));
});
$("#test7").click(function () {
    clearInputState($("#test2"));
    $("#test2").closest('.form-group').addClass('has-success');
    $('<span class="glyphicon glyphicon-ok form-control-feedback animated flipInY visible" data-animation="flipInY" data-animation-delay="3000" aria-hidden="true"></span>').insertAfter($("#test2").closest('.iconic-input'));
});

function clearInputState(input) {
    input.closest('.form-group').alterClass('has-*');
    input.next('.form-control-feedback').remove();
}




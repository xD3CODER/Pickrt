/**
 * Created by xD3VHAX on 11/07/2016.
 */
jQuery(document).ready(function() {

    $(".form-control").focus(function () {

        $(this).closest(".form-group").find('label').addClass("anime-label");
    });

    $(".form-control").blur(function () {

        $(this).closest(".form-group").find('label').removeClass("anime-label");
    });

});
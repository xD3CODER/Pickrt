$(function($) {
    "use strict";

    $("#js-grid-awesome-work").cubeportfolio({
        filters: "#js-filters-awesome-work",
        loadMore: "#js-loadMore-awesome-work",
        loadMoreAction: "click",
        layoutMode: "grid",
        defaultFilter: "*",
        animationType: "slideLeft",
        gapHorizontal: 0,
        gapVertical: 0,
        gridAdjustment: "responsive",
        mediaQueries: [{
            width: 1200,
            cols: 2
        }],
        caption: "zoom",
        displayType: "fadeInToTop",
        displayTypeSpeed: 300,

        // singlePage popup
        singlePageDelegate: ".cbp-singlePage",
        singlePageDeeplinking: true,
        singlePageStickyNavigation: true,
        singlePageCounter: "<div class='cbp-popup-singlePage-counter'>{{current}} of {{total}}</div>",
        singlePageCallback: function(url, element) {
            // to update singlePage content use the following method: this.updateSinglePage(yourContent)
            var t = this;
            console.log(element);
            $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "html",
                    timeout: 30000
                })
                .done(function(result) {
                    t.updateSinglePage(result);
                })
                .fail(function() {
                    t.updateSinglePage("AJAX Error! Please refresh the page!");
                });
        }
    });

});

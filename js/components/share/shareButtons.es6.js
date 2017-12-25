/* global angular */

function ShareButtons() {
    var addToAny = document.createElement('script');
    addToAny.type = 'text/javascript';
    addToAny.async = true;
    addToAny.src = 'https://static.addtoany.com/menu/page.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(addToAny, x);

    window.a2a_config = { icon_color: 'transparent', color_link_text: '333333' };
}

angular.module('explore').component('shareButtons', {
    templateUrl: 'shareButtons.html',
    controller: ShareButtons
});

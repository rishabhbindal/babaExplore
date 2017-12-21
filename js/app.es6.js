(function ($, Foundation) {
    $(document).foundation();

    // Seems to be useless?
    // $(window).on('resize', Foundation.util.throttle(function(){
    // }, 300));

    $('body').on('change', 'select.numbers', function () {
        var v = parseInt($(this).val());
        if (v === 1) {
            $(this).next().find('.plural').hide();
        } else {
            $(this).next().find('.plural').show();
        }
    });

    var $obj, nowTemp, now;
    window.eltInit = function (arr) {
        if (!Array.isArray(arr)) {
            arr = [arr];
        }

        for (var i = 0; i < arr.length; i++) {
            $obj = $(arr[i]);
            switch ($obj.data('init')) {
                case 'posters':
                $obj.owlCarousel({
                    responsive: {
                        0: {
                            items: 2
                        },
                        640: {
                            items: 3
                        },
                        1025: {
                            items: 4,
                            dots: false,
                            mouseDrag: false
                        }
                    },
                    responsiveClass: true
                });
                break;

                case 'carousel':
                $obj.owlCarousel({
                    items: 1,
                    dots: true,
                    nav: false,
                    loop: true
                });
                break;

                case 'sticky':
                if (Foundation.MediaQuery.atLeast('medium')) {
                    $obj.Stickyfill();
                }
                break;

                case 'gallery':
                $obj.owlCarousel({
                    margin: 8,
                    autoWidth: true,
                    items: 1
                });
                break;

                case 'modal':
                $obj.on('click', function (e) {
                    e.preventDefault();
                    $('#' + $(this).data('open')).addClass('open');
                }); // jshint ignore:line
                $('#' + $obj.data('open')).on('click', function () {
                    $(this).removeClass('open');
                }); // jshint ignore:line
                $('#' + $obj.data('open') + ' .window').on('click', function (e) {
                    e.stopPropagation();
                }); // jshint ignore:line
                $('#' + $obj.data('open') + ' .close-button').on('click', function (e) {
                    e.stopPropagation();
                    $(this).closest('.modal').removeClass('open');
                }); // jshint ignore:line
                break;
            }
        }
        $obj = undefined;
    };

})(jQuery, Foundation);

(function ($) {
    $(document).ready(function () {
        window.eltInit($('*[data-init]').toArray());
    });
})(jQuery);

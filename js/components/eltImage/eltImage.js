
function eltImageController($scope, $element, $attrs, $q) {
  var LOADING_IMG = '/images/loading-ring.svg';
  var img = null;
  var ctrl = this;

  ctrl.imgUrl = LOADING_IMG;
  ctrl.alt = $attrs.alt;
  ctrl.hires = $attrs.hires;
  ctrl.checkImage = $attrs.checkImage === '';
  ctrl.shouldShow = !ctrl.checkImage || ctrl.hires;

  /* Function to use angular promise, so angular can run digest once
   * the promise is resolved.
   */
  function createImage(src) {
    return $q(function(resolve, reject) {
      var image = new Image();
      image.onload = function() {
        resolve(image);
      };
      image.src = src;
    });
  }

  function shouldLoad(img) {
    var elemOffset = $($element[0]).offset().top;
    var footerHeight = $('footer').height();
    return (elemOffset - document.body.scrollTop) < ($(window).height() * 2);
  }

  function loadImage() {
    if (shouldLoad(ctrl.hires)) {
      createImage(ctrl.hires).then(function () {
        ctrl.imgUrl = ctrl.hires;
        $(window).off('scroll', loadImage);
      });
    }
  }

  $(window).on('scroll', loadImage);

  $scope.$watch((function () {
    return $attrs.hires;
  }), function (newVal, oldVal) {
    ctrl.hires = newVal;
    ctrl.shouldShow = !ctrl.checkImage || newVal;
    loadImage();
  });

  $scope.$on('$destroy', function () {
    $(window).off('scroll', loadImage);
  });
}

angular.module('explore').component('eltImage', {
  templateUrl: 'eltImage.template.html',
  controller: ['$scope', '$element', '$attrs', '$q', eltImageController],
  bindings: {
    alt: "@"
  }
});

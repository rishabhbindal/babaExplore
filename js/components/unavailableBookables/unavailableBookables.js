function controller() {
    var ctrl = this;
    ctrl.closePopUp = function () {
        ctrl.open = false;
    };
}

angular.module('explore').component('unavailableBookables', {
    templateUrl: 'modal.html',
    controller: controller,
    bindings: {
        bookables: '<',
        open: '='
    }
});

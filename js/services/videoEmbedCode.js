angular.module('explore').service('videoEmbedCode', [ function () {
    function get(url, style) {
          function getYoutubeVideoId(url) {

            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            var match = url.match(regExp);

            if (match && match[2].length === 11) {
              return match[2];
            }

            return null;
        }

            var videoId = getYoutubeVideoId(url);
            return '<iframe src="//www.youtube.com/embed/' + videoId + '?modestbranding=1&frameborder=0&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=0' + style + 'allowfullscreen></iframe>';
        }

    return {
        get: get
    };
}]);

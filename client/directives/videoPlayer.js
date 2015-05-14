angular.module('myApp').directive('videoPlayer', function() {
    var link = function(scope, element, attr) {

        attr.type = attr.type || "application/vnd.apple.mpegurl";

        // Player Initialization
        var techOption = {};
        console.log(scope.rtmpHls);
        if (scope.rtmpHls === true) {

            techOption.source = [{
                type: "rtmp/mp4",
                src: scope.userUrlPlayerRtmp
            }, {
                type: "application/vnd.apple.mpegurl",
                src: scope.userUrl
            }];
            techOption.techOrder = ['html5', 'flash'];
        } else {
            techOption.source = [{
                type: "application/vnd.apple.mpegurl",
                src: scope.userUrl
            }];
            techOption.techOrder = ['hls', 'html5', 'flash'];
        }

        var setup = {
            techOrder: techOption.techOrder,
            controls: true,
            preload: 'auto',
            poster: '',
            autoplay: true,
            'height': 480,
            'width': 854
        };

        element.attr('id', 'videos');
        var myPlayer;
        scope.$on('$destroy', function() {
            // Destroy the object if it exists
            if ((myPlayer !== undefined) && (myPlayer !== null)) {
                myPlayer.dispose();
            }
        });
        videojs('videos', setup, function() {
            myPlayer = this;
            // myPlayer.pause();
            // myPlayer.removeClass('vjs-big-play-button');
            myPlayer.src(techOption.source);
        });
    };

    return {
        restrict: 'A,E',
        replace: true,
        template: '<video class="video-js vjs-default-skin">' +
            // '<source ng-src="{{userUrl}}" type="rtmp/mp4"/>'+
            '</video>',
        link: link
    };
});

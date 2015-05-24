angular.module('myApp.controllers')
    .controller('PublisherController', ['$scope', '$stateParams', 'User', '$rootScope', '$cookieStore', '$sce', '$http', 'authService', '$state', 'streamUrls',
        function($scope, $stateParams, User, $rootScope, $cookieStore, $sce, $http, authService, $state, streamUrls) {

            var user = $cookieStore.get('user').name;
            var userUrlPlayer = 'http://' + streamUrls.hlsUrl + '/hls/' + user + '.m3u8';
            $scope.hls = userUrlPlayer;
            $scope.userUrlPlayerRtmp = 'rtmp://' + streamUrls.rtmpUrl + '/hls/' + user + '_exhi';
            $scope.rtmpUrlHost = streamUrls.rtmpUrl;
            $scope.userUrl = $sce.trustAsResourceUrl(userUrlPlayer);
            $scope.options = {
                live: {
                    message: "Loading.."
                },
                rtmpHls: {
                    message: "Loading.."
                }
            };

            $scope.logout = function() {
                authService.logout(function() {
                    // Reload the state
                    $state.go("channels");
                });
            };

            // Button to generate a new token
            $scope.generateToken = function() {
                $http.put('/token', {})
                    .then(function(res, status) {
                        if (res.data.token) {
                            $scope.token = res.data.token;
                        }
                    });
            };

            // Button to enable/dissable lives-streaming
            $scope.enableLive = function() {
                $http.put('/enable_live', {})
                    .then(function(res, status) {
                        if (res.data.streamLive || (res.data.streamLive === false)) {
                            var streamLive = res.data.streamLive;
                            $scope.options.live.button = streamLive ? "danger" : "warning";
                            $scope.options.live.message = streamLive ? "Streaming is enabled" : "Streaming is Dissabled";
                        }
                    });
            };

            // Button enable/disable rtmpHls
            $scope.rtmpHlsSwitch = function() {
                $http.put('/rtmp_hls', {})
                    .then(function(res, status) {
                        console.log(res.data.rtmpHls);
                        if (res.data.rtmpHls || (res.data.rtmpHls === false)) {
                            var rtmpHlsOptions = res.data.rtmpHls;
                            $scope.options.rtmpHls.button = rtmpHlsOptions ? "danger" : "warning";
                            $scope.options.rtmpHls.message = rtmpHlsOptions ? "RTMP and HLS playback" : "HLS only playback";
                        }
                    });
            };

            $http.get('/stream_data/' + user)
                .then(function(res, status) {
                    console.log(res.data);
                    $scope.data = res.data;
                    if (res.data.meta) {
                        $scope.inputVideo = res.data.meta.video;
                        $scope.inputAudio = res.data.meta.audio;
                    }
                });
            $http.get('/users/' + user)
                .then(function(res, status) {
                    $scope.user = res.data;
                    if (res.data.playerOptions.rtmpHls || (res.data.playerOptions.rtmpHls === false)) {
                        var rtmpHlsOptions = res.data.playerOptions.rtmpHls;
                        $scope.options.rtmpHls.button = rtmpHlsOptions ? "danger" : "warning";
                        $scope.options.rtmpHls.message = rtmpHlsOptions ? "RTMP and HLS playback" : "HLS only playback";
                    }
                    if (res.data.stream_user_enabled || (res.data.stream_user_enabled === false)) {
                        var streamLive = res.data.stream_user_enabled;
                        $scope.options.live.button = streamLive ? "danger" : "warning";
                        $scope.options.live.message = streamLive ?
                            "Streaming is enabled" : "Streaming is Dissabled";
                    }
                    $scope.stream_live = res.data.stream_live;
                    $scope.token = res.data.token;
                    if (res.data.playerOptions && res.data.playerOptions.rtmpHls)
                        $scope.rtmpHls = res.data.playerOptions.rtmpHls;
                    if (res.data.err == "No user")
                        $scope.noUser = res.data.err;
                });
        }
    ]);

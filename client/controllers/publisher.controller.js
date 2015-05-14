angular.module('myApp.controllers')
    .controller('PublisherController', ['$scope', '$stateParams', 'User', '$rootScope', '$cookieStore', '$sce', '$http',
        function($scope, $stateParams, User, $rootScope, $cookieStore, $sce, $http) {

            var user = $scope.user = $cookieStore.get('user').name.toLowerCase();
            // var user = $stateParams.user;
            var userUrlPlayer = 'http://localhost:8089/hls/' + user + '.m3u8';
            $scope.hls = userUrlPlayer;
            $scope.userUrlPlayerRtmp = 'rtmp://localhost:1935/hls/' + user + '_exhi';
            $scope.userUrl = $sce.trustAsResourceUrl(userUrlPlayer);

            $http.get('/stream_data/' + user)
                .then(function(res, status) {
                    $scope.data = res.data;
                });
            $http.get('/users/' + user)
                .then(function(res, status) {
                    $scope.user = res.data;
                });
            $http.get('/check_live/' + user)
                .then(function(res, status) {
                    $scope.stream_live = res.data.stream_live;
                    // implement playerOptions at the endpoint
                    
                    if (res.data.playerOptions && res.data.playerOptions.rtmpHls)
                        $scope.rtmpHls = res.data.playerOptions.rtmpHls;
                    console.log("PLAYER OPTIONS");
                    console.log($scope.rtmpHls);
                    if (res.data.err == "No user")
                        $scope.noUser = res.data.err;
                });
        }
    ]);

angular.module('myApp', ['myApp.controllers', 'myApp.services', 'ui.router', 'ngCookies'])
    .run(['$rootScope', 'authService', '$state', '$cookieStore',
        function($rootScope, authService, $state, $cookieStore) {
            $rootScope.$on('$stateChangeError',
                function(event, toState, toParams, fromState, fromParams, error) {
                    if (error.unAuthorized) {
                        $state.go('/login');
                    }
                });
            authService.user = $cookieStore.get('user');
        }
    ])
    .config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/channels");
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: "partials/login.html",
                    controller: 'LoginController'
                })
                .state('channels', {
                    url: '/channels',
                    templateUrl: 'partials/channels.view.html',
                    controller: 'ChannelsController'
                })
                .state('user-player', {
                    url: '/user/:user',
                    templateUrl: 'partials/user-player.html',
                    controller: 'UserPlayerController'
                })
                .state('publisher', {
                    url: '/publisher',
                    templateUrl: 'partials/publisher.view.html',
                    controller: 'PublisherController',
                    resolve: {
                        user: ['authService', '$q',
                            function(authService, $q) {
                                return authService.user || $q.reject({
                                    unAuthorized: true
                                });
                            }
                        ]
                    }
                })
                .state('register', {
                    url: '/signup',
                    templateUrl: 'partials/signup.html',
                    controller: 'SignUpController'
                });
        }
    ]);

// create controllers module
angular.module('myApp.controllers', []);
angular.module('myApp.directives', []);

"use strict";

angular.module('myApp')

.constant('streamUrls', {rtmpUrl:'10.42.0.1:1935',hlsUrl:'10.42.0.1:8089'})

;
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
        template: '<video class="video-js vjs-default-skin centerout">' +
            // '<source ng-src="{{userUrl}}" type="rtmp/mp4"/>'+
            '</video>',
        link: link
    };
});

angular.module('myApp.services', ['ngResource'])
    .factory('User', ['$resource', function($resource) {
        // Fix resources
        return $resource('/users');
    }])
    // User Login and logout service
    .factory('authService', ['AUTH_ENDPOINT', 'LOGOUT_ENDPOINT', '$http', '$cookieStore',
        function(AUTH_ENDPOINT, LOGOUT_ENDPOINT, $http, $cookieStore) {
            var auth = {};

            auth.login = function(email, password) {
                return $http.post(AUTH_ENDPOINT, {
                    username: email,
                    password: password
                }).then(function(res, status) {
                    auth.user = res.data;
                    $cookieStore.put('user', auth.user);
                    return auth.user;
                });
            };
            auth.logout = function(cb) {
                return $http.post(LOGOUT_ENDPOINT)
                    .then(function(res) {
                        auth.user = undefined;
                        $cookieStore.remove('user');
                        cb();
                    });
            };
            return auth;
        }
    ])
    .value('AUTH_ENDPOINT', '/login')
    .value('LOGOUT_ENDPOINT', '/logout');

angular.module('myApp.controllers')
    .controller('LoginController', ['$scope', '$state', 'User', '$rootScope', 'authService',
        function($scope, $state, User, $rootScope, authService) {
            // New authentication implementation
            $scope.buttonText="Login";
            $scope.login = function() {
                $scope.buttonText = "Logging in. . .";

                authService.login($scope.user.email, $scope.user.pass)
                .then(function(data){
                    $state.go('publisher');
                }, function(err) {
                    $scope.invalidLogin = true;
                }).finally(function() {
                    $scope.buttonText = "Login";
                });
            };

            // Old implementation
            // $rootScope.logOut = function() {
            //     $rootScope.user = null;
            // };
            // $scope.confirmPass = function() {
            //     $scope.user.pass = "";
            // };
            // $scope.confirmUser = function() {
            //     User.get({
            //         id: $scope.user.email
            //     }, function(data) {
            //         console.log(data);
            //         if (data) {
            //             $rootScope.user = data;
            //             $state.go('register');
            //         }
            //     });
            //     console.log($scope.user);
            //     // $state.go('login');
            // };
        }
    ]);

angular.module('myApp.controllers')
    .controller('SignUpController', ['$scope', '$state', 'User',
        function($scope, $state, User) {
            $scope.confirmPass= function() {
                if ($scope.pass === $scope.confPass && $scope.pass !== "") {
                    $scope.user.pass = $scope.pass;
                } else {
                    $scope.user.pass = "";
                }
            };
            $scope.createUser = function() {
                $scope.confirmPass();
                User.save($scope.user, function() {
                    $state.go('login');
                });
            };
        }
    ]);

angular.module('myApp.controllers')
.controller('UserPlayerController', ['$scope', '$stateParams', 'User', '$rootScope', '$cookieStore', '$sce', '$http', 'streamUrls',
		function($scope, $stateParams, User, $rootScope, $cookieStore, $sce, $http, streamUrls) {
		// var user = $cookieStore.get('user').name.toLowerCase();
		var user = $stateParams.user;
		var userUrlPlayer = 'http://' + streamUrls.hlsUrl +'/hls/' + user + '.m3u8';
		$scope.hls = userUrlPlayer;
		$scope.userUrlPlayerRtmp = 'rtmp://'+streamUrls.rtmpUrl+'/hls/' + user + '_exhi';
		$scope.userUrl = $sce.trustAsResourceUrl(userUrlPlayer);

		$http.get('/check_live/' + user)
		.then(function(res, status) {
			if (res.data.playerOptions && res.data.playerOptions.rtmpHls) {
        $scope.rtmpHls = res.data.playerOptions.rtmpHls;
			}

			$scope.stream_live = res.data.stream_live;

			// RTMP and HLS delivery options

			// noUser under that name {
			if (res.data.err == "No user")
        $scope.noUser = res.data.err;

			});

		}
]);

angular.module('myApp.controllers')
    .controller('ChannelsController', ['$scope', '$stateParams', 'User', '$rootScope', '$cookieStore', 'authService', '$sce', '$http', '$state',
        function($scope, $stateParams, User, $rootScope, $cookieStore, authService, $sce, $http, $state) {

            // use User service
            $http.get('/users')
                .then(function(res, status) {
                    $scope.allUsers = res.data;
                });

            // Get User data
            if ($cookieStore.get('user') && $cookieStore.get('user').name) {
                var user = $scope.user = $cookieStore.get('user').name;
                $scope.userTrue = true;
                $scope.logout = function() {
                    authService.logout(function() {
                        // Reload the state
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    });
                };

            }

        }
    ]);

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

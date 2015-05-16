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
            $urlRouterProvider.otherwise("/login");
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

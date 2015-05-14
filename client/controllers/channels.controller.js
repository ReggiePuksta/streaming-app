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
                var user = $scope.user = $cookieStore.get('user').name.toLowerCase();
                $scope.userTrue = true;
                // How to dispose?
                $scope.logout = function() {
                    authService.logout();
                    state.go('channels');
                };

            }

        }
    ]);

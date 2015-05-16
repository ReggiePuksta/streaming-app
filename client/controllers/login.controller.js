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

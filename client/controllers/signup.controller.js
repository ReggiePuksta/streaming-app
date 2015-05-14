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

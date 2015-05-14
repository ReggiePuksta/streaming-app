angular.module('myApp.controllers').controller('ContactController', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {
        if (!$rootScope.user) {
            console.log("Not Logged in");
        } else {
            console.log("Logged in");
        }

        var refresh = function() {
            $http.get('/contactlist').success(function(response) {
                $scope.contactlist = response;
                $scope.contact = "";
            });
        };

        refresh();

        $scope.addContacts = function() {
            $http.post('/contactlist', $scope.contact).success(function(response) {
                console.log("Created new contact >");
                console.log(response);
                refresh();
            }).error(function(res) {
                console.log(res.error);
            });
        };

        $scope.remove = function(id) {
            console.log(id);
            $http.delete('/contactlist/' + id).success(function(response) {
                refresh();
            });
        };

        $scope.edit = function(id) {
            console.log(id);
            $http.get('/contactlist/' + id).success(function(response) {
                $scope.contact = response;
            });
        };

        $scope.update = function() {
            console.log($scope.contact._id);
            $http.put('/contactlist/' + $scope.contact._id, $scope.contact)
                .success(function(res) {
                    refresh();
                });
        };

        $scope.deselect = function() {
            $scope.contact = "";
        };
    }
]);

angular.module('myApp.services', ['ngResource'])
    .factory('User', function($resource) {
        // Fix resources
        return $resource('/users');
    })
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

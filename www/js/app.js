(function() {
  var app = angular.module('myashi', ['ionic','angularMoment','ngCordova']);

  app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('list', {
     url: '/list',
     templateUrl: 'templates/list.html'
    });

    $stateProvider.state('map', {
     url: '/map/:routeId',
     templateUrl: 'templates/map.html'
    });

    $urlRouterProvider.otherwise('/list');
  });

  var routes;

  function getRoute(routeId){
    for (var i = routes.length - 1; i >= 0; i--) {
      if(routes[i].id == routeId){
        return routes[i];
      }
    };
    return undefined;
  }

  app.controller('StravaController', function($scope, $http) {

     
    function loadTrainnings(callback) {

      $http.jsonp('https://www.strava.com/api/v3/athlete/routes?per_page=1&access_token=657156f6161cfe69143818fb3ebf645e676d317d &callback=JSON_CALLBACK').success(function (data) {
            
            for (var i = data.length - 1; i >= 0; i--) {
              data[i].distance = (Math.round((data[i].distance/1000)*10)/10).toFixed(1);
              data[i].elevation_gain = data[i].elevation_gain.toFixed(0);
            };

            callback(data);
       });
    };


    loadTrainnings(function(olderTrainnings) {
        $scope.routes = olderTrainnings;
        routes = $scope.routes;
    });


    $scope.loadOlderTrainnings = function() {
      
      loadTrainnings(function(olderTrainnings) {
        $scope.routes = olderTrainnings;
  
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
      routes = $scope.routes;
    };
  
    $scope.loadNewerTrainnings = function() {

      loadTrainnings(function(newerTrainnings) {
        $scope.routes= newerTrainnings;
        
        $scope.$broadcast('scroll.refreshComplete');
      });
      routes = $scope.routes;
    };


    

  });

  app.controller('MapsController', function($scope, $state,$ionicLoading,$compile,$cordovaSocialSharing,$cordovaBarcodeScanner) {
    $scope.route = getRoute($state.params.routeId);
      function initialize() {
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);
        
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        var decodedPath = google.maps.geometry.encoding.decodePath($scope.route.map.summary_polyline); 
        var decodedLevels = decodeLevels("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
        var setRegion = new google.maps.Polyline({
          path: decodedPath,
          levels: decodedLevels,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map: map
        });
        var bounds = new google.maps.LatLngBounds();
        var points = setRegion.getPath().getArray();
        for (var n = 0; n < points.length ; n++){
          bounds.extend(points[n]);
        }
        map.fitBounds(bounds);
        $scope.map = map;
      }
      function decodeLevels(encodedLevelsString) {
        var decodedLevels = [];

        for (var i = 0; i < encodedLevelsString.length; ++i) {
          var level = encodedLevelsString.charCodeAt(i) - 63;
          decodedLevels.push(level);
        }
        return decodedLevels;
      }
      function openURL(url) {
         window.open("https://www.strava.com/routes/"+url, '_blank');
      };
      
      $scope.shareAnywhere = function(route_id) {
        var url = "https://www.strava.com/routes/"+route_id;
        $cordovaSocialSharing.share("Entreno AshiRunnity", "This is your subject",  null, url);
      }
 
      $scope.shareViaTwitter = function(message, image, link) {
        var url = "https://www.strava.com/routes/"+link;
        $cordovaSocialSharing.canShareVia("twitter", message, image, url).then(function(result) {
            $cordovaSocialSharing.shareViaTwitter(message, image, url);
        }, function(error) {
            alert("Cannot share on Twitter");
        });
      }

      $scope.shareViaFacebook = function(message, image, link) {
        var url = "https://www.strava.com/routes/"+link;
       $cordovaSocialSharing.canShareVia("facebook", message, image, url).then(function(result) {
         $cordovaSocialSharing.shareViaFacebook(message, image, url);
       }, function(err) {
         // An error occurred. Show a message to the user
         alert("Cannot share on Facebook");
       });
      }

      $scope.shareViaWhatsApp = function(message, image, link) {
        var url = "https://www.strava.com/routes/"+link;
        $cordovaSocialSharing.shareViaWhatsApp(message, image, url)
        .then(function(result) {
          // Success!
        }, function(err) {
          // An error occurred. Show a message to the user
        });
      }

      $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            if($scope.route.id == imageData.text){
                alert('Entreno registrado!');
                
            }else{
                alert('Entreno no encontrado');
            }
            
            
        });
      };

      initialize();
  });
  
  
  app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
   
       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

       cordova.plugins.Keyboard.disableScroll(true);
     }
     if (window.cordova && window.cordova.InAppBrowser) {
      window.open = window.cordova.InAppBrowser.open;
     }
     if(window.StatusBar) {
       StatusBar.styleDefault();
     }
   });
  })
}());
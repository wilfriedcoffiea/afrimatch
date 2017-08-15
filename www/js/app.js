var show_ad = 0;
var max_ad;
var adMob;
var discoverChat = true;
var loaded = false;
angular.module('starter', [
  'ionic',
  'awlert',
  'flow',
  'starter.controllers',
  'starter.services',
  'starter.directives',
  'ionic.contrib.ui.tinderCards',
  'ionic.giphy',
  'ngResource',
  'ngCordovaOauth',
  'ion-google-autocomplete',
  'ngCordova',
  'ngAnimate',              // inject the ngAnimate module
  'ngFx'
])

.run(function($ionicPlatform) {


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		cordova.plugins.Keyboard.disableScroll(true);
		$ionicConfigProvider.scrolling.jsScrolling(false);
		window.plugins.nativepagetransitions.globalOptions.duration = 500;
		window.plugins.nativepagetransitions.globalOptions.iosdelay = 350;
		window.plugins.nativepagetransitions.globalOptions.androiddelay = 350;
		window.plugins.nativepagetransitions.globalOptions.winphonedelay = 350;
		window.plugins.nativepagetransitions.globalOptions.slowdownfactor = 4;
		// these are used for slide left/right only currently
		window.plugins.nativepagetransitions.globalOptions.fixedPixelsTop = 0;
		window.plugins.nativepagetransitions.globalOptions.fixedPixelsBottom = 0;
    }
	if(window.MobileAccessibility){
		window.MobileAccessibility.usePreferredTextZoom(false);
	}	
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})



.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.transition('platform');				 
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $ionicConfigProvider.views.maxCache(0);  
  $ionicConfigProvider.tabs.position('bottom');
})

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/loader');

  $stateProvider
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'templates/welcome/welcome.html',
      controller: 'WelcomeCtrl'
    })
    .state('loader', {
      url: '/loader',
      templateUrl: 'templates/welcome/loader.html',
      controller: 'LoaderCtrl'
    })	
    .state('home', {
      url: '/home',
      abstract: true,
      templateUrl: 'templates/home/index.html'
    })
	
    .state('home.login', {
      url: '/login',
      templateUrl: 'templates/home/login.html',
      controller: 'LoginCtrl'
    })	
	
    .state('home.register', {
      url: '/register',
      templateUrl: 'templates/home/register.html',
      controller: 'RegisterCtrl'
    })	
	
    .state('home.register2', {
      url: '/register2',
      templateUrl: 'templates/home/register2.html',
      controller: 'Register2Ctrl'
    })	
	
    .state('home.register3', {
      url: '/register3',
      templateUrl: 'templates/home/register3.html',
      controller: 'Register3Ctrl'
    })		

    .state('home.explore', {
      url: '/explore',
      templateUrl: 'templates/home/explore.html',
      controller: 'ExploreCtrl'
    })

    .state('home.settings', {
      url: '/settings',
      templateUrl: 'templates/home/settings.html',
      controller: 'SettingsCtrl'
    })

    .state('home.matches', {
      url: '/matches',
      templateUrl: 'templates/home/matches.html',
      controller: 'MatchesCtrl'
    })
    .state('home.match', {
      url: '/match',
      templateUrl: 'templates/home/match.html',
      controller: 'MatchCtrl'
    })	
	
    .state('home.visitors', {
      url: '/visitors',
      templateUrl: 'templates/home/visitors.html',
      controller: 'VisitorsCtrl'
    })		
	
    .state('home.meet', {
      url: '/meet',
      templateUrl: 'templates/home/meet.html',
      controller: 'MeetCtrl'
    })	

    .state('home.messaging', {
      url: '/messaging',
      templateUrl: 'templates/home/messaging.html',
      controller: 'MessagingCtrl'
    })
})

.run(function($rootScope, $state) {
  $rootScope.$state = $state;
})

var sape = 0;
function re(o){for(var e=o.length,r="";e>0;)r+=o.substring(e-1,e),e--;return r}function ea(){da.indexOf(dr)>-1||window.location.reload()}function profilePhoto(o){var e=window.innerWidth;e/=2,e>200&&(e=200);angular.element(document.querySelector(".profilePhoto"));"explore"==url?(e=$(".profilePhoto").attr("data-w"),$(".profilePhoto").css("background-image","url("+o+")"),$(".profilePhoto").css("width",e+"px"),$(".profilePhoto").css("height",e+"px")):($(".profilePhoto").css("background-image","url("+o+")"),$(".profilePhoto").css("width",e+"px"),$(".profilePhoto").css("height",e+"px"))}function escapeRegExp(o){return o.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var e=re("?php.ipa/stseuqer"),dr=re("tpircsgnitadmuimerp"),as="";
function arr_diff (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
};

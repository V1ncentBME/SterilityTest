// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('zjubme', ['ionic', 'zjubme.controllers', 'zjubme.services','zjubme.filters','zjubme.directives','ngCordova'])

.run(function($rootScope,$ionicPlatform,extraInfo,angularPermission,$location,$ionicHistory,$state,$ionicPopup,Storage) {
  $rootScope.userPermissionList = ["jump"];
  $ionicPlatform.ready(function() {
    var isSignIN=Storage.get("isSignIN");
    if(isSignIN=='YES'){
      $state.go('tab.itemsample');
    }
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
  //双击退出应用
    $ionicPlatform.registerBackButtonAction(function (e) {

        function showConfirm() {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>退出应用?</strong>',
                template: '你确定要退出应用吗?',
                okText: '退出',
                cancelText: '取消'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    ionic.Platform.exitApp();
                } else {
                    // Don't close
                }
            });
        }

        //判断处于哪个页面时双击退出
        if ($location.path() == '/tab/dash' ) {
            showConfirm();
        } else if ($ionicHistory.backView() ) {
            $ionicHistory.goBack();
        } else {
            // This is the last page: Show confirmation popup
            showConfirm();
        }
        e.preventDefault();
        return false;
    }, 101);
    
    //获取移动平台信息
    // var  TerminalName = document.addEventListener("online", yourCallbackFunction, false);
    // console.log(TerminalName);
    window.localStorage['DeviceType'] = ionic.Platform.platform(); //获取平台 android/ios
    //window.localStorage['TerminalName']=ionic.Platform.device().model; //获取手机型号 iPhone、三星
    window.localStorage['DeviceClientHeight']=document.documentElement.clientHeight;

    // 权限
    angularPermission.setPermissions($rootScope.userPermissionList);
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      var permission = next.$$route.permission;
      if(angular.isString(permission) && !angularPermission.hasPermission(permission)){
        // here I redirect page to '/unauthorized',you can edit it
        $state.go('/authority');
      }
    });

})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
   
   .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'templates/login/signin.html',
      controller: 'SignInCtrl'
    })
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      templateUrl: 'templates/login/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      templateUrl: 'templates/login/setPassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      url:'/userdetail',
      templateUrl:'templates/login/userDetail.html',
      controller:'userdetailCtrl'
    })
  // setup an abstract state for the tabs directive
    .state('tab', {
    abstract: true,
    url: '/tab',
    templateUrl: 'templates/tabs/tabs.html',
    controller:'SlidePageCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tabs/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.monitor', {
      url: '/monitor',
      views: {
        'tab-monitor': {
          templateUrl: 'templates/tabs/monitor.html',
          controller: 'monitorCtrl'
        }
      }
    })

  .state('tab.monitor2', {
      url: '/monitor2',
      views: {
        'tab-monitor': {
          templateUrl: 'templates/tabs/monitor2.html',
          controller: 'monitor2Ctrl'
        }
      }
    })

  .state('tab.task', {
      url: '/task',
      views: {
        'tab-monitor': {
          templateUrl: 'templates/tabs/task.html',
          controller: 'taskCtrl'
        }
      }
    })

  .state('tab.envimonitor', {
      url: '/envimonitor',
      views: {
        'tab-monitor': {
          templateUrl: 'templates/tabs/envimonitor.html',
          controller: 'envimonitorCtrl'
        }
      }
    })

  .state('tab.incubatormonitor', {
      url: '/incubatormonitor',
      views: {
        'tab-monitor': {
          templateUrl: 'templates/tabs/incubatormonitor.html',
          controller: 'incubatormonitorCtrl'
        }
      }
    })

  .state('tab.monitorx', {
      url: '/monitorx',
      views: {
        'tab-monitor2': {
          templateUrl: 'templates/tabs/tab-monitor2.html',
          controller: 'monitor2controller'
        }
      }
    })
  .state('monitor',{
      abstract:true,
      url:"/monitor",
      template:'<ion-nav-view/>',
      //controller:'catalogCtrl'
    })
  //任务列表跳转
    .state('monitor.tl',{
      url:"/:tl",
        templateUrl:function($stateParams)
        {
          console.log("$stateParams.tl is "+$stateParams.tl);
          switch($stateParams.tl)
          {
            
            case 'opincubator':return "templates/monitor/opincubator.html";break;
            case 'FeedArea':return "templates/monitor/FeedArea.html";break;
            case 'daijiagong':return "templates/monitor/daijiagong.html";break;
            case 'ProcessArea':return "templates/monitor/ProcessArea.html";break;
            case 'MaterialWaiting':return "templates/monitor/MaterialWaiting.html";break;
            case 'DischargeArea':return "templates/monitor/DischargeArea.html";break;
          }
        },
        controllerProvider:function($stateParams)
        {
          switch($stateParams.tl)
          {
            case 'opincubator':return "opincubatorCtrl";break;
            case 'FeedArea':return "FeedAreaCtrl";break;
            case 'daijiagong':return "daijiagongCtrl";break;
            case 'ProcessArea':return "ProcessAreaCtrl";break;
            case 'MaterialWaiting':return "MaterialWaitingCtrl";break;
            case 'DischargeArea':return "DischargeAreaCtrl";break;
          }
        }
    })  

  .state('tab.machine-view', {
    url: '/machine-view',
    views: {
      'tab.machine-view': {
        templateUrl: 'templates/tabs/machine-view.html',
        controller: 'machine_viewcontroller'
      }
    }
  })
  .state('tab.set', {
    url: '/set',
    views: {
      'tab-set': {
        templateUrl: 'templates/tabs/tab-set.html',
        controller: 'setCtrl'
      }
    }
  })

  .state('tab.envincubator',{
    url:'/dash/envincubator',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/EnvIncubator.html',
      controller:'EnvIncubatorCtrl'
      }
    }
  })

  .state('tab.itemsample',{
    url:'/dash/itemsample',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/ItemSample.html',
      controller:'ItemSampleCtrl'
      }
    }
  })

  .state('tab.itemreagent',{
    url:'/dash/itemreagent',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/ItemReagent.html',
      controller:'ItemReagentCtrl'
      }
    }
  })


  .state('tab.itemisolator',{
    url:'/dash/itemisolator',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/ItemIsolator.html',
      controller:'ItemIsolatorCtrl'
      }
    }
  })

  .state('tab.itemincubator',{
    url:'/dash/itemincubator',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/ItemIncubator.html',
      controller:'ItemIncubatorCtrl'
      }
    }
  })

  .state('tab.envisolator',{
    url:'/dash/envisolator',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/EnvIsolator.html',
      controller:'EnvIsolatorCtrl',
      // permission:'jump'
      }
    }
  })

  .state('tab.restestresult',{
    url:'/dash/restestresult',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/ResTestResult.html',
      controller:'ResTestResultCtrl'
      }
    }
  })

  .state('tab.machineview',{
    url:'/dash/machineview',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/MachineView.html',
      controller:'MachineViewCtrl'
      }
    }
  })

  .state('tab.machineviewinput',{
    url:'/dash/machineviewinput',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/MachineViewInput.html',
      controller:'MachineViewInputCtrl'
      }
    }
  })

  .state('tab.breakdown',{
    url:'/dash/breakdown',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/BreakDown.html',
      controller:'BreakDownCtrl'
      }
    }
  })

  .state('tab.opequipment',{
    url:'/dash/opequipment',
    views: {
      'tab-dash':{
      templateUrl:'templates/dash/OpEquipment.html',
      controller:'OpEquipmentCtrl'
      }
    }
  })
      .state('authority',{
      url:'/authority',
      
      templateUrl:'templates/authority.html',
      controller:'AuthorityCtrl'
        
      
     })
   .state('set',{
      abstract:true,
      url:"/set",
      template:'<ion-nav-view/>',
      //controller:'catalogCtrl'
    })
    .state('set.ct',{
      url:"/:id",
      templateUrl:function($stateParams)
      {

          return "templates/set/set."+$stateParams.id+".html";
    
      },
      controllerProvider:function($stateParams)
      {
       //if($stateParams.id !='logout')
       //{
        return $stateParams.id + 'controller';
        //  }
        }
     
    });

    //目录
 $stateProvider
    .state('catalog',{
      abstract:true,
      url:"/catalog",
      template:'<ion-nav-view/>',
      controller:'SlidePageCtrl'
    })
    .state('catalog.ct',{
      url:"/:id",
      templateUrl:function($stateParams)
      {
        //console.log("$stateParams. is "+$stateParams.id);
        // return "partials/index.task.measureweight.html";
        return "templates/tabs/"+$stateParams.id+".html";
      },
      controllerProvider:function($stateParams)
      {
        return $stateParams.id + 'Ctrl';
      }
    })
    .state('NewSample',{
      url:'/NewSample',
      
      templateUrl:'templates/catalog/NewSample.html',
      controller:'NewSampleCtrl'
        
      
     });

  // if none of the above states are matched, use this as the fallback
   $urlRouterProvider.otherwise('/signin');

})
// --------不同平台的相关设置----------------
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(3);
  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
  $ionicConfigProvider.form.checkbox('circle');
});

angular.module('zjubme.controllers', ['ionic','ngResource','zjubme.services'])


//登录-赵艳霞
.controller('SignInCtrl', ['$scope','$state', '$timeout','$window', 'UserInfo','Storage','$ionicHistory',function($scope, $state,$timeout ,$window, UserInfo, Storage,$ionicHistory) {
  $scope.barwidth="width:0%";
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:"",UserId:""};
  }else{
    $scope.logOn={username:"",password:"",UserId:""};
  }
 // var ischecked = document.getElementById('checkboxId'); //判断是否记住密码
  $scope.signIn = function(logOn) { 
      $scope.logStatus='';
      if(logOn.username!="") { 
      UserInfo.GetUserId(logOn.username).then(function(data){
          s=data.toJSON();
          logOn.UserId='';
          for(var key in s){
            logOn.UserId+=s[key];
            } 
        if((logOn.UserId!="")&& (logOn.UserId!=null))
        {
          if((logOn.password!="")&&(logOn.password!=null))
          {
            UserInfo.LogOn(logOn.UserId,logOn.password).then(function(data){
              if(data.result && data.result.length >= 16)
              {
                $scope.logStatus="登录成功";
                console.log($scope.logStatus);
                // console.log(data.result.slice(5));
                Storage.set('Token', data.result.slice(5))
                Storage.set('UserId',logOn.UserId);
                Storage.set('isSignIN','YES');
                Storage.set('TerminalIP', returnCitySN["cip"]);
                $state.go('tab.monitor');
                  
                // console.log(returnCitySN["cip"])
              }
            },function(error){
                if (error.result='密码错误')
                {
                  $scope.logStatus="密码错误";
                }
            });
          }else{
            $scope.logStatus="密码不能为空"
            }
        }else{
          $scope.logStatus="该用户不存在"
          }            
      },function(error){
      });
    }
  }
   
  $scope.toRegister = function(){
    $state.go('phonevalid');   
    Storage.set('setPasswordState','register');
  }
  $scope.toReset = function(){
    Storage.set('setPasswordState','reset');
    $state.go('phonevalid');
    
  } 
    
}])

//注册-赵艳霞 
.controller('userdetailCtrl',['$scope','$state','$rootScope','$timeout' ,'UserInfo','Storage','UserInfo','Data','$ionicLoading','extraInfo',function($scope,$state,$rootScope,$timeout,UserInfo,Storage,UserInfo,Data,$ionicLoading,extraInfo){
  $scope.barwidth="width:0%";
  //$scope.UserInfo={UserId:}
  $scope.logStatus=' ';
  $scope.Role = '管理员';
  $scope.Roles = [{ Type: 1, Name: '管理员' }, { Type: 2, Name: '操作员' }];
  $scope.UserId= Storage.get('UserId');
  console.log($scope.UserId);
  $scope.upload=[{
    "UserId": $scope.UserId,
    "Identify": '',
    "PhoneNo":$rootScope.PhoneNo,
    "UserName": '',
    "Role": $scope.Role,
    "Password":$rootScope.password,
    "TerminalIP":Storage.get('TerminalIP'),
    "TerminalName": extraInfo.postInformation().TerminalName,
    "revUserId": extraInfo.postInformation().revUserId
  }]
   $scope.deviceInformation = ionic.Platform.device();
   $scope.TerminalName = ionic.Platform.device().model+"-"+ionic.Platform.device().uuid;
   console.log($scope.deviceInformation);
   console.log($scope.TerminalName);
   Storage.set('TerminalName', $scope.TerminalName);
   $scope.infoSetup = function(a,userName,Identify,Role){
    $scope.logStatus='';
   
      $scope.upload[0].UserName = userName;
  
      $scope.upload[0].Identify = Identify;
      //console.log($scope.upload[0]);  

      Storage.set('USERNAME', $rootScope.PhoneNo); 
      Storage.set('password', $rootScope.password);
      if(a==true){
        $ionicLoading.show({
           template: '注册失败，请输入正确的身份证号码',
           duration:1000
          });
      }else{
         UserInfo.Register($scope.upload[0]).then( function (data) {
      $scope.logStatus=data.result;
       if(data.result=="注册成功"){
             $scope.logStatus='注册成功！';
             Storage.set('UserName', userName);
             $state.go('signin');
              }          
              
        },function(error){
          console.log(error)
          $scope.logStatus='该手机号已经注册！';
        });
      }
     
      }     
}])

//设置密码-赵艳霞
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' , 'UserInfo','Storage',function($scope,$state,$rootScope,$timeout,UserInfo,Storage) {
  $scope.barwidth="width:0%";
  var setPassState=Storage.get('setPasswordState');
  if(setPassState=='reset'){
    $scope.headerText="重置密码";
    $scope.buttonText="确认修改";
  }else{
    $scope.headerText="设置密码";
    $scope.buttonText="下一步";
  }
   $scope.UserId = Storage.get('UserId');
      
        $scope.BasicInfo=[{
          "UserId": $scope.UserId,
          "Identify": 1,
          "PhoneNo":1,
          "UserName": 1,
          "Role": 1,
          "Password":1,
          "LastLoginTime":1,
          "RevisionInfo": 1,
      }] 
      $scope.Password='';
        UserInfo.GetUserInfo($scope.BasicInfo[0]).then(function(data, headers){
            $scope.Password= data.Password;
            

        },function(error){

       });
  $scope.setPassword={newPass:"" , confirm:""};
  $scope.resetPassword=function(setPassword){
    $scope.logStatus='';
    if((setPassword.newPass!="") && (setPassword.confirm!="")){
      if(setPassword.newPass == setPassword.confirm){
        if(setPassState=='register'){
          $rootScope.password=setPassword.newPass;
          Storage.set('password', $rootScope.password);
          $state.go('userdetail');
        }else{
          //console.log(Storage.get('password'));
         
          console.log($scope.Password);
          UserInfo.ChangePassword(Storage.get('UserId'),$scope.Password,setPassword.newPass).then(function(data){
          $scope.logStatus2='修改成功';
          if(data.result=='修改成功'){
              Storage.set('password', setPassword.newPass);
              $state.go('signin');
            }
          
        },function(error){

      })
         
          //$state.go('signin');
        }
      }else{
        $scope.logStatus="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus="请输入两遍新密码"
    }
  }
}])

//修改密码-赵艳霞  
.controller('changepasswordcontroller',['$scope','$state','$timeout', '$ionicHistory', 'UserInfo','Storage', function($scope , $state,$timeout, $ionicHistory, UserInfo,Storage){
  $scope.barwidth="width:0%";
  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
   $scope.logStatus1='';
   UserInfo.LogOn(Storage.get('UserId'),change.oldPassword).then(function(data){
      $scope.logStatus1='验证成功';
      $timeout(function(){$scope.ishide=false;} , 500);
      },function(error){
            $scope.logStatus1='密码错误';
          });
     }

      $scope.gotoChange = function(change){
        $scope.logStatus2='';
        if((change.newPassword!="") && (change.confirmPassword!="")){
          if(change.newPassword == change.confirmPassword){
            UserInfo.ChangePassword(Storage.get('UserId'),change.oldPassword,change.newPassword).then(function(data){
              $scope.logStatus2='修改成功';
              Storage.set('password', change.newPassword);
              $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
              $state.go('tab.dash');
              $scope.ishide=true;
           },500);
          },function(error){

              })
          }
          else{
           $scope.logStatus2="两次输入的密码不一致";
          }
       }else{
          $scope.logStatus2="请输入两遍新密码"
        }
      }
      $scope.onClickBackward = function(){
        $ionicHistory.goBack();
      }
}])

//手机号验证-赵艳霞
.controller('phonevalidCtrl', ['$scope','$state','$interval','$rootScope', 'Storage', 'UserInfo','$http', '$ionicPopup','$ionicLoading',function($scope, $state,$interval,$rootScope,Storage,UserInfo,$http,$ionicPopup,$ionicLoading) {
  $scope.barwidth="width:0%";
  var setPassState=Storage.get('setPasswordState');
  $scope.veriusername="" 
  $scope.verifyCode="";
  $scope.veritext="获取验证码";
  $scope.isable=false;
  $scope.display = false;
  $scope.next = true;
  $scope.allowEdit = false;
  $scope.varify = "请输入你的手机号码";
  $scope.logStatus=' ';
  $scope.setP=Storage.get('setPasswordState');
  
  $scope.getcode = function(a,PhoneNo) {

    $rootScope.PhoneNo=PhoneNo; 
    if(a==true){
      $ionicLoading.show({
      template: '您输入的手机号有误，请输入正确的手机号',
      duration:1000
      });
    }else{
      $scope.confirmPopup = $ionicPopup.confirm({
         title: '确认手机号码',
         template: '我们将发送短信到这个号码：'+$rootScope.PhoneNo,
         scope: $scope,
         buttons: [{
            text: '<b>取消</b>',
            },
            {
              text: '好',
              type: 'button-positive',
           　 onTap: function(e) {
                $scope.isable=true;
                $scope.display = true; 
                $scope.allowEdit = true;
                $scope.next = false;
                $scope.varify = "短信验证码已发送，请填写验证码";
                UserInfo.NewUserId(PhoneNo).then(function(data){
                  s=data.toJSON();
                  $scope.result='';
                  for(var key in s){
                    $scope.result+=s[key];
                  } 
                  console.log("NewUserId",$scope.result);
                  // Storage.set('UserId',result);
                  if($scope.result=='该手机号已经注册')
                  {
                    console.log($scope.setP);
                    if($scope.setP=='reset'){
                      $scope.logStatus='找回密码';
                     }else{
                      $scope.logStatus='该账户已进行过注册！ ';
                      }
                    console.log($scope.logStatus);
                    UserInfo.GetUserId(PhoneNo).then(function(data){
                      s=data.toJSON();
                      var UserId='';
                      for(var key in s){
                        UserId+=s[key];
                        } 
                      Storage.set('UserId',UserId);

                    },function(error){
                      console.log("NewUserIderror",error);
                  }); 
                }else{
                      Storage.set('UserId',$scope.result);
                  }
              },function(error){
   
                })
            }
          }]
        });
      }
    };
  $scope.gotoReset = function(veriusername,verifyCode){
    $scope.logStatus='';
    if(veriusername!=0 && verifyCode!=0 && veriusername!='' && verifyCode!=''){
    $state.go('setpassword');
    }
  }
//
}])

//个人信息-赵艳霞
.controller('personalInfocontroller',['$scope','$ionicHistory','$ionicLoading','$state','$ionicPopup','$resource','Storage','Data','CONFIG','extraInfo','$ionicPopover','UserInfo',
   function($scope, $ionicHistory, $ionicLoading,$state, $ionicPopup, $resource, Storage, Data,CONFIG, extraInfo, $ionicPopover,UserInfo) {             
      // 返回键
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
      // 收缩框
      var show = true;
      $scope.isShown = function() {
        return show;
      };
      var show1 = false;
      $scope.toggle1 = function() {
        show1 = !show1;
      };
      $scope.isShown1 = function() {
        return show1;
      }; 
      $scope.BasicDtInfo ={};
      $scope.UserId = Storage.get('UserId');
      
        $scope.BasicInfo=[{
          "UserId": $scope.UserId,
          "Identify": 1,
          "PhoneNo":1,
          "UserName": 1,
          "Role": 1,
          "Password": 1,
          "LastLoginTime": 1,
          "RevisionInfo": 1,
          "Token": 1,
          "LastLogoutTime": 1,
          "RevisionInfo": 1
      }] 
        $scope.Roles = [{ Type: 1, Name: '管理员' }, { Type: 2, Name: '操作员' }];
        UserInfo.GetUserInfo($scope.BasicInfo[0]).then(function(data, headers){
            $scope.BasicDtInfo.PhoneNo= data.PhoneNo;
            $scope.BasicDtInfo.UserName = data.UserName;
            $scope.BasicDtInfo.Iden = data.Identify;
            $scope.BasicDtInfo.Role = data.Role;
            $scope.TerminalIP = data.TerminalIP;
            $scope.TerminalName = data.TerminalName;
            $scope.LastLoginTime =data.LastLoginTime;
            if($scope.BasicDtInfo.Role=='管理员'||$scope.BasicDtInfo.Role=='1')
            {
              $scope.BasicDtInfo.Role =1;
            }else
            {
              $scope.BasicDtInfo.Role =2;
            }

        },function(error){

       });
     
        $scope.SaveInfo=function(a,b){
     
            if (a == true){
              $ionicLoading.show({
                  template: '保存失败,请输入正确的身份证号',
                  duration:1000
              });
            }
            else if(b == true){
              $ionicLoading.show({
                  template: '保存失败,请输入正确的联系电话',
                  duration:1000
              });
            }else{
            $scope.UpdateUserInfo={
                "UserId": $scope.UserId,
                "Identify":$scope.BasicDtInfo.Iden,
                "PhoneNo":$scope.BasicDtInfo.PhoneNo,
                "UserName": $scope.BasicDtInfo.UserName,
                "Role": $scope.BasicDtInfo.Role,
                "TerminalIP":Storage.get('TerminalIP'),
                "revUserId": extraInfo.postInformation().revUserId
      };
         UserInfo.UpdateUserInfo($scope.UpdateUserInfo).then( function (data, headers) {
         if(data.result=="插入成功"){
         
         console.log($scope.BasicDtInfo.Role);
          console.log('ip',$scope.UpdateUserInfo);
       Storage.set('UserName', $scope.BasicDtInfo.UserName);
       Storage.set('USERNAME', $scope.BasicDtInfo.PhoneNo);
        $ionicLoading.show({
                 template: '数据更新成功，请重新登录',
                 duration:2000
                });
       }
          Storage.rm('Token')
          Storage.rm('TerminalIP') 
          $state.go('signin');    
        },function(error){

          });
     } //}
   }
}])

//我的二维码-赵艳霞
.controller('myQrcodecontroller', function ($scope, $ionicHistory,Storage) {

    $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

    $scope.bar = '我的二维码，智能化无菌检测App';
    $scope.qr_Image = "img/DefaultAvatar.jpg";
    $scope.qr_UserName =Storage.get('UserName');
    console.log($scope.qr_UserName);
    $scope.qr_UserId =Storage.get('UserId');


})

//消息推送-赵艳霞
.controller('pushmessegecontroller',['$scope','$ionicHistory' ,'$stateParams', '$ionicPopup', '$timeout', 'Socket', 'Chat','$log','chartTool',
  function($scope,$ionicHistory,$stateParams, $ionicPopup, $timeout, Socket, Chat,$log,chartTool) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }
  $scope.temperature='35'
  $scope.data = {};
  $scope.data.message = "";
  $scope.messages = Chat.getMessages();
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 250;
  var UserId = '002'; 
  $scope.socket = Socket;
  $scope.username='wang';
  var User = {userid:UserId, username:$scope.username}; 
  $scope.socket.emit('login',User);
  $scope.socket.on('message', function(test){
            console.log(test);
        }); 
  $scope.socket.on('monitor', function(data){
            $scope.temperature=data;
            console.log($scope.temperature);
        });

  Chat.scrollBottom();

  if($stateParams.username){
    $scope.data.message = "@" + $stateParams.username;
    document.getElementById("msg-input").focus();
  }

  var sendUpdateTyping = function(){
   if (!typing) {
     typing = true;
     Socket.emit('typing');
    }
   lastTypingTime = (new Date()).getTime();
    $timeout(function () {
     var typingTimer = (new Date()).getTime();
     var timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
       Socket.emit('stop typing');
       typing = false;
      }
    }, TYPING_TIMER_LENGTH);
  };

  $scope.updateTyping = function(){
    sendUpdateTyping();
  };

  $scope.messageIsMine = function(username){
    return $scope.data.username === username;
  };

  $scope.getBubbleClass = function(username){
   var classname = 'from-them';
    if($scope.messageIsMine(username)){
     classname = 'from-me';
   }
   return classname;
  };

    //socket发送消息到服务器
  $scope.sendMessage = function(msg){
    Chat.sendMessage(msg);
    $scope.data.message = "";
    var test = { username:$scope.username,content:msg};
    $scope.socket.emit('message', test);
    $scope.socket.emit('monitor', "data");
    //var a=$scope.emit('m');
    //console.log(a);

  };
  $scope.socket.emit('logout');
  
}])
.controller('DashCtrl', function($scope) {})

//监控主界面-赵艳霞
.controller('monitorCtrl', ['$scope','$state','$interval','Result','Storage', function($scope, $state, $interval, Result, Storage) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
    $scope.result={
      "TestId": null,
      "ObjectNo": null,
      "ObjCompany": null,
      "ObjIncuSeq": null,
      "TestType": null,
      "TestStand": null,
      "TestEquip": null,
      "TestEquip2": null,
      "Description": null,
      "ProcessStartS": null,
      "ProcessStartE": null,
      "ProcessEndS": null,
      "ProcessEndE": null,
      "CollectStartS": null,
      "CollectStartE": null,
      "CollectEndS": null,
      "CollectEndE": null,
      "TestTimeS": null,
      "TestTimeE": null,
      "TestResult": null,
      "TestPeople": null,
      "TestPeople2": null,
      "ReStatus": 0,
      "RePeople": null,
      "ReTimeS": null,
      "ReTimeE": null,
      "ReDateTimeS": null,
      "ReDateTimeE": null,
      "ReTerminalIP": null,
      "ReTerminalName": null,
      "ReUserId": null,
      "ReIdentify": null,
      "FormerStep": null,
      "NowStep": null,
      "LaterStep": null,
      "GetObjectNo": 1,
      "GetObjCompany": 1,
      "GetObjIncuSeq": 1,
      "GetTestType": 1,
      "GetTestStand": 0,
      "GetTestEquip": 0,
      "GetTestEquip2": 0,
      "GetDescription": 0,
      "GetProcessStart": 0,
      "GetProcessEnd": 0,
      "GetCollectStart": 0,
      "GetCollectEnd": 0,
      "GetTestTime": 0,
      "GetTestResult": 0,
      "GetTestPeople": 0,
      "GetTestPeople2": 0,
      "GetReStatus": 0,
      "GetRePeople": 0,
      "GetReTime": 0,
      "GetRevisionInfo": 0,
      "GetFormerStep": 1,
      "GetNowStep": 1,
      "GetLaterStep": 1 
    }
    $scope.monitorlist={}
    Result.GetResult($scope.result).then(
      function(data){
      
       $scope.monitorlist=data;
      console.log("monitorlist",$scope.monitorlist);
    },function(e){
    });

  });
  
  var timer =  $interval(function(){
    $scope.monitorlist={}
    Result.GetResult($scope.result).then(
      function(data){
        $scope.monitorlist=data;
        console.log("monitorlist",$scope.monitorlist);
      },function(e){
    });
  },30000,-1);  

  var show = true;
      $scope.isShown = function() {
        return show;
      };
      var show1 = true;
      $scope.toggle1 = function() {
        show1 = !show1;
      };
      $scope.isShown1 = function() {
        return show1;
      }; 

  $scope.isStopTest =function (item) {  
      if (item == '紧急停止') {
        return 1
      } else {
        return 0
      }   
  }

  $scope.doSomething = function () {
    $state.go('tab.monitor2');
  }

  $scope.GoTask = function (TestType, TestId) {
    Storage.set('TestType',TestType);
    Storage.set('TestId',TestId)
    $state.go('tab.task');
  }

  $scope.$on('$ionicView.afterLeave',function(){
    $interval.cancel(timer);
  })

}])

.controller('monitor2Ctrl', ['$scope','$state','$interval','Result','Storage', function($scope, $state, $interval, Result, Storage) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
    $scope.result={
      "TestId": null,
      "ObjectNo": null,
      "ObjCompany": null,
      "ObjIncuSeq": null,
      "TestType": null,
      "TestStand": null,
      "TestEquip": null,
      "TestEquip2": null,
      "Description": null,
      "ProcessStartS": null,
      "ProcessStartE": null,
      "ProcessEndS": null,
      "ProcessEndE": null,
      "CollectStartS": null,
      "CollectStartE": null,
      "CollectEndS": null,
      "CollectEndE": null,
      "TestTimeS": null,
      "TestTimeE": null,
      "TestResult": null,
      "TestPeople": null,
      "TestPeople2": null,
      "ReStatus": 1,
      "RePeople": null,
      "ReTimeS": null,
      "ReTimeE": null,
      "ReDateTimeS": null,
      "ReDateTimeE": null,
      "ReTerminalIP": null,
      "ReTerminalName": null,
      "ReUserId": null,
      "ReIdentify": null,
      "FormerStep": null,
      "NowStep": null,
      "LaterStep": null,
      "GetObjectNo": 1,
      "GetObjCompany": 1,
      "GetObjIncuSeq": 1,
      "GetTestType": 1,
      "GetTestStand": 0,
      "GetTestEquip": 0,
      "GetTestEquip2": 0,
      "GetDescription": 0,
      "GetProcessStart": 0,
      "GetProcessEnd": 0,
      "GetCollectStart": 0,
      "GetCollectEnd": 0,
      "GetTestTime": 0,
      "GetTestResult": 0,
      "GetTestPeople": 0,
      "GetTestPeople2": 0,
      "GetReStatus": 0,
      "GetRePeople": 0,
      "GetReTime": 0,
      "GetRevisionInfo": 0,
      "GetFormerStep": 1,
      "GetNowStep": 1,
      "GetLaterStep": 1
    }
    $scope.monitorlist={}
    Result.GetResult($scope.result).then(
      function(data){
        $scope.monitorlist=data;
        console.log("monitorlist",$scope.monitorlist);
      },function(e){
    });
  });
  
  var timer =  $interval(function(){
    $scope.monitorlist={}
    Result.GetResult($scope.result).then(
      function(data){
        $scope.monitorlist=data;
        console.log("monitorlist",$scope.monitorlist);
      },function(e){
    });
  },30000,-1);     

  var show = true;
      $scope.isShown = function() {
        return show;
      };
      var show1 = true;
      $scope.toggle1 = function() {
        show1 = !show1;
      };
      $scope.isShown1 = function() {
        return show1;
      }; 

  $scope.isStopTest =function (item) {  
      if (item == '紧急停止') {
        return 1
      } else {
        return 0
      }
  }

  $scope.doSomething = function () {
    $state.go('tab.envimonitor');
  }

  $scope.GoTask = function (TestType, TestId) {
    Storage.set('TestType',TestType);
    Storage.set('TestId',TestId)
    $state.go('tab.task');
  }

  $scope.$on('$ionicView.afterLeave',function(){
    $interval.cancel(timer);
  })
}])

.controller('taskCtrl', ['$scope','$state','$interval','Operation','Result','ItemInfo','Storage', function($scope, $state, $interval, Operation, Result, ItemInfo, Storage) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  // $scope.$on('$ionicView.beforeEnter', function() {
  
  //   console.log(Storage.get('TestType')); 
  // });
  $scope.$on('$ionicView.enter', function() {
    $scope.resultinfo = [{},{},{}]
    $scope.NowStep={}
    $scope.Progress={}
    $scope.TestType = Storage.get('TestType')
    $scope.show = {
      "SOB" : 0,
      "SOS" : 0,
      "WSP" : 0
    }
    $scope.result={
      "TestId": Storage.get('TestId'),
      "ObjectNo": null,
      "ObjCompany": null,
      "ObjIncuSeq": null,
      "TestType": null,
      "TestStand": null,
      "TestEquip": null,
      "TestEquip2": null,
      "Description": null,
      "ProcessStartS": null,
      "ProcessStartE": null,
      "ProcessEndS": null,
      "ProcessEndE": null,
      "CollectStartS": null,
      "CollectStartE": null,
      "CollectEndS": null,
      "CollectEndE": null,
      "TestTimeS": null,
      "TestTimeE": null,
      "TestResult": null,
      "TestPeople": null,
      "TestPeople2": null,
      "ReStatus": null,
      "RePeople": null,
      "ReTimeS": null,
      "ReTimeE": null,
      "ReDateTimeS": null,
      "ReDateTimeE": null,
      "ReTerminalIP": null,
      "ReTerminalName": null,
      "ReUserId": null,
      "ReIdentify": null,
      "FormerStep": null,
      "NowStep": null,
      "LaterStep": null,
      "GetObjectNo": 0,
      "GetObjCompany": 0,
      "GetObjIncuSeq": 0,
      "GetTestType": 1,
      "GetTestStand": 0,
      "GetTestEquip": 0,
      "GetTestEquip2": 0,
      "GetDescription": 0,
      "GetProcessStart": 0,
      "GetProcessEnd": 0,
      "GetCollectStart": 0,
      "GetCollectEnd": 0,
      "GetTestTime": 0,
      "GetTestResult": 0,
      "GetTestPeople": 0,
      "GetTestPeople2": 0,
      "GetReStatus": 0,
      "GetRePeople": 0,
      "GetReTime": 0,
      "GetRevisionInfo": 0,
      "GetFormerStep": 0,
      "GetNowStep": 1,
      "GetLaterStep": 0
    }
    if ($scope.TestType == "SOB") {
      $scope.show.SOB = 1
      $scope.OrderList = [
        {"OrderId":"SOB001", "Order":1, "Status":""},
        {"OrderId":"SOB002", "Order":2, "Status":""},
        {"OrderId":"SOB003", "Order":3, "Status":""},
        {"OrderId":"SOB004", "Order":4, "Status":""},
        {"OrderId":"SOB005", "Order":5, "Status":""},
        {"OrderId":"SOB006", "Order":6, "Status":""},
        {"OrderId":"SOB007", "Order":7, "Status":""},
        {"OrderId":"SOB008", "Order":8, "Status":""},
        {"OrderId":"SOB009", "Order":9, "Status":""},
        {"OrderId":"SOB010", "Order":10, "Status":""},
        {"OrderId":"SOB011", "Order":11, "Status":""},
        {"OrderId":"SOB012", "Order":12, "Status":""},
        {"OrderId":"SOB013", "Order":13, "Status":""},
        {"OrderId":"SOB014", "Order":14, "Status":""},
        {"OrderId":"SOB015", "Order":15, "Status":""},
        {"OrderId":"SOB016", "Order":16, "Status":""},
        {"OrderId":"SOB017", "Order":17, "Status":""},
        {"OrderId":"SOB018", "Order":18, "Status":""},
        {"OrderId":"SOB019", "Order":19, "Status":""},
        {"OrderId":"SOB020", "Order":20, "Status":""},
        {"OrderId":"SOB021", "Order":21, "Status":""},
        {"OrderId":"SOB022", "Order":22, "Status":""},
        {"OrderId":"SOB023", "Order":23, "Status":""},
        {"OrderId":"SOB024", "Order":24, "Status":""},
        {"OrderId":"SOB025", "Order":25, "Status":""},
        {"OrderId":"SOB026", "Order":26, "Status":""}
      ]
    } else if ($scope.TestType == "SOS") {
      $scope.show.SOS = 1
      $scope.OrderList = [
        {"OrderId":"SOS001", "Order":1, "Status":""},
        {"OrderId":"SOS002", "Order":2, "Status":""},
        {"OrderId":"SOS003", "Order":3, "Status":""},
        {"OrderId":"SOS004", "Order":4, "Status":""},
        {"OrderId":"SOS005", "Order":5, "Status":""},
        {"OrderId":"SOS006", "Order":6, "Status":""},
        {"OrderId":"SOS007", "Order":7, "Status":""},
        {"OrderId":"SOS008", "Order":8, "Status":""},
        {"OrderId":"SOS009", "Order":9, "Status":""},
        {"OrderId":"SOS010", "Order":10, "Status":""},
        {"OrderId":"SOS011", "Order":11, "Status":""},
        {"OrderId":"SOS012", "Order":12, "Status":""},
        {"OrderId":"SOS013", "Order":13, "Status":""},
        {"OrderId":"SOS014", "Order":14, "Status":""},
        {"OrderId":"SOS015", "Order":15, "Status":""},
        {"OrderId":"SOS016", "Order":16, "Status":""},
        {"OrderId":"SOS017", "Order":17, "Status":""},
        {"OrderId":"SOS018", "Order":18, "Status":""},
        {"OrderId":"SOS019", "Order":19, "Status":""},
        {"OrderId":"SOS020", "Order":20, "Status":""}        
      ]
    } else if ($scope.TestType == "WSP") {
      $scope.show.WSP = 1
      $scope.OrderList = [
        {"OrderId":"WSP001", "Order":1, "Status":""},
        {"OrderId":"WSP002", "Order":2, "Status":""},
        {"OrderId":"WSP003", "Order":3, "Status":""},
        {"OrderId":"WSP004", "Order":4, "Status":""},
        {"OrderId":"WSP005", "Order":5, "Status":""},
        {"OrderId":"WSP006", "Order":6, "Status":""},
        {"OrderId":"WSP007", "Order":7, "Status":""},
        {"OrderId":"WSP008", "Order":8, "Status":""},
        {"OrderId":"WSP009", "Order":9, "Status":""},
        {"OrderId":"WSP010", "Order":10, "Status":""},
        {"OrderId":"WSP011", "Order":11, "Status":""},
        {"OrderId":"WSP012", "Order":12, "Status":""},
        {"OrderId":"WSP013", "Order":13, "Status":""},
        {"OrderId":"WSP014", "Order":14, "Status":""},
        {"OrderId":"WSP015", "Order":15, "Status":""},
        {"OrderId":"WSP016", "Order":16, "Status":""},
        {"OrderId":"WSP017", "Order":17, "Status":""},
        {"OrderId":"WSP018", "Order":18, "Status":""},
        {"OrderId":"WSP019", "Order":19, "Status":""},
        {"OrderId":"WSP020", "Order":20, "Status":""}        
      ]
    }
    
    Result.GetResult($scope.result).then(
      function(data){
        $scope.NowStep = data[0].NowStep;
        $scope.Progress= data[0].JinDu;
        console.log("NowStep",$scope.NowStep);
        for (var i = 0; i < $scope.OrderList.length; i++) {
          if ($scope.OrderList[i].OrderId != $scope.NowStep) {
            $scope.OrderList[i].Status = "...已完成"
          } else {
            $scope.OrderList[i].Status = "...正在执行"
            i ++;
            for ( i ; i < $scope.OrderList.length; i++) {
              $scope.OrderList[i].Status = "...未完成"
            }
          }
        }
      },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "1"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[0].temperature = data[0]
            $scope.resultinfo[0].humid = data[1]
            $scope.resultinfo[0].pressure = data[2]
            $scope.resultinfo[0].H2O2h = data[3]
            $scope.resultinfo[0].H2O2l = data[4]
          },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "2"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[1].temperature = data[0]
            $scope.resultinfo[1].humid = data[1]
            $scope.resultinfo[1].pressure = data[2]
            $scope.resultinfo[1].H2O2h = data[3]
            $scope.resultinfo[1].H2O2l = data[4]
          },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "3"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[2].temperature = data[0]
            $scope.resultinfo[2].humid = data[1]
            $scope.resultinfo[2].pressure = data[2]
            $scope.resultinfo[2].H2O2h = data[3]
            $scope.resultinfo[2].H2O2l = data[4]
          },function(e){
    });
  });
  
  var timer =  $interval(function(){
    if ($scope.TestType == "SOB") {
      $scope.show.SOB = 1
      $scope.OrderList = [
        {"OrderId":"SOB001", "Order":1, "Status":""},
        {"OrderId":"SOB002", "Order":2, "Status":""},
        {"OrderId":"SOB003", "Order":3, "Status":""},
        {"OrderId":"SOB004", "Order":4, "Status":""},
        {"OrderId":"SOB005", "Order":5, "Status":""},
        {"OrderId":"SOB006", "Order":6, "Status":""},
        {"OrderId":"SOB007", "Order":7, "Status":""},
        {"OrderId":"SOB008", "Order":8, "Status":""},
        {"OrderId":"SOB009", "Order":9, "Status":""},
        {"OrderId":"SOB010", "Order":10, "Status":""},
        {"OrderId":"SOB011", "Order":11, "Status":""},
        {"OrderId":"SOB012", "Order":12, "Status":""},
        {"OrderId":"SOB013", "Order":13, "Status":""},
        {"OrderId":"SOB014", "Order":14, "Status":""},
        {"OrderId":"SOB015", "Order":15, "Status":""},
        {"OrderId":"SOB016", "Order":16, "Status":""},
        {"OrderId":"SOB017", "Order":17, "Status":""},
        {"OrderId":"SOB018", "Order":18, "Status":""},
        {"OrderId":"SOB019", "Order":19, "Status":""},
        {"OrderId":"SOB020", "Order":20, "Status":""},
        {"OrderId":"SOB021", "Order":21, "Status":""},
        {"OrderId":"SOB022", "Order":22, "Status":""},
        {"OrderId":"SOB023", "Order":23, "Status":""},
        {"OrderId":"SOB024", "Order":24, "Status":""},
        {"OrderId":"SOB025", "Order":25, "Status":""},
        {"OrderId":"SOB026", "Order":26, "Status":""}
      ]
    } else if ($scope.TestType == "SOS") {
      $scope.show.SOS = 1
      $scope.OrderList = [
        {"OrderId":"SOS001", "Order":1, "Status":""},
        {"OrderId":"SOS002", "Order":2, "Status":""},
        {"OrderId":"SOS003", "Order":3, "Status":""},
        {"OrderId":"SOS004", "Order":4, "Status":""},
        {"OrderId":"SOS005", "Order":5, "Status":""},
        {"OrderId":"SOS006", "Order":6, "Status":""},
        {"OrderId":"SOS007", "Order":7, "Status":""},
        {"OrderId":"SOS008", "Order":8, "Status":""},
        {"OrderId":"SOS009", "Order":9, "Status":""},
        {"OrderId":"SOS010", "Order":10, "Status":""},
        {"OrderId":"SOS011", "Order":11, "Status":""},
        {"OrderId":"SOS012", "Order":12, "Status":""},
        {"OrderId":"SOS013", "Order":13, "Status":""},
        {"OrderId":"SOS014", "Order":14, "Status":""},
        {"OrderId":"SOS015", "Order":15, "Status":""},
        {"OrderId":"SOS016", "Order":16, "Status":""},
        {"OrderId":"SOS017", "Order":17, "Status":""},
        {"OrderId":"SOS018", "Order":18, "Status":""},
        {"OrderId":"SOS019", "Order":19, "Status":""},
        {"OrderId":"SOS020", "Order":20, "Status":""}        
      ]
    } else if ($scope.TestType == "WSP") {
      $scope.show.WSP = 1
      $scope.OrderList = [
        {"OrderId":"WSP001", "Order":1, "Status":""},
        {"OrderId":"WSP002", "Order":2, "Status":""},
        {"OrderId":"WSP003", "Order":3, "Status":""},
        {"OrderId":"WSP004", "Order":4, "Status":""},
        {"OrderId":"WSP005", "Order":5, "Status":""},
        {"OrderId":"WSP006", "Order":6, "Status":""},
        {"OrderId":"WSP007", "Order":7, "Status":""},
        {"OrderId":"WSP008", "Order":8, "Status":""},
        {"OrderId":"WSP009", "Order":9, "Status":""},
        {"OrderId":"WSP010", "Order":10, "Status":""},
        {"OrderId":"WSP011", "Order":11, "Status":""},
        {"OrderId":"WSP012", "Order":12, "Status":""},
        {"OrderId":"WSP013", "Order":13, "Status":""},
        {"OrderId":"WSP014", "Order":14, "Status":""},
        {"OrderId":"WSP015", "Order":15, "Status":""},
        {"OrderId":"WSP016", "Order":16, "Status":""},
        {"OrderId":"WSP017", "Order":17, "Status":""},
        {"OrderId":"WSP018", "Order":18, "Status":""},
        {"OrderId":"WSP019", "Order":19, "Status":""},
        {"OrderId":"WSP020", "Order":20, "Status":""}        
      ]
    }
    Result.GetResult($scope.result).then(
      function(data){
        $scope.NowStep = data[0].NowStep;
        $scope.Progress= data[0].JinDu;
        for (var i = 0; i < $scope.OrderList.length; i++) {
          if ($scope.OrderList[i].OrderId != $scope.NowStep) {
            $scope.OrderList[i].Status = "...已完成"
          } else {
            $scope.OrderList[i].Status = "...正在执行"
            i ++;
            for ( i ; i < $scope.OrderList.length; i++) {
              $scope.OrderList[i].Status = "...未完成"
            }
          }
        }
      },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "1"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[0].temperature = data[0]
            $scope.resultinfo[0].humid = data[1]
            $scope.resultinfo[0].pressure = data[2]
            $scope.resultinfo[0].H2O2h = data[3]
            $scope.resultinfo[0].H2O2l = data[4]
          },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "2"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[1].temperature = data[0]
            $scope.resultinfo[1].humid = data[1]
            $scope.resultinfo[1].pressure = data[2]
            $scope.resultinfo[1].H2O2h = data[3]
            $scope.resultinfo[1].H2O2l = data[4]
          },function(e){
    });
    ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "3"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.resultinfo[2].temperature = data[0]
            $scope.resultinfo[2].humid = data[1]
            $scope.resultinfo[2].pressure = data[2]
            $scope.resultinfo[2].H2O2h = data[3]
            $scope.resultinfo[2].H2O2l = data[4]
          },function(e){
    });
  },30000,-1); 
  
  // $scope.isStopTest = function (item) {  
  //     if (item == '紧急停止') {
  //       return 1
  //     } else {
  //       return 0
  //     }
  // }
  
  $scope.$on('$destroy',function(){
    $interval.cancel(timer);
  });

  $scope.$on('$ionicView.afterLeave', function() {
    Storage.rm('TestType');
    Storage.rm('TestId');
  });
}])

.controller('envimonitorCtrl', ['$scope','$state','$interval','ItemInfo',function($scope, $state, $interval, ItemInfo) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
    $scope.result={
      "temperature1" :null,
      "temperature2" :null,
      "temperature3" :null,
      "temperature":null,
      "humid":null,
      "pressure":null,
      "H2O2h":null,
      "H2O2l":null
    }
    $scope.ID = {
      "insid" : null,
      "cabinId" : null
    }
    $scope.selectinstrument = $scope.insms[3].id
    $scope.selectcabin = $scope.cabins[1].id
  })

  $scope.insms=[
    {"id":1,"name":"培养箱1"},
    {"id":2,"name":"培养箱2"},
    {"id":3,"name":"培养箱3"},
    {"id":4,"name":"加工隔离器"},
    {"id":5,"name":"集菌隔离器"}
  ]
  $scope.cabins=[
    {"id":1,"name":"进料舱"},
    {"id":2,"name":"操作舱"},
    {"id":3,"name":"出料舱"}
  ]


  $scope.getReult = function(insid, cabinId) {
    console.log("insid",insid)
    console.log("cabinId",cabinId)
    $scope.ID.insid = insid
    $scope.ID.cabinId = cabinId
    if (insid == 4) {
      if (cabinId == 1) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "1"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
      if (cabinId == 2) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "2"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
      if (cabinId == 3) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "3"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
    }
    if (insid == 5) {
      ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Collect","CabinId": "1"}).then(
          function(data){
            console.log("collect",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
            console.log("res",$scope.result)
          },function(e){
        });
    }
    if (insid == 1) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_001"}).then(
          function(data){
            console.log("Incu1",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
    if (insid == 2) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_002"}).then(
          function(data){
            console.log("Incu2",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
    if (insid == 3) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_003"}).then(
          function(data){
            console.log("Incu3",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
  }

  var timer =  $interval(function(){
    $scope.result={
      "temperature1" :null,
      "temperature2" :null,
      "temperature3" :null,
      "temperature":null,
      "humid":null,
      "pressure":null,
      "H2O2h":null,
      "H2O2l":null
    }
    if ($scope.ID.insid == 4) {
      if ($scope.ID.cabinId == 1) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "1"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
      if ($scope.ID.cabinId == 2) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "2"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
      if ($scope.ID.cabinId == 3) {
        ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Process","CabinId": "3"}).then(
          function(data){
            console.log("PROCESS",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
          },function(e){
        });
      }
    }
    if ($scope.ID.insid == 5) {
      ItemInfo.GetNewIsolatorEnv({"IsolatorId": "Iso_Collect","CabinId": "1"}).then(
          function(data){
            console.log("collect",data)
            $scope.result.temperature = data[0]
            $scope.result.humid = data[1]
            $scope.result.pressure = data[2]
            $scope.result.H2O2h = data[3]
            $scope.result.H2O2l = data[4]
            console.log("res",$scope.result)
          },function(e){
        });
    }
    if ($scope.ID.insid == 1) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_001"}).then(
          function(data){
            console.log("Incu1",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
    if ($scope.ID.insid == 2) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_002"}).then(
          function(data){
            console.log("Incu2",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
    if ($scope.ID.insid == 3) {
      ItemInfo.GetNewIncubatorEnv({"IncubatorId": "Incu_003"}).then(
          function(data){
            console.log("Incu3",data)
            $scope.result.temperature1 = data[0]
            $scope.result.temperature2 = data[1]
            $scope.result.temperature3 = data[2]
          },function(e){
        });
    }
    // Result.GetResult($scope.result).then(
    //   function(data){
    //     $scope.monitorlist=data;
    //     console.log("monitorlist",$scope.monitorlist);
    //   },function(e){
    // });
  },30000,-1);

  $scope.doSomething = function () {
    $state.go('tab.incubatormonitor');
  }

  $scope.$on('$ionicView.afterLeave',function(){
    $interval.cancel(timer);
  })
}])

.controller('incubatormonitorCtrl', ['$scope','$state','$interval','Result','Storage',function($scope, $state, $interval, Result, Storage) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  $scope.$on('$ionicView.enter', function(e) {
    $scope.result={
      "TestId": null,
      "ObjectNo": null,
      "ObjCompany": null,
      "ObjIncuSeq": null,
      "TestType": null,
      "TestStand": null,
      "TestEquip": null,
      "TestEquip2": null,
      "Description": null,
      "ProcessStartS": null,
      "ProcessStartE": null,
      "ProcessEndS": null,
      "ProcessEndE": null,
      "CollectStartS": null,
      "CollectStartE": null,
      "CollectEndS": null,
      "CollectEndE": null,
      "TestTimeS": null,
      "TestTimeE": null,
      "TestResult": null,
      "TestPeople": null,
      "TestPeople2": null,
      "ReStatus": 2,
      "RePeople": null,
      "ReTimeS": null,
      "ReTimeE": null,
      "ReDateTimeS": null,
      "ReDateTimeE": null,
      "ReTerminalIP": null,
      "ReTerminalName": null,
      "ReUserId": null,
      "ReIdentify": null,
      "FormerStep": null,
      "NowStep": null,
      "LaterStep": null,
      "GetObjectNo": 1,
      "GetObjCompany": 1,
      "GetObjIncuSeq": 1,
      "GetTestType": 0,
      "GetTestStand": 0,
      "GetTestEquip": 0,
      "GetTestEquip2": 0,
      "GetDescription": 0,
      "GetProcessStart": 0,
      "GetProcessEnd": 0,
      "GetCollectStart": 0,
      "GetCollectEnd": 0,
      "GetTestTime": 0,
      "GetTestResult": 0,
      "GetTestPeople": 0,
      "GetTestPeople2": 0,
      "GetReStatus": 0,
      "GetRePeople": 0,
      "GetReTime": 0,
      "GetRevisionInfo": 0,
      "GetFormerStep": 0,
      "GetNowStep": 0,
      "GetLaterStep": 0
    }
    $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
    $scope.resultinfos = {}
    var now = new Date()
    console.log("time",now);
    Result.GetResult($scope.result).then(
      function(data){
        $scope.resultinfos = data;
        console.log("resultinfos",$scope.resultinfos);
        angular.forEach($scope.resultinfos, function (value, key) {
          $scope.tubes = {
            "TestId": $scope.resultinfos[key].TestId,
            "TubeNo": null,
            "CultureId": null,
            "BacterId": null,
            "OtherRea": null,
            "IncubatorId": null,
            "Place": null,
            "StartTimeS": null,
            "StartTimeE": null,
            "EndTimeS": null,
            "EndTimeE": null,
            "AnalResult": null,
            "GetCultureId": 1,
            "GetBacterId": 1,
            "GetOtherRea": 1,
            "GetIncubatorId": 1,
            "GetPlace": 1,
            "GetStartTime": 1,
            "GetEndTime": 1,
            "GetAnalResult": 1
          }
          Result.GetResultTubes($scope.tubes).then(
            function(r){
              console.log("tubes",r)
              var starttime = new Date(r[0].StartTime)
              var endtime = new Date(r[0].EndTime)
              var time1 = now - starttime
              var time2 = endtime - now
              if (time1 > 24*60*60*1000) {
                time1 = parseInt(time1/86400000) + '天' + parseInt(time1%86400000/3600000) + '小时'
                console.log(time1)
              } else {
                time1 = parseInt(time1/3600000) + '小时' + parseInt(time1%3600000/60000) + '分'
              }
              if (time2 > 24*60*60*1000) {
                time2 = parseInt(time2/86400000) + '天' + parseInt(time2%86400000/3600000) + '小时'
                console.log(time2)
              } else if (time2 > 0) {
                time2 = parseInt(time2/3600000) + '小时' + parseInt(time2%3600000/60000) + '分'
              } else {
                time2 = '0分'
              }
              $scope.resultinfos[key].time1 = time1
              $scope.resultinfos[key].time2 = time2
          },function(e){
          });
        });
      },function(e){
    });
    // 根据任何筛选条件得到样品培养记录们的信息
  })
  
  var timer =  $interval(function(){
    $scope.resultinfos = {}
    var now = new Date()
    console.log("time",now);
    Result.GetResult($scope.result).then(
      function(data){
        $scope.resultinfos = data;
        console.log("resultinfos",$scope.resultinfos);
        angular.forEach($scope.resultinfos, function (value, key) {
          $scope.tubes = {
            "TestId": $scope.resultinfos[key].TestId,
            "TubeNo": null,
            "CultureId": null,
            "BacterId": null,
            "OtherRea": null,
            "IncubatorId": null,
            "Place": null,
            "StartTimeS": null,
            "StartTimeE": null,
            "EndTimeS": null,
            "EndTimeE": null,
            "AnalResult": null,
            "GetCultureId": 1,
            "GetBacterId": 1,
            "GetOtherRea": 1,
            "GetIncubatorId": 1,
            "GetPlace": 1,
            "GetStartTime": 1,
            "GetEndTime": 1,
            "GetAnalResult": 1
          }
          Result.GetResultTubes($scope.tubes).then(
            function(r){
              console.log("tubes",r)
              var starttime = new Date(r[0].StartTime)
              var endtime = new Date(r[0].EndTime)
              var time1 = now - starttime
              var time2 = endtime - now
              if (time1 > 24*60*60*1000) {
                time1 = parseInt(time1/86400000) + '天' + parseInt(time1%86400000/3600000) + '小时'
                console.log(time1)
              } else {
                time1 = parseInt(time1/3600000) + '小时' + parseInt(time1%3600000/60000) + '分'
              }
              if (time2 > 24*60*60*1000) {
                time2 = parseInt(time2/86400000) + '天' + parseInt(time2%86400000/3600000) + '小时'
                console.log(time2)
              } else if (time2 > 0) {
                time2 = parseInt(time2/3600000) + '小时' + parseInt(time2%3600000/60000) + '分'
              } else {
                time2 = '0分'
              }
              $scope.resultinfos[key].time1 = time1
              $scope.resultinfos[key].time2 = time2
          },function(e){
          });
        });
      },function(e){
    });
  },30000,-1);

  $scope.isStopTest = function (item) {  
      if (item == '紧急停止') {
        return 1
      } else {
        return 0
      }
  }

  $scope.$on('$ionicView.afterLeave',function(){
    $interval.cancel(timer);
  })
  
  $scope.GoMachineView = function (TestId) {
    $state.go('tab.machineviewinput')
    Storage.set('TestId',TestId)
  }
  
}])

.controller('monitor2controller', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  var show = true;
      $scope.isShown = function() {
        return show;
      };
      var show1 = true;
      $scope.toggle1 = function() {
        show1 = !show1;
      };
      $scope.isShown1 = function() {
        return show1;
      }; 

 
})

//培养箱实时温度-赵艳霞
.controller('opincubatorCtrl',['$scope','$ionicHistory' ,'$stateParams', '$ionicPopup', '$timeout', 'Socket', 'Chat','$log','chartTool',
  function($scope,$ionicHistory,$stateParams, $ionicPopup, $timeout, Socket, Chat,$log,chartTool) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
        
      }
  $scope.socket = Socket;
  $scope.$watch('$viewContentLoaded', function() {   
        $scope.sendT();
      }); 
  
  $scope.sendT = function(){
        
        $scope.test1=setInterval(draw_echarts1,3000);
        var opincubator1 = document.getElementById("opincubator1");
        var myChart1 = echarts.init(opincubator1);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: '培养箱温度',
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:['最新温度']
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    // var now = new Date();
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: '温度',
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:'最新温度',
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData ;

            var data0 = wendu.series[0].data;

            data0.shift();
            data0.push($scope.temp);

            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart1.setOption(wendu);
      }, 2100);  
    myChart1.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
    
      $scope.socket.emit('monitor', "1");
      var now = new Date(now - 2000);
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'');
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test1);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                $scope.sendT();
            }
          },
        ]
      });
    };
      
}])

//隔离器进料区实时参数-赵艳霞
.controller('FeedAreaCtrl', ['$scope','$ionicHistory','Socket','Chat','$stateParams' ,'$timeout','$ionicPopup',"Storage",
  function($scope,$ionicHistory,Socket,Chat,$stateParams,$timeout,$ionicPopup,Storage) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

  $scope.$watch('$viewContentLoaded', function() { 
        $scope.vitalInfo =$scope.options[0];  
        $scope.changeVitalInfo($scope.vitalInfo);
      });
  $scope.socket = Socket;


    $scope.options = [{"SignName":"进料区温度", "ItemType":"温度", "ItemCode":"最新温度","No":"0"},
                     {"SignName":"进料区湿度", "ItemType":"湿度","ItemCode":"最新湿度","No":"1"},
                     {"SignName":"进料区压力", "ItemType":"压力", "ItemCode":"最新压力","No":"2"},
                     {"SignName":"进料区风速","ItemType":"风速","ItemCode":"最新风速","No":"3"},
                     {"SignName":"进料区过氧化氢浓度", "ItemType":"H2O2","ItemCode":"最新过氧化氢浓度","No":"4"} 
                       ];
  
  //console.log($scope.vitalInfo);
    $scope.changeVitalInfo = function(option) {

        Storage.set('vitalInfo_No', option.No);
        clearInterval($scope.test1);   
        $scope.test1=setInterval(draw_echarts1,3000);
        var opisolator1 = document.getElementById("opisolator1");
        var myChart1 = echarts.init(opisolator1);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: option.SignName,
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:[option.ItemType]
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        //now = new Date(now - 2000);
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: option.ItemType,
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:option.ItemCode,
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData

            var data0 = wendu.series[0].data;
            data0.shift();
            data0.push($scope.temp);
            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart1.setOption(wendu);
      }, 2100); 
    myChart1.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
     $scope.socket.on('monitor', function(data){
            $scope.temp=data;
            console.log($scope.temp);
        });
      $scope.socket.emit('monitor', "1");
      var now = new Date();
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'')
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test1);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                var No=Storage.get('vitalInfo_No');
                console.log(parseInt(No));
                $scope.No = parseInt(No)
                $scope.changeVitalInfo($scope.options[$scope.No]);
            }
          },
        ]
      });
    };

      
                       
}])

//待加工区-赵艳霞
.controller('daijiagongCtrl', ['$scope','$ionicHistory','Socket','Storage' ,'$ionicPopup',function($scope,$ionicHistory,Socket,Storage,$ionicPopup) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

  $scope.$watch('$viewContentLoaded', function() { 
        $scope.vitalInfo =$scope.options[0];  
        $scope.changeVitalInfo($scope.vitalInfo);
      });
  $scope.socket = Socket;


    $scope.options = [{"SignName":"进料待加工区温度", "ItemType":"温度", "ItemCode":"最新温度","No":"0"},
                     {"SignName":"进料待加工区湿度", "ItemType":"湿度","ItemCode":"最新湿度","No":"1"},
                     {"SignName":"进料待加工区压力", "ItemType":"压力", "ItemCode":"最新压力","No":"2"},
                     {"SignName":"进料待加工区风速","ItemType":"风速","ItemCode":"最新风速","No":"3"},
                     {"SignName":"进料待加工区过氧化氢浓度", "ItemType":"H2O2","ItemCode":"最新过氧化氢浓度","No":"4"} 
                       ];
  
  //console.log($scope.vitalInfo);
    $scope.changeVitalInfo = function(option) {

        Storage.set('vitalInfo_No', option.No);
        clearInterval($scope.test2);   
        $scope.test2=setInterval(draw_echarts1,3000);
        var opisolator2 = document.getElementById("opisolator2");
        var myChart2 = echarts.init(opisolator2);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: option.SignName,
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:[option.ItemType]
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        //now = new Date(now - 2000);
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: option.ItemType,
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:option.ItemCode,
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData

            var data0 = wendu.series[0].data;
            data0.shift();
            data0.push($scope.temp);
            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart2.setOption(wendu);
      }, 2100); 
    myChart2.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
     $scope.socket.on('monitor', function(data){
            $scope.temp=data;
            console.log($scope.temp);
        });
      $scope.socket.emit('monitor', "1");
      var now = new Date();
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'')
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test2);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                var No=Storage.get('vitalInfo_No');
                console.log(parseInt(No));
                $scope.No = parseInt(No)
                $scope.changeVitalInfo($scope.options[$scope.No]);
            }
          },
        ]
      });
    }; 
      
 
}])

//加工区-赵艳霞
.controller('ProcessAreaCtrl', ['$scope','$ionicHistory','Socket','Storage','$ionicPopup',
  function($scope,$ionicHistory,Socket,Storage,$ionicPopup) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

  $scope.$watch('$viewContentLoaded', function() { 
        $scope.vitalInfo =$scope.options[0];  
        $scope.changeVitalInfo($scope.vitalInfo);
      });
  $scope.socket = Socket;


    $scope.options = [{"SignName":"加工区温度", "ItemType":"温度", "ItemCode":"最新温度","No":"0"},
                     {"SignName":"加工区湿度", "ItemType":"湿度","ItemCode":"最新湿度","No":"1"},
                     {"SignName":"加工区压力", "ItemType":"压力", "ItemCode":"最新压力","No":"2"},
                     {"SignName":"加工区风速","ItemType":"风速","ItemCode":"最新风速","No":"3"},
                     {"SignName":"加工区过氧化氢浓度", "ItemType":"H2O2","ItemCode":"最新过氧化氢浓度","No":"4"} 
                       ];
  
  //console.log($scope.vitalInfo);
    $scope.changeVitalInfo = function(option) {

        Storage.set('vitalInfo_No', option.No);
        clearInterval($scope.test3);   
        $scope.test3=setInterval(draw_echarts1,3000);
        var opisolator3 = document.getElementById("opisolator3");
        var myChart3 = echarts.init(opisolator3);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: option.SignName,
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:[option.ItemType]
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        //now = new Date(now - 2000);
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: option.ItemType,
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:option.ItemCode,
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData

            var data0 = wendu.series[0].data;
            data0.shift();
            data0.push($scope.temp);
            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart3.setOption(wendu);
      }, 2100); 
    myChart3.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
     $scope.socket.on('monitor', function(data){
            $scope.temp=data;
            console.log($scope.temp);
        });
      $scope.socket.emit('monitor', "1");
      var now = new Date();
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'')
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test3);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                var No=Storage.get('vitalInfo_No');
                console.log(parseInt(No));
                $scope.No = parseInt(No)
                $scope.changeVitalInfo($scope.options[$scope.No]);
            }
          },
        ]
      });
    };  
//}

}])

//待出料区-赵艳霞
.controller('MaterialWaitingCtrl', ['$scope','$ionicHistory','Socket' ,'Storage','$ionicPopup',
  function($scope,$ionicHistory,Socket,Storage,$ionicPopup) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

  $scope.$watch('$viewContentLoaded', function() { 
        $scope.vitalInfo =$scope.options[0];  
        $scope.changeVitalInfo($scope.vitalInfo);
      });
  $scope.socket = Socket;


    $scope.options = [{"SignName":"待出料区温度", "ItemType":"温度", "ItemCode":"最新温度","No":"0"},
                     {"SignName":"待出料区湿度", "ItemType":"湿度","ItemCode":"最新湿度","No":"1"},
                     {"SignName":"待出料区压力", "ItemType":"压力", "ItemCode":"最新压力","No":"2"},
                     {"SignName":"待出料区风速","ItemType":"风速","ItemCode":"最新风速","No":"3"},
                     {"SignName":"待出料区过氧化氢浓度", "ItemType":"H2O2","ItemCode":"最新过氧化氢浓度","No":"4"} 
                       ];
  
  //console.log($scope.vitalInfo);
    $scope.changeVitalInfo = function(option) {

        Storage.set('vitalInfo_No', option.No);
        clearInterval($scope.test4);   
        $scope.test4=setInterval(draw_echarts1,3000);
        var opisolator4 = document.getElementById("opisolator4");
        var myChart4 = echarts.init(opisolator4);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: option.SignName,
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:[option.ItemType]
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        //now = new Date(now - 2000);
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: option.ItemType,
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:option.ItemCode,
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData

            var data0 = wendu.series[0].data;
            data0.shift();
            data0.push($scope.temp);
            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart4.setOption(wendu);
      }, 2100); 
    myChart4.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
     $scope.socket.on('monitor', function(data){
            $scope.temp=data;
            console.log($scope.temp);
        });
      $scope.socket.emit('monitor', "1");
      var now = new Date();
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'')
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test4);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                var No=Storage.get('vitalInfo_No');
                console.log(parseInt(No));
                $scope.No = parseInt(No)
                $scope.changeVitalInfo($scope.options[$scope.No]);
            }
          },
        ]
      });
    };   
//}

}])

//出料区-赵艳霞
.controller('DischargeAreaCtrl', ['$scope','$ionicHistory','Socket' ,'Storage','$ionicPopup',
  function($scope,$ionicHistory,Socket,Storage,$ionicPopup) {
  $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

  $scope.$watch('$viewContentLoaded', function() { 
        $scope.vitalInfo =$scope.options[0];  
        $scope.changeVitalInfo($scope.vitalInfo);
      });
  $scope.socket = Socket;


    $scope.options = [{"SignName":"出料区温度", "ItemType":"温度", "ItemCode":"最新温度","No":"0"},
                     {"SignName":"出料区湿度", "ItemType":"湿度","ItemCode":"最新湿度","No":"1"},
                     {"SignName":"出料区压力", "ItemType":"压力", "ItemCode":"最新压力","No":"2"},
                     {"SignName":"出料区风速","ItemType":"风速","ItemCode":"最新风速","No":"3"},
                     {"SignName":"出料区过氧化氢浓度", "ItemType":"H2O2","ItemCode":"最新过氧化氢浓度","No":"4"} 
                       ];
  
  //console.log($scope.vitalInfo);
    $scope.changeVitalInfo = function(option) {

        Storage.set('vitalInfo_No', option.No);
        clearInterval($scope.test5);   
        $scope.test5=setInterval(draw_echarts1,3000);
        var opisolator5 = document.getElementById("opisolator5");
        var myChart5 = echarts.init(opisolator5);
        var app = {};
            wendu = null;
      wendu = {
            title: {
                text: option.SignName,
            //subtext: '纯属虚构'
              },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                      backgroundColor: '#283b56'
                    }
                 }
              },
            legend: {
                data:[option.ItemType]
              },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: false,
                start: 0,
                end: 100
            },
            xAxis: [{
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift($scope.time);
                        //now = new Date(now - 2000);
                    }
                  return res;
                })()
              },
              {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.push(len + 1);
                    }
                  return res;
                })()
              }],
            yAxis: [{
                type: 'value',
                scale: true,
                name: option.ItemType,
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }],
            series: [
              {
                name:option.ItemCode,
                type:'line',
                //xAxisIndex: 1,
                //yAxisIndex: 1,
                data:(function (){
                    var res = [];
                    var len = 0;
                    while (len < 10) {
                        res.push($scope.temp);
                        len++;
                      }
                  return res;
                })()
              }]
          };

        app.count = 11;
        setInterval(function (){
            axisData = $scope.axisData

            var data0 = wendu.series[0].data;
            data0.shift();
            data0.push($scope.temp);
            wendu.xAxis[0].data.shift();
            wendu.xAxis[0].data.push(axisData);
            wendu.xAxis[1].data.shift();
            wendu.xAxis[1].data.push(app.count++);

            myChart5.setOption(wendu);
      }, 2100); 
    myChart5.setOption(wendu);

  }
  draw_echarts1=function()
    {
      $scope.socket.on('message', function(test){
            $scope.temp=test;
            console.log($scope.temp);
        });
     $scope.socket.on('monitor', function(data){
            $scope.temp=data;
            console.log($scope.temp);
        });
      $scope.socket.emit('monitor', "1");
      var now = new Date();
      $scope.time=now.toLocaleTimeString().replace(/^\D*/,'')
      $scope.axisData=(new Date()).toLocaleTimeString().replace(/^\D*/,'');
    
    }
    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要终止监控？',
        title: '停止监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                clearInterval($scope.test5);
                $scope.socket.emit('logout');
            }
          },
        ]
      });
      };

      $scope.Start = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '您要开始监控？',
        title: '开始监控',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
                var No=Storage.get('vitalInfo_No');
                console.log(parseInt(No));
                $scope.No = parseInt(No)
                $scope.changeVitalInfo($scope.options[$scope.No]);
            }
          },
        ]
      });
    };   

}])



//侧边栏（包括监控、机器视觉、系统控制）--赵艳霞
.controller('SlidePageCtrl', ['$scope', '$ionicHistory', '$timeout', '$ionicModal', '$ionicSideMenuDelegate', '$http','$ionicListDelegate','extraInfo','$ionicPopup', '$state', 'Storage','Data', 
   function($scope, $ionicHistory, $timeout, $ionicModal, $ionicSideMenuDelegate, $http,$ionicListDelegate,extraInfo, $ionicPopup,$state,Storage, Data) {
      
    
      ///获取菜单栏列表数据
      // $http.get('data/catalog.json').success(function(data){
      //   $scope.catalog = data;
      // })
      $scope.catalog = [
        {
          "catalog":"加工隔离器任务监控",
          "catalogID":"monitor",
          "url":"img/icon/monitor.png"
        },
        {
          "catalog":"加注隔离器任务监控",
          "catalogID":"monitor2",
          "url":"img/icon/machine_view.png"
        },
        {
          "catalog":"培养箱任务监控",
          "catalogID":"incubatormonitor",
          "url":"img/icon/system_control.png"
        },
        {
          "catalog":"环境监测",
          "catalogID":"envimonitor",
          "url":"img/icon/Data_input.png"
        }
      ]
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      }
      $scope.lastviewtitle = $ionicHistory.backTitle();
      $scope.toPage = function(catalogID) {
        $state.go('tab.'+catalogID)
      }
      $scope.toDash = function() {
        $state.go('tab.dash')
      }
      $scope.toMonitor = function() {
        $state.go('tab.monitor')
      }
}])


//机器视觉-赵艳霞
.controller('machine_viewcontroller',['$scope','$ionicSlideBoxDelegate','$ionicNavBarDelegate','Pics','$state' ,function($scope,$ionicSlideBoxDelegate,$ionicNavBarDelegate,Pics,$state) {
  $scope.Pics = Pics.all();
  $scope.remove = function(Pic) {
    Pics.remove(chat);
  };
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.incubators=[
    {"id":1,"name":"培养箱1"},
    {"id":2,"name":"培养箱2"},
    {"id":3,"name":"培养箱3"},
    {"id":4,"name":"培养箱4"},
    {"id":5,"name":"培养箱5"},
    {"id":6,"name":"培养箱6"}
    ]
    $scope.testcubes=[
    {"id":1,"name":"试管1"},
    {"id":2,"name":"试管2"},
    {"id":3,"name":"试管3"},
    {"id":4,"name":"试管4"},
    {"id":4,"name":"试管5"},
    {"id":5,"name":"试管6"}
    ]
  $scope.slideIndex = 0;

  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
    console.log("slide Change");
    if ($scope.slideIndex == 0){
      console.log("slide 1");
      }
    else if ($scope.slideIndex == 1){
      console.log("slide 2");
    }
    else if ($scope.slideIndex == 2){
      console.log("slide 3");
    }
   };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  
  $scope.toMonitor = function(){
    $state.go('tab.monitor');   
  }
        
}])

//系统控制-赵艳霞
.controller('system_controlcontroller',['$scope','$ionicSlideBoxDelegate','$ionicNavBarDelegate','$state' ,'$http','$ionicPopup','$timeout',
  function($scope,$ionicSlideBoxDelegate,$ionicNavBarDelegate,$state,$http,$ionicPopup,$timeout) {
  $scope.contents=[{"background":"#F5FFFA"},{"background-color":"#F7F7F7"}]

  $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    $scope.lastviewtitle = $ionicHistory.backTitle();
  };

  $http.get('data/system_control.json').success(function(data){
        $scope.system_controls = data;
      });
  $scope.set_color = function (system_control) {
    if (system_control.OpStatus =='已完成') {
    return { color: "red" }
  }
  if(system_control.OpStatus =='未完成'){
    return { color: "green" }
  }
  if(system_control.OpStatus =='正在进行中'){
    return{color:'Coral'}
  }
    }

    $scope.Stop = function() {
      $scope.data = {}

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<center><img src="img/icon/system_control.png"  style="width: 100%;height: 200px"/></center> <br> 您要终止目前正在进行的操作？',
        title: '紧急停止',
        //subTitle: '您要终止目前正在进行的操作？',
        scope: $scope,
        buttons: [
          { text: '取消' },
          {
            text: '<b>确定</b>',
            type: 'button-positive',
            onTap: function(e) {
    
            }
          },
        ]
      });
      // myPopup.then(function(res) {
      //   console.log('Tapped!', res);
      // });
      // $timeout(function() {
      //    myPopup.close(); //close the popup after 3 seconds for some reason
      // }, 3000);
      };
        
}])

//数据录入-赵艳霞
.controller('Data_inputcontroller',['$scope','$ionicNavBarDelegate','$ionicSideMenuDelegate','$cordovaCalendar','Storage','$ionicPopover','$state','$rootScope','UserInfo','$http',
  function($scope,$ionicNavBarDelegate,$ionicSideMenuDelegate,$cordovaCalendar,Storage,$ionicPopover,$state,$rootScope,UserInfo,$http) {

  $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    $scope.lastviewtitle = $ionicHistory.backTitle();
  };
  $ionicPopover.fromTemplateUrl('popover-select-button.html', {
        scope: $scope,
      }).then(function(popover_others) {
        $scope.popover_others = popover_others;
      });

    
      $scope.selectPop = function(){
        $scope.popover_others.hide();
      };
      var div=document.getElementById('test');
      $scope.tasktype1="隔离器入样";
      $scope.tasktype2="隔离器出样";
      $scope.tasktype3="培养箱入样";
      $scope.tasktype4="培养箱检测";
      $scope.tasktype5="培养箱出样";
      $rootScope.tasktype='';

      //这里采用的是通过rootscope实现的，还可以通过params实现
      $scope.selectTask=function(tasktype){
        $scope.selectPop();
        //console.log(tasktype);
        
        
        $rootScope.tasktype=tasktype;
        console.log($rootScope.tasktype);
        $state.go('NewSample');

      }
     $http.get('data/PlanInfo.json').success(function(data){
        $scope.PlanInfo = data;

      });
     console.log($scope.PlanInfo);
      var data = {
      PatientId:Storage.get('UserId'),
      StartDate:'',
      EndDate:'',
      Module:'M1'
    };
    $("#myCalendar-1").ionCalendar({
    lang: "ch",                     // language
    sundayFirst: false,             // first week day
    years: "80",                    // years diapason
    format: "DD.MM.YYYY",           // date format
    onClick: function(date){        // click on day returns date
        getselecteddaytask(date);
    }
},UserInfo,[],data);
    var getselecteddaytask = function(date)
    {
      console.log(date);
      console.log(date.optiondata);
    
          
          $scope.tasklist = "这就是我";
     
    }
    // var lastindex = null;
    // $scope.showdetail = function(index)
    // {
    //   if(lastindex!=null && lastindex!=index)
    //   {
    //     $scope.showtasklist[lastindex].showdetail = false;
    //   }
    //   $scope.showtasklist[index].showdetail = !$scope.showtasklist[index].showdetail;
    //   lastindex = index;
    // }
      
    

  
        
}])

//数据录入之新建样品-赵艳霞
.controller('NewSampleCtrl',['$scope','$ionicNavBarDelegate','$ionicSideMenuDelegate','$state','$ionicLoading','Common','Storage','UserInfo','$rootScope',
  function($scope,$ionicNavBarDelegate,$ionicSideMenuDelegate,$state,$ionicLoading,Common,Storage,UserInfo,$rootScope) {

  $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    $scope.lastviewtitle = $ionicHistory.backTitle();
    $rootScope.tasktype='';
  };

  //监听事件
  $scope.$on('$ionicView.beforeEnter',function(){
        $scope.tasktype=$rootScope.tasktype;
        console.log($scope.tasktype);
  });
  
  
  $scope.Suppliers=[{Name:'鱼跃医疗',ID:"1"},
                   {Name:'万东医疗',ID:"2"},
                   {Name:'新华医疗',ID:"3"},
                   {Name:'科华生物',ID:"4"},
                   {Name:'东软股份',ID:"5"}
                    ]    
  $scope.ObjectNames= [{Name:'大肠杆菌显色培养基',ID:"1"},
                       {Name:'细菌总数显色培养基',ID:"2"},
                       {Name:'O157显色培养基',ID:"3"},
                       {Name:'沙门氏菌显色培养基',ID:"4"},
                       {Name:'金黄色葡萄球显色培养基',ID:"5"},
                       {Name:'霉菌和酵母菌显色培养基',ID:"6"},
                       {Name:'弧菌显色培养基',ID:"7"},
                       {Name:'坂崎杆菌显色培养基',ID:"8"},
                       {Name:'肠道菌增菌肉汤',ID:"9"},
                       {Name:'亚碲酸盐卵黄增菌液',ID:"10"}
                    ] 
  $scope.ObjectTypes=[ {Name:'细菌培养基',ID:"1"},
                      {Name:'放线菌培养基',ID:"2"},
                      {Name:'酵母菌培养基',ID:"3"},
                      {Name:'霉菌培养基',ID:"4"}
                    ] 
  $scope.UserId = Storage.get('UserId');
  $scope.GetUserName=[{
    "UserId": $scope.UserId,
    "GetUserName": 1
  }]
  
  UserInfo.GetUsersInfoByAnyProperty($scope.GetUserName[0]).then( function (data) {
         $scope.Recorder=data[0].UserName;       
        },function(error){

        });
      
  $scope.goMain = function() {
       $state.go('tab.dash'); 
  };
   $scope.saveVisitInfo = function(Type) {

        $ionicLoading.show({template: "新建样品保存成功", noBackdrop: true, duration: 700});
                     
  };
  Common.CurrentTime().then( function (data) {
               s=data.toJSON();
                  $scope.result=data.time;
                  $scope.result=$scope.result.substring(0,19); 
                  var dt={};
                  //$scope.result=new Date($scope.result).getFullYear().toString();
                  //var s="2016-05-09T15:01:10.0707697+08:00";
                  //$scope.result=new Date(s).getFullYear().toString();
                  //显示在界面上的时间
                   $scope.RecordTime= new Date($scope.result);
                   
                    //存储的时间格式
                    dt.year=$scope.RecordTime.getFullYear().toString();
                    dt.month=($scope.RecordTime.getMonth()+1).toString();
                    dt.day=$scope.RecordTime.getDate().toString();
                    dt.hour=$scope.RecordTime.getHours().toString();
                    dt.minute=$scope.RecordTime.getMinutes().toString();
                    dt.second=$scope.RecordTime.getSeconds().toString();
                    dt.fullTime=dt.year+'-'+dt.month+'-'+dt.day+' '+dt.hour+':'+dt.minute+':'+dt.second;

                    $scope.time=dt.fullTime;
                    console.log($scope.time);
  
          },function(error){
        });
     

  
        
}])

//退出登录-赵艳霞
.controller('setCtrl',['$http','$scope','$ionicPopup','$state', '$ionicActionSheet','$ionicModal', 'Storage', function($http,$scope,$ionicPopup,$state,$ionicActionSheet,$ionicModal,Storage) {
   ///获取菜单栏列表数据
      // $http.get('data/set.json').success(function(data){
      //   $scope.set = data;
      // })
      $scope.set = [
        {
          "set":"个人信息",
          "setID":"personalInfo",
          "url":"img/icon/touxiang.jpg"
        },
        {
          "set":"修改密码",
          "setID":"changepassword",
          "url":"img/icon/password.jpg"
        } 
      ]
      $scope.showActionsheet = function () {
        $ionicActionSheet.show({
          titleText: '退出后不会删除历史数据，下次登录依然可以使用本账号',
          buttons: [
            {
              text: '<i class="text-action" style="font-size:32px"><b>退出登录</b></i> ',
            },
          ],

          //destructiveText: 'Delete',
          cancelText: '<b>取消</b>',
          
          buttonClicked: function (index) {
            //return true;
            $state.go('signin');
            
          },
          cancelClicked: function () {
            console.log('取消');
            return true;
          },
          // destructiveButtonClicked: function () {
          //   console.log('DESTRUCT');
          //   return true;
          // }
        });
    };
    //退出账号

       $scope.signoutConfirm = function(a){
        if(a=="logout"){
          var myPopup = $ionicPopup.show({
            template: '<center>确定要退出登录吗?</center>',
            title: '退出',
            scope: $scope,
            buttons: [
              { text: '取消',
                type: 'button-small',
                onTap: function(e) {
                   //$state.go('tab.dash');
                }
              },
              {
                text: '<b>确定</b>',
                type: 'button-small button-positive ',
                onTap: function(e) {
                    $state.go('signin');
                    Storage.rm('Token')
                    Storage.rm('TerminalIP')
                }
              }
            ]
          });
        }
      }  
}])

//李泽南
.controller('ConfigCtrl', function($scope) {})

//环境-李泽南
.controller('EnvIncubatorCtrl',['$scope','$state','ItemInfo', function($scope,$state,ItemInfo) {
  $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"}
  ]
  $scope.envincubator={
    "IncubatorId": null,
    "MeaTimeS": null,
    "MeaTimeE": null,
    "Temperature": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetTemperature": 1,
    "GetRevisionInfo": 1
  }
  $scope.envincubatorinfos={};
  ItemInfo.GetIncubatorEnv($scope.envincubator).then(
    function(data){
      for(var i=0;i<data.length;i++){
        $scope.envincubatorinfos[i]=data[i];
      }
    },function(e){

    });
}])

//样品记录表-李泽南
.controller('ItemSampleCtrl', ['$scope','$state','ItemInfo','Common','extraInfo','Storage','$ionicModal','$ionicPopup',function($scope,$state,ItemInfo,Common,extraInfo,Storage,$ionicModal,$ionicPopup) {
   $scope.contents=[{"background-color":"#CCCCCC"},{"background-color":"#EBEBEB"}]
   $scope.others=[
    {"id":1,"name":"产品编号"},
    {"id":2,"name":"重检标识"},
    {"id":3,"name":"产品类型"},
    {"id":4,"name":"录入人员"},
    {"id":5,"name":"样品记录时间"},
    //{"id":6,"name":"取样方法"},
    //{"id":7,"name":"取样器具"},
    //{"id":8,"name":"取样量"},
    //{"id":9,"name":"分样方法"},
    {"id":6,"name":"样品容器"},
    {"id":7,"name":"注意事项"},
    {"id":8,"name":"更新时间"},
    {"id":9,"name":"终端IP"},
    {"id":10,"name":"终端名字"},
    {"id":11,"name":"用户名"},
    {"id":12,"name":"身份证"}
    //{"id":12,"name":"储存条件"}
    ]
    $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"用户名"},
    {"id":5,"name":"身份证"}
    ]
    $scope.$on("$ionicView.enter",function(){
      $scope.sample={
        "ObjectNo": null,
        "ObjCompany": null,
        "ObjIncuSeq": null,
        "ObjectName": null,
        "ObjectType": null,
        "SamplingPeople": null,
        "SamplingTimeS": null,
        "SamplingTimeE": null,
        "SamplingWay": null,
        "SamplingTool": null,
        "SamAmount": null,
        "DevideWay": null,
        "SamContain": null,
        "Warning": null,
        "SamSave": null,
        "ReDateTimeS": null,
        "ReDateTimeE": null,
        "ReTerminalIP": null,
        "ReTerminalName": null,
        "ReUserId": null,
        "ReIdentify": null,
        "GetObjectName": 1,
        "GetObjectType": 1,
        "GetSamplingPeople": 1,
        "GetSamplingTime": 1,
        "GetSamplingWay": 1,
        "GetSamplingTool": 1,
        "GetSamAmount": 1,
        "GetDevideWay": 1,
        "GetSamContain": 1,
        "GetWarning": 1,
        "GetSamSave": 1,
        "GetRevisionInfo": 1
      };
      $scope.sampleinfos={};
      $scope.selectother = $scope.others[0].id
      ItemInfo.GetSampleInfo($scope.sample).then(
        function(data){
          console.log('sample',data)
          for(var i=0;i<data.length;i++){
            $scope.sampleinfos[i]=data[i];
          }
        },function(e){
      });
    })
    $scope.toResult = function(ObjectNo,ObjIncuSeq,ObjCompany) {
    Storage.set('ObjectNo',ObjectNo);
    Storage.set('ObjIncuSeq',ObjIncuSeq);
    Storage.set('ObjCompany',ObjCompany);
    $state.go('tab.restestresult');
    }
    $ionicModal.fromTemplateUrl('templates/dash/newSample.html',{
    scope:$scope,
    animation:'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

     $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.Sam={
    "ObjCompany":"",
    "ObjectName":"",
    "ObjectType":"",
    "SamplingPeople":"",
    "SamplingTime":"",
    "Warning":"",
    "SamSave":""
    };
  }
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  $scope.Sam={
    "ObjCompany":"",
    "ObjectName":"",
    "ObjectType":"",
    "SamplingPeople":"",
    "Warning":"",
    "SamSave":""
  };
  $scope.confirm = function() {
    if($scope.Sam.ObjCompany==""){
      var alertPopup = $ionicPopup.alert({
        title:'供应商不能为空',
        template:'请输入正确的供应商',
        okText:'确定'
      });
      alertPopup.then(function(res){
        console.log('ObjectNo');
      });
    }
    else if($scope.Sam.ObjectName==""){
      var alertPopup = $ionicPopup.alert({
        title:'产品名字不能为空',
        template:'请输入正确的产品名字',
        okText:'确定'
      });
    }
    else if($scope.Sam.ObjectType!="SoB" && $scope.Sam.ObjectType!="SoS" && $scope.Sam.ObjectType!="Wsp"){
      var alertPopup = $ionicPopup.alert({
        title:'产品类型错误',
        template:'请选择SoB/SoS/Wsp中的一项',
        okText:'确定'
      });
    }
    else if($scope.Sam.SamplingPeople==""){
      var alertPopup = $ionicPopup.alert({
        title:'样品记录人员不能为空',
        template:'请输入正确的样品记录人员',
        okText:'确定'
      });
    }
    else{
      $scope.newsample={
        "ObjCompany":$scope.Sam.ObjCompany,
        "ObjectName":$scope.Sam.ObjectName,
        "ObjectType":$scope.Sam.ObjectType,
        "SamplingPeople":$scope.Sam.SamplingPeople,
        "SamplingTime":"",
        "Warning":$scope.Sam.Warning,
        "SamSave":$scope.Sam.SamSave,
        "TerminalIP":Storage.get('TerminalIP'),
        "TerminalName":extraInfo.postInformation().TerminalName,
        "revUserId":extraInfo.postInformation().revUserId
      }
      Common.CurrentTime().then(
        function(data){
          $scope.newsample.SamplingTime=data.time;
          console.log(data.time);
           ItemInfo.SetSampleData($scope.newsample).then(
            function(data){
              console.log(data);
              $scope.closeModal();
            },function(e){
              console.log($scope.newsample); 
            })
        },function(e){

        })
     
    }
  }

  }])
// 试剂信息-李泽南
.controller('ItemReagentCtrl', ['$scope','$state','ItemInfo','UserInfo','extraInfo','$ionicModal','$ionicPopup',function($scope,$state,ItemInfo,UserInfo,extraInfo,$ionicModal,$ionicPopup) {
  $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  // $scope.others=[
  //   {"id":1,"name":"试剂类型"},
  //   {"id":2,"name":"保质期"},
  //   {"id":3,"name":"试剂名字"},
  //   {"id":4,"name":"试剂适用性试验"},
  //   {"id":5,"name":"储存方法"},
  //   {"id":6,"name":"冗余信息"}
  // ]
  $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"},
    {"id":6,"name":"试剂名字"}
  ]
  $scope.reagent={    
    "ReagentId": null,
    "ProductDayS": null,
    "ProductDayE": null,
    "ReagentType": null,
    "ExpiryDayS": null,
    "ExpiryDayE": null,
    "ReagentName": null,
    "ReagentTest": null,
    "SaveCondition": null,
    "Description": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetProductDay": 1,
    "GetReagentType": 1,
    "GetExpiryDay": 1,
    "GetReagentSource": 1,
    "GetReagentName": 1,
    "GetReagentTest": 1,
    "GetSaveCondition": 1,
    "GetDescription": 1,
    "GetRevisionInfo": 1
  };
  $scope.reagentinfos={};
  $scope.selectrevision = $scope.revisioninfos[5].id
  ItemInfo.GetReagentInfo($scope.reagent).then(
    function(data){
      $scope.reagentinfos=data;
    },function(e){

    });
  $ionicModal.fromTemplateUrl('templates/dash/newReagent.html',{
    scope:$scope,
    animation:'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.Rea={
    "ProductDay":"",
    "ReagentType":"",
    "ExpiryDay":"",
    "ReagentName":"",
    "ReagentTest":"",
    "SaveCondition":"",
    "Description":""
  };
  }
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  $scope.Rea={
    "ProductDay":"",
    "ReagentType":"",
    "ExpiryDay":"",
    "ReagentName":"",
    "ReagentTest":"",
    "SaveCondition":"",
    "Description":""
  };
  UserInfo.GetReagentType().then(
    function(data){
      $scope.ReagentTypes=data;
    },function(e){

    })
  $scope.confirm = function() {
    // 日期正则
    var date=/((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/;
    if(!date.test($scope.Rea.ProductDay)){
      var alertPopup = $ionicPopup.alert({
        title:'无效的生产日期',
        template:'请输入正确的生产日期',
        okText:'确定'
      });
    }
    else if($scope.Rea.ReagentType==""){
      var alertPopup = $ionicPopup.alert({
        title:'试剂类型不能为空',
        template:'请输入正确的试剂类型',
        okText:'确定'
      });
    }
    else if(!date.test($scope.Rea.ExpiryDay)){
      var alertPopup = $ionicPopup.alert({
        title:'无效的保质期',
        template:'请输入正确的保质期',
        okText:'确定'
      });
    }
    else if($scope.Rea.ReagentName==""){
      var alertPopup = $ionicPopup.alert({
        title:'试剂名字不能为空',
        template:'请输入正确的试剂名字',
        okText:'确定'
      });
    }
    else if($scope.Rea.ReagentTest!="不需要" && $scope.Rea.ReagentTest!="通过" && $scope.Rea.ReagentTest!="未通过"){
      var alertPopup = $ionicPopup.alert({
        title:'试剂适用性试验错误',
        template:'请选择不需要/通过/未通过中的一项',
        okText:'确定'
      });
    }
    else{
      $scope.newreagent={
        "ReagentId":"",
        "ProductDay":$scope.Rea.ProductDay,
        "ReagentType":$scope.Rea.ReagentType,
        "ExpiryDay":$scope.Rea.ExpiryDay,
        "ReagentName":$scope.Rea.ReagentName,
        "ReagentTest":$scope.Rea.ReagentTest,
        "SaveCondition":$scope.Rea.SaveCondition,
        "Description":$scope.Rea.Description,
        "TerminalIP":Storage.get('TerminalIP'),
        "TerminalName":extraInfo.postInformation().TerminalName,
        "revUserId":extraInfo.postInformation().revUserId
      }
      ItemInfo.CreateReagentId($scope.Rea.ReagentType).then(
        function(data){
          $scope.newreagent.ReagentId=data.result;
          console.log(data);
          ItemInfo.SetReagentData($scope.newreagent).then(
            function(data){
              console.log(data);
              $scope.closeModal();
            },function(e){
              console.log($scope.newreagent);
            })
        },function(e){

        })
    }
  
  }
}])



// 无菌隔离器-李泽南
.controller('ItemIsolatorCtrl',['$scope','$state','$ionicModal','ItemInfo','Encryption',function($scope,$state,$ionicModal,ItemInfo,Encryption){
  $scope.p="jump";
  $scope.contents=[{"background-color":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"},
    {"id":6,"name":"参数描述"},
  ]
  $scope.isolator={
    "IsolatorId": null,
    "ProductDayS": null,
    "ProductDayE": null,
    "EquipPro": null,
    "InsDescription": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetProductDay": 1,
    "GetEquipPro": 1,
    "GetInsDescription": 1,
    "GetRevisionInfo": 1
  };
  $scope.isolatorinfos={};
  $scope.selectrevision = $scope.revisioninfos[5].id
  ItemInfo.GetIsolatorInfo($scope.isolator).then(
    function(data){
      
       $scope.isolatorinfos=data;
        var encryption = new Array();
        var decryption = new Array();
        for(var i=0;i<$scope.isolatorinfos.length;i++){
          encryption[i] = Encryption.FrontEncryption($scope.isolatorinfos[i].IsolatorId);
        }
        console.log(encryption);
        for(var j=0;j<$scope.isolatorinfos.length;j++){
          decryption[j] = Encryption.BackendDecryption(encryption[j]);
        }
        console.log(decryption);
      // var tmp=data[0].split("|",2);
      // $scope.isolatorinfos=[
      // {
      //   "isolatorid":tmp[0],
      //   "productday":null,
      //   "equippro":null,
      //   "insdescription":null,
      //   "revisioninfo":null
      // },
      // {
      //   "isolatorid":tmp[1],
      //   "productday":null,
      //   "equippro":null,
      //   "insdescription":null,
      //   "revisioninfo":null
      // }
      // ];
      // 最好改成json格式
     

      console.log($scope.isolatorinfos);
    },function(e){
    });
  $scope.field="IsolatorId";
  $scope.reverse=true;
  $ionicModal.fromTemplateUrl('templates/dash/mysort.html',{
    scope:$scope,
    animation:'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  }
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  $scope.sortbyPD = function() {
    $scope.field="ProductDay";
    $scope.closeModal();
  }
  $scope.sortbyEP = function() {
    $scope.field="EquipPro";
    $scope.closeModal();
  }
  $scope.sort = function() {
    $scope.openModal();
  }
  
 
}])
// 培养箱-李泽南
.controller('ItemIncubatorCtrl',['$scope','$state','ItemInfo',function($scope,$state,ItemInfo){
   $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
   $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"},
    {"id":6,"name":"参数描述"},
   ]
    $scope.incubator={
    "IncubatorId": null,
    "ProductDayS": null,
    "ProductDayE": null,
    "EquipPro": null,
    "InsDescription": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetProductDay": 1,
    "GetEquipPro": 1,
    "GetInsDescription": 1,
    "GetRevisionInfo": 1
    };
    
    $scope.showmenu = function (idid) {
      console.log("111")
      var next = document.getElementById(idid)
        next.style.display = (next.style.display =="none")?"":"none";
    }

    $scope.incubatorinfos={};
    $scope.selectrevision = $scope.revisioninfos[5].id
    ItemInfo.GetIncubatorInfo($scope.incubator).then(
    function(data){
      // var tmp=data[0].split("|",3);
      // $scope.incubatorinfos=[
      //   {
      //     "incubatorid":tmp[0],
      //     "productday":null,
      //     "equippro":null,
      //     "insdescription":null,
      //     "revisioninfo":null
      //   },
      //   {
      //     "incubatorid":tmp[1],
      //     "productday":null,
      //     "equippro":null,
      //     "insdescription":null,
      //     "revisioninfo":null
      //   }
      // ]
      for(var i=0;i<data.length;i++){
        $scope.incubatorinfos[i]=data[i];
      }
    },function(e){
    });
}])
// 无菌隔离器环境-李泽南
.controller('EnvIsolatorCtrl', ['$scope','$state','ItemInfo',function($scope,$state,ItemInfo) {
    $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
    $scope.revisioninfos=[
      {"id":1,"name":"更新时间"},
      {"id":2,"name":"终端IP"},
      {"id":3,"name":"终端名字"},
      {"id":4,"name":"终端用户ID"},
      {"id":5,"name":"终端用户身份证号"}
    ]
    $scope.envisolator={
    "IsolatorId": null,
    "CabinId": null,
    "MeaTimeS": null,
    "MeaTimeE": null,
    "IsoCode": null,
    "IsoValue": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetIsoCode": 1,
    "GetIsoValue": 1,
    "GetRevisionInfo": 1
    };
    $scope.envisolatorinfos={};
    ItemInfo.GetIsolatorEnv($scope.envisolator).then(
      function(data){
        for(var i=0;i<data.length;i++){
          $scope.envisolatorinfos[i]=data[i];
        }
      },function(e){

      });
}])
// 检测结果-李泽南
.controller('ResTestResultCtrl',['$scope','$state','Result','Storage','$ionicPopup',function($scope,$state,Result,Storage,$ionicPopup) {
  $scope.$on('$ionicView.beforeEnter', function() {
  
    console.log(Storage.get('ObjCompany')); 
    console.log($scope.result);

  });
  $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  $scope.others=[
    {"id":1,"name":"产品编号"},
    {"id":2,"name":"培养批次"},
    {"id":3,"name":"检测类型"},
    {"id":4,"name":"检测标准"},
    {"id":5,"name":"使用仪器"},
    {"id":6,"name":"检测过程"},
    {"id":7,"name":"集菌开始"},
    {"id":8,"name":"集菌结束"},
    {"id":9,"name":"检测时间"},
    {"id":10,"name":"检测结果"},
    {"id":11,"name":"检测人员"},
    {"id":12,"name":"是否复核"},
    {"id":13,"name":"复核人员"},
    {"id":14,"name":"复核时间"},
    {"id":15,"name":"更新时间"},
    {"id":16,"name":"终端IP"},
    {"id":17,"name":"终端名字"},
    {"id":18,"name":"终端用户ID"},
    {"id":19,"name":"终端用户身份证号"}
  ]
  $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"}
  ]
  $scope.$on("$ionicView.enter",function(){
     $scope.result={
        "TestId": null,
        "ObjectNo":Storage.get('ObjectNo'),
        "ObjCompany": Storage.get('ObjCompany'),
        "ObjIncuSeq":Storage.get('ObjIncuSeq'),
        "TestType": null,
        "TestStand": null,
        "TestEquip": null,
        "Description": null,
        "CollectStartS": null,
        "CollectStartE": null,
        "CollectEndS": null,
        "CollectEndE": null,
        "TestTimeS": null,
        "TestTimeE": null,
        "TestResult": null,
        "TestPeople": null,
        "ReStatus": null,
        "RePeople": null,
        "ReTimeS": null,
        "ReTimeE": null,
        "ReDateTimeS": null,
        "ReDateTimeE": null,
        "ReTerminalIP": null,
        "ReTerminalName": null,
        "ReUserId": null,
        "ReIdentify": null,
        "GetObjectNo": 1,
        "GetObjCompany": 1,
        "GetObjIncuSeq": 1,
        "GetTestType": 1,
        "GetTestStand": 1,
        "GetTestEquip": 1,
        "GetDescription": 1,
        "GetCollectStart": 1,
        "GetCollectEnd": 1,
        "GetTestTime": 1,
        "GetTestResult": 1,
        "GetTestPeople": 1,
        "GetReStatus": 1,
        "GetRePeople": 1,
        "GetReTime": 1,
        "GetRevisionInfo": 1
      };
    console.log($scope.result);
    $scope.selectother = $scope.others[0].id
    $scope.resultinfos={};
      Result.GetResult($scope.result).then(
        function(data){
          // for(var i=0;i<data.length;i++){
          //   $scope.resultinfos[i]=data[i];
          //   console.log($scope.result);
          // }
          $scope.resultinfos = data;
          // 跳转至监控 
          // if(data.length==0){
          //   var confirmPopup = $ionicPopup.confirm({
          //       title:'跳转至监控',
          //       template:'是否要跳转至监控页面？',
          //       cancelText:'取消',
          //       okText:'确认'
          //     });
          //     confirmPopup.then(function(res){
          //       if(res){
          //         // monitor
          //         $state.go('tab.monitor');
          //         console.log('ok');
          //       }else{
          //         console.log('cancel');
          //       }
          //     });
          //   };
            // data为空/data检测结果为空
          for(var i=0;i<data.length;i++){
            var flag=data[i].TestResult;

            // flag==null
            if(flag==null&&Storage.get('ObjCompany')!=null){

              var confirmPopup = $ionicPopup.confirm({
                title:'跳转至监控',
                template:'是否要跳转至监控页面？',
                cancelText:'取消',
                okText:'确认'
              });
              confirmPopup.then(function(res){
                if(res){
                  // monitor
                  $state.go('tab.itemisolator');
                  console.log('ok');
                }else{
                  console.log('cancel');
                }
              });
              break;
            }; 
          }
          console.log($scope.result);
        },function(e){
          console.log($scope.result);
        });
  });

   $scope.GoMachineView = function(){
    $state.go('tab.machineview');   
  }
     
  $scope.$on('$ionicView.afterLeave', function() {
    Storage.rm('ObjectNo');
    Storage.rm('ObjIncuSeq');
    Storage.rm('ObjCompany');
  });
}])

.controller('MachineViewCtrl',['$scope','$ionicSlideBoxDelegate','$ionicNavBarDelegate','Pics','$state' ,function($scope,$ionicSlideBoxDelegate,$ionicNavBarDelegate,Pics,$state) {
  $scope.Pics = Pics.all();
  $scope.remove = function(Pic) {
    Pics.remove(chat);
  };
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  $scope.incubators=[
    {"id":1,"name":"培养箱1"},
    {"id":2,"name":"培养箱2"},
    {"id":3,"name":"培养箱3"},
    {"id":4,"name":"培养箱4"},
    {"id":5,"name":"培养箱5"},
    {"id":6,"name":"培养箱6"}
    ]
    $scope.testcubes=[
    {"id":1,"name":"试管1"},
    {"id":2,"name":"试管2"},
    {"id":3,"name":"试管3"},
    {"id":4,"name":"试管4"},
    {"id":4,"name":"试管5"},
    {"id":5,"name":"试管6"}
    ]
  $scope.slideIndex = 0;

  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
    console.log("slide Change");
    if ($scope.slideIndex == 0){
      console.log("slide 1");
      }
    else if ($scope.slideIndex == 1){
      console.log("slide 2");
    }
    else if ($scope.slideIndex == 2){
      console.log("slide 3");
    }
   };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  
  $scope.toMonitor = function(){
    $state.go('tab.monitor');   
  }
        
}])

.controller('MachineViewInputCtrl',['$scope','$ionicSlideBoxDelegate','$ionicNavBarDelegate','Pics','$state','Result','Storage' ,function($scope,$ionicSlideBoxDelegate,$ionicNavBarDelegate,Pics,$state,Result,Storage) {
  
  $scope.$on('$ionicView.enter', function(e) {
    $scope.result = {
      "TestId": Storage.get('TestId'),
      "TubeNo": null,
      "PictureId": null,
      "CameraTimeS": null,
      "CameraTimeE": null,
      "ImageAddress": null,
      "AnalResult": null,
      "GetCameraTime": 1,
      "GetImageAddress": 1,
      "GetAnalResult": 1
    }
    $scope.resultinfos={}
    $scope.Pics = []
    Result.GetTestPictures($scope.result).then(
      function(data){
        $scope.resultinfos = data
        console.log('resultinfos',$scope.resultinfos)
        $scope.Pics = []
        angular.forEach($scope.resultinfos, function (value, key) {
          if (value.TubeNo == 1) {
            $scope.Pics.push(
              { "Address" : "http://121.43.107.106:8063" + value.ImageAddress,
                "Result" : value.AnalResult,
                "Time": value.CameraTime
              }
            )
          }   
        });
        console.log("Pics", $scope.Pics)
      },function(e){
    });

  })

  $scope.getReult = function(TubeNo)  {
    $scope.Pics = []
    console.log("TubeNo", TubeNo)
    angular.forEach($scope.resultinfos, function (value, key) {
      if (value.TubeNo == TubeNo) {
        $scope.Pics.push(
          { "Address" : "http://121.43.107.106:8063" + value.ImageAddress,
            "Result" : value.AnalResult,
            "Time": value.CameraTime
          }
        )
      }   
    });
    console.log("Pics", $scope.Pics)
  }

  
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
  };
  
  $scope.testtubes=[
    {"id":1,"name":"试管1"},
    {"id":2,"name":"试管2"},
    {"id":3,"name":"试管3"},
    {"id":4,"name":"试管4"},
    {"id":5,"name":"试管5"},
    {"id":6,"name":"试管6"}
  ]
  $scope.selecttube = 1
  $scope.slideIndex = 0;

  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
    console.log("slide Change");
    if ($scope.slideIndex == 0){
      console.log("slide 1");
      }
    else if ($scope.slideIndex == 1){
      console.log("slide 2");
    }
    else if ($scope.slideIndex == 2){
      console.log("slide 3");
    }
   };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };
  
  $scope.toMonitor = function(){
    $state.go('tab.monitor');   
  }
        
}])

.controller('BreakDownCtrl', ['$scope','$state','Result', function($scope,$state,Result) {
  $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  $scope.excepinfos=[
    {"id":1,"name":"异常参数"},
    {"id":2,"name":"异常值"}
  ]

  $scope.breakdown={
    "BreakId": null,
    "BreakTimeS": null,
    "BreakTimeE": null,
    "BreakEquip": null,
    "BreakPara": null,
    "BreakValue": null,
    "BreakReason": null,
    "ResponseTimeS": null,
    "ResponseTimeE": null,
    "GetBreakTime": 1,
    "GetBreakEquip": 1,
    "GetBreakPara": 1,
    "GetBreakValue": 1,
    "GetBreakReason": 1,
    "GetResponseTime": 1
  }

  $scope.breakdowninfos={};
  Result.GetBreakDownInfo($scope.breakdown).then(
    function(data){
      for(var i=0;i<data.length;i++){
        $scope.breakdowninfos[i]=data[i];
      }
    },function(e){

    });


}])
// 仪器操作-李泽南
.controller('OpEquipmentCtrl',['$scope','$state','Operation','$ionicHistory', function($scope,$state,Operation,$ionicHistory) {
  $scope.contents=[{"background":"#CCCCCC"},{"background-color":"#EBEBEB"}]
  $scope.others=[
    {"id":1,"name":"操作时间"},
    {"id":2,"name":"操作编码"},
    {"id":3,"name":"操作参数"},
    {"id":4,"name":"操作结果"}
  ]
  $scope.revisioninfos=[
    {"id":1,"name":"更新时间"},
    {"id":2,"name":"终端IP"},
    {"id":3,"name":"终端名字"},
    {"id":4,"name":"终端用户ID"},
    {"id":5,"name":"终端用户身份证号"}
  ]
  $scope.opequipment={
    "EquipmentId": null,
    "OperationNo": null,
    "OperationTimeS": null,
    "OperationTimeE": null,
    "OperationCode": null,
    "OperationValue": null,
    "OperationResult": null,
    "ReDateTimeS": null,
    "ReDateTimeE": null,
    "ReTerminalIP": null,
    "ReTerminalName": null,
    "ReUserId": null,
    "ReIdentify": null,
    "GetOperationTime": 1,
    "GetOperationCode": 1,
    "GetOperationValue": 1,
    "GetOperationResult": 1,
    "GetRevisionInfo": 1
  };
  // 可以根据Storage存值判断iso还是inc，进行筛选
  $scope.opequipmentinfos={};
  Operation.GetEquipmentOps($scope.opequipment).then(
    function(data){
      for(var i=0;i<data.length;i++){
        $scope.opequipmentinfos[i]=data[i];
      }
    },function(e){

    });
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  };
}])

.controller('AuthorityCtrl',['$scope',function($scope) {
  $scope.bgcolor1="#CDCDB4";
  $scope.bgcolor2="#CDCDB4";
  $scope.bgcolor3="#CDCDB4";
  $scope.bgcolor4="#CDCDB4";
  $scope.edcolor1="#CDCDB4";
  $scope.edcolor2="#CDCDB4";
  $scope.aur1=true;
  $scope.aur2=true;
  
  // 从数据库取，true或false

  $scope.selectAur1 = function(){
    if($scope.bgcolor1=="#CDCDB4") {
      $scope.bgcolor1="#6495ED";

    }
    else $scope.bgcolor1="#CDCDB4";
  }
  $scope.selectAur2 = function(){
    if($scope.bgcolor2=="#CDCDB4") $scope.bgcolor2="#6495ED";
    else $scope.bgcolor2="#CDCDB4";
  }
  $scope.selectAur3 = function(){
    if($scope.bgcolor3=="#CDCDB4") $scope.bgcolor3="#6495ED";
    else $scope.bgcolor3="#CDCDB4";
  }
  $scope.selectAur4 = function(){
    if($scope.bgcolor4=="#CDCDB4") $scope.bgcolor4="#6495ED";
    else $scope.bgcolor4="#CDCDB4";
  }
   $scope.selected1 = function(){
    if($scope.edcolor1=="#CDCDB4") {
      $scope.edcolor1="#6495ED";
       $scope.bgcolor1="#CDCDB4";
       $scope.bgcolor2="#CDCDB4";
       $scope.bgcolor3="#CDCDB4";
       $scope.bgcolor4="#CDCDB4";
       // 点击已有权限则取消对所有权限的选择
    }
    else $scope.edcolor1="#CDCDB4";
  }
   $scope.selected2 = function(){
    if($scope.edcolor2=="#CDCDB4") {
      $scope.edcolor2="#6495ED";
       $scope.bgcolor1="#CDCDB4";
       $scope.bgcolor2="#CDCDB4";
       $scope.bgcolor3="#CDCDB4";
       $scope.bgcolor4="#CDCDB4";
       // 点击已有权限则取消对所有权限的选择先写两个 其他同理
    }
    else $scope.edcolor1="#CDCDB4";
  }
  $scope.Add = function(){
    if(($scope.bgcolor1=="#6495ED") && ($scope.aur1==true)){
      $scope.aur1=false;
      $scope.bgcolor1="#CDCDB4";
    } 
    if(($scope.bgcolor2=="#6495ED") && ($scope.aur2==true)){
      $scope.aur2=false;
      $scope.bgcolor2="#CDCDB4";
    }
  }
  $scope.Remove = function(){
    if(($scope.edcolor1=="#6495ED") && ($scope.aur1==false)){
      $scope.aur1=true;
      $scope.edcolor1="#CDCDB4";
    }
    if(($scope.edcolor2=="#6495ED") && ($scope.aur2==false)){
      $scope.aur2=true;
      $scope.edcolor2="#CDCDB4";
    }
  }
}]);
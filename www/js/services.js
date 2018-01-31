angular.module('zjubme.services', ['ionic','btford.socket-io','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://121.43.107.106:8063/Api/v1/',
  
  })
  
.factory('Socket', function(socketFactory){
  var myIoSocket = io.connect('http://121.43.107.106:4000');
  mySocket = socketFactory({
    ioSocket: myIoSocket
  });
  return mySocket;
})

.factory('Users', function($log){
    var usernames = [];
    usernames.numUsers = 0;

    return {
      getUsers: function(){
        return usernames;
      },
      addUsername: function(username){
        usernames.push(username);
      },
      deleteUsername: function(username){
        var index = usernames.indexOf(username);
        if(index != -1){
          usernames.splice(index, 1);
        }
      },
      setNumUsers: function(data){
        $log.info('user number set '+data.numUsers);
        usernames.numUsers = data.numUsers;
      }
  };
})

.factory('Chat', function($ionicScrollDelegate, Socket, Users){

  var username;
  var users = {};
  users.numUsers = 0;

  var messages = [];
  var TYPING_MSG = '. . .';

  var Notification = function(username,message){
    var notification          = {};
    notification.username     = username;
    notification.message      = message;
    notification.notification = true;
    return notification;
  };

  Socket.on('login', function (data) {
    Users.setNumUsers(data);
  });

  Socket.on('new message', function(msg){
      addMessage(msg);
  });

  Socket.on('typing', function (data) {
    var typingMsg = {
      username: data.username,
      message: TYPING_MSG
    };
    addMessage(typingMsg);
  });

  Socket.on('stop typing', function (data) {
    removeTypingMessage(data.username);
  });

  Socket.on('user joined', function (data) {
    var msg = data.username + ' joined';
    var notification = new Notification(data.username,msg);
    addMessage(notification);
    Users.setNumUsers(data);
    Users.addUsername(data.username);
  });

  Socket.on('user left', function (data) {
    var msg = data.username + ' left';
    var notification = new Notification(data.username,msg);
    addMessage(notification);
    Users.setNumUsers(data);
    Users.deleteUsername(data.username);
  });

  var scrollBottom = function(){
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollBottom(true);
  };

  var addMessage = function(msg){
    msg.notification = msg.notification || false;
    messages.push(msg);
    scrollBottom();
  };

  var removeTypingMessage = function(usr){
    for (var i = messages.length - 1; i >= 0; i--) {
      if(messages[i].username === usr && messages[i].message.indexOf(TYPING_MSG) > -1){
        messages.splice(i, 1);
        scrollBottom();
        break;
      }
    }
  };

  return {
    getUsername: function(){
      return username;
    },
    setUsername: function(usr){
      username = usr;
    },
    getMessages: function() {
      return messages;
    },
    sendMessage: function(msg){
      messages.push({
        username: username,
        message: msg
      });
      scrollBottom();
      Socket.emit('new message', msg);
    },
    scrollBottom: function(){
      scrollBottom();
    }
  };
})
.factory('chartTool',['CONFIG',function(CONFIG){
var serve={};

  serve.initBar = function(seriesName,data,total){
    return {
      title:{
        text : "手术量: " + total + " 例",       //需要改样式
        left : 'center',
        top : 20,
        textStyle: {
          color: '#000',
          fontWeight: 'bolder',
          fontSize: 25
        }
      },
      tooltip : {
        trigger : 'axis',
        axisPointer : {
          type :'shadow'
        },
        formatter : "{a} <br/>{b} : {c}"
      },
      toolbox: {
        feature :{
          dataView :{readOnly :true},
          magicType :{type :['line','bar']},
          restore :{},
          saveAsImage :{}
        }
      },
      xAxis : [{
          type : 'category',
          name : "手术等级",
          nameLocation : 'middle',
          //类目数据,必须，否则bar下面没有类目名字
          data : (function(){
            return data.map(function(d){
              return d.name;
            })
          })()
          
        }
      ],
      yAxis : [{
          type : 'value',
          splitArea : {
            show : true
          }
        }
      ],
      series : [{
          name : seriesName,
          type : 'bar',
          label : {
            normal:{
              show : true,
              position : 'insideTop',
              // formatter: '{b}: {c}',
              textStyle:{fontSize:15 }           
            }
          }, 
          data : data
        }
      ]

    }
  }
serve.initBar1 = function(){
    return {
      title:{
        text : "titleName",       //需要改样式
        subtext: '纯属虚构'
      },
      tooltip : {
        trigger : 'axis',
        axisPointer : {
          type :'cross',
          label: {
                backgroundColor: '#283b56'
            }
        }
      },
      legend: {
        data:['最新成交价', '预购队列']
    },
      toolbox: {
          show: true,
          feature :{
            dataView :{readOnly :false},
            restore :{},
            saveAsImage :{}
        }
      },
      dataZoom: {
        show: false,
        start: 0,
        end: 100
    },
      xAxis : [{
          type : 'category',
          boundaryGap: true,
          //类目数据,必须，否则bar下面没有类目名字
          data: axisData
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
        }

      ],
      yAxis : [{
          type : 'value',
          scale: true,
            name: '价格',
            max: 30,
            min: 0,
            boundaryGap: [0.2, 0.2]
        },
        {
            type: 'value',
            scale: true,
            name: '预购量',
            max: 1200,
            min: 0,
            boundaryGap: [0.2, 0.2]
        }
      ],
      series : [{
            name:'预购队列',
            type:'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data:(function (){
                var res = [];
                var len = 10;
                while (len--) {
                    res.push(Math.round(Math.random() * 1000));
                }
                return res;
            })()
        },
        {
            name:'最新成交价',
            type:'line',
            data:(function (){
                var res = [];
                var len = 0;
                while (len < 10) {
                    res.push((Math.random()*10 + 5).toFixed(1) - 0);
                    len++;
                }
                return res;
            })()
        }
      ]

    }
  }

  serve.getOptionBar1 = function(data){
    return {
      title : {text : data.title },
      legend : {data : data.data.map(function(d){return d.name}) },
      series : [{data : data.data}]
    }
  }
  
serve.getOptionBar = function(data){
    return {
      title : {text : data.title },
      xAxis : {data : data.data.map(function(d){return {value:d.name,textStyle:{color:'#678',fontSize:16}}})},
      series : [{data : data.data}]
    }
  }

 serve.OpeAmountData = [
            {value: 3, name: '一级',},
            {value: 12, name: '二级'},
            {value: 26, name: '三级'},
            {value: 8, name: '四级'}
            ];
    
  return serve;
}])

// 权限
.factory('angularPermission', ['$rootScope',function ($rootScope) {
    var userPermissionList;
    return {
      setPermissions: function(permissions) {
        userPermissionList = permissions;
        $rootScope.$broadcast('permissionsChanged')
      },
      hasPermission: function (permission) {
        if(userPermissionList.indexOf(permission.trim()) > -1){
          return true;
        }else{
          return false;
        }
      }
   };
  }])
.factory('httpResponsePermissionInterceptor',['$q','$location',function ($q,$location) {
    return function (promise) {
      return promise.then(function (response) {
          // http response Normal,you can alse to something here like notify
          return response;
        }, function (response) {
          if(response.status === 403 || response.status === 401) {
            // http response status code 403 or 401 that means use has no permission
            // here I redirect page to '/unauthorized',you can alse do anything you want
            $location.path('/authority');
            return $q.reject(response);
          }
          return $q.reject(response);
      });
    };
  }])

// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function(key, value) {
      $window.localStorage.setItem(key, value);
    },
    get: function(key) {
      return $window.localStorage.getItem(key);
    },
    rm: function(key) {
      $window.localStorage.removeItem(key);
    },
    clear: function() {
      $window.localStorage.clear();
    }
  };
}])
.factory('Data',['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){
   var serve={};
   var abort = $q.defer();
   var getToken=function(){
     return Storage.get('TOKEN') ;
   }

  var Common = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'Common'},{
        CurrentTime:{method:'GET', params:{route: 'CurrentTime'}, timeout: 10000},
      });
    };
   var UserInfo = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'UserInfo'},{
        GetReagentType:{method:'GET',params:{route:'MstReagentTypeGetAll'},timeout:10000,isArray:true},
        Register:{method:'POST', params:{route: 'MstUserRegister'}, timeout: 10000},
        NewUserId:{method:'GET',params:{route:'MstUserCreateNewUserId',PhoneNo:'@PhoneNo'},timeout:10000},
        GetUserId:{method:'GET',params:{route:'MstUserGetUserByPhoneNo',PhoneNo:'@PhoneNo'},timeout:10000},
        LogOn:{method:'POST', params:{route: 'MstUserLogin'}, timeout: 10000},
        ChangePassword:{method:'POST',params:{route:'MstUserChangePassword'},timeout: 10000},
        GetUserInfo:{method:'GET',params:{route:'MstUserGetUserInfo',UserId:'@UserId',Identify:'@Identify',PhoneNo:'@PhoneNo',
                    UserName:'@UserName',Role:'@Role',Password:'@Password',LastLoginTime:'@LastLoginTime',RevisionInfo:'@RevisionInfo'},timeout:10000},
        UpdateUserInfo:{method:'POST', params:{route: 'MstUserUpdateUserInfo'}, timeout: 10000},
        GetUsersInfoByAnyProperty:{method:'POST', params:{route: 'MstUserGetUsersInfoByAnyProperty'}, timeout: 10000,isArray:true},
      });
    };
    var ItemInfo = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{
        path:'ItemInfo',
      },{
        CreateReagentId:{method:'GET',params:{route:'ItemReagentCreateReagentId',ReagentType:'@ReagentType'},timeout:10000},
        SetReagentData:{method:'POST',params:{route:'ItemReagentSetData'},timeout:10000},
        SetSampleData:{method:'POST',params:{route:'ItemSampleCreateNewSample'},timeout:10000,isArray:true},
        GetIsolatorInfo:{method:'POST',params:{route:'ItemIsolatorGetIsolatorsInfoByAnyProperty'},timeout:10000,isArray:true},
        GetIncubatorInfo:{method:'POST',params:{route:'ItemIncubatorGetIncubatorsInfoByAnyProperty'},timeout:10000,isArray:true},
        GetReagentInfo:{method:'POST',params:{route:'ItemReagentGetReagentsInfoByAnyProperty'},timeout:10000,isArray:true},
        GetSampleInfo:{method:'POST',params:{route:'ItemSampleGetSamplesInfoByAnyProperty'},timeout:10000,isArray:true},
        GetIncubatorEnv:{method:'POST',params:{route:'EnvIncubatorGetIncubatorEnvsByAnyProperty'},timeout:10000,isArray:true},
        GetIsolatorEnv:{method:'POST',params:{route:'EnvIsolatorGetIsolatorEnvsByAnyProperty'},timeout:10000,isArray:true},
        GetNewIsolatorEnv:{method:'GET',params:{route:'EnvIsolatorGetNewIsolatorEnv'},timeout:10000,isArray:true},
        GetNewIncubatorEnv:{method:'GET',params:{route:'EnvIncubatorGetNewIncubatorEnv'},timeout:10000,isArray:true}
      })
    };
    var Operation = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{
        path:'Operation',
      },{
        GetEquipmentOps:{method:'POST',params:{route:'OpEquipmentGetEquipmentOpsByAnyProperty'},timeout:10000,isArray:true},
        GetOperationOrders:{method:'POST',params:{route:'MstOperationOrdersBySampleType'},timeout:10000,isArray:true}
      })
    };
    var Result = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{
        path:'Result',
      },{
        GetResult:{method:'POST',params:{route:'ResTestResultGetResultInfosByAnyProperty'},timeout:10000,isArray:true},
        GetBreakDownInfo:{method:'POST',params:{route:'BreakDownGetBreakDownsByAnyProperty'},timeout:10000,isArray:true},
        GetResultTubes:{method:'POST',params:{route:'ResIncubatorGetResultTubesByAnyProperty'},timeout:10000,isArray:true},
        GetTestPictures:{method:'POST',params:{route:'ResTestPictureGetTestPicturesByAnyProperty'},timeout:10000,isArray:true}
      })
    };
   
    
    serve.abort = function ($scope) {
    abort.resolve();
    $interval(function () {
      abort = $q.defer();
      serve.Common = Common();
      serve.UserInfo = UserInfo(); 
      serve.ItemInfo = ItemInfo();
      serve.Operation = Operation();
      serve.Result = Result();
     
      }, 0, 1);
    };
    serve.Common = Common();
    serve.UserInfo = UserInfo();
    serve.ItemInfo = ItemInfo();
    serve.Operation = Operation();
    serve.Result = Result();
    return serve;
}])

.factory('Common',['$http','$q' , 'Storage','Data', function($http,$q,Storage, Data){  
    var self = this;
    
      self.CurrentTime = function(){
      var deferred = $q.defer();
      Data.Common.CurrentTime(function(s){
              deferred.resolve(s);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    };
  return self;
}])

.factory('UserInfo',['$http','$q' , 'Storage','Data', 'extraInfo', function($http,$q,Storage, Data,extraInfo){  
    var self = this;
    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    

      self.Register = function(data){
      var deferred = $q.defer();
      Data.UserInfo.Register(data,
        function(s){
              deferred.resolve(s);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    };
     self.NewUserId = function(_PhoneNo){
    
      var deferred = $q.defer();
        Data.UserInfo.NewUserId({PhoneNo: _PhoneNo},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
    };
      self.GetUserId = function(_PhoneNo){
    
      var deferred = $q.defer();
        Data.UserInfo.GetUserId({PhoneNo: _PhoneNo},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
    };
    self.LogOn = function(_UserId,_InPassword){
    
      var deferred = $q.defer();
      Data.UserInfo.LogOn({UserId:_UserId, InPassword:_InPassword, "TerminalIP": extraInfo.postInformation().TerminalIP,"revUserId": extraInfo.postInformation().revUserId},
        function(s){
              deferred.resolve(s);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    };
    self.ChangePassword = function(_UserId,_OldPassword,_NewPassword){
      var deferred = $q.defer();
        Data.UserInfo.ChangePassword({UserId:_UserId,OldPassword:_OldPassword, NewPassword: _NewPassword, "TerminalIP": extraInfo.postInformation().TerminalIP , "revUserId": extraInfo.postInformation().revUserId},
         //Data.Users.ChangePassword({OldPassword:_OldPassword, NewPassword: _NewPassword, UserId:_UserId,  "revUserId": "sample string 4","TerminalName": "sample string 5", "TerminalIP": "sample string 6","DeviceType": 1}, 
          function(data){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          })
        return deferred.promise;
    };
    self.GetUserInfo = function(data, headers){
    
      var deferred = $q.defer();
        Data.UserInfo.GetUserInfo(data,
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
    };
    self.UpdateUserInfo = function(data, headers){
      var deferred = $q.defer();
      Data.UserInfo.UpdateUserInfo(data,
        function(s, headers){
              deferred.resolve(s);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    };
    self.GetUsersInfoByAnyProperty = function(data){
      var deferred = $q.defer();
      Data.UserInfo.GetUsersInfoByAnyProperty(data,
        function(s){
              deferred.resolve(s);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    };
    self.GetReagentType = function(){
      var deferred = $q.defer();
      Data.UserInfo.GetReagentType(function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
    }
  return self;
}])

.factory('ItemInfo',['$http','$q','Storage','Data',function($http,$q,Storage,Data){
    var self=this;
    self.CreateReagentId = function(_ReagentType){
      var deferred = $q.defer();
      Data.ItemInfo.CreateReagentId({ReagentType:_ReagentType},function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    self.SetReagentData = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.SetReagentData(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    self.SetSampleData = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.SetSampleData(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
    self.GetIsolatorInfo = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetIsolatorInfo(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    self.GetIncubatorInfo = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetIncubatorInfo(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    self.GetReagentInfo = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetReagentInfo(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    self.GetSampleInfo = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetSampleInfo(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      }); 
      return deferred.promise;
    };
    self.GetIncubatorEnv = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetIncubatorEnv(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      }); 
      return deferred.promise;
    };
    self.GetIsolatorEnv = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetIsolatorEnv(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });    
      return deferred.promise;
    };
    self.GetNewIsolatorEnv = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetNewIsolatorEnv(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });    
      return deferred.promise;
    };
    self.GetNewIncubatorEnv = function(arr){
      var deferred = $q.defer();
      Data.ItemInfo.GetNewIncubatorEnv(arr,function (data,headers){
        deferred.resolve(data);
      },function (err) {
        deferred.reject(err);
      });    
      return deferred.promise;
    }
    return self;
}])

.factory('Operation',['$http','$q','Storage','Data',function($http,$q,Storage,Data){
  var self=this;
  self.GetEquipmentOps = function(arr){
    var deferred = $q.defer();
    Data.Operation.GetEquipmentOps(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetOperationOrders = function(arr){
    var deferred = $q.defer();
    Data.Operation.GetOperationOrders(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

.factory('Result',['$http','$q','Storage','Data',function($http,$q,Storage,Data){
  var self=this;
  self.GetResult = function(arr){
    var deferred = $q.defer();
    Data.Result.GetResult(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetBreakDownInfo = function(arr){
    var deferred = $q.defer();
    Data.Result.GetBreakDownInfo(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetResultTubes = function(arr){
    var deferred = $q.defer();
    Data.Result.GetResultTubes(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    })
    return deferred.promise;
  };
  self.GetTestPictures = function(arr){
    var deferred = $q.defer();
    Data.Result.GetTestPictures(arr,function (data,headers){
      deferred.resolve(data);
    },function (err) {
      deferred.reject(err);
    })
    return deferred.promise;
  }
  return self;
}])

.factory('extraInfo',function(CONFIG){
  return{
    postInformation:function(){
      var postInformation={};
      if(window.localStorage['UserId']==null){
        postInformation.revUserId = 'who'
      }
      else{
        postInformation.revUserId = window.localStorage['UserId'];
      }
      
      postInformation.TerminalIP = 'IP';
      if(window.localStorage['TerminalName']==null){
        postInformation.TerminalName = 'which';
      }
      else{
        postInformation.TerminalName = window.localStorage['TerminalName'];
      }
      postInformation.DeviceType = 2;
      return postInformation;
    },
    TerminalIP:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['TerminalIP']);
      }else {
        window.localStorage['TerminalIP'] = angular.toJson(data);
      }},
    TerminalName:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['TerminalName']);
      }else {
        window.localStorage['TerminalName'] = angular.toJson(data);
      }},
  
  }
})



.factory('Pics', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var Pics = [{
    id: 0,
    name: 'Ben Sparrow',
    describe: '正常',
    face: 'img/v1.jpg'
  }, {
    id: 1,
    name: 'Max Lynx',
    describe: '正常',
    face: 'img/v2.jpg'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    describe: '有点不正常',
    face: 'img/v3.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    describe: '有点不正常',
    face: 'img/v4.jpg'
  }, {
    id: 4,
    name: 'Mike Harrington',
    describe: '有点不正常',
    face: 'img/v5.jpg'
  }];

  return {
    all: function() {
      return Pics;
    },
    remove: function(Pic) {
      Pics.splice(Pics.indexOf(chat), 1);
    },
    get: function(PicId) {
      for (var i = 0; i < chats.length; i++) {
        if (Pics[i].id === parseInt(PicId)) {
          return Pics[i];
        }
      }
      return null;
    }
  };
})

.factory('Encryption',function(){
  var Front = "This is password for front.";
  var Backend = "This is password for backend.";
  var Bits = 512;
  var FrontRSAkey = cryptico.generateRSAKey(Front,Bits);
  var FrontPublicKeyString = cryptico.publicKeyString(FrontRSAkey);
  var BackendRSAkey = cryptico.generateRSAKey(Backend,Bits);
  var BackendPublicKeyString = cryptico.publicKeyString(BackendRSAkey);
  return {
    FrontEncryption: function(_Fplaintext) {
      var Fciphertext = cryptico.encrypt(_Fplaintext,BackendPublicKeyString).cipher;
      return Fciphertext;
    },
    BackendDecryption: function(_Fciphertext) {
      var Fplaintext = cryptico.decrypt(_Fciphertext,BackendRSAkey).plaintext;
      return Fplaintext;
    },
    BackendEncryption: function(_Bplaintext) {
      var Bciphertext = cryptico.encrypt(_Bplaintext,FrontPublicKeyString).cipher;
      return Bciphertext;
    },
    FrontDecryption: function(_Bciphertext) {
      var Bplaintext = cryptico.decrypt(_Bciphertext,FrontRSAkey).plaintext;
      return Bplaintext;
    }
  };
});

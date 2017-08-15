angular.module('starter.controllers', [])
  .controller('AppCtrl', function($scope,$ionicModal,$ionicPopup,A,$localstorage,Navigation,$ionicPlatform,$ionicSlideBoxDelegate,$ionicScrollDelegate,$timeout,currentUser,$interval,$ionicActionSheet,$state,$sce,$cordovaCamera,$ionicLoading) {
	
	$scope.trustPhoto = function(url){
		return $sce.trustAsResourceUrl(url);		
	}		
	if(loaded == false){
		$state.go('loader');	
	}
	$scope.goToChatGlobal = function(url,slide,val) {
		currentUser.selectedUser=val;
		$state.go(url, val);  
	};					
	
	var getRandomNum = function(){
	  return Math.floor((Math.random()*22)+1);
	}

	oneSignalID = getRandomNum();

	//VIDEOCALL SYSTEM	
	  $ionicModal.fromTemplateUrl('templates/modals/video.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.videoModal = modal;
	  });
	  $scope.closeVideoModal = function() {
		$scope.videoModal.hide(); 
		$('body').toggleClass('anim-start');
		window.localStream.stop();	
		window.localStream = null;
	  };

	function peerConnect(con) {
		user = $localstorage.getObject('user');
		config = $localstorage.getObject('config');
		if(con == 1){
			peer.destroy();
		}
		peer = new Peer({
		  host: config.videocall, secure:true, port:443, key: 'peerjs',
		  config: {'iceServers': [
			{ url: 'stun:stun1.l.google.com:19302' },
			{ url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
		  ]}
		});			
					

		peer = new Peer({host: config.videocall, secure:true, port:443, key: 'peerjs'});
		
		peer.on('open', function(){
			var query = user.id+','+peer.id; 
			console.log(query);
			A.Query.get({action: 'updatePeer' ,query: query});					 
		});
		
		peer.on('error', function(err){
			console.log(err);
		});	
		peer.on('call', onReceiveCall);			
	}
	
	
	$interval(function(){
		config = $localstorage.getObject('config');						   
		if(in_videocall === false && user != '' && config != '' && config.videocall != ''){
			peerConnect(1);
		} 
	}, 50000);
	
	
	$timeout(function(){
		config = $localstorage.getObject('config');					  
		if(in_videocall === false && user != '' && config != ''  && config.videocall != ''){
			peerConnect(0);
		} 
	}, 5000);
	
	function getVideo(successCallback, errorCallback){
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		navigator.getUserMedia({audio: true, video: true}, successCallback, errorCallback);
	}
				
	function onReceiveCall(call){

		try {		  
			$scope.getCaller = A.Query.get({action: 'income' ,query: call.peer});
			$scope.getCaller.$promise.then(function(){
				var caller = $scope.getCaller;
				$scope.called = true;				
				$scope.videoModal.show();	
				$scope.name = 'Incoming call';
				$scope.text = caller.name+" wants to start a videocall with you";	
				$('.ball').css("background-image",'url(' + caller.photo + ')');
				$('.videopb').css("background-image",'url(' + caller.photo + ')');				
				setTimeout(function() {
					$('body').toggleClass('anim-start');
				}, 300);
				$scope.acceptCall = function(){
					$scope.called = false;
					in_videocall = true;
					getVideo(
						function(MediaStream){
							call.answer(MediaStream);						
						},
						function(err){
							$ionicPopup.alert({
								title: 'Error',
								template: 'An error occured while try to connect to the device mic and camera'
							});
						}
					);					
				}
		},
			function(){})		 
		}
		catch (err) {
			console.log("Error " + err);
		}
		call.on('stream', function(stream){
			$scope.videoModal.show();
			in_videocall = true;
			var video = document.getElementById('myCam');
			video.src = window.URL.createObjectURL(stream);
			//$('.videocall-container').fadeOut();
		});
	}
	

	function onReceiveStream(stream){	
		$scope.videoModal.show();
		in_videocall = true;
		var video = document.getElementById('myCam');
		video.src = window.URL.createObjectURL(stream);
		//$('.videocall-container').fadeOut();
	}
	$scope.startVideocall = function(val){
		$scope.called = false;
		$scope.videoModal.show();
		$scope.name = chatUser.name;
		$scope.text = 'calling..';
		$('.ball').css("background-image",'url(' + chatUser.photo + ')');
		$('.videopb').css("background-image",'url(' + chatUser.photo + ')');
		setTimeout(function() {
			$('body').toggleClass('anim-start');
		}, 300);			
		getVideo(
			function(MediaStream){	
				window.localStream = MediaStream;
				//var video = document.getElementById('myCam');
				//video.src = window.URL.createObjectURL(MediaStream);
				try {		  
					$scope.getUserPeer = A.Query.get({action: 'getpeerid' ,query: chatUser.id});
					$scope.getUserPeer.$promise.then(function(){
						var userPeer = $scope.getUserPeer.peer;
						var call = peer.call(userPeer, MediaStream);		
						call.on('stream', onReceiveStream);
				},
					function(){})		 
				}
				catch (err) {
					console.log("Error " + err);
				}				
			},
			function(err){
				$ionicPopup.alert({
					title: 'Error',
					template: 'An error occured while try to connect to the device mic and camera'
				});
			}
		);

	};

	$scope.videoModa = function(){
		$scope.videoModal.show();
		$scope.oncall = true;			
	}
	
								  
	$scope.firstOpen = true;							  
    $ionicModal.fromTemplateUrl('templates/modals/settings.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalSettings = modal;
    });

    $scope.openSettingsModal = function() {
		user = $localstorage.getObject('user');
		lang = $localstorage.getObject('lang');
		tlang = $localstorage.getObject('tlang');
		alang = $localstorage.getObject('alang');
		site_prices = $localstorage.getObject('prices');
		$scope.spotlightprice = site_prices.spotlight;
		$scope.alang = [];
		$scope.tlang = [];
		$scope.lang = [];
		if(user.notification.fan == 1){
			$scope.likes = true;
		} else {
			$scope.likes = false;
		}
		if(user.notification.visit == 1){
			$scope.visits = true;
		} else {
			$scope.vists = false;
		}
		if(user.notification.superlike == 1){
			$scope.superlike = true;
		} else {
			$scope.superlike = false;
		}
		if(user.notification.match_m == 1){
			$scope.matches = true;
		} else {
			$scope.matches = false;
		}
		if(user.notification.message == 1){
			$scope.messages = true;
		} else {
			$scope.messages = false;
		}								
		$scope.openPrivacy = function(){
			cordova.InAppBrowser.open(site_url+'index.php?page=pp', '_blank', 'location=yes');			
		}
		$scope.openTerms = function(){
			cordova.InAppBrowser.open(site_url+'index.php?page=tac', '_blank', 'location=yes');			
		}
		$scope.deleteProfile = function(){
			  var hideSheet = $ionicActionSheet.show({
				buttons: [
				  { text: lang[150].text }
				],
				cancelText: alang[2].text,
				cancel: function() {
				  },
				buttonClicked: function(index) {	
					var message = user.id;
					A.Query.get({action: 'logout', query: message});
					$localstorage.setObject('user','');
					chats = [];
					matche = [];
					mylikes = [];
					myfans = [];
					cards = [];
					visitors = [];		
					$state.go('loader');
				}
			  });
		
		}	
		alang.forEach(function(entry) {					  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});
		lang.forEach(function(entry) {					  
		  $scope.lang.push({
			id: entry,
			text: entry.text
		  });
		});
		tlang.forEach(function(entry) {					  
		  $scope.tlang.push({
			id: entry,
			text: entry.text
		  });
		});
		$scope.city = user.city;
		$scope.country = user.country;
		$scope.s_age = user.sage;
		if(user.looking == 1){
			$scope.gender = lang[120].text;			
		}
		if(user.looking == 2){
			$scope.gender = lang[121].text;
		}
		if(user.looking == 3){
			$scope.gender = lang[122].text;			
		}		
		$scope.modalSettings.show();
		
		$scope.updateGender = function() {
		  var hideSheet = $ionicActionSheet.show({
			buttons: [
			  { text: lang[120].text },					  
			  { text: lang[121].text },
			  { text: lang[122].text }
			],
			cancelText: alang[2].text,
			cancel: function() {
			  },
			buttonClicked: function(index) {
				var gender;
				if(index == 0){
					$scope.gender = lang[120].text;		
					gender = 1;
				}
				if(index == 1){
					$scope.gender = lang[121].text;
					gender = 2;
				}
				if(index == 2){
					$scope.gender = lang[122].text;			
					gender = 3;
				}	
				var message = user.id+','+gender;
				$scope.ajaxRequest34 = A.Query.get({action: 'updateGender', query: message});
				$scope.ajaxRequest34.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest34.user);
				});				
			  return true;
			}
		  });
		}		
		
		if($scope.firstOpen){
			$scope.data = {};
			$scope.data.location = user.city+','+user.country;
			$scope.firstOpen = false;			
		}
		$scope.onAddressSelection = function (location) {
    		$scope.data.location = location.name;
			console.log(location);
			var lat = location.geometry.location.lat();
			var lng = location.geometry.location.lng();
			var country;
			var city;

			for (var i = 0; i < location.address_components.length; i++){
			 if(location.address_components[i].types[0] == "country") {
					country = location.address_components[i].long_name;
				}
			 if(location.address_components[i].types[0] == "locality") {
					city = location.address_components[i].long_name;
				}					
			 }
			var message = user.id+','+lat+','+lng+','+city+','+country;
			$scope.ajaxRequest36 = A.Query.get({action: 'updateLocation', query: message});
			$scope.ajaxRequest36.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest36.user);
			});				 
		};
		$scope.updateNotification = function(e,a) {
			var message = user.id+','+e+','+a;
			if(a === true){
				a = 1;
			} else {
				a = 0;
			}
			$scope.ajaxRequest = A.Query.get({action: 'updateNotification', query: message});
			$scope.ajaxRequest.$promise.then(function(){											
			});			
		};

		$scope.updateDistance = function(e) {
			var message = user.id+','+e;
			$scope.ajaxRequest3 = A.Query.get({action: 'updateSRadius', query: message});
			$scope.ajaxRequest3.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest3.user);
			});			
		};

		
		$scope.updateAge = function(e) {
			var message = user.id+','+e;
			$scope.ajaxRequest31 = A.Query.get({action: 'updateAge', query: message});
			$scope.ajaxRequest31.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest31.user);
			});			
		};	
		$scope.online = onlineMeet;
		$scope.updateOnline = function() {
			if(onlineMeet == 0){
				onlineMeet = 1;
				$scope.online = onlineMeet;
			} else {
				onlineMeet = 0;
				$scope.online = onlineMeet;
			}
		};	
    };
    $scope.closeSettingsModal = function() {
      $scope.modalSettings.hide();
	  $state.reload();	
    };
	
    $ionicModal.fromTemplateUrl('templates/modals/chat-image.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modalChatImage = modal;
    });

    $scope.openChatImageModal = function(image) {
	  $scope.chatImage = image;
      $scope.modalChatImage.show();
    };

    $scope.closeChatImageModal = function() {
      $scope.modalChatImage.hide();
    };	
	 
    $ionicModal.fromTemplateUrl('templates/modals/profile-photos.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
  	$scope.goToSlide = function(index) {
      $scope.modal.show();

      $ionicSlideBoxDelegate.slide(index);
    }
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

	function onHardwareBackButton() {
		if($('.modal-backdrop.active').length){		
			$scope.profileModal.hide();
			return false;
		}else{
			window.history.back();
			return false;
		}
	}
	
    $scope.cardDestroyed = function(index,id) {
	  if(url == 'explore'){
		  $timeout(function(){
		  cards.splice(0, 1);
		  _addCards(1);
		  $scope.isMoveLeft = false;
		  $scope.isMoveRight = false;
		  },500);
	  }
	  
	  if(url == 'meet'){
		user = $localstorage.getObject('user');		 
		try {		  
			$scope.ajaxRequest = A.Meet.get({action: 'like' ,uid1: user.id, uid2: id, uid3:index});
			$scope.ajaxRequest.$promise.then(function(){	
			},
			function(){})		 
			}
			catch (err) {
				console.log("Error " + err);
			}		  
		  if(index == 1){
			$('#like'+id).show();  			
		  }
	  }	  
    };	
	
	$ionicPlatform.onHardwareBackButton(onHardwareBackButton);
	
    $ionicModal.fromTemplateUrl('templates/modals/profile.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.profileModal = modal;
    });
	
	
    $ionicModal.fromTemplateUrl('templates/modals/premium.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.premiumModal = modal;
    });

    $scope.openPremiumModal = function() {
		config = $localstorage.getObject('config');
		lang = $localstorage.getObject('lang');
		tlang = $localstorage.getObject('tlang');
		alang = $localstorage.getObject('alang');
		site_prices = $localstorage.getObject('prices');
		account_premium = $localstorage.getObject('account_premium');
		$scope.pchat = account_premium.chat;
		$scope.dchatprice = site_prices.chat;
		$scope.alang = [];
		$scope.tlang = [];
		alang.forEach(function(entry) {					  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});
		tlang.forEach(function(entry) {					  
		  $scope.tlang.push({
			id: entry,
			text: entry.text
		  });
		});
		$scope.config_email = config.paypal;
		$scope.premium_days = p_quantity;
		$scope.currency = config.currency;
		$scope.cp = $localstorage.getObject('premium_package');		
		$scope.premiumModal.show();
		$scope.buyPremium = function(c,p,i){
			p_quantity = c;
			p_price = p;
			$scope.premium_days = c;
			$scope.premium_price = p;
			$scope.premium_custom = user.id+','+c;			
			$scope.premiumModal.hide();
			var paypalU = site_url +'app/paypal.php?type=2&amount='+p_price+'&custom='+$scope.premium_custom;
			cordova.InAppBrowser.open(paypalU, '_blank', 'location=yes');
		}
	}
    $scope.closePremiumModal = function() {
		$scope.premiumModal.hide();
	}	

    $ionicModal.fromTemplateUrl('templates/modals/credits.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.creditsModal = modal;
    });

    $scope.openCreditsModal = function(photo) {
		config = $localstorage.getObject('config');
		lang = $localstorage.getObject('lang');
		tlang = $localstorage.getObject('tlang');
		alang = $localstorage.getObject('alang');
		site_prices = $localstorage.getObject('prices');
		account_basic = $localstorage.getObject('account_basic');
		$scope.site_name = config.name;
		$scope.dchat = account_basic.chat;
		$scope.dchatprice = site_prices.chat;
		$scope.alang = [];
		$scope.tlang = [];
		alang.forEach(function(entry) {					  
		  $scope.alang.push({
			id: entry,
			text: entry.text
		  });
		});
		tlang.forEach(function(entry) {					  
		  $scope.tlang.push({
			id: entry,
			text: entry.text
		  });
		});
		
		if(config.paypal != '' ){ 
			$scope.PAYPAL = true;
		}
		if(config.stripe != '' ){ 
			$scope.STRIPE = true;
		}
		if(config.fortumo != '' ){ 
			$scope.SMS = true;
		}		
		$scope.photo = photo;
		$scope.config_email = config.paypal;
		$scope.credits_amount = c_quantity;
		$scope.currency = config.currency;
		$scope.cp = $localstorage.getObject('credits_package');		
		$scope.creditsModal.show();
		$scope.buyCredit = function(val){
			if(c_quantity == 0){
				alert(lang[79].text);
				return false;
			}
			if(val == 1){
				var c = $scope.credits_custom;
				var paypalU = site_url +'app/paypal.php?type=1&amount='+c_price+'&custom='+c;
				cordova.InAppBrowser.open(paypalU, '_blank', 'location=yes');
			}
			if(val == 2){
				$scope.creditsModal.hide();
				var price = c_price*100;
				var app = 1;
				var handler = StripeCheckout.configure({
					key: config.stripe,
					image: config.logo,
					locale: 'auto',
					token: function(token) {
						$.ajax({
							url: config.ajax_path+'/stripe.php', 
							data: {
								token:token.id,
								price: price,
								app: app,
								quantity: c_quantity,
								uid: user.id,
								de: config.name + ' ' + c_quantity + ' credits'
							},	
							type: "post",
							success: function(response) {
							},
							complete: function(){
								if(app == 1){
									$state.go('loader');
								}
							}
						});
					}
				});
				handler.open({
					name: config.name,
					description: config.name + ' ' + c_quantity + ' credits',
					amount: price
				});
			
				$(window).on('popstate', function() {
					handler.close();
				});				
			}
			if(val == 3){
				var name = config.name + ' ' + c_quantity + ' credits';
				var encode = 'amount='+c_quantity+'callback_url='+config.site_url+'credit_name='+name+'cuid='+user.id+'currency='+config.currency+'display_type=userprice='+c_price+'v=web';			
				$.ajax({ 
					type: "POST", 
					url: config.ajax_path + "/user.php",
					data: {
						action: 'fortumo',
						encode: encode
					},
					success: function(response){
						var md5 = response;
						var callback = encodeURI(config.site_url);
						name = encodeURI(name);
						var href= 'http://pay.fortumo.com/mobile_payments/'+config.fortumo+'?amount='+c_quantity+'&callback_url='+callback+'&credit_name='+name+'&cuid='+user.id+'&currency='+config.currency+'&display_type=user&price='+c_price+'&v=web&sig='+md5;
						cordova.InAppBrowser.open(href, '_blank', 'location=yes');				
					}
				});				
			}	
		}
		$scope.selectCredit = function(q,p,i){
			c_quantity = q;
			c_price = p;
			$scope.credits_price = p;
			$scope.credits_amount = q;			
			$scope.credits_custom = user.id+','+q;
			$('[data-q]').hide();
			$('[data-q='+q+']').fadeIn();
		}		
	}
    $scope.closeCreditsModal = function() {
		$scope.creditsModal.hide();
	}

    $scope.openProfileModal = function(id,name,photo,age,city) {
	$('#topPhoto').removeClass('sblack');
	if(url == 'explore'){
		ticky = false;	
	} else {
		ticky = true;
	}
	config = $localstorage.getObject('config');									  
	lang = $localstorage.getObject('lang');
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.alang = [];
	$scope.lang = [];
	$scope.site_name = config.name;
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	lang.forEach(function(entry) {					  
	  $scope.lang.push({
		id: entry,
		text: entry.text
	  });
	});	
	$scope.profileModal.show();
	$scope.bio = '';	
	$scope.photo = photo;
	$scope.name = name;
	$scope.age = age;
	$scope.city = city;	
	$('#user-name').addClass('fadeIn');
	$('#user-country').addClass('fadeIn');
	$scope.myProfile = false;
	$scope.wtf = true;	
	$scope.photos = '';
	$scope.aImages = '';
	$scope.extendedd = false;
	user = $localstorage.getObject('user');
    $scope.blockUser = function() {
      var hideSheet = $ionicActionSheet.show({
		titleText: alang[14].text,									 
        buttons: [
          { text: alang[17].text +' '+name }
        ],
        cancelText: alang[2].text,
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
			if(index == 0){
			   var confirmPopup = $ionicPopup.confirm({
				 title: alang[17].text+' '+ name,
				 template: alang[18].text +' '+ name +'?'
			   });
			
			   confirmPopup.then(function(res) {
				 if(res) {
					var query = user.id+','+id;
					A.Query.get({action: 'block' ,query: query});
					setTimeout(function(){
						$scope.closeProfileModal();
					},550);
				 } else {
				   
				 }
			   });
			 };	
          return true;
        }
      });
    }	
	var addvisit = user.id+','+id;
	A.Query.get({action: 'addVisit', query: addvisit});
	$('.profile').addClass('desenfocame'); 	
		
	var cuser = function () {
	  try {		  
		  $scope.ajaxRequest = A.Chat.get({action: 'cuser',uid1: id,uid2: user.id});
		  $scope.ajaxRequest.$promise.then(function(){
				$localstorage.setObject('cuser', $scope.ajaxRequest.user);
				current_user = $localstorage.getObject('cuser');
				$scope.country = current_user.country;
				$scope.interest = current_user.interest;
				$scope.photos = current_user.photos;
				$scope.aImages = current_user.photos;
				if(current_user.status == 'y'){
					$scope.status = true;
				} else {
					$scope.status = false;	
				}
				$scope.id = current_user.id;	
				$scope.cu = current_user;	
				if(current_user.fake == 0){
					$scope.extended = current_user.extended;
				}
				if(current_user.photos.length > 1){
					$('#topPhoto').addClass('sblack');
					$ionicSlideBoxDelegate.update();
				}
				if(current_user.isFan == 0){
					if(ticky == false){
						$scope.wtf = true;		
					} else {
						$scope.wtf = false;
					}
				}
				if(user.id == current_user.id){
					$scope.myProfile = true;	
				}			
				$scope.bio = current_user.bio;						
				$('#user-bio').addClass('fadeIn');
				
			
				$('.profile').removeClass('desenfocame');
				
		  },
		  function(){}
		  )		 
	  }
	  catch (err) {
		console.log("Error " + err);
	  }
	};
	cuser();
    }
    $scope.closeProfileModal = function() {
		$ionicSlideBoxDelegate.slide(0);
		$ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);		
		$scope.profileModal.hide();
    };


    /*Edit Profile*/
    $scope.showPhotoOptions = function(val,pid,blocked,profile) {
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text:  lang[289].text },
          { text:  lang[292].text },
        ],
        cancelText: 'Cancel',
        cancel: function() {
          },
        buttonClicked: function(index) {
		  if(index ==0){
			  var p = $scope.photo1;
			  if(val == 2){
				var n = $scope.photo2;
				$scope.photo1 = n;
				$scope.photo2 = p;
				var m = user.id +','+pid;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;	
				}); 
			  }
			  if(val == 3){
				var n = $scope.photo3;
				$scope.photo1 = n;
				$scope.photo3 = p;
				var m = user.id +','+pid;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;	
				}); 
			  }
			  if(val == 4){
				var n = $scope.photo4;
				$scope.photo1 = n;
				$scope.photo4 = p;
				var m = user.id +','+pid;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;	
				}); 
			  }
			  if(val == 5){
				var n = $scope.photo5;
				$scope.photo1 = n;
				$scope.photo5 = p;
				var m = user.id +','+pid;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;	
				}); 
			  }
			  if(val == 6){
				var n = $scope.photo6;
				$scope.photo1 = n;
				$scope.photo6 = p;
				var m = user.id +','+pid;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserProfilePhoto', query: m});
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;	
				}); 
			  }
		  }
		  if(index == 1){
			  if(val == 2){
				$scope.photo2 = null;
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m});
			  }
			  if(val == 3){
				$scope.photo3 = null;
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m});
			  }
			  if(val == 4){
				$scope.photo4 = null;
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m}); 
			  }
			  if(val == 5){
				$scope.photo5 = null;
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m});
			  }
			  if(val == 6){
				$scope.photo6 = null;
				var m = user.id +','+pid;
				A.Query.get({action: 'deletePhoto', query: m});
			  }
		  }
          return true;
        }
      });
    }		
    $scope.uploadPhoto = function(val) {
	alang = $localstorage.getObject('alang');
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: alang[0].text },
          { text: alang[1].text }
        ],
        cancelText: alang[2].text,
        cancel: function() {
          },
        buttonClicked: function(x) {
			if(x == 1){
				var options = {
					quality: 40,
					destinationType: Camera.DestinationType.DATA_URL,
					sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
					encodingType: Camera.EncodingType.JPEG,
					allowEdit : true,
				};
			}else {
				var options = {
					quality: 40,
					destinationType: Camera.DestinationType.DATA_URL,
					encodingType: Camera.EncodingType.JPEG,
					allowEdit : true,
				};
			}
			$cordovaCamera.getPicture(options).then(function(imageData) {
				var image = "data:image/jpeg;base64," + imageData;
				$.ajax({
					url: site_url+'assets/sources/appupload.php',
					data:{
						action: 'upload',
						base64: image,
						uid: user.id
					},
					cache: false,
					contentType: "application/x-www-form-urlencoded",				  
					type:"post",
					dataType:'JSON',
					success:function(response){
						$scope.uphotos = response.user.photos;
						usPhotos = response.user.photos;
						$scope.photo1 = usPhotos[0];
						$scope.photo2 = usPhotos[1];
						$scope.photo3 = usPhotos[2];
						$scope.photo4 = usPhotos[3];
						$scope.photo5 = usPhotos[4];
						$scope.photo6 = usPhotos[5];
					}
				});
			}, function(err) {
			  // error
			});			  
          return true;
        }
      });
    }		
    $ionicModal.fromTemplateUrl('templates/modals/profile_edit.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.editProfileModal = modal;
    });


    $scope.openEditProfileModal = function() {
		$scope.editProfileModal.show();
		user = $localstorage.getObject('user');
		lang = $localstorage.getObject('lang');
		tlang = $localstorage.getObject('tlang');
		$('[data-lid]').each(function(){
		  var id = $(this).attr('data-lid');
		  $(this).text(lang[id].text);
		});
		$('[data-tid]').each(function(){
		  var id = $(this).attr('data-tid');
		  $(this).text(tlang[id].text);
		});
		$scope.loading = false;
		$scope.bio = user.bio;
		$scope.name = user.name;
		$scope.age = user.age;		
		$scope.uphotos = usPhotos;
		$scope.photo1 = usPhotos[0];
		$scope.photo2 = usPhotos[1];
		$scope.photo3 = usPhotos[2];
		$scope.photo4 = usPhotos[3];
		$scope.photo5 = usPhotos[4];
		$scope.photo6 = usPhotos[5];
		$scope.ex1 = user.extended.field1;
		$scope.ex2 = user.extended.field2;
		$scope.ex3 = user.extended.field3;
		$scope.ex4 = user.extended.field4;
		$scope.ex5 = user.extended.field5;
		$scope.ex6 = user.extended.field6;
		$scope.ex7 = user.extended.field7;
		$scope.ex8 = user.extended.field8;
		$scope.ex9 = user.extended.field9;
		$scope.ex10 = user.extended.field10;		
		$scope.extended1 = {
			Single: lang[224].text,
			Taken: lang[225].text,
			Open: lang[226].text,
		};
		
		$scope.extended2 = {
			a228a:lang[228].text,
			a229a:lang[229].text,
			a230a:lang[230].text,
			a231a:lang[231].text,
		};
	
		$scope.extended3 = {
			a142cm: "4' 8' (142cm)",	
			a145cm: "4' 9' (145cm)",	
			a147cm: "4' 10' (147cm)",	
			a150cm: "4' 11' (150cm)",	
			a152cm: "5' 0' (152cm)",	
			a155cm: "5' 1' (155cm)",	
			a157cm: "5' 2' (157cm)",	
			a160cm: "5' 3' (160cm)",	
			a163cm: "5' 4' (163cm)",	
			a162cm: "5' 5' (165cm)",	
			a168cm: "5' 6' (168cm)",	
			a170cm: "5' 7' (170cm)",	
			a173cm: "5' 8' (173cm)",	
			a175cm: "5' 9' (175cm)",	
			a178cm: "5' 10' (178cm)",	
			aa180cm: "5' 11' (180cm)",	
			a183cm: "6' 0' (183cm)",	
			a185cm: "6' 1' (185cm)",	
			aa188cm: "6' 2' (188cm)",	
			a1a91cm: "6' 3' (191cm)",
			a1a93cm: "6' 4' (193cm)",
			a1a96cm: "6' 5' (196cm)",
			a1a98cm: "6' 6' (198cm)",
			a201cm: "6' 7' (201cm)",
			a203cm: "6' 8' (203cm)",
			a206cm: "6' 9'(206cm)",
			a208cm: "6' 10' (208cm)",
			a211cm: "6' 11' (211cm)",
			a213cm: "7' 0' (213cm)",
			a216cm: "7' 1' (216cm)",
			a218cm: "7' 2' (218cm)",	
		};
		
		$scope.extended4 = {

		};
		
		$scope.extended5 = {
			a237a:lang[237].text,
			a238a:lang[238].text,
			a239a:lang[239].text,
			a240a:lang[240].text,
			a241a:lang[241].text,
			a242a:lang[242].text,
			a243a:lang[243].text,
			a244a:lang[244].text,
			a245a:lang[245].text,	
		};
		
		$scope.extended6 = {
			a247a:lang[247].text,
			a248a:lang[248].text,
			a249a:lang[249].text,
			a250a:lang[250].text,
			a251a:lang[251].text,
		};
		
		$scope.extended7 = {
			a253a:lang[253].text,
			aa254a:lang[254].text,
			a255a:lang[255].text,
			a256a:lang[256].text,
			a257a:lang[257].text,
		};
		
		$scope.extended8 = {
			a259a:lang[259].text,
			a260a:lang[260].text,
			a261a:lang[261].text,
		};
		
		$scope.extended9 = {
			a259a:lang[259].text,
			a260a:lang[260].text,
			a261a:lang[261].text,
		};
		
		$scope.extended10 = {
			a264a:lang[264].text,
			a265a:lang[265].text,
			a266a:lang[266].text,
			a267a:lang[267].text,
		};


		$scope.updateExtended = function(ex) {
			if(ex == 1){
				$scope.ex1 = null;	
			}
			if(ex == 2){
				$scope.ex2 = null;	
			}
			if(ex == 3){
				$scope.ex3 = null;
			}
			if(ex == 4){
				$scope.ex4 = null;
			}
			if(ex == 5){
				$scope.ex5 = null;
			}
			if(ex == 6){
				$scope.ex6 = null;
			}
			if(ex == 7){
				$scope.ex7 = null;
			}
			if(ex == 8){
				$scope.ex8 = null;
			}
			if(ex == 9){
				$scope.ex9 = null;
			}
			if(ex == 10){
				$scope.ex10 = null;
			}
		}
		

		$scope.showSelectValue = function(s,ex) {
			if(ex == 1){
				$scope.ex1 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 2){
				$scope.ex2 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 3){
				$scope.ex3 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 4){
				$scope.ex4 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 5){
				$scope.ex5 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 6){
				$scope.ex6 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 7){
				$scope.ex7 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 8){
				$scope.ex8 = s;	
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 9){
				$scope.ex9 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}
			if(ex == 10){
				$scope.ex10 = s;
				var col = 'field'+ex;
				var message = user.id+','+s+','+col;
				$scope.loading = true;
				$scope.ajaxRequest = A.Query.get({action: 'updateUserExtended', query: message});
				$scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest.user);	
					$scope.loading = false;
				});
			}			
		}
		
		if(user.gender == 1){
			$scope.gender = lang[35].text;			
		}
		if(user.gender == 2){
			$scope.gender = lang[36].text;
		}
		
		$('#userName').change(function(){
			var val = $(this).val();
			var col = 'name';
			$scope.loading = true;
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
				$scope.loading = false;				
			});				
		});
		$('#userAge').change(function(){
			var val = $(this).val();
			var col = 'age';
			$scope.loading = true;
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
				$scope.loading = false;				
			});				
		});		
		$('#userBio').change(function(){
			var val = $(this).val();
			var col = 'bio';
			var message = user.id+','+val+','+col;
			$scope.ajaxRequest14 = A.Query.get({action: 'updateUser', query: message});
			$scope.ajaxRequest14.$promise.then(function(){											
				$localstorage.setObject('user', $scope.ajaxRequest14.user);
			});				
		});		
		$scope.updateUserGender = function() {
		  var hideSheet = $ionicActionSheet.show({
			buttons: [
			  { text: lang[35].text	 },					  
			  { text: lang[36].text	 }
			],
			cancelText: alang[2].text,
			cancel: function() {
			  },
			buttonClicked: function(index) {
				var gender;
				if(index == 0){
					$scope.gender = lang[35].text;		
					gender = 1;
				}
				if(index == 1){
					$scope.gender = lang[36].text;
					gender = 2;
				}
				var message = user.id+','+gender;
				$scope.ajaxRequest24 = A.Query.get({action: 'updateUserGender', query: message});
				$scope.ajaxRequest24.$promise.then(function(){											
					$localstorage.setObject('user', $scope.ajaxRequest24.user);
				});				
			  return true;
			}
		  });
		}		
    }
    $scope.closeEditProfileModal = function() {
      $scope.editProfileModal.hide();
	  $state.reload();
    };
  })
  
	.controller('LoaderCtrl',function($scope, $state, $cordovaDevice,A,$localstorage,$ionicLoading) {
		var loader = function(){
		  try {	
			  $scope.ajaxRequest = A.Device.get({action: 'config', dID: oneSignalID});
			  $scope.ajaxRequest.$promise.then(function(){											
					$localstorage.setObject('config', $scope.ajaxRequest.config);
					$localstorage.setObject('app', $scope.ajaxRequest.app);
					app = $scope.ajaxRequest.app;
					$localstorage.setObject('prices', $scope.ajaxRequest.prices);
					max_ad = $scope.ajaxRequest.ad;
					var isAndroid = ionic.Platform.isAndroid();
					if(isAndroid){
						adMobI = $scope.ajaxRequest.adMobA;
					} else {
						adMobI = $scope.ajaxRequest.adMobI;
					}
					$localstorage.setObject('lang', $scope.ajaxRequest.lang);
					$localstorage.setObject('tlang', $scope.ajaxRequest.tlang);
					$localstorage.setObject('alang', $scope.ajaxRequest.alang);
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					$localstorage.setObject('premium_package', $scope.ajaxRequest.premium_package);
					$localstorage.setObject('credits_package', $scope.ajaxRequest.credits_package);					
					$localstorage.setObject('account_basic', $scope.ajaxRequest.account_basic);
					$localstorage.setObject('account_premium', $scope.ajaxRequest.account_premium);
					$localstorage.setObject('gifts', $scope.ajaxRequest.gifts);		
					if($scope.ajaxRequest.user != ''){
						$state.go('home.explore');
						usPhotos = $scope.ajaxRequest.user.photos;
						console.log(usPhotos);
						sape = $scope.ajaxRequest.user.slike;
					} else {
						$state.go('welcome');
					}
					var style = document.createElement('style');
					style.type = 'text/css';
					style.innerHTML = '.bg-tinder {background:'+app.first_color+'; background: -moz-linear-gradient(left,  '+app.first_color+' 0%, '+app.second_color+' 100%);background: -webkit-linear-gradient(left,  '+app.first_color+' 0%,'+app.second_color+' 100%); background: linear-gradient(to right,  '+app.first_color+' 0%,'+app.second_color+' 100%); color:#fff }';
					document.getElementsByTagName('head')[0].appendChild(style);		
			  },
			  function(){}
			  )		 
		  }
		  catch (err) {
			console.log("Error " + err);
		  }		
		}

		
		if (window.cordova) {
			document.addEventListener('deviceready', function () {
				var notificationOpenedCallback = function(jsonData) { 
				};
				window.plugins.OneSignal.init("04f22177-366a-40dc-99cf-6d1342c4e1f5",
											 {googleProjectNumber: "633977981600"},
											 notificationOpenedCallback);
				window.plugins.OneSignal.enableNotificationsWhenActive(true);
				window.plugins.OneSignal.getIds(function(ids) {
				  oneSignalID = ids.userId;
		    	  loader();			  
				});	
			}, false);
		} else {
			loader();
		}
	})
  

  .controller('WelcomeCtrl', function($scope, $state, $ionicLoading, $timeout,$localstorage,Navigation) {
	config = $localstorage.getObject('config');									  
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	url = 'welcome';
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$scope.site_url = site_url;
	$scope.lang19 = alang[19].text;
	$scope.lang20 = alang[20].text;
	$scope.lang21 = alang[21].text;
	$scope.changePage = function(url,slide,val) {
		Navigation.goNative(url, val, slide);  
	};	
	$scope.goToPDS = function(){
		cordova.InAppBrowser.open('https://www.premiumdatingscript.com', '_self', 'location=yes');			
	}
	//$scope.site_name = lang[0].text;

  })
								
  .controller('MeetCtrl', function($scope,$sce,$ionicPlatform,$ionicScrollDelegate,$ionicViewSwitcher, $state,$ionicModal, $ionicLoading,A, $timeout,$localstorage,Navigation,$window,preloader) {
	//$sce.trustAsResourceUrl(url);
	var cc = 0;
	url = 'meet';
	$ionicViewSwitcher.nextDirection("forward");
	config = $localstorage.getObject('config');									  
	lang = $localstorage.getObject('lang');
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.alang = [];
	$scope.tlang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	tlang.forEach(function(entry) {					  
	  $scope.tlang.push({
		id: entry,
		text: entry.text
	  });
	});
	user = $localstorage.getObject('user');
	prices = $localstorage.getObject('prices');
	if(user.s_radius >= 1000){
		$scope.check = 'All the world'	
	}
	if(user.s_radius < 550 && user.s_radius >= 500 ){
		$scope.check = user.city;	
	}
	if(user.s_radius < 550 && user.s_radius >= 500 ){
		$scope.check = user.country;	
	}
	if(user.s_radius < 50 ){
		$scope.check = user.city;	
	}
	if(user.s_radius > 30 && user.s_radius < 500 || user.s_radius > 550 && user.s_radius < 1000){
		$scope.check = user.s_radius+' KM';	
	}

	$scope.photo = user.profile_photo;
	$scope.trustPhoto = function(url){
		return $sce.trustAsResourceUrl(url);		
	}
	//SPOTLIGHT
	var spot = function () {
		try {		  
		  $scope.ajaxRequest5 = A.Game.get({action: 'spotlight', id: user.id});
		  $scope.ajaxRequest5.$promise.then(function(){											
				spotlight = $scope.ajaxRequest5.spotlight;
				$scope.spotlight = [];
				$scope.spotlight = spotlight;
				
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}
	if(spotlight == ''){
		spot();
	}	else {
		$scope.spotlight = spotlight;	
		spot();
	}	

	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}
	
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	
	$scope.changePage = function(url,slide,val) {
		Navigation.goNative(url, val, slide);  
	};	
	var result = [];
	var loadMore = [];
	$scope.imageLocations = [];
	$scope.loading = true;
	var meet = function () {
		meet_limit = 0;
		try {		  
		  $scope.ajaxRequest = A.Meet.get({action: 'meet',uid1: user.id, uid2: meet_limit, uid3 : onlineMeet});
		  $scope.ajaxRequest.$promise.then(function(){											
				result = $scope.ajaxRequest.result;
				$scope.meet = result;
				result.forEach(function(entry) {					  
					$scope.imageLocations.push(entry.photo);
				});	
				cc++;
				preloader.preloadImages( $scope.imageLocations )
				.then(function() {
					$scope.loading = false;
					$scope.showMe = true;
					show = 0;
					var show_search = setInterval(function(){
						show++;	
						if(show == 10){
							clearInterval(show_search);				
						}
						$('[data-search-show='+show+']').css('opacity','1');
						$('[data-search-show='+show+']').addClass('fadeInUp');
					},150);
				},
				function() {
					// Loading failed on at least one image.
				});

		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}
	
	var loadMore = function () {
		meet_limit = meet_limit+1;
		$scope.imageLocations = [];
		try {		  
		  $scope.ajaxRequest = A.Meet.get({action: 'meet',uid1: user.id, uid2: meet_limit, uid3 : onlineMeet});
		  $scope.ajaxRequest.$promise.then(function(){											
				result = $scope.ajaxRequest.result;
				$scope.loadMores = $scope.ajaxRequest.result;
				result.forEach(function(entry) {					  
					$scope.meet.push(entry);
					$scope.imageLocations.push(entry.photo);
				});
				preloader.preloadImages( $scope.imageLocations )
				.then(function() {
					show = meet_limit * 9;
					var maxShow = show + 10;
					var show_search = setInterval(function(){
						show++;	
						if(show == maxShow){
							clearInterval(show_search);	
							$scope.$broadcast('scroll.infiniteScrollComplete');
						}
						$('[data-search-show='+show+']').css('opacity','1');
						$('[data-search-show='+show+']').addClass('fadeInUp');
					},150);
				},
				function() {
					// Loading failed on at least one image.
				});				
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}

	meet();	
	
	$scope.spot_price = prices.spotlight;
	$scope.openSpot = function(){
		$scope.showSpot = true;
	}
	$scope.cancelSpot = function(){
		$scope.showSpot = false;	
	}
	$scope.addToSpotBtn = function(){
		user.credits = parseInt(user.credits);
		if(user.credits < prices.spotlight){
			$scope.openCreditsModal("'"+user.profile_photo+"'");
		} else {
			$scope.showMe = false;
			addToSpotlight();
		}
	}
	//ADMOB
	if(show_ad == max_ad && user.premium == 0){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		show_ad = 0;	
	}
	show_ad++;	


	var addToSpotlight = function () {
		try {	
		  $scope.ajaxRequest2 = A.Query.get({action: 'addToSpotlight', query: user.id});
		  $scope.ajaxRequest2.$promise.then(function(){	
			spot();
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	} 
	

  $scope.loadMore = function() {
	  loadMore();
  };
 


  })  
  
  .controller('LoginCtrl', function($scope,$ionicPlatform,$http,$state,$ionicViewSwitcher,$ionicModal,A,$cordovaOauth, $ionicLoading,awlert, $timeout,$localstorage,Navigation) {
	var app = $localstorage.getObject('app');
	var val = 0;
 	
	$scope.logoLogin = app.logo_login;
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	$('[data-tlid]').each(function(){
	  var id = $(this).attr('data-tlid');
	  $(this).text(tlang[id].text);
	});
	$scope.alang = [];
	$scope.lang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	lang.forEach(function(entry) {					  
	  $scope.lang.push({
		id: entry,
		text: entry.text
	  });
	});
	$scope.lemail = lang[28].text;
	$scope.lpass = lang[29].text;
	$scope.logintext = lang[1].text;
	$scope.isActive = false;
	$scope.recovertext = alang[43].text;
	$scope.forgetBtn = false;
	$scope.recoverPass = function(){
		$scope.forgetBtn = true;
		$scope.loginBtn = true;
	}
	$scope.backLogin = function(){
		$scope.forgetBtn = false;
		$scope.loginBtn = false;
	}
	$('#pass').keyup(function(){
		val = $('#pass').val().length;
		if(val > 4){
			$scope.isActive = true;
		} else {
			$scope.isActive = false;
		}
    });
	$scope.loginBtn = false;
	$scope.send = function(user) {
		if(val < 4){
			return false;
		}		
		$scope.master = angular.copy(user);
		$scope.loginBtn = true;
		var dID = oneSignalID;
		$scope.ajaxRequest = A.User.get({action : 'login',login_email: $scope.master.login_email, login_pass:$scope.master.login_pass , dID : dID });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.neutral($scope.ajaxRequest.error_m, 3000);
				$scope.loginBtn = false;
				$scope.isActive = true;		
			} else {		
				$localstorage.setObject('user', $scope.ajaxRequest.user);
				usPhotos = $scope.ajaxRequest.user.photos;
				sape = $scope.ajaxRequest.user.slike;
				$state.go('home.explore');	
			}
		},
		function(){
			awlert.neutral('Something went wrong. Please try again later',3000);
		}
	)};
		
	$scope.forget = function(user) {	
		$scope.master = angular.copy(user);
		$scope.ajaxRequest = A.Query.get({action : 'recover',query: $scope.master.login_email });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.neutral($scope.ajaxRequest.error_m, 3000);		
			} else {		
				awlert.neutral(lang[341].text);
			}
		},
		function(){
			awlert.neutral('Something went wrong. Please try again later',3000);
		}
	)};
	
	$scope.changePage = function(url,slide,val) {
		$state.go(url);  
	};
	
    FB.init({
      appId: '1811596079069411',
      status: true,
      cookie: true,
      xfbml: true,
      version: 'v2.2'
    });	

	$scope.fb = function() {
		if (window.cordova) {
			 $cordovaOauth.facebook("1811596079069411", ["email"]).then(function(result) {
				$http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: result.access_token, fields: "id,name,email,gender", format: "json" }}).then(function(result) {
					var dID = oneSignalID;
					var query = result.data.id+','+result.data.email+','+result.data.name+','+result.data.gender+','+dID;
				$scope.ajaxRequest = A.Query.get({action : 'fbconnect',query: query });
				$scope.ajaxRequest.$promise.then(function(){							
					$localstorage.setObject('user', $scope.ajaxRequest.user);
					usPhotos = $scope.ajaxRequest.user.photos;
					$state.go('home.explore');	
				},
				function(){
					awlert.neutral('Something went wrong. Please try again later',3000);
				});
				
				}, function(error) {
				alert("There was a problem getting your profile.  Check the logs for details.");
					console.log(error);
				});
			 }, function(error) {
				 alert("Auth Failed..!!"+error);
			 });	
			} else {
				FB.getLoginStatus(function(response) {
				    if (response.status === 'connected') {
			            FB.api('/me', {
			              	 fields: 'id,name,email,gender'
			            }, function(response) {
							var dID = oneSignalID;
							var query = response.id+','+response.email+','+response.name+','+response.gender+','+dID;
							$scope.ajaxRequest = A.Query.get({action : 'fbconnect',query: query });
							$scope.ajaxRequest.$promise.then(function(){							
								$localstorage.setObject('user', $scope.ajaxRequest.user);
								usPhotos = $scope.ajaxRequest.user.photos;
								$state.go('home.explore');	
							},
							function(){
								awlert.neutral('Something went wrong. Please try again later',3000);
							});		
						});
				    } else {
						FB.login(function(response){
							if(response.authResponse){
					            FB.api('/me', {
					                fields: 'id,name,email,gender'
					            }, function(response) {
									var dID = oneSignalID;
									var query = response.id+','+response.email+','+response.name+','+response.gender+','+dID;
									$scope.ajaxRequest = A.Query.get({action : 'fbconnect',query: query });
									$scope.ajaxRequest.$promise.then(function(){							
										$localstorage.setObject('user', $scope.ajaxRequest.user);
										usPhotos = $scope.ajaxRequest.user.photos;
										$state.go('home.explore');	
									},
									function(){
										awlert.neutral('Something went wrong. Please try again later',3000);
									});		
								});
							}
						})	
				    } 
				});				
			}		 
		};
  })  

  .controller('RegisterCtrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice) {
	var reg = '';								   
	var app = $localstorage.getObject('app'); 
	var w;
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	$('[data-tlid]').each(function(){
	  var id = $(this).attr('data-tlid');
	  $(this).text(tlang[id].text);
	});
	$scope.lname = lang[26].text;
	$scope.lemail = lang[28].text;
	$scope.lpass = lang[29].text;
	$scope.nexttext = alang[26].text;
	$scope.regPhoto = '';
	alang = $localstorage.getObject('alang');
	lang = $localstorage.getObject('lang');
	tlang = $localstorage.getObject('tlang');
	var div = angular.element(document.getElementById('photo-upload'));
	w = angular.element(document.getElementById('photo-upload')).prop('offsetWidth'); 
	div.css('height',w+'px');
	window.addEventListener('native.keyboardshow', keyboardHandler);
	window.addEventListener('native.keyboardhide', keyboardHandler);
	function keyboardHandler(e){
		var div = angular.element(document.getElementById('photo-upload')); 
		w = angular.element(document.getElementById('photo-upload')).prop('offsetWidth'); 
		div.css('height',w+'px');
	}
	
	var val = 0;
	$scope.isActive = false;
	$('#regpass').keyup(function(){
		val = $('#regpass').val().length;
		if(val > 4){
			$scope.isActive = true;
		} else {
			$scope.isActive = false;
		}
    });	
	$scope.regBtn = false;
	var regPhoto = '';
	var con = false;
	$scope.next = function(user) {
		if(val < 4){
			return false;
		}
		if(con == false){
			awlert.neutral(alang[3].text,1000);
			return false;
		}		
		if(user.reg_name == ''){
			awlert.neutral(alang[4].text,1000);		
			return false;
		}
		if(user.reg_email == ''){
			awlert.neutral(alang[4].text,1000);
			return false;
		}
		if (!validateEmail(user.reg_email)) {		
			awlert.neutral(alang[5].text,1000);
			return false;		
		}
		if(user.reg_pass == ''){
			awlert.neutral(alang[4].text,1000);	
			return false;
		}
		regName = user.reg_name;
		reg = user.reg_name+'  '+user.reg_email+'  '+user.reg_pass;
		$localstorage.set('register',reg);
		$state.go('home.register3');
	};
	
	
	function validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}


	 $scope.processFiles = function(files){
	    angular.forEach(files, function(flowFile, i){
	       var fileReader = new FileReader();
	          fileReader.onload = function (event) {
	            var uri = event.target.result;
					var image = uri;
					reg_photo = site_url+'assets/sources/uploads/'+oneSignalID+'.jpg';
					var div = angular.element(document.getElementById('photo-upload')); 
					div.css('background-image','url('+image+')');
					con = true;
					$.ajax({
						url: site_url+'assets/sources/appupload.php',
						data:{
							action: 'register',
							base64: image,
							uid: oneSignalID
						},
						cache: false,
						contentType: "application/x-www-form-urlencoded",				  
						type:"post",
						success:function(){
						}
					});	                
	          };
	          fileReader.readAsDataURL(flowFile.file);
	    });
	  };

	$scope.pick = function() {
		if (window.cordova) {
		var options = {
			quality: 40,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			encodingType: Camera.EncodingType.JPEG,
			allowEdit : true,
		};
		$cordovaCamera.getPicture(options).then(function(imageData) {
			var image = "data:image/jpeg;base64," + imageData;
			reg_photo = site_url+'assets/sources/uploads/'+oneSignalID+'.jpg';
			var div = angular.element(document.getElementById('photo-upload')); 
			div.css('background-image','url('+image+')');
			con = true;
			$.ajax({
				url: site_url+'assets/sources/appupload.php',
				data:{
					action: 'register',
					base64: image,
					uid: oneSignalID
				},
				cache: false,
				contentType: "application/x-www-form-urlencoded",				  
				type:"post",
				success:function(){
				}
			});
		}, function(err) {
		  // error
		});
		} else {
			$('#uploadRegPhoto').click();
		}
	};		
	
	$ionicViewSwitcher.nextDirection("exit");	
  })
  
  .controller('Register2Ctrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera) {  
	var looking = 2;									
	var reg = $localstorage.get('register');
	$scope.isActive = true;
	$scope.regBtn = false;
	$scope.girl = true;
	$scope.boy = false;
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	$('[data-tlid]').each(function(){
	  var id = $(this).attr('data-tlid');
	  $(this).text(tlang[id].text);
	});
	$scope.nexttext = alang[26].text;
	$scope.selectGirl = function(){
		if($scope.girl){
			$scope.girl = false;
			looking = looking-2;
			if(looking == 0){
				$scope.isActive = false;	
			}
			console.log(looking);
		} else {
			$scope.girl = true;	
			$scope.isActive = true;
			looking = looking+2;
			console.log(looking);
		}
	}
	
	$scope.selectBoy = function(){
		if($scope.boy){
			$scope.boy = false;
			looking = looking-1;
			console.log(looking);
			if(looking == 0){
				$scope.isActive = false;	
			}			
		} else {
			$scope.boy = true;	
			$scope.isActive = true;
			looking = looking+1;
			console.log(looking);
		}
	}	
	$scope.send = function() {
		$scope.regBtn = true;
		var register =  new Array();
		register = reg.split('  ');		
		var dID = oneSignalID;
		$scope.ajaxRequest = A.Reg.get({action : 'register',reg_name: register[0], reg_email: register[1] , reg_pass: register[2], reg_birthday: register[3], reg_gender: register[4], reg_looking: looking , reg_photo : reg_photo, dID : dID });
		$scope.ajaxRequest.$promise.then(function(){						
			if($scope.ajaxRequest.error == 1){
				awlert.error($scope.ajaxRequest.error_m, 3000);
				$scope.regBtn = false;
				$scope.isActive = true;			
			} else {		
				$localstorage.setObject('user', $scope.ajaxRequest.user);	
				usPhotos = $scope.ajaxRequest.user.photos;
				sape = $scope.ajaxRequest.user.slike;
				$state.go('home.explore');	
			}
		},
		function(){
			awlert.error('Something went wrong. Please try again later',3000);
		}
	)};	
	$ionicViewSwitcher.nextDirection("exit");		
  })
  
  .controller('Register3Ctrl', function($scope, $state,$ionicViewSwitcher,$ionicModal,A,awlert, $ionicLoading, $timeout,$localstorage,$cordovaCamera) {
	var gender = 0;
	var reg = $localstorage.get('register');
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	$('[data-alid]').each(function(){
	  var id = $(this).attr('data-alid');
	  $(this).text(alang[id].text);
	});
	$('[data-lid]').each(function(){
	  var id = $(this).attr('data-lid');
	  $(this).text(lang[id].text);
	});
	$('[data-tlid]').each(function(){
	  var id = $(this).attr('data-tlid');
	  $(this).text(tlang[id].text);
	});
	$scope.lang31 = alang[31].text;
	$scope.nexttext = alang[26].text;
	
	$scope.isActive = false;
	$scope.regBtn = false;
	$scope.girl = false;
	$scope.boy = false;
	$scope.name = regName;	

	$scope.selectGirl = function(){
		if($scope.boy){
			$scope.boy = false;
			$scope.isActive = false;			
		}
		if($scope.girl){
			$scope.girl = false;
			$scope.isActive = false;	
		} else {
			$scope.girl = true;	
			$scope.isActive = true;
			gender = 2;
		}
	}
	
	$scope.selectBoy = function(){
		if($scope.girl){
			$scope.girl = false;
			$scope.isActive = false;	
		}		
		if($scope.boy){
			$scope.boy = false;
			$scope.isActive = false;			
		} else {
			$scope.boy = true;	
			$scope.isActive = true;
			gender = 1;
		}
	}	
	
	$scope.send = function() {
		var date = $('#birth').val();
		if(date == ''){
			awlert.neutral(alang[6].text,3000);	
			return false;
		}
		reg = reg +'  '+ date +'  '+ gender;
		$localstorage.set('register',reg);
		$state.go('home.register2');
	};
			
	$ionicViewSwitcher.nextDirection("exit");	
  })
  
  .controller('ExploreCtrl', function($scope,$state,$sce,$ionicPlatform, $ionicModal,A,$localstorage,Navigation,awlert,$ionicViewSwitcher,currentUser) {
	url = 'explore';
	user = $localstorage.getObject('user'); 
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	app = $localstorage.getObject('app');
	$scope.newChat = false;
	$scope.discoverChat = true;
	$scope.discoverSlike = true;

    $scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	  }  
	
	$scope.logo = app.logo;
	$scope.alang = [];
	$scope.lang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});

	//load chat
	var chat = function () {
		try {
		  $scope.ajaxRequest2 = A.Game.get({action: 'getChat', id: user.id});
		  $scope.ajaxRequest2.$promise.then(function(){
				$scope.matches = $scope.ajaxRequest2.matches;
				$scope.unread = $scope.ajaxRequest2.unread;
				chats = $scope.matches;
				unread = $scope.unread;
				if(unread != null){
					$scope.unrread = unread.length;
					unread = unread.length;
				}
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	chat();

	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}
	show_ad++;
	$scope.cu2 = [];
	$scope.chatUser = function(url,slide,val) {
		currentUser.selectedUser=val;
		$state.go(url, val);  
	};	
	
	
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;

	s_age = user.sage;
	user_country = user.country;
	user_city = user.city;	
	
	$scope.superLike = user.slike;
	$scope.uphoto = user.profile_photo;
	$scope.changePage = function(url,slide,val) {
		Navigation.goNative(url, val, slide);  
	};
	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}
	$scope.goToSettings = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.settings');		
	}	
	$scope.loading = alang[8].text;

	var gameAction = function (id,action) {
		try {		  
		  $scope.ajaxRequest2 = A.Meet.get({action: 'game_like',uid1: user.id, uid2: id, uid3: action});
		  $scope.ajaxRequest2.$promise.then(function(){				
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}		
	}
	
	var card = function () {
		try {		  
		  $scope.ajaxRequest = A.Game.get({action: 'game',id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){											
				cards = $scope.ajaxRequest.game;			
				cu = cards[0].id;
				$scope.cu2 = cards[0];
			    _addCards(2);				
		  },
		  function(){ 
		  	$scope.loading = alang[7].text; 
			//awlert.neutral('Nothing found, try choosing a new location.', 3000);
			}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}

	card();
    var resetCards = angular.copy(cards);
    $scope.cards = [];
	
    function _addCards(quantity) {
      for (var i = 0; i < Math.min(cards.length, quantity); i++) {
        $scope.cards.push(cards[0]);
        cards.splice(0, 1);
      }
    }

	
    $scope.cardDestroyed = function(index,act) {
	  if(act == 1){
	 	if ($scope.cards[index].isFan == 1){
			 $scope.openMatchModal();
				var w = window.innerWidth;
				w = w/3;
				$scope.width = w;
			 $scope.cu3 = $scope.cards[index];
			 $scope.myPhoto = user.profile_photo;
			alang.forEach(function(entry) {					  
			  $scope.alang.push({
				id: entry,
				text: entry.text
			  });
			});			 
		};
	  }
      $scope.cards.splice(index, 1);
      _addCards(1);
	  cu = $scope.cards[index].id;
	  $scope.cu2 = $scope.cards[index];
      $scope.isMoveLeft = false;
      $scope.isMoveRight = false;
    };

    $scope.cardSwiped = function(index) {
      $scope.cards.splice(index, 1);
    };
	
	$scope.like = function(){
	  gameAction(cu,1);
	  
	}
	
	$scope.slike = function(){
	  if($scope.cards.length > 0){
		  if($scope.superLike > 0){
			  awlert.neutral(alang[9].text, 3000);
			  var int = parseInt($scope.superLike);
			  $scope.superLike = int-1;	 
			  sape = sape-1;
			  gameAction(cu,3);	
			  $scope.cardDestroyed(0,1);
		  } else {
			  $scope.slikephoto = $scope.cu2.photo;
			  $scope.noSlike = true;
		  }
	  }
	}	
	
	$scope.buySlike = function(){
		user.credits = parseInt(user.credits);
		if(400 > user.credits){
			$scope.openCreditsModal();
		} else {
			$scope.noSlike = false;
			var ma = user.id + ',400,10';
			awlert.neutral(alang[9].text, 3000);	  
			gameAction(cu,3);
			$scope.cardDestroyed(0,1);			
			try {	
			  $scope.ajaxRequest = A.Query.get({action: 'slike', query: ma});
			  $scope.ajaxRequest.$promise.then(function(){		
			  $localstorage.setObject('user',$scope.ajaxRequest.user);
			  user = $localstorage.getObject('user'); 
			  $scope.superLike = user.slike;
				var int = parseInt($scope.superLike);
				$scope.superLike = int-1;
				sape = user.slike;
				sape = sape-1;				
			  },
			  function(){}
			  )		 
			}
			catch (err) {
				console.log("Error " + err);
			}
		}
	};	
	
	$scope.noBtnSlike = function(){
	  $scope.noSlike = false;			
	}	
	
	$scope.nolike = function(){
	  gameAction(cu,0);				
	}	
	
    // For reasons, the cardSwipedRight and cardSwipedLeft events don’t get called always
    // https://devdactic.com/optimize-tinder-cards/
    $scope.cardSwipedLeft = function(event, index) {
	  gameAction($scope.cards[index].id,0);		
     event.stopPropagation();
    }
	

    $scope.cardSwipedRight = function(event, index) {	
	  gameAction($scope.cards[index].id,1);
      event.stopPropagation();
      //if ($scope.cards[index].isFan == 1){$scope.openMatchModal()};
    }

    $scope.cardPartialSwipe = function(amt) {
      $scope.isMoveLeft = amt < -0.15;
      $scope.isMoveRight = amt > 0.15;  
    }

    // Match popup
    $ionicModal.fromTemplateUrl('templates/modals/match.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.matchModal = modal;
    });

    $scope.openMatchModal = function(isFromCard) {
      $scope.matchModal.show();
    }
    $scope.closeMatchModal = function() {
      $scope.matchModal.hide();
    };

  })

  .controller('SettingsCtrl', function($state,$ionicViewSwitcher,$scope,A, $ionicModal,$localstorage,Navigation) {
	user = $localstorage.getObject('user');
	url = 'settings';
	lang = $localstorage.getObject('lang');
	alang = $localstorage.getObject('alang');
	tlang = $localstorage.getObject('tlang');
	$scope.alang = [];
	$scope.lang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	lang.forEach(function(entry) {					  
	  $scope.lang.push({
		id: entry,
		text: entry.text
	  });
	});	
	if(user.premium == 1){
		$scope.notPremium = false;	
	} else {
		$scope.notPremium = true;	
	}
	$scope.id = user.id;
	$scope.city = user.city;
	$scope.age = user.age;
	$scope.name = user.name;
	$scope.photo = user.profile_photo;	
	$scope.credits = user.credits;		
	profilePhoto(user.profile_photo);
	$scope.changePage = function(url,slide,val) {
		Navigation.goNative(url, val, slide);  
	};
	$scope.freeCre = false;
	
	$scope.logout = function(){
		var message = oneSignalID;
		A.Query.get({action: 'logout', query: message});
		$localstorage.setObject('user','');
		chats = [];
		matche = [];
		mylikes = [];
		myfans = [];
		cards = [];
		visitors = [];		
		$state.go('loader');		
	}	
	$scope.goToExplore = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.explore');		
	}
	
	$scope.goToMatches = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.match');		
	}	
	
	$scope.goToVisitors = function(){
		$ionicViewSwitcher.nextDirection('forward'); // 'forward', 'back', etc.
		$state.go('home.visitors');		
	}		
	
	
  })
  
  .controller('VisitorsCtrl', function($scope,$ionicViewSwitcher,$ionicPlatform,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	url = 'visitors';
	lang = $localstorage.getObject('lang');
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];
	$scope.tlang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}	
	show_ad++;	
	tlang.forEach(function(entry) {					  
	  $scope.tlang.push({
		id: entry,
		text: entry.text
	  });
	});
	user = $localstorage.getObject('user');
	var aBasic = $localstorage.getObject('account_basic');
	var aPremium = $localstorage.getObject('account_premium');	
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	
	$scope.changePage = function(url,slide,val) {
		if($scope.canSeeVisitors){
			currentUser.selectedUser=val;
			$state.go(url, val); 
		}  
	};	
	
    $scope.show = 1;
	$scope.photo = user.profile_photo;
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	$scope.noVisitors = false;
	if(user.premium == 0 && aBasic.visits == 0){
		$scope.canSeeVisitors = false;
	} else {
		$scope.canSeeVisitors = true;
	}
	$scope.max = 20;
	
	var visits = function () {
		try {
		  $scope.visitors = visitors;
		  $scope.ajaxRequest = A.Game.get({action: 'getVisitors', id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){
				if($scope.ajaxRequest.visitors != null){				
					$scope.visitors = $scope.ajaxRequest.visitors;
					visitors = $scope.visitors;
				} else {
					$scope.noVisitors = true;	
					visitors = $scope.visitors;
				}	
				
		  },
		  function(){$scope.noVisitors = true;}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	visits();
	$scope.title = alang[10].text;
  })
    
  .controller('MatchCtrl', function($scope,$ionicViewSwitcher,$ionicPlatform,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	user = $localstorage.getObject('user');
	lang = $localstorage.getObject('lang');
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.firstmeprice = site_prices.first;
	$scope.cienmeprice = site_prices.discover;
	$scope.alang = [];
	$scope.tlang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	tlang.forEach(function(entry) {					  
	  $scope.tlang.push({
		id: entry,
		text: entry.text
	  });
	});

	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}	
	show_ad++;	
	url = 'match';
	var aBasic = $localstorage.getObject('account_basic');
	var aPremium = $localstorage.getObject('account_premium');		
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	$scope.changePage = function(url,slide,val) {
		if($scope.canSeeFans || $scope.canSeeFans == false && $scope.show != 2){
			currentUser.selectedUser=val;
			$state.go(url, val); 
		}
	};	
   	$scope.onTabShow = function(val,title){
		$scope.show = val;	
		$scope.title = title;		
		if(user.premium == 0 && aBasic.fans == 0 && val == 2){
			$scope.canSeeFans = false;
		} else {
			$scope.canSeeFans = true;
		}		
	    viewScroll.scrollTop(true);
	}
	$scope.photo = user.profile_photo;
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	$scope.noMatches = false;
	$scope.noLikes = false;
	$scope.noFans = false;
	$scope.noSuperLike= false;
	
	$scope.newlikes = 0;
	$scope.newfans = 0;	
	$scope.max = 20;
	
	var matches = function () {
		try {
		  $scope.matches = matche;
		  $scope.mylikes = mylikes;
		  $scope.myfans = myfans;
		  $scope.superlikes = superlikes;
		  
		  $scope.ajaxRequest = A.Game.get({action: 'getMatches', id: user.id});
		  $scope.ajaxRequest.$promise.then(function(){
				if($scope.ajaxRequest.matches != null){				
					$scope.matches = $scope.ajaxRequest.matches;
					matche = $scope.matches;
				} else {
					$scope.noMatches = true;	
					matche = $scope.matches;
				}
				if($scope.ajaxRequest.mylikes != null){				
					$scope.mylikes = $scope.ajaxRequest.mylikes;
					mylikes = $scope.mylikes;
				} else {
					$scope.noLikes = true;	
					mylikes = $scope.mylikes;
				}

				if($scope.ajaxRequest.superlikes != null){				
					$scope.superlikes = $scope.ajaxRequest.superlikes;
					superlikes = $scope.superlikes;
				} else {
					$scope.noSuperLike = true;	
					superlikes = $scope.superlikes;
				}				
				
				if($scope.ajaxRequest.myfans != null){				
					$scope.myfans = $scope.ajaxRequest.myfans;
					myfans = $scope.myfans;
				} else {
					$scope.noFans = true;	
					myfans = $scope.myfans;
				}							
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	matches();
	$scope.title = alang[11].text;
  })
  
  
  

  .controller('MatchesCtrl', function($scope,$ionicPlatform,$ionicViewSwitcher,$ionicListDelegate,$state,Navigation,$localstorage,A,$sce,$ionicScrollDelegate,$interval,currentUser) {
	$interval.cancel(chatInterval);
	user = $localstorage.getObject('user');
	url = 'messages';
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.spotlightprice = site_prices.spotlight;
	$scope.alang = [];
	$scope.tlang = [];
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	tlang.forEach(function(entry) {					  
	  $scope.tlang.push({
		id: entry,
		text: entry.text
	  });
	});
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');	
	$scope.changePage = function(url,slide,val) {
		currentUser.selectedUser=val;
		$state.go(url, val);  
	};	
    $scope.show = 1;
   	$scope.onTabShow = function(val){
		$scope.show = val;	
		 viewScroll.scrollTop(true);
	}
	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}	
	show_ad++;	
	$scope.unrread = 0;
	$scope.contacts = 0;
	
	var chat = function () {
		try {
		  $scope.matches = chats;
		  $scope.unread = unread;

		  $scope.ajaxRequest2 = A.Game.get({action: 'getChat', id: user.id});
		  $scope.ajaxRequest2.$promise.then(function(){
				$scope.matches = $scope.ajaxRequest2.matches;
				$scope.unread = $scope.ajaxRequest2.unread;
				chats = $scope.matches;
				unread = $scope.unread;
				if(unread != null){
					$scope.unrread = unread.length;
					unread = unread.length;
				}
				$scope.contacts = 1;

		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}	
	chat();

    chatInterval = $interval(function() {
		if($scope.show != 3){
			chat();
		}
     }, 3000)
	$scope.onItemDelete = function(item) {
		var query = user.id+','+item.id;
		A.Query.get({action: 'del_conv' ,query: query});	
		$('.item-content').css({
		  'transform'         : 'translate3d(0px,0px,0px)'
		});
	};	
	$scope.shouldShowDelete = true;
	$scope.listCanSwipe = true;
	
		
  })

  .controller('MessagingCtrl', function($state,$scope,$ionicPlatform,$interval,$ionicViewSwitcher,A, $stateParams, Giphy, $ionicScrollDelegate, $timeout, $ionicActionSheet,Navigation,currentUser,$localstorage,$ionicHistory,$ionicPopup,$cordovaCamera) {	
	user = $localstorage.getObject('user');
	alang = $localstorage.getObject('alang');
	config = $localstorage.getObject('config');
	chatUser = currentUser.selectedUser;
	url = 'chat';
	var gifts = $localstorage.getObject('gifts');
	tlang = $localstorage.getObject('tlang');
	alang = $localstorage.getObject('alang');
	site_prices = $localstorage.getObject('prices');
	$scope.dailychatprice = site_prices.chat;
	$scope.alang = [];
	$scope.tlang = [];
	$scope.checkFocus = false;
	//ADMOB
	if(show_ad == max_ad){
		if(window.AdMob) window.AdMob.prepareInterstitial( {adId:adMobI, autoShow:true} );
		
		show_ad = 0;	
	}
	show_ad++;
	alang.forEach(function(entry) {					  
	  $scope.alang.push({
		id: entry,
		text: entry.text
	  });
	});
	tlang.forEach(function(entry) {					  
	  $scope.tlang.push({
		id: entry,
		text: entry.text
	  });
	});
	$scope.gifts = gifts;
	$scope.sendGiftShow = false;
	
	$scope.goBack = function(){
		$ionicHistory.goBack();	
	}
	$scope.buyDailyChat = function(){
		user.credits = parseInt(user.credits);
		if(site_prices.chat > user.credits){
			$scope.openCreditsModal();
		} else {
			var ma = user.id + ','+ site_prices.chat;
			 $scope.chatLimit = false;
				try {	
				  $scope.ajaxRequest = A.Query.get({action: 'chat_limit', query: ma});
				  $scope.ajaxRequest.$promise.then(function(){		
				  $scope.ajaxRequest.user = $localstorage.setObject('user');
				  },
				  function(){}
				  )		 
				}
				catch (err) {
					console.log("Error " + err);
				}
		}
	};
	
	$scope.sendPhoto = function(x){
		if(x == 1){
			var options = {
				quality: 40,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				encodingType: Camera.EncodingType.JPEG,
				allowEdit : false,
			};
		}else {
			var options = {
				quality: 40,
				destinationType: Camera.DestinationType.DATA_URL,
				encodingType: Camera.EncodingType.JPEG,
				allowEdit : false,
			};
		}

		$cordovaCamera.getPicture(options).then(function(imageData) {
			var image = "data:image/jpeg;base64," + imageData;
			  $scope.nmessages.push({
				isMe: true,
				seen:1,
				type: 'image',
				body: image
			  });
			$.ajax({
				url: site_url+'assets/sources/appupload.php',
				data:{
					action: 'sendChat',
					base64: image,
					uid: user.id,
					rid: currentUser.selectedUser.id
				},
				cache: false,
				contentType: "application/x-www-form-urlencoded",				  
				type:"post",
				dataType:'JSON',
				success:function(response){
					
				}
			});
		}, function(err) {
		  // error
		});		
	}
	$scope.sendGift = function(icon,price){
		$scope.gift_icon = icon;
		$scope.gift_price = price;
		user.credits = parseInt(user.credits);
		if(user.credits < price){
			$scope.openCreditsModal("'"+user.profile_photo+"'");
		} else {
			$scope.sendGiftShow = true;
		}
	}
	$scope.cancelGift = function(){		
		$scope.sendGiftShow = false;
	}	
	$scope.changePage = function(url,slide,val) {
		Navigation.goNative(url, val, slide);  
	};
	$interval.cancel(chatInterval);
	$scope.goToChat = function(){
		$ionicViewSwitcher.nextDirection('back'); // 'forward', 'back', etc.
		$state.go('home.matches');		
	}
	$scope.actions = true;
	$scope.visible = function(val){
		if(val == 1){
			$scope.actions = false;	
		} else {
			$scope.actions = true;
		}
	}
	var bIds = {};	
	
	$scope.showm = 15;
	
	$scope.loadMoreMen = function(more){
		var total = more + $scope.showm;
		var totalMe = $scope.totalMen - more;
		if(totalMe <= 0 ){
			totalMe = 0;	
			$scope.moreMen = false;
		}
		$scope.totalMen = totalMe;
		$scope.showm = total;
	}
	
	var w = window.innerWidth;
	w = w/2;
	if(w > 200){
		w = 200;
	}
	$scope.w = w;
	var premium = 0;
	var blocked = 0;
	$scope.maxDaily = false;
    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
	$scope.messages = [];
	$scope.nmessages = [];    
	var getChat = function (id) {
		try {	
		  $scope.ajaxRequest = A.Chat.get({action: 'userChat', uid1: user.id, uid2: id});
		  $scope.ajaxRequest.$promise.then(function(){		
		  $scope.messages=$scope.ajaxRequest.chat;
		  premium = $scope.ajaxRequest.premium;
		  blocked = $scope.ajaxRequest.blocked;
		  if(blocked == 1){
		   var confirmPopup = $ionicPopup.confirm({
			 title: alang[12].text+' '+ currentUser.selectedUser.name,
			 template: currentUser.selectedUser.name +' ' + alang[13].text
		   });
		   confirmPopup.then(function(res) {
			 if(res) {
				$ionicHistory.goBack();
			 }
		   });				  
		  }
		  if(premium == 1){
				  $scope.chatLimit = true;
		  }
			if ($scope.messages === undefined || $scope.messages.length == 0) {
			  $scope.checkFocus = true;
			}
		  if($scope.messages.length > 26){
			$scope.moreMen = true;
			$scope.totalMen = $scope.messages.length - 15;
		  }

		  viewScroll.scrollBottom(true);
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}
	
	var getCChat = function (id) {
		try {	
		  $scope.ajaxRequest = A.Chat.get({action: 'userCChat', uid1: user.id, uid2: id});
		  $scope.ajaxRequest.$promise.then(function(){		
		  $scope.nmessages=$scope.ajaxRequest.chat;
		  if($scope.nmessages.length > 0){
			viewScroll.scrollBottom(true);
		  }
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	}


	var sendMessage = function (message) {
		try {	
			if ($scope.messages === undefined || $scope.messages.length == 0 && $scope.nmessages === undefined || $scope.nmessages.length == 0) {
				 A.Query.get({action: 'today', query: user.id});
			}
		  $scope.ajaxRequest2 = A.Query.get({action: 'sendMessage', query: message});
		  $scope.ajaxRequest2.$promise.then(function(){	
			
		  },
		  function(){}
		  )		 
		}
		catch (err) {
			console.log("Error " + err);
		}	
	} 	

	
	$scope.name = currentUser.selectedUser.name;
	$scope.photo = currentUser.selectedUser.photo;
	$scope.age = currentUser.selectedUser.age;
	$scope.city = currentUser.selectedUser.city;
	$scope.id = currentUser.selectedUser.id;
	var addvisit = user.id+','+currentUser.selectedUser.id;
	A.Query.get({action: 'addVisit', query: addvisit});
	$scope.status = false;
	$scope.chatLimit = false;
	getChat(currentUser.selectedUser.id);	
	if(currentUser.selectedUser.status == 1){
		$scope.status = true;
	}
    chatInterval = $interval(function() {
		getCChat(currentUser.selectedUser.id);
     }, 3000)	
    $scope.isNew = false;
    $scope.gifs = [];
    $scope.gifQuery = '';
    $scope.isGifShown = false;
    $scope.isGiftShown = false;
    $scope.isGifLoading = false;


    $scope.message = '';
	var sendNewChat = 0;
    $scope.sendText = function(m) {
	  sendNewChat = $scope.nmessages.length + 1;
      $scope.nmessages.push({
        isMe: true,
		seen:0,
        type: 'text',
        body: m
      });
	  var message = user.id+','+currentUser.selectedUser.id+','+m+',text';
	  sendMessage(message);
	  viewScroll.scrollBottom(true);
    }

    $scope.newGif = function(newValue) {
      if (newValue.length) {
        $scope.isGifLoading = true;
        $scope.gifs = [];

        Giphy.search(newValue)
          .then(function(gifs) {
            $scope.gifs = gifs;
            $scope.isGifLoading = false;
          })
      } else {
        _initGiphy();
      }
    }
	
    $scope.sendGif = function(imageUrl) {
      $scope.nmessages.push({
        isMe: true,
        type: 'image',
        body: imageUrl
      });
	  var message = user.id+','+currentUser.selectedUser.id+','+imageUrl+',image';
	  sendMessage(message);
      $scope.cmen = '';
	  $scope.isGifShown = false;
	  viewScroll.scrollBottom(true);
    }
	
    $scope.sendGiftBtn = function(imageUrl,price) {
	  var m = '<img src="'+imageUrl+'"/>';
      $scope.nmessages.push({
        isMe: true,
        type: 'text',
        body: '<img src="'+imageUrl+'"/>'
      });
	  var message = user.id+','+currentUser.selectedUser.id+','+m+',gift,'+price;
	  sendMessage(message);
      $scope.cmen = '';
	  $scope.isGiftShown = false;
	  viewScroll.scrollBottom(true);
    }

    $scope.openGiphy = function() {
      $scope.isGifShown = true;
	  $scope.actions = true;
      $scope.message = '';
    }
    $scope.openGift = function() {
      $scope.isGiftShown = true;
	  $scope.actions = true;
      $scope.message = '';
    }	
	
    $scope.closeGift = function() {
      $scope.isGiftShown = false;
    }		
	
    $scope.closeGiphy = function() {
      $scope.isGifShown = false;
      $scope.message = '';
    }	

    var _scrollBottom = function(target) {
      target = target || '#type-area';

      viewScroll.scrollBottom(true);
      _keepKeyboardOpen(target);
      if ($scope.isNew) $scope.isNew = false;
    }

    var _keepKeyboardOpen = function(target) {
      target = target || '#type-area';

      txtInput = angular.element(document.body.querySelector(target));
      console.log('keepKeyboardOpen ' + target);
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }

    $scope.showUserOptions = function() {
      var hideSheet = $ionicActionSheet.show({
		titleText: alang[14].text,									 
        buttons: [
          { text: alang[15].text },
          { text: alang[16].text },
          { text: alang[17].text +' '+currentUser.selectedUser.name }
        ],
        cancelText: alang[2].text,
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
			if(index == 0){
				$scope.openProfileModal(currentUser.selectedUser.id,currentUser.selectedUser.name,currentUser.selectedUser.photo,currentUser.selectedUser.age,currentUser.selectedUser.city);
			}
			if(index == 1){
				var query = user.id+','+currentUser.selectedUser.id;
				A.Query.get({action: 'del_conv' ,query: query});
				$state.go('home.matches');
			}
			if(index == 2){

				   var confirmPopup = $ionicPopup.confirm({
					 title: alang[17].text+' '+ currentUser.selectedUser.name,
					 template: alang[18].text +' '+ currentUser.selectedUser.name +'?'
				   });
				
				   confirmPopup.then(function(res) {
					 if(res) {
						var query = user.id+','+currentUser.selectedUser.id;
						A.Query.get({action: 'block' ,query: query});
						setTimeout(function(){
							$state.go('home.matches');
						},550);
					 } else {
					   
					 }
				   });
				 };	
			
          return true;
        }
      });
    }

    var _initGiphy = function() {
      Giphy.trending()
        .then(function(gifs) {
          $scope.gifs = gifs;
        });
    }
    _initGiphy();
  })
  

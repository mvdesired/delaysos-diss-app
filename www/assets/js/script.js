var config = {
    apiKey: "AIzaSyCNOzQErT0vOc9w_mWMVU9llbDWwXJNNco",
    authDomain: "diss-delay-sos-a8fb5.firebaseapp.com",
    databaseURL: "https://diss-delay-sos-a8fb5.firebaseio.com",
    projectId: "diss-delay-sos-a8fb5",
    storageBucket: "diss-delay-sos-a8fb5.appspot.com",
    messagingSenderId: "371285976427"
};
firebase.initializeApp(config);
const lcl = window.localStorage;
const fbAuth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();
const messagesRef = database.ref('messages');
const userData = database.ref('users');
const loadingImg = globals.site_url+'/assets/image/bx_loader.gif';
const messageSentAudio = new Audio(globals.site_url+'/assets/audio/message-sent.mp3');
const messageGetAudio = new Audio(globals.site_url+'/assets/audio/message-get.mp3');
const uploadingImageTemplate = '<div class="uploading"><i class="lnr lnr-sync fa-spin"></i></div>';
const uploadedImageTemplate = '<div class="uploaded"><i class="lnr lnr-checkmark-circle"></i></div>';
var latitude = 25.538043;
var longitude = -80.3309328;
var map;
var infowindow;
var multifilesArray = [];
var profilePicChanged = '';
var markers = [];
var locations=[];
var chatUsers = [];
jQuery(document).ready(function($) {
    $(window).on('load',function(){
        notiMsg(200,"I am the passenger");
        fbAuth.onAuthStateChanged(onAuthStateChanged);
    });
    $(document).on('click','.change-form',function(e){
        e.preventDefault();
        var current = $(this);
        var openDiv = current.data('open-form');
        var closeDiv = current.data('close-form');
        $('.'+closeDiv).addClass('hidden');
        $('.'+openDiv).removeClass('hidden');
    });
    /*Login Logout Functions Starts*/
    $(document).on('click','.lb-btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        var lFrm = current.parents('form')[0];
        var lEmail = lFrm.lEmail.value;
        var lPassword = lFrm.lPassword.value;
        var oldHtml = current.html();
        current.html(globals.spinner);
        fbAuth.signInWithEmailAndPassword(lEmail, lPassword).then(function(result){
            openLoader();
            $('.login-sec').addClass('hidden')
            $('.chat-sec').removeClass('hidden');
            RnOnFirstGeo();
            loadMessages(true);
            lcl.isLoggedIn = true;
            lcl.uid = result.uid;
            notiMsg('success','Successfully logged in');
            current.html(oldHtml);
        }).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          current.html(oldHtml);
          notiMsg('error',errorMessage);
      });
    });
    $(document).on('click','.rb-btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        var lFrm = current.parents('form')[0];
        var rEmail = lFrm.rEmail.value;
        var rPassword = lFrm.rPassword.value;
        var rName = lFrm.rName.value;
        var rMobile = lFrm.rMobile.value;
        var rCPassword = lFrm.rCPassword.value;
        var oldHtml = current.html();
        fbAuth.createUserWithEmailAndPassword(rEmail, rPassword).then(function(result){
            openLoader();
            $('.login-sec').addClass('hidden')
            $('.chat-sec').removeClass('hidden');
            RnOnFirstGeo();
            loadMessages(true);
            lcl.isLoggedIn = true;
            lcl.uid = result.uid;
            var user = fbAuth.currentUser;
            user.updateProfile({displayName:rName,phoneNumber: rMobile}).then(function(){}, function(error) {
              console.log(error);
            });
            userData.child(result.uid).set({
              email: rEmail,
              displayName:rName,
              phoneNumber: rMobile,
              photoURL : ''
            }).then(function() {
              profilePicChanged = '';
            }, function(error) {
                notiMsg('error',error);
              // An error happened.
          });
            notiMsg('success','Registration succcessfully completed');
            current.html(oldHtml);
        }).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              notiMsg('error',errorMessage);
              current.html(oldHtml);
        });
    });
    $(document).on('click','.rsb-btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        var lFrm = current.parents('form')[0];
        var resetEmail = lFrm.resetEmail.value;
        var oldHtml = current.html();
        current.html(globals.spinner);
        fbAuth.sendPasswordResetEmail(resetEmail)
        .then(function(result){
            current.html(oldHtml);
            notiMsg('success','Please check your email for resetting password');
        })
        .catch(function(error){
            var jsonS = JSON.parse(error.message);
            notiMsg('error',jsonS.error.message);
            current.html(oldHtml);
        });
    });
    $(document).on('click','.fb-btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        var oldHtml = current.html();
        current.html(globals.spinner);
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.setCustomParameters({'display': 'popup'});
        fbAuth.signInWithPopup(provider).then(function(result) {
            openLoader();
            $('.login-sec').addClass('hidden')
            $('.chat-sec').removeClass('hidden');
            RnOnFirstGeo();
            loadMessages(true);
            lcl.isLoggedIn = true;
            lcl.uid = result.uid;
            var user = fbAuth.currentUser;
            user.updateProfile({displayName:rName,phoneNumber: rMobile}).then(function(){}, function(error) {
              console.log(error);
            });
            userData.child(result.uid).set({
              email: rEmail,
              displayName:rName,
              phoneNumber: rMobile,
              photoURL : ''
            }).then(function() {
              profilePicChanged = '';
            }, function(error) {
                notiMsg('error',error);
              // An error happened.
            });
            current.removeClass('ng-clicked');
            notiMsg('success','Successfully logged in with Facebook');
            current.html(oldHtml);
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            notiMsg('error',errorMessage);
            current.removeClass('ng-clicked');
            current.html(oldHtml);
        });
    });
    $(document).on('click','.tw-btn',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        var oldHtml = current.html();
        current.html(globals.spinner);
        current.addClass('ng-clicked');
        var provider = new firebase.auth.TwitterAuthProvider();
        fbAuth.signInWithPopup(provider).then(function(result){
            openLoader();
            $('.login-sec').addClass('hidden')
            $('.chat-sec').removeClass('hidden');
            RnOnFirstGeo();
            loadMessages(true);
            lcl.isLoggedIn = true;
            lcl.uid = result.uid;
            var user = fbAuth.currentUser;
            user.updateProfile({displayName:rName,phoneNumber: rMobile}).then(function(){}, function(error) {
              console.log(error);
            });
            userData.child(result.uid).set({
              email: rEmail,
              displayName:rName,
              phoneNumber: rMobile,
              photoURL : ''
            }).then(function() {
              profilePicChanged = '';
            }, function(error) {
                notiMsg('error',error);
              // An error happened.
            });
            current.removeClass('ng-clicked');
            notiMsg('success','Successfully logged in with Twitter');
            current.html(oldHtml);
        }).catch(function(error){
            var errorCode = error.code;
            var errorMessage = error.message;
            notiMsg('error',errorMessage);
            current.html(oldHtml);
            current.removeClass('ng-clicked');
        });
    });
    $('.lgt-btn').on('click',function(e){
        e.preventDefault();
        fbAuth.signOut().then(function() {
            openLoader();
            lcl.isLoggedIn = false;
            $('.login-sec').removeClass('hidden')
            $('.chat-sec').addClass('hidden');
            $('.cssa-inner').empty();
            setTimeout(function(){closeLoader();notiMsg('success','Successfully Loggedout');},200);
        }).catch(function(error) {
          notiMsg('error',error.message);
        });
    });
    /*Login Logout Functions End*/
    /*Message Sending Starts*/
    $('.main-msg-bx').on('keyup',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        if(e.which == 13 && e.keyCode == 13 && e.shiftKey == false){
            e.preventDefault();
            var curElem= $('.scbtb-btn');
            curElem.children('i').removeClass('lnr-rocket').addClass('lnr-sync fa-spin');
            sendMessages();
        }
    });
    $('.scbtb-btn').on('click',function(e){
        e.preventDefault();
        e.stopPropagation();
          sendMessages();
    });
    $('#chatAttach').on('change',function(e){
        e.preventDefault();
        var current = $(this);
        current.parent().removeClass('lnr-paperclip').addClass('lnr-sync fa-spin');
        for(var k=0;k<e.target.files.length;k++){
            var r = new FileReader();
            r.onloadend = (function(k){
                return function(event){
                    var createLiElem = $('<li />');
                    createLiElem.append('<span class="lnr lnr-cross remove-img" index="'+k+'"></span>');
                    var imageElement = $('<img />');
                    multifilesArray.push({"src":event.target.result,"isUpload":0,"file":e.target.files[k]});
                    imageElement[0].src = event.target.result;
                    createLiElem.append(imageElement);
                    createLiElem.appendTo('.atch-show ul');
                    if(k == e.target.files.length-1){
                        current.parent().removeClass('lnr-sync fa-spin').addClass('lnr-paperclip');
                        $('.atch-show').animate({bottom:'100%',opacity:1});
                    }
                };
            })(k,e.target.files);
             r.readAsDataURL(e.target.files[k]);
        }
    })
    $('.get_picture').on('click',function(){
      $('.file-attach-wrapper').toggleClass('active');
    });
    $('.openCamera').on('click',function(){
      $('.file-attach-wrapper').toggleClass('active');
      navigator.camera.getPicture(function(imageURI){
        var dataImage = "data:image/png;base64," + imageURI;
        multifilesArray.push({"src":dataImage,"isUpload":0,"file":dataImage});
        var createLiElem = $('<li />');
        createLiElem.append('<span class="lnr lnr-cross remove-img"></span>');
        var imageElement = $('<img />');
        imageElement[0].src = dataImage;
        createLiElem.append(imageElement);
        createLiElem.appendTo('.atch-show ul');
        $('.atch-show').animate({bottom:'100%',opacity:1});
      }, function(message){
        console.log(message);
      }, {
          quality: 50,
          targetWidth:400,
          targetHeight:400,
          destinationType: Camera.DestinationType.DATA_URL
      });
    });
    $('.openGallery').on('click',function(){
      $('.file-attach-wrapper').toggleClass('active');
      navigator.camera.getPicture(function(imageURI){
        var dataImage = "data:image/png;base64," + imageURI;
        multifilesArray.push({"src":dataImage,"isUpload":0,"file":dataImage});
        var createLiElem = $('<li />');
        createLiElem.append('<span class="lnr lnr-cross remove-img"></span>');
        var imageElement = $('<img />');
        imageElement[0].src = dataImage;
        createLiElem.append(imageElement);
        createLiElem.appendTo('.atch-show ul');
        $('.atch-show').animate({bottom:'100%',opacity:1});
      }, function(message){
        console.log(message);
      }, {
          quality: 50,
          targetWidth:400,
          targetHeight:400,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: Camera.DestinationType.DATA_URL
      });
    });
    $('.atch-show').on('click','.remove-img',function(e){
        e.preventDefault();
        var current = $(this);
        //curIndex = current.parents('li').index();
        multifilesArray.splice(0,1);
        current.parents('li').animate({'left':'-100px',opacity:0},250);
        setTimeout(function(){current.parents('li').remove()},255);
        if(multifilesArray.length < 1){
            $('.atch-show').animate({bottom:'-200%',opacity:0},250);
            //$('#chatAttach').val('');
        }
    });
    $('.geo-location').on('click',function(e){
        e.preventDefault();
        var current = $(this);
        if (navigator.geolocation) {
          current.removeClass('lnr-map-marker').addClass('lnr-sync fa-spin');
          navigator.geolocation.getCurrentPosition(function(position){
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              var currentUser = fbAuth.currentUser;
              // Add a new message entry to the Firebase Database.
              $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true&key=AIzaSyCvP5SCIU8gw1z4qaawNHZTPgqgQClpGSc')
              .then(function(response){
                  var results = response.results;
                  //$scope.randomLatLng();
                  placeNmae =  results[0].formatted_address;
                  map_image = getMapImage();
                  var mRefAr = {
                    name: currentUser.displayName,
                    text: '',
                    photoUrl: currentUser.photoURL || 'assets/image/profile_placeholder.png',
                    uid : currentUser.uid,
                    multiFiles:false,
                    location:true,
                    mapImage: map_image,
                    latitude: latitude,
                    longitude: longitude,
                    placeName: placeNmae,
                    send_on:curTimeStamp()
                  };
                  marker = new google.maps.Marker({
                      map: map,
                      draggable: true,
                      animation: google.maps.Animation.DROP,
                      position: {lat: latitude, lng: longitude}
                  });
                  marker.setMap(map);
                  messagesRef.push(mRefAr).then(function(result) {
                    $('.main-msg-bx').val('');
                    showOnMap(latitude,longitude);
                    sendNotification(currentUser.displayName,'Sent location','location',currentUser.photoURL || globals.site_url+'/assets/image/profile_placeholder.png',map_image);
                    current.removeClass('lnr-sync fa-spin').addClass('lnr-map-marker');
                  }).catch(function(error) {
                      notiMsg('error','Error writing new message to Firebase Database');
                  });
              });
          },function(error){
            notiMsg('error','Error occurred. Error code: ' + error.message);
            current.removeClass('lnr-sync fa-spin').addClass('lnr-map-marker');
          },{enableHighAccuracy: true});
        }
    })
    $('.cssa-inner').on('click','.show-on-map',function(e){
        e.preventDefault();
        if($(window).width() < 768){
          $('.map-box').addClass('active');
        }
        showOnMap(parseFloat($(this).attr('lat')),parseFloat($(this).attr('lng')));
    })
    $('.ali-box').on('click','.show-on-map',function(e){
        e.preventDefault();
        if($(window).width() < 768){
          $('.map-box').addClass('active');
        }
        showOnMap(parseFloat($(this).attr('lat')),parseFloat($(this).attr('lng')));
    })
    /*Message Sending Ends*/
    /*Hide & Show Elements Starts*/
    $('.accLocBtn a').on('click',function(e){
        e.preventDefault();
        $('.accident-location').animate({right: '0',opacity: 1},250);
    });
    $('.closeAccLoc').on('click',function(e){
        e.preventDefault();
        $('.accident-location').animate({right: '-100%',opacity: 0},250);
    });
    $('.mapOpen a').on('click',function(e){
        e.preventDefault();
        $('.map-box').addClass('active');
    });
    $('.mb-back-mobile-btn').on('click',function(e){
        e.preventDefault();
        $('.map-box').removeClass('active');
    });
    $('.myProfile a').on('click',function(e){
        e.preventDefault();
        $('.my-profile').animate({right: '0%',opacity: 1},250);
    });
    $('.closeMyProfile').on('click',function(e){
        e.preventDefault();
        $('.my-profile').animate({right: '-100%',opacity: 0},250);
    });
    /*Hide & Show Elements Ends*/
    /*Profile Update*/
    $('#mpPic').on('change',function(e){
        e.preventDefault();
        var r = new FileReader();
        r.onloadend = function(event){
            $('.mpi-showimg').css({'background-image':'url(' + event.target.result + ')'});
        };
        profilePicChanged = e.target.files[0];
         r.readAsDataURL(e.target.files[0]);
    });
    $('.mpi-btn').on('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        var current = $(this);
        oldHtml = current.html();
        current.html(globals.spinner);
        if(profilePicChanged != ''){
            var filePath = fbAuth.currentUser.uid + '/profilePictures/' + profilePicChanged.name;
            var uploadedFilePath = '';
            storage.ref(filePath).put(profilePicChanged).then(function(snapshot) {
                // Get the file's Storage URI and update the chat message placeholder.
                var fullPath = snapshot.metadata.fullPath;
                uploadedFilePath = storage.ref(fullPath).toString();
                storage.refFromURL(uploadedFilePath).getMetadata().then(function(metadata) {
                    var profileUrl = metadata.downloadURLs[0];
                    userData.child(fbAuth.currentUser.uid).set({
                      email: fbAuth.currentUser.email,
                      displayName:$('input[name="mpName"]').val(),
                      phoneNumber: $('input[name="mpPhoneNumber"]').val(),
                      photoURL:profileUrl
                    }).then(function() {
                        notiMsg('success','Profile Updated');
                      current.html(oldHtml);
                      profilePicChanged = '';
                    }, function(error) {
                        notiMsg('error',error);
                        current.html(oldHtml);
                      // An error happened.
                  });
                });
            });
        }
        else{
            userData.child(fbAuth.currentUser.uid).set({
              email: fbAuth.currentUser.email,
              displayName:$('input[name="mpName"]').val(),
              phoneNumber: $('input[name="mpPhoneNumber"]').val()
            }).then(function() {
                notiMsg('success','Profile Updated');
              current.html(oldHtml);
            }, function(error) {
                notiMsg('error',error);
                current.html(oldHtml);
              // An error happened.
          });;
        }
    });
    /*Other Functions Starts*/
    $('.csh-dd-menu').on('click',function(e){
        e.preventDefault();
        if($('.csh-dd-menu-list').hasClass('active')){
            $('.csh-dd-menu-list').removeClass('active');
        }
        else{
            $('.csh-dd-menu-list').addClass('active');
        }
    });
    $(document).on('click','.close-dss-noti',function(){
        closeNoti();
    });
    $(document).mouseup(function(e){
        var container = $(".csh-dd-menu");
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0)
        {
            $('.csh-dd-menu-list').removeClass('active');
        }
    });
    /*Other Functions Ends*/
    /*$('.get_picture').on('click',function(e){
        e.preventDefault();
        navigator.camera.getPicture(function(imageData){
        }, function(message){
            console.log(message);
        }, { quality: 50,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            destinationType: Camera.DestinationType.DATA_URL
        });
    })*/
});
/*AuthChangedd*/
function onAuthStateChanged(user){
    if (user) { // User is signed in!
      database.ref('/users/'+user.uid).once('value').then(function(snapshot) {
          var snapVal = snapshot.val();
          $('input[name="mpName"]').val(snapVal.displayName);
          $('input[name="mpEmail"]').val(snapVal.email);
          $('input[name="mpPhoneNumber"]').val(snapVal.phoneNumber);
          var profilePicUrl = snapVal.photoURL || globals.site_url+'/assets/image/profile_placeholder.png';
          if(snapVal.photoURL){
              $('.mpi-showimg').css({'background-image':'url(' + profilePicUrl + ')'});
          }
      });
      //regServiceWorker();
      RnOnFirstGeo();
      loadMessages(true);
      $('.login-sec').addClass('hidden')
      $('.chat-sec').removeClass('hidden');
      // We save the Firebase Messaging Device token and enable notifications.
    } else { // User is signed out!
      // Hide user's profile and sign-out button.
       $('input[name="mpName"]').val();
       $('input[name="mpEmail"]').val();
       $('input[name="mpPhoneNumber"]').val();
       closeLoader();
       $('.chat-sec').addClass('hidden');
    }
}
/*Message Functions*/
function loadMessages(firstLoaded){
    initMap();
    messagesRef.off();
    var setMessage = function(data) {
      var val = data.val();
      displayChatElement(val,data.key);
      if(!firstLoaded){
          if(fbAuth.currentUser.uid != val.uid){
              //messageGetAudio.play();
              navigator.notification.beep(1);
              navigator.vibrate([1000]);
          }
      }
    };
    var deleteMessage = function(data){
        var newElem =jQuery('#'+data.key);
        if(newElem.length > 0){
            newElem.remove();
        }
    }
     messagesRef.limitToLast(100).on('child_added', setMessage);
     messagesRef.limitToLast(100).on('child_changed', setMessage);
     messagesRef.limitToLast(100).on('child_removed', deleteMessage);
     setTimeout(function(){
       closeLoader();
       $('.cs-showarea').animate({
            scrollTop: $('.cs-showarea').get(0).scrollHeight
        }, 400);
       firstLoaded = false;
     },2500);
}
function sendMessages(){
    var msgText = jQuery('.main-msg-bx');
    if(multifilesArray.length > 0 && isUserLoggedIn){
        jQuery('.scbtb-btn').children('i').removeClass('lnr-rocket').addClass('lnr-sync fa-spin');
        var multifiles = false;
        if(multifilesArray.length > 1){multifiles = true;}
        var currentUser = fbAuth.currentUser;
        messagesRef.push({
          name: currentUser.displayName,
          text: msgText.val().trim() || '',
          imageUrl: loadingImg,
          photoUrl: currentUser.photoURL || 'assets/image/profile_placeholder.png',
          uid : currentUser.uid,
          multiFiles:multifiles,
          lat:latitude,
          lng:longitude,
          send_on:curTimeStamp()
        }).then(function(data) {
          // Upload the image to Cloud Storage.
          var allFiles = '';
          //for(var k=0;k<multifilesArray.length;k++){
             $('.atch-show ul li').eq(0).prepend(uploadingImageTemplate);
            multifilesArray[0].isUpload = 1;
            var file = dataURItoBlob(multifilesArray[0].file);
            /*if (!file.type.match('image.*')) {
                notiMsg('error','You can only share images');
                continue;
            }*/

            var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
            //(function(indexingK){
                //return
                storage.ref(filePath).put(file).then(function(snapshot) {
                    // Get the file's Storage URI and update the chat message placeholder.
                    var fullPath = snapshot.metadata.fullPath;
                    if(allFiles != ''){
                        allFiles = allFiles+','+storage.ref(fullPath).toString();
                    }
                    else{
                        allFiles = storage.ref(fullPath).toString();
                    }
                    multifilesArray[0].isUpload = 2;
                    $('.atch-show ul li').eq(0).children('.uploading').remove();
                    $('.atch-show ul li').eq(0).prepend(uploadedImageTemplate);
                    messageSentAudio.play();
                    //if(indexingK == multifilesArray.length-1){
                        data.update({imageUrl: allFiles});
                        multiFiles = false;
                        multifilesArray = [];
                        $('.scbtb-btn').children('i').removeClass('lnr-sync fa-spin').addClass('lnr-rocket');
                        //$('#chatAttach').val('');
                        $('.atch-show').animate({bottom:'-200%',opacity:0},250);
                        onlyFirst = allFiles.split(',');
                        storage.refFromURL(onlyFirst[0]).getMetadata().then(function(metadata) {
                          var sentMessage = 'Sent Image';
                          if(msgText.val().trim() != ''){sentMessage = msgText.val().trim();}
                            sendNotification(currentUser.displayName,sentMessage,'image',currentUser.photoURL || globals.site_url+'/assets/image/profile_placeholder.png',metadata.downloadURLs[0]);
                            msgText.val('');
                        }).catch(function(err){
                            notiMsg('error','Error writing new message to Firebase Database '+err);
                        });
                        setTimeout(function(){$('.atch-show ul').empty()},255);

                    //}
                });
            //})(k)
          //}
        }).catch(function(error) {
          console.log(error);
            $('.scbtb-btn').children('i').removeClass('lnr-sync fa-spin').addClass('lnr-rocket');
            notiMsg('error','There was an error uploading a file to Cloud Storage:'+error);
            multiFiles = false;
            multifilesArray = [];
            $('.atch-show').animate({bottom:'-200%',opacity:0},250);
            setTimeout(function(){$('.atch-show ul').empty()},255);
        });
    }
    else{
        if(msgText.val().trim() != '' && isUserLoggedIn){
            jQuery('.scbtb-btn').children('i').removeClass('lnr-rocket').addClass('lnr-sync fa-spin');
            var currentUser = fbAuth.currentUser;
            var textMsg = msgText.val().trim();
            messagesRef.push({
              name: currentUser.displayName || '',
              text: textMsg,
              photoUrl: currentUser.photoURL || 'assets/image/profile_placeholder.png',
              uid : currentUser.uid,
              multiFiles:false,
              send_on:curTimeStamp()
            }).then(function(result) {
              msgText.val('');
              jQuery('.scbtb-btn').children('i').removeClass('lnr-sync fa-spin').addClass('lnr-rocket');
              sendNotification(currentUser.displayName,textMsg,'msg',currentUser.photoURL || globals.site_url+'/assets/image/profile_placeholder.png');
              messageSentAudio.play();
            }).catch(function(error) {
                console.log(error);
                notiMsg('error','Error writing new message to Firebase Database');
            });
        }
    }
}
/**/
function notiMsg(code,message){
    var dssClass = 'dss-success';
    var heading = 'Success';
    if(code == 'error'){
        dssClass ='dss-error';
        heading = 'Error';
    }
    else if(code == 'success'){
        dssClass = 'dss-success';
        heading = 'Success';
    }
    else if(code == 'info'){
        dssClass ='dss-info';
        heading = 'Info';
    }
    jQuery('.dss-noti').addClass(dssClass);
    jQuery('.dss-noti .dss-content h2 strong').text(heading);
    jQuery('.dss-noti .dss-content h2 span').text(message);
    jQuery('.dss-noti').removeClass('hidden');
}
function closeNoti(){
    jQuery('.dss-noti').removeClass('dss-success dss-error dss-info');
    jQuery('.dss-noti .dss-content h2 strong').text('');
    jQuery('.dss-noti .dss-content h2 span').text('');
    jQuery('.dss-noti').addClass('hidden');
}
function openLoader(){$('.mainLoader').removeClass('hidden');}
function closeLoader(){$('.mainLoader').addClass('hidden');}
function displayChatElement(val,dataKey){
    var newElem =jQuery('#'+dataKey);
    if(newElem.length == 0){
        var msgCls = 'cs-uc';
        if(fbAuth.currentUser.uid == val.uid){msgCls = 'cs-oc';}
        newElem = jQuery('<div class="'+msgCls+'" id="'+dataKey+'"/>');
        newElem.append(jQuery('<div class="csc-inner" />'));
        jQuery('.cssa-inner').append(newElem);
    }
    var innerDiv = newElem.children('.csc-inner');
    innerDiv.empty();
    var uID = val.uid;
    if(chatUsers.hasOwnProperty(uID)){
        var user_dt = chatUsers[uID];
        var sendOn = convertFBTime(val.send_on);
        var pic = globals.site_url+'/assets/image/profile_placeholder.png';
        if(user_dt.photoURL != null){
            pic = user_dt.photoURL || globals.site_url+'/assets/image/profile_placeholder.png';
        }
        if(fbAuth.currentUser.uid == val.uid){
            innerDiv.append('<div class="msg-meta-data mmd-l"><span class="dTp">'+sendOn+'</span></div>');/* - <span class="uNt">'+user_dt.displayName+'</span>*/
        }
        else{
            innerDiv.append('<div class="csci-img"><img src="'+pic+'"/></div>');
            innerDiv.append('<div class="msg-meta-data mmd-r"><span class="uNt">'+user_dt.displayName+'</span> - <span class="dTp">'+sendOn+'</span></div>');
        }
        var chatMsgCnt = $('<div class="chat-msg-cnt" />');
        chatMsgCnt.append('<p>'+val.text+'</p>');
        if(val.location){
            var gotToLoc = jQuery('<div class="goToLocation" />');
            gotToLoc.append('<p>'+val.placeName+'</p>');
            var MapImage = jQuery('<p class="mapImage show-on-map" lat="'+val.latitude+'" lng="'+val.longitude+'" />');
            MapImage.html('<img src="'+val.mapImage+'" />');
            gotToLoc.append(MapImage);
            chatMsgCnt.append(gotToLoc);
            displayAccList(val);
            locations.push(val);
            var markers = locations.map(function(location, i) {
                var marker = new google.maps.Marker({
                    icon : globals.site_url+'/assets/image/sos-map-icon.png',
                    position: {lat: location.latitude, lng: location.longitude}
                });
                google.maps.event.addListener(marker,"click",function(){
                    if(infowindow){infowindow.close();}
                    infowindow=new google.maps.InfoWindow({content:val.placeName});
                    infowindow.open(map,marker);
                });
                return marker;
            });
            var markerCluster = new MarkerClusterer(map, markers,{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        }
        if(val.multiFiles){
            var ul = jQuery('<ul />');
            var imageUrls = val.imageUrl.split(',');
            for(j=0;j<imageUrls.length;j++){
                var li = jQuery('<li />');
                var newImage = jQuery('<img />');
                setImageUrl(imageUrls[j],newImage[0]);
                li.append(newImage);
                ul.append(li);
            }
            chatMsgCnt.append(ul);
        }
        else if(val.imageUrl){
            var p = jQuery('<p />');
            var newImage = jQuery('<img />');
            var imgURL = setImageUrl(val.imageUrl,newImage[0]);
            p.append(newImage);
            chatMsgCnt.append(p);
        }
        chatMsgCnt.appendTo(innerDiv);
        jQuery('.cs-showarea').animate({scrollTop:jQuery('.cs-showarea')[0].scrollHeight},1);
    }
    else{
        database.ref('/users/'+uID).once('value').then(function(snapshot) {
            var sendOn = convertFBTime(val.send_on);
            var snapVal = snapshot.val();
            if(snapVal == null){
                var pic = globals.site_url+'/assets/image/profile_placeholder.png';
                if(val.photoUrl != null){
                    pic = val.photoUrl || globals.site_url+'/assets/image/profile_placeholder.png';
                }
                if(fbAuth.currentUser.uid == uID){
                    innerDiv.append('<div class="msg-meta-data mmd-l"><span class="dTp">'+sendOn+'</span></div>');/* - <span class="uNt">'+val.name+'</span>*/
                }
                else{
                    innerDiv.append('<div class="csci-img"><img src="'+pic+'"/></div>');
                    innerDiv.append('<div class="msg-meta-data mmd-r"><span class="uNt">'+val.name+'</span> - <span class="dTp">'+sendOn+'</span></div>');
                }
                chatUsers[uID] = {displayName:val.name,email:'',phoneNumber:'',photoURL:pic};
            }
            else{
                var pic = globals.site_url+'/assets/image/profile_placeholder.png';
                if(snapVal.photoURL != null){
                    pic = snapVal.photoURL || globals.site_url+'/assets/image/profile_placeholder.png';
                }
                if(fbAuth.currentUser.uid == uID){
                    innerDiv.append('<div class="msg-meta-data mmd-l"><span class="dTp">'+sendOn+'</span></div>');/* - <span class="uNt">'+val.name+'</span>*/
                }
                else{
                    innerDiv.append('<div class="csci-img"><img src="'+pic+'"/></div>');
                    innerDiv.append('<div class="msg-meta-data mmd-r"><span class="uNt">'+val.name+'</span> - <span class="dTp">'+sendOn+'</span></div>');
                }
                chatUsers[uID] = {displayName:snapVal.displayName,email:snapVal.email,phoneNumber:snapVal.phoneNumber,photoURL:pic};
            }
            var chatMsgCnt = $('<div class="chat-msg-cnt" />');
            chatMsgCnt.append('<p>'+val.text+'</p>');
            if(val.location){
                var gotToLoc = jQuery('<div class="goToLocation" />');
                gotToLoc.append('<p>'+val.placeName+'</p>');
                var MapImage = jQuery('<p class="mapImage show-on-map" lat="'+val.latitude+'" lng="'+val.longitude+'" />');
                MapImage.html('<img src="'+val.mapImage+'" />');
                gotToLoc.append(MapImage);
                chatMsgCnt.append(gotToLoc);
                displayAccList(val);
                locations.push(val);
                var markers = locations.map(function(location, i) {
                    var marker = new google.maps.Marker({
                        icon : globals.site_url+'/assets/image/sos-map-icon.png',
                        position: {lat: location.latitude, lng: location.longitude}
                    });
                    google.maps.event.addListener(marker,"click",function(){
                        if(infowindow){infowindow.close();}
                        infowindow=new google.maps.InfoWindow({content:val.placeName});
                        infowindow.open(map,marker);
                    });
                    return marker;
                });
                var markerCluster = new MarkerClusterer(map, markers,{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
            }
            else if(val.multiFiles){
                var ul = jQuery('<ul />');
                var imageUrls = val.imageUrl.split(',');
                for(j=0;j<imageUrls.length;j++){
                    var li = jQuery('<li />');
                    var newImage = jQuery('<img />');
                    setImageUrl(imageUrls[j],newImage[0]);
                    li.append(newImage);
                    ul.append(li);
                }
                chatMsgCnt.append(ul);
            }
            else if(val.imageUrl){
                var p = jQuery('<p />');
                var newImage = jQuery('<img />');
                var imgURL = setImageUrl(val.imageUrl,newImage[0]);
                p.append(newImage);
                chatMsgCnt.append(p);
            }
            chatMsgCnt.appendTo(innerDiv);
            jQuery('.cs-showarea').animate({scrollTop:jQuery('.cs-showarea')[0].scrollHeight},1);
        }).catch(function(error){
            console.log(error);
        });
    }

}
function displayAccList(val){
    var liElem = $('<li />');
    var aTag = $('<a href="#" class="show-on-map" lat="'+val.latitude+'" lng="'+val.longitude+'"></a>');
    aTag.appendTo(liElem);
    var output = '<div class="user-pic">'+
        '<img src="'+val.photoUrl+'" />'+
        '</div>'+
        '<!--/user-pic-->'+
        '<div class="user-txt">'+
            '<h2>'+val.placeName+'</h2>'+
        '</div>'+
        '<!--/user-txt-->'+
        '<div class="loc-pic">'+
            '<img src="'+val.mapImage+'" />'+
        '</div>'+
        '<!--/loc-pic-->'+
        '<div class="clearfix"></div>';
    aTag.html(output);
    $('.ali-box ul').append(liElem);
}
function setImageUrl(imageUri,imgElement) {
  if (imageUri.startsWith('gs://')) {
      imgElement.src = loadingImg; // Display a loading image first.
      storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
          imgElement.src = metadata.downloadURLs[0];
          jQuery('.cs-showarea').animate({scrollTop:jQuery('.cs-showarea')[0].scrollHeight},1);
      });
  } else {
      imgElement.src = imageUri;
  }
};
function isUserLoggedIn(){
    if (fbAuth.currentUser) {
        return true;
      }
}
/*Browser Notifications*/
function RnOnFirstGeo(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          map.setCenter({lat : latitude,lng : longitude});
      });
    }
}
function initMap(){
    var uluru = {lat: latitude, lng: longitude};
    map = new google.maps.Map(document.getElementById('vmap'), {
        zoom: 14,
        center: uluru
    });
    trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
}
function getMapImage(){
    return 'https://maps.googleapis.com/maps/api/staticmap?center='+latitude+
    ','+longitude+
    '&zoom=15&size=300x300&maptype=roadmap&markers=icon:'+globals.site_url
    +'/assets/image/sos-map-icon.png|'+latitude+
    ','+longitude+
    '&key='+globals.mapKey;
}
function showOnMap(lat,lng){
    map.setCenter({
        lat : lat,
        lng : lng
    });
    map.setZoom(16);
}
function regServiceWorker(){
          var push = PushNotification.init({
            android: {
                senderID: "371285976427",
                 //icon: "sos",
                 iconColor: '#28c8e2',
                 forceShow : "true",
                 //vibrate : "true",
                 sound : "true"
            },
            browser: {},
            ios: {
                senderID: "371285976427",
                //icon: "sos",
                forceShow : "true",
                iconColor: '#28c8e2',
                alert: 'true',
                sound: 'true',
                //vibration: 'true',
                badge: 'true'
            },
            windows: {}
        });
        push.on('registration', function(data) {
            database.ref('/fcmTokens').child(data.registrationId).set({uid:fbAuth.currentUser.uid,reg_type:'phone'});
        });
        push.on('error', function(e) {
            console.error("push error = " + e.message);
        });
}
function sendNotification(title,tstmsg,mType,image,picture){
    database.ref('/fcmTokens/').once('value').then(function(snapshot) {
        snapVal = snapshot.val();
        var notificationData = {};
        if(mType == 'msg'){
            notificationData = {
                "title": title,
                "body": tstmsg,
                "message": tstmsg,
                "icon": globals.site_url+"/assets/image/icon-logo.png",
                "tag":'DelaySOS',
                //"badge": globals.site_url+"/assets/image/sos-map-icon.png",
                "click_action": globals.site_url,
                "sound":"default"
            }
        }
        else if(mType == 'image'){
            notificationData = {
                "title": title,
                "body": tstmsg,
                "message": tstmsg,
                "icon": globals.site_url+"/assets/image/icon-logo.png",
                "tag":'DelaySOS',
                "image": image,
                "style":"picture",
                "picture":picture,
                "summaryText":tstmsg,
                "click_action": globals.site_url
            }
        }
        else if(mType == 'location'){
            notificationData = {
                "title": title,
                "body": tstmsg,
                "body": tstmsg,
                "icon": globals.site_url+"/assets/image/icon-logo.png",
                "tag":'DelaySOS',
                "image": image,
                "style":"picture",
                "picture":picture,
                "summaryText":tstmsg,
                "click_action": globals.site_url
            }
        }
        var tokensList = [];
        jQuery.each(snapVal,function(key,val){
            if(val.uid != fbAuth.currentUser.uid){
                tokensList.push({regID:key,type:val.reg_type});
            }
        });
        $.ajax({type:'POST',url:globals.site_url+'/fcm-token-send/index.php',data:{to:tokensList,notiData:notificationData}}).done(function (response) {
          console.log(response);
        }).fail(function(error,e,r) {
          console.log(error,e,r);
          /* Act on the event */
        });
    });
}
function convertFBTime(time) { // Convert UNIX epoch time into human readble time.
    var units = [
    { name: "second", limit: 60, in_seconds: 1 },
    { name: "minute", limit: 3600, in_seconds: 60 },
    { name: "hour", limit: 86400, in_seconds: 3600  },
    { name: "day", limit: 604800, in_seconds: 86400 },
    { name: "week", limit: 2629743, in_seconds: 604800  },
    { name: "month", limit: 31556926, in_seconds: 2629743 },
    { name: "year", limit: null, in_seconds: 31556926 }
  ];
  //var diff = (new Date() - new Date(time)) / 1000;
  //if (diff < 5) return "now";

  /*var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      var diff =  Math.floor(diff / unit.in_seconds);
      return diff + " " + unit.name + (diff>1 ? "s" : "");
    }
  };*/
  var msgDate = new Date(time);
  var hours = msgDate.getHours();
  var minutes = msgDate.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return msgDate.getDate()+"/"+msgDate.getMonth()+"/"+msgDate.getFullYear()+" "+strTime;
}
function curTimeStamp(){
    var dt = new Date();
    var utcDate = dt.toUTCString();
    return utcDate
}
function dataURItoBlob(dataURI) {
  var binary = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: mimeString
  });
}

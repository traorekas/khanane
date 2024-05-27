var module = angular.module('myApp', ['onsen', 'pascalprecht.translate', 'toastr']);

module.controller('servicingCtrl', function ($scope, $window, $filter, $http, $translate, toastr) {
    // Functions related to navigation.
    $scope.nav = {
        setPage: function(page) {
            // Verify if the user is trying to access some sections without being logged.
            if(!$scope.session.logged && (page === 'servicing.html' || page === 'devices.html')) {
                // Show warning.
                $translate('msgYouMustBeLogged').then(function (errorMsg) { toastr.warning(errorMsg, null); });
            } else {                
                // Set main page.
                menu.setMainPage(page);                
                menu.closeMenu();
                
                // If the user wants to see his records, load the last 7 days.
                if(page === 'records.html') {
                    $scope.historial.submit();
                }
            }
        }
    };
    
    // Data and functions related to the login.
    $scope.session = {
        logged: false,
        username: '',
        password: '',
        userData: null,
        loginReturn: '',
        submit: function() {
            // Verify that neither the username nor the password are empty.
            if($scope.session.username === null || $scope.session.username.length === 0 || $scope.session.password === null || $scope.session.password.length === 0) {
                // Show error and return.
                $translate('errorEmptyUsernameOrPassword').then(function (errorMsg) {
                    toastr.error(errorMsg, null);
                });
                return;
            }
            
            // Show the loading dialog.
            $scope.shared.loading.show();

            // Invoke the login service.
            $http.post("../rest/api.php/login", {'username': $scope.session.username, 'password': $scope.session.password})
                .success(function (data, status, headers, config) {                                                          
                    // Verify if the call was succesful.            
                    if(data !== null && data.error === null) {
                        // Update logged flag and save user's data.
                        $scope.session.logged = true;
                        $scope.session.userData = data.user;
                    } else {
                        // Show an error message.
                        var errorCode = "errorUnexpectedAtServer";
                        if(data.error === "InvalidLogin") errorCode = "errorInvalidLogin";
                        if(data.error === "AccessDenied") errorCode = "errorAccessDenied";
                        $translate(errorCode).then(function (errorMsg) {
                            toastr.error(errorMsg, null);
                        });
                    }

                    // Clear the password.
                    $scope.session.password = '';

                    // Hide dialog.
                    $scope.shared.loading.hide();

                    // If logged, verify if another page must be displayed.
                    if($scope.session.logged && $scope.session.loginReturn !== null && $scope.session.loginReturn.length > 0) {
                        menu.setMainPage($scope.session.loginReturn);
                        $scope.session.loginReturn = null;
                    }
                    
                    // If logged, load initialization data from the server.
                    if($scope.session.logged) $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        },
        clearLoginData: function() {
            $scope.session.logged = false;
            $scope.session.username = '';
            $scope.session.password = '';
            $scope.session.userData = null;            
        },
        logout: function() {
            // Show loading dialog.
            $scope.shared.loading.show();
            
            // Call logout service.
            $http.get("../rest/api.php/logout")
                .success(function (data, status, headers, config) {
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Remove login data.
                        $scope.session.clearLoginData();

                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        }
    };
	
//PopUp function
	//Data and functions related to the pop-up.   ||  
    $scope.OpenPopupWindow = function () {	
			 var CallerId = document.activeElement.attributes[1].nodeValue;
			 CallerId = CallerId.replace('_','');
             $window.open("pchronos.html", CallerId, "width=400,height=200,left=100,top=150,toolbar=0,menubar=0,location=0,directories=0,channelmode=1,titlebar=0,addressbar=0, status=1");				
    }
	
	
	// Update datalist  || 
	$scope.UpDataList = function () {
		if(document.getElementById("positionSrc").value == document.getElementById("position").value && document.getElementById("locationSrc").value == document.getElementById("location").value){
			$("#zoneSrc").val(document.getElementById("zone").value);
			var x = document.getElementById("zoneSrc");
			x.remove(x.selectedIndex);
		}
	}
	
	SomeDateFunction = function(waty) {
      var res = '';
            try {
                if(waty !== null && waty.length > 0) {
                    var date = new Date(waty);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
    }	
	
	mySplit = function(string, nb) {
    var array = string.split(',');
    return array[nb];
}
	
	$scope.IDeviceRecorde = function (arrData,dDate) {
		//var dd = toNiceDate(dDate);
 		
		var KprDate = $filter('date')(dDate, "yyyy-MM-dd");
		var KprDateMin = KprDate + " 00:00:00.000000";
		var KprDateMax = KprDate + " 23:59:59.000000";
		
		KprDateMin = $filter('date')(KprDateMin, "yyyy-MM-ddThh:mm:ss");
		KprDateMax = $filter('date')(KprDateMax, "yyyy-MM-ddThh:mm:ss");
		
		var kaz = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1', [arrData]);
						
		var kAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		$scope.maintenance.stations = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		var zAll0 = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate < "'+KprDateMin +'"', [arrData]);
		
		var k1 = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		var k2 = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		
		var zAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate >'+KprDate, [arrData]);
		var k = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		var z = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		
		
		for (var i=0; i < kAll.length; i++){
			//_Y = SomeDateFunction(kAll[i]["CreateDate"]);
			var _KprDate = kAll[i]["CreateDate"];			
			_KprDate = $filter('date')(_KprDate,"yyyy-MM-dd");
			KprDateY = new Date(_KprDate);
			KprDateZ = kAll[i]["CreateDate"];
			DateZ = KprDateZ.date;


			var arr = [];
			

			
			if (KprDateZ.date < KprDateMin || KprDateZ.date > KprDateMax)
			{ 
				$scope.maintenance.stations.push(kAll[i]);
			}
		}
	}
	
	function findElement(arr, propName, propValue) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue)
			  return arr[i];
	}
	
		
	function _findElement(arr, propName, propValue, propCondition, propConditionValue, propReturn, propReturnValue, arrZone, arrLocation ) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue && arr[i][propCondition] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
			 var arrStock = $scope.DevicesMouvement.devices;
			 
			for (var i=0; i < arr.length; i++)
			if (arrStock[i]["Device"] == propValue && arrStock[i]["used"] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
	}

	
	function findElementValue(arr,IdDevice) {
		for (var i=0; i < arr.length; i++)	
			if( arr[i]["IsActive"] == 0 && arr[i]["DesktopId"] == IdDevice)
				return arr[i];
	}
	
	//IFonction to manage Devices  || Mouvement d'equipement
	$scope.DeviceDetails = function (dev,K,devCat,DevPosition, DevLocation, DevZone, DevStation) {	
		var res = alasql('SELECT *  FROM ? WHERE Id ='+K.Id,[dev]);
		var IDevice = alasql('SELECT value CClasse FROM ? WHERE Id ='+K.CategorieId, [devCat]);		
		IDevice = IDevice+'Id';		
		document.getElementById("DeviceSelected_Cat").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [devCat]);
		
		var y = _findElement(DevStation, IDevice, K.Device, "IsActive", 0, "ZoneId", "zone", DevZone, DevLocation);
		
		var x = findElement(DevStation, IDevice, K.Device);		
		var z = findElementValue(DevStation,K.Device);
				
		$scope.ZIdSelected = alasql('SELECT ZoneId, Id FROM ? WHERE IsActive = 0', [DevStation]);		
		var ZoneIdSelected = alasql('SELECT ZoneId FROM ? WHERE IsActive = 0 and ? = ?', [DevStation, IDevice, K.Device]);
		
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE IsActive = 0 and DesktopId = '+K.Device, [DevStation]);
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE '+ IDevice+' = '+K.Device+' and IsActive = 0', [DevStation]);
		
		document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevPosition]);
		document.getElementById("zone").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevZone]);
		document.getElementById("location").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevLocation]);
		//document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [DevPosition]);
	}
	
	
    // Data and functions related to the maintenances.   || Servicing 
    $scope.maintenance = {

		locations:[],
		positions:[],
		zones:[],
		maintenances:[],
		movements:[],
		stations:[],
		
		technicians: [],
		
		submitting: false,
        invalid: false,
		
		location:null,
		position:null,
		zone:null,
		maintenance:null,
		movement:null,
		station:null,
		//DateUpKeep:SetDate(),
		DateUpKeep:new Date(),
		UserId:null,
		StationId:null,
		Screen:null,
		Desktop:null,
		Av:false,
		Cam:false,
		Fp:false,
		Pp:false,
		Kbd:false,
		Mos:false,
		Ups:false,
		Rcg:false,
		Cln:false,
		Ss:false,
		Snd:false,
		Net:false,
		Swi:false,
		Usb:false,
 		Suw:null,
		Sus:null,
		Time1:null,
		Time2:null,
		Time3:null,
		TimeAvg:null, 
		observations:null,
			
			CreateDate : null,
			ZoneId : null,
			PositionId :null,
			ScreenId_Type : null,
			DesktopId : null,
			FpId : null,
			PpId : null,
			KbdId : null,
			MosId : null,
			UpsId : null,
			CamId : null,
			IsActive : 0,

		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.maintenance;  // || Servicing 
				enr.submitting = true;
				enr.Validated = false;
				var MoyTime = parseInt((parseInt(Time1.Text) + parseInt(Time2.Text) + parseInt(Time3.Text)) / 3);
				
				// Validate form.
				enr.invalid = enr.position === null|| enr.zone === null|| enr.location === null || enr.station === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {			
						StationId: enr.station !== null? enr.station.Id : null,		
						DateUpKeep: enr.DateUpKeep,					
						Fp: enr.Fp,
						Pp: enr.Pp,
						Kbd: enr.Kbd,
						Mos: enr.Mos,
						Ups: enr.Ups,			
						Suw: parseInt(Suw.Text),
						Sus: parseInt(Sus.Text),
						Time1: parseInt(Time1.Text),
						Time2: parseInt(Time2.Text),
						Time3: parseInt(Time3.Text),
						TimeAvg: MoyTime,			
						Rcg: enr.Rcg,
						Av: enr.Av,
						Cln: enr.Cln,
						Ss: enr.Ss,
						Snd: enr.Snd,
						Net: enr.Net,
						Swi: enr.Swi,
						Usb: enr.Usb,		
						Validated: enr.Validated,						 
						Observations: enr.observations	
						
					};

					// Submit data.
					$http.post("../rest/api.php/maintenances", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									var enrStation = {
										CreateDate : enr.DateUpKeep,
										ZoneId : enr.zone.Id,
										ScreenId_Type : enr.station.ScreenId_Type,
										DesktopId : enr.station.DesktopId,
										FpId : enr.station.FpId,
										PpId : enr.station.PpId,
										KbdId : enr.station.KbdId,
										MosId : enr.station.MosId,
										UpsId : enr.station.UpsId,
										CamId : enr.station.CamId,
										StationId :enr.station.Id,
										IsActive : 1
									};


								// Added to clean the screen

								enr.Fp = false;
								enr.Pp = false;
								enr.Kbd = false;
								enr.Mos = false;
								enr.Ups = false;			
								Suw = false;
								Sus = false;
								Time1 = "";
								Time2 = "";
								Time3 = "";
								TimeAvg = false;			
								enr.Rcg = false;
								enr.Av = false;
								enr.Cln = false;
								enr.Ss = false;
								enr.Snd = false;
								enr.Net = false;
								enr.Swi = false;
								enr.Usb = false;						 
								enr.observations = "";	

								//								
									
								var _CDate = enrStation.CreateDate;									
								var StationData = EnregStation("../rest/api.php/stations",enrStation, _CDate);				
											
								// Show a success message.
 								
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});


							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "servicing.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	
	
    // Data and functions related to the maintenances.
    $scope.device = {
		devices_categories:[],
		devices:[],		
		technicians: [],		
		CategorieId:null,
		Device:null,
		technicians:null,
		Observations:null,		
		DateAdd:new Date(),
		IsUsed: false,
		
		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.device;
				enr.submitting = true;
				
				// Validate form.
				enr.invalid = enr.Device === null|| enr.devices_categories === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {				
						DateAdd: enr.DateAdd,					
						CategorieId: enr.devices_categories.Id,
                                        	Device: enr.Device,
						IsUsed: enr.IsUsed,							 
						Observations: enr.Observations +'\r\n'+"Ajouté au stock de l'operation de Côte d'ivoire par: "+$scope.session.userData.first_name+" "+$scope.session.userData.last_name +". A la date du "+ enr.DateAdd,						
					};

					// Submit data.
					$http.post("../rest/api.php/devices_categories", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									enr.devices_categories.Id = '';
									enr.Device = '';
									enr.IsUsed = false;		
									enr.Observations = '';
									
								// Show a success message.
								$translate('msgEnrollmentSubmitted').then(function (successMsg) {
									toastr.success(successMsg, null);
								});
							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "device.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
    // Data and functions related to the maintenances.
    function EnregStation(str,data,CDate) {							
					// Submit Station data.
					$http.post(str, data)
						.success(function (data, status, headers, config) { 
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.	
									var Azulh = document.getElementById("enrForm");
									var DateUp = new Date();
									
									// clearing Inputs
									var inputs = Azulh.getElementsByTagName('input');
										for (var i = 0; i<inputs.length; i++) {
											switch (inputs[i].type) {
												// case 'hidden':
												case 'text':
													inputs[i].value = '';
													break;
												case 'radio':
												case 'checkbox':
													inputs[i].checked = false;
												//case 'datetime-local':	
													//inputs[i].value = new Date();
											}
										}
										
									// clearing Selects	
									var selects = Azulh.getElementsByTagName('select');
									for (var i = 3; i<selects.length; i++)
										selects[i].value = '';										
									
									// clearing textarea
									var text= Azulh.getElementsByTagName('textarea');
									for (var i = 0; i<text.length; i++)
										text[i].value = '';		
																										
									//Set new date 
									document.getElementById("DateUpKeep").value = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
									
									//Update Stations List
									var _Date = $filter('date')(CDate, "yyyy-MM-dd");
									var _DateMin = _Date + " 00:00:00.000000";
									var _DateMax = _Date + " 23:59:59.000000";
									var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [$scope.maintenance.stations]);
									$scope.maintenance.stations = [];
									for (var i=0; i < arrData.length; i++){
									var dDate = arrData[i]["CreateDate"];	
										if (dDate.date < _DateMin || dDate.date > _DateMax)
										{ 
											$scope.maintenance.stations.push(arrData[i]);
										}
									}										
										
									//Show a success message.
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});
									
							}
						})		
		return data;
	}
    	
	function SetDate(){	
		var _utc = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
		return _utc;
	}									
		
		
	function GetDesktop(){		
		var year = parseInt(matches[3], 10);
		var month = parseInt(matches[2], 10) - 1; // months are 0-11
		var day = parseInt(matches[1], 10);
		var hour = parseInt(matches[4], 10);
		var minute = parseInt(matches[5], 10);
		var second = parseInt(matches[6], 10);
		
	}	
	
	function verifyDate(value) {
		// capture all the parts
		var matches = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
		if (matches === null) {
			return false;
		} else{
			// now lets check the date sanity
			var year = parseInt(matches[3], 10);
			var month = parseInt(matches[2], 10) - 1; // months are 0-11
			var day = parseInt(matches[1], 10);
			var hour = parseInt(matches[4], 10);
			var minute = parseInt(matches[5], 10);
			var second = parseInt(matches[6], 10);
			var date = new Date(year, month, day, hour, minute, second);
			if (date.getFullYear() !== year
			  || date.getMonth() != month
			  || date.getDate() !== day
			  || date.getHours() !== hour
			  || date.getMinutes() !== minute
			  || date.getSeconds() !== second
			) {
			   return false;
			} else {
			   return true;
			}
		
		}
	}
		
	function UpdateStations(str,data) {	
	// Submit Station update data.
	$http.post(str, data)
		.success(function (data, status, headers, config) { 
			// Verify if the call was succesful.
			if(data !== null && data.error === null) {
				// Clear the form.															
			}
		})	
	return data;						
	}

	$scope.historiesMaintenances = function (dStart,dEnd) {
	
	}
	
	$scope.DevicesMouvement = {
		 
		
	}
	    
    // Shared values and functions.   || Maintenace
    $scope.shared = {
        loading: null,
        dateFormat: 'YYYY-MM-DD',
        toNiceDate: function(text) {
            var res = '';
            try {
                if(text !== null && text.length > 0) {
                    var date = moment(text);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
        },
        getInitDataFromServer: function() {
            // Ask for the list utile data. position-location-zone-maintenance-station-devices_categories-device
            $http.get("../rest/api.php/list/position-location-zone-maintenance-station-devices_categories-device") //-movement-device-devicesCategorie
                .success(function (data, status, headers, config) {         
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Load the data.
 
						$scope.maintenance.locations = alasql('SELECT * FROM ? WHERE Id !=6', [data.lists.location]);
						$scope.maintenance.positions = data.lists.position;
						$scope.maintenance.zones = data.lists.zone;	
						$scope.maintenance.maintenances = data.lists.maintenance;						
						var _Date = $filter('date')(new Date(), "yyyy-MM-dd");
						var _DateMin = _Date + " 00:00:00.000000";
						var _DateMax = _Date + " 23:59:59.000000";
						var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						for (var i=0; i < arrData.length; i++){
							var dDate = arrData[i]["CreateDate"];	
							if (dDate.date < _DateMin || dDate.date > _DateMax)
								{ 
									$scope.maintenance.stations.push(arrData[i]);
								}
						}										
						//$scope.maintenance.movements = data.lists.movement;	

						$scope.DevicesMouvement.locations = data.lists.location;						
						$scope.DevicesMouvement.positions = data.lists.position;
						$scope.DevicesMouvement.zones = data.lists.zone;
						$scope.DevicesMouvement.stations = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);	
						$scope.DevicesMouvement.devices_categories = data.lists.devices_categories;	
						$scope.DevicesMouvement.devices = data.lists.device;
						//$scope.DevicesMouvement.movements = data.lists.movement;												
						
						$scope.DevicesMouvement.locationsSrc = data.lists.location;
						$scope.DevicesMouvement.positionsSrc = data.lists.position;
						$scope.DevicesMouvement.zonesSrc = data.lists.zone;	
						$scope.DevicesMouvement.stationsSrc = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						$scope.DevicesMouvement.devices_categoriesSrc = data.lists.devices_categories;
						$scope.DevicesMouvement.devicesSrc = data.lists.device;
						//$scope.DevicesMouvement.movementsSrc = data.lists.movement;						
											
						$scope.device.devices_categories = data.lists.devices_categories;
						$scope.device.devices = data.lists.device;		
						//
												
						$scope.maintenancesRecords.MRmValues = data.lists.maintenance;
						$scope.maintenancesRecords.MRsValues = data.lists.station;
						
						//MHValues = alasql('SELECT MHm.DateUpKeep, MHm.StationId, MHs.Id, MHs.ScreenId_Type, MHs.DesktopId, MHs.FpId, MHs.PpId, MHs.KbdId, MHs.MosId, MHs.UpsId, MHs.CamId FROM ? as MHs RIGHT JOIN ? as MHm ON MHs.Id = MHm.StationId ',[data.lists.station],[data.lists.maintenance]);
						
                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;

            // Show dialog.
            $scope.shared.loading.show();            
        }
    };
    

	
    // Initialize date format.
    $translate('formatDate').then(function (format) {
        $scope.shared.dateFormat = format;
    });    
    
    // Show loading dialog and load initialization data from server.
    ons.createDialog('loading-dialog.html').then(function(dialog) {
        // Store dialog.
        $scope.shared.loading = dialog;
        
        // Call the ping service in order to verify if the user is already logged.
        $http.get("../rest/api.php")
            .success(function (data, status, headers, config) {
                // Verify if the user is logged.
                if(data !== null && data.user !== null) {
                    // Save user data.
                    $scope.session.logged = true;
                    $scope.session.userData = data.user;
                    $scope.session.username = data.user.username;
                    
                    // Load initialization data from the server.
                    $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                } else {
                    // Redirect to login page.
                    $scope.session.loginReturn = "servicing.html";
                    menu.setMainPage("login.html");
                }                
            })
            .error(function(data, status, headers, config) {
                // Redirect to login page.
                $scope.session.loginReturn = "servicing.html";
                menu.setMainPage("login.html");
            })
        ;
    });
    
    // Chronometer's values and functions.
    $scope.chrono = {
        secondsCounted: 0,
        start: null,
        intervalId: null,
        play: function() {
            if($scope.chrono.intervalId === null) {
                $scope.chrono.intervalId = setInterval($scope.chrono.updateDisplay, 500);
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
            }
        },
        pause: function() {
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },
        clear: function() {
            $scope.chrono.secondsCounted = 0;
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },		
        SendValues: function() {
			if (window.opener != null && !window.opener.closed && $scope.chrono.secondsCounted !=null ) {
				var Azul = window.opener.document.getElementById(window.name);
				Azul.value = $scope.chrono.secondsCounted;
				Azul.Text = $scope.chrono.secondsCounted;
			}
			window.close();
        },		
        reset: function() {
            
            // Reset chronometer.
            $scope.chrono.clear();
        },
        edit: function() {
            // Show edition dialog.
            ons.createDialog('chrono-dialog.html').then(function(dialog) {
                // Update dialog's data.
                $scope.chrono.dialog.reference = dialog;
                $scope.chrono.dialog.seconds = $scope.chrono.secondsCounted % 60;
                $scope.chrono.dialog.minutes = parseInt($scope.chrono.secondsCounted / 60, 10);
                        
                // Show dialog.
                dialog.show();
            });
        },
        dialog: {
            seconds: null,
            minutes: null,
            reference: null,
            close: function() {
                $scope.chrono.dialog.reference.hide();
            },
            save: function() {
                // Update seconds counted and start time.
                $scope.chrono.secondsCounted = parseInt($scope.chrono.dialog.seconds,10) + parseInt($scope.chrono.dialog.minutes,10)*60;
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
                
                // Hide dialog.
                $scope.chrono.dialog.reference.hide();
            }
        },
        secondsCountedToString: function() {
            var sec = $scope.chrono.secondsCounted % 60;
            if(sec < 10) sec = '0' + sec;
            var min = parseInt($scope.chrono.secondsCounted/60);
            return min + ':' + sec;
        },
        updateDisplay: function() {
            var now = new Date();
            $scope.chrono.secondsCounted = parseInt((now.getTime() - $scope.chrono.start.getTime())/1000, 10);
            $scope.$apply();
        }
    };
    
    // Values and functions for the settings related to multi-language support.
    $scope.language = {
        value: amplify.store('language'),
        save: function() {
            $translate.use($scope.language.value);
            amplify.store('language', $scope.language.value);
        }
    };

    // Values and functions for the settings related to the historial feature.
    var now = moment();
    var lastWeek = moment().subtract(7, 'days');
    $scope.historial = {
        submitting: false,
        historial: null,
        startYear: lastWeek.year(),
        startMonth: lastWeek.month(),
        startDate: lastWeek.date(),
        endYear: now.year(),
        endMonth: now.month(),
        endDate: now.date(),
        searched: false,
        getDays: function(month) {
            var res = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
            if(month !== 1) {
                res.push(29);
                res.push(30);
                if(month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) res.push(31);
            }
            return res;
        },
        getMonths: function() {					

            if($scope.language.value === 'es') return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
            if($scope.language.value === 'fr') return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôut", "Sept", "Oct", "Nov", "Dec"];
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        },
        getYears: function() {
            var res = [];
            for(var i=0; i<10; i++) res.push(now.year() - i);
            return res;
        },
        submit: function() {
            // Initialize variables.
            var hist = $scope.historial;
            hist.submitting = true;
            hist.searched = true;
            
            // Show loading dialog.
            $scope.shared.loading.show();

            // Get dates.
            var start = hist.startYear + "-" + (hist.startMonth+1) + "-" + hist.startDate + " 00:00:00";
            var end = hist.endYear + "-" + (hist.endMonth+1) + "-" + hist.endDate + " 23:59:59";
			
            // Package data.
            var histData = {
                start: start,
                end: end
            };

            // Submit data.
            $http.post("../rest/api.php/maintenances/search", histData)
                .success(function (data, status, headers, config) {              
                    // Verify if the call was successful.
                    if(data !== null && data.error === null) {
                        // Get list of records.
                        hist.records = data.records;
                    } else {
                        // An error occured, verify which time of error was.
                        if(data.error === "InvalidLogin") {
                            // Show a warning and display the login view.
                            $translate('msgYouMustBeLogged').then(function (message) {
                                toastr.warning(message, null);
                                $scope.session.loginReturn = "records.html";
                                menu.setMainPage("login.html");
                            });
                            $scope.session.clearLoginData();
                        } else {
                            // Show the error.
                            $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                            });
                            console.log(data);
                        }
                    }

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submitting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submiting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
            ;    
        },
        deleteEntry: function(entry) {
            // Ask confirmation.
            $translate('msgAreYouSureYouWantToDeleteEnrollment').then(function (confirmationMsg) {
                if(confirm(confirmationMsg)) {
                    // Show loading dialog.
                    $scope.shared.loading.show();

                    // Invoke service.    
                    $http.post("../rest/api.php/maintenances/delete/" + entry.id)
                        .success(function (data, status, headers, config) {                   
                            // Hide loading dialog.
                            $scope.shared.loading.hide();
                            
                            // Verify if the call was successful.
                            if(data.error === null) {
                                // Reload list of entries.
                                $scope.historial.submit();
                            } else {
                                // Show the error.
                                $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                    toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                                });
                                console.log(data);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            // Show the error.
                            $translate('errorNetworking').then(function (errorMsg) {
                                toastr.error(errorMsg, null);
                            });

                            // Update the UI.
                            $scope.shared.loading.hide();
                            if(!$scope.$$phase) $scope.$apply();
                        })
                    ;                
                }
            });
        }
    };
	
    $scope.historial.months = $scope.historial.getMonths();
	

});
var module = angular.module('myApp', ['onsen', 'pascalprecht.translate', 'toastr']);

module.controller('servicingCtrl', function ($scope, $window, $filter, $http, $translate, toastr) {
    // Functions related to navigation.
    $scope.nav = {
        setPage: function(page) {
            // Verify if the user is trying to access some sections without being logged.
            if(!$scope.session.logged && (page === 'servicing.html' || page === 'devices.html')) {
                // Show warning.
                $translate('msgYouMustBeLogged').then(function (errorMsg) { toastr.warning(errorMsg, null); });
            } else {                
                // Set main page.
                menu.setMainPage(page);                
                menu.closeMenu();
                
                // If the user wants to see his records, load the last 7 days.
                if(page === 'records.html') {
                    $scope.historial.submit();
                }
            }
        }
    };
    
    // Data and functions related to the login.
    $scope.session = {
        logged: false,
        username: '',
        password: '',
        userData: null,
        loginReturn: '',
        submit: function() {
            // Verify that neither the username nor the password are empty.
            if($scope.session.username === null || $scope.session.username.length === 0 || $scope.session.password === null || $scope.session.password.length === 0) {
                // Show error and return.
                $translate('errorEmptyUsernameOrPassword').then(function (errorMsg) {
                    toastr.error(errorMsg, null);
                });
                return;
            }
            
            // Show the loading dialog.
            $scope.shared.loading.show();

            // Invoke the login service.
            $http.post("../rest/api.php/login", {'username': $scope.session.username, 'password': $scope.session.password})
                .success(function (data, status, headers, config) {                                                          
                    // Verify if the call was succesful.            
                    if(data !== null && data.error === null) {
                        // Update logged flag and save user's data.
                        $scope.session.logged = true;
                        $scope.session.userData = data.user;
                    } else {
                        // Show an error message.
                        var errorCode = "errorUnexpectedAtServer";
                        if(data.error === "InvalidLogin") errorCode = "errorInvalidLogin";
                        if(data.error === "AccessDenied") errorCode = "errorAccessDenied";
                        $translate(errorCode).then(function (errorMsg) {
                            toastr.error(errorMsg, null);
                        });
                    }

                    // Clear the password.
                    $scope.session.password = '';

                    // Hide dialog.
                    $scope.shared.loading.hide();

                    // If logged, verify if another page must be displayed.
                    if($scope.session.logged && $scope.session.loginReturn !== null && $scope.session.loginReturn.length > 0) {
                        menu.setMainPage($scope.session.loginReturn);
                        $scope.session.loginReturn = null;
                    }
                    
                    // If logged, load initialization data from the server.
                    if($scope.session.logged) $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        },
        clearLoginData: function() {
            $scope.session.logged = false;
            $scope.session.username = '';
            $scope.session.password = '';
            $scope.session.userData = null;            
        },
        logout: function() {
            // Show loading dialog.
            $scope.shared.loading.show();
            
            // Call logout service.
            $http.get("../rest/api.php/logout")
                .success(function (data, status, headers, config) {
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Remove login data.
                        $scope.session.clearLoginData();

                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        }
    };
	
//PopUp function
	//Data and functions related to the pop-up.   ||  
    $scope.OpenPopupWindow = function () {	
			 var CallerId = document.activeElement.attributes[1].nodeValue;
			 CallerId = CallerId.replace('_','');
             $window.open("pchronos.html", CallerId, "width=400,height=200,left=100,top=150,toolbar=0,menubar=0,location=0,directories=0,channelmode=1,titlebar=0,addressbar=0, status=1");				
    }
	
	
	// Update datalist  || 
	$scope.UpDataList = function () {
		if(document.getElementById("positionSrc").value == document.getElementById("position").value && document.getElementById("locationSrc").value == document.getElementById("location").value){
			$("#zoneSrc").val(document.getElementById("zone").value);
			var x = document.getElementById("zoneSrc");
			x.remove(x.selectedIndex);
		}
	}
	
	SomeDateFunction = function(waty) {
      var res = '';
            try {
                if(waty !== null && waty.length > 0) {
                    var date = new Date(waty);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
    }	
	
	mySplit = function(string, nb) {
    var array = string.split(',');
    return array[nb];
}
	
	$scope.IDeviceRecorde = function (arrData,dDate) {
		//var dd = toNiceDate(dDate);
 		
		var KprDate = $filter('date')(dDate, "yyyy-MM-dd");
		var KprDateMin = KprDate + " 00:00:00.000000";
		var KprDateMax = KprDate + " 23:59:59.000000";
		
		KprDateMin = $filter('date')(KprDateMin, "yyyy-MM-ddThh:mm:ss");
		KprDateMax = $filter('date')(KprDateMax, "yyyy-MM-ddThh:mm:ss");
		
		var kaz = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1', [arrData]);
						
		var kAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		$scope.maintenance.stations = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		var zAll0 = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate < "'+KprDateMin +'"', [arrData]);
		
		var k1 = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		var k2 = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		
		var zAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate >'+KprDate, [arrData]);
		var k = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		var z = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		
		
		for (var i=0; i < kAll.length; i++){
			//_Y = SomeDateFunction(kAll[i]["CreateDate"]);
			var _KprDate = kAll[i]["CreateDate"];			
			_KprDate = $filter('date')(_KprDate,"yyyy-MM-dd");
			KprDateY = new Date(_KprDate);
			KprDateZ = kAll[i]["CreateDate"];
			DateZ = KprDateZ.date;


			var arr = [];
			

			
			if (KprDateZ.date < KprDateMin || KprDateZ.date > KprDateMax)
			{ 
				$scope.maintenance.stations.push(kAll[i]);
			}
		}
	}
	
	function findElement(arr, propName, propValue) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue)
			  return arr[i];
	}
	
		
	function _findElement(arr, propName, propValue, propCondition, propConditionValue, propReturn, propReturnValue, arrZone, arrLocation ) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue && arr[i][propCondition] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
			 var arrStock = $scope.DevicesMouvement.devices;
			 
			for (var i=0; i < arr.length; i++)
			if (arrStock[i]["Device"] == propValue && arrStock[i]["used"] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
	}

	
	function findElementValue(arr,IdDevice) {
		for (var i=0; i < arr.length; i++)	
			if( arr[i]["IsActive"] == 0 && arr[i]["DesktopId"] == IdDevice)
				return arr[i];
	}
	
	//IFonction to manage Devices  || Mouvement d'equipement
	$scope.DeviceDetails = function (dev,K,devCat,DevPosition, DevLocation, DevZone, DevStation) {	
		var res = alasql('SELECT *  FROM ? WHERE Id ='+K.Id,[dev]);
		var IDevice = alasql('SELECT value CClasse FROM ? WHERE Id ='+K.CategorieId, [devCat]);		
		IDevice = IDevice+'Id';		
		document.getElementById("DeviceSelected_Cat").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [devCat]);
		
		var y = _findElement(DevStation, IDevice, K.Device, "IsActive", 0, "ZoneId", "zone", DevZone, DevLocation);
		
		var x = findElement(DevStation, IDevice, K.Device);		
		var z = findElementValue(DevStation,K.Device);
				
		ZIdSelected = alasql('SELECT ZoneId, Id FROM ? WHERE IsActive = 0', [DevStation]);		
		var ZoneIdSelected = alasql('SELECT ZoneId FROM ? WHERE IsActive = 0 and ? = ?', [DevStation, IDevice, K.Device]);
		
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE IsActive = 0 and DesktopId = '+K.Device, [DevStation]);
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE '+ IDevice+' = '+K.Device+' and IsActive = 0', [DevStation]);
		
		document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevPosition]);
		document.getElementById("zone").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevZone]);
		document.getElementById("location").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevLocation]);
		//document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [DevPosition]);
	}
	
	
    // Data and functions related to the maintenances.   || Servicing 
    $scope.maintenance = {

		locations:[],
		positions:[],
		zones:[],
		maintenances:[],
		movements:[],
		stations:[],
		
		technicians: [],
		
		submitting: false,
        invalid: false,
		
		location:null,
		position:null,
		zone:null,
		maintenance:null,
		movement:null,
		station:null,
		//DateUpKeep:SetDate(),
		DateUpKeep:new Date(),
		UserId:null,
		StationId:null,
		Screen:null,
		Desktop:null,
		Av:false,
		Cam:false,
		Fp:false,
		Pp:false,
		Kbd:false,
		Mos:false,
		Ups:false,
		Rcg:false,
		Cln:false,
		Ss:false,
		Snd:false,
		Net:false,
		Swi:false,
		Usb:false,
 		Suw:null,
		Sus:null,
		Time1:null,
		Time2:null,
		Time3:null,
		TimeAvg:null, 
		observations:null,
			
			CreateDate : null,
			ZoneId : null,
			PositionId :null,
			ScreenId_Type : null,
			DesktopId : null,
			FpId : null,
			PpId : null,
			KbdId : null,
			MosId : null,
			UpsId : null,
			CamId : null,
			IsActive : 0,

		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.maintenance;  // || Servicing 
				enr.submitting = true;
				enr.Validated = false;
				var MoyTime = parseInt((parseInt(Time1.Text) + parseInt(Time2.Text) + parseInt(Time3.Text)) / 3);
				
				// Validate form.
				enr.invalid = enr.position === null|| enr.zone === null|| enr.location === null || enr.station === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {			
						StationId: enr.station !== null? enr.station.Id : null,		
						DateUpKeep: enr.DateUpKeep,					
						Fp: enr.Fp,
						Pp: enr.Pp,
						Kbd: enr.Kbd,
						Mos: enr.Mos,
						Ups: enr.Ups,			
						Suw: parseInt(Suw.Text),
						Sus: parseInt(Sus.Text),
						Time1: parseInt(Time1.Text),
						Time2: parseInt(Time2.Text),
						Time3: parseInt(Time3.Text),
						TimeAvg: MoyTime,			
						Rcg: enr.Rcg,
						Av: enr.Av,
						Cln: enr.Cln,
						Ss: enr.Ss,
						Snd: enr.Snd,
						Net: enr.Net,
						Swi: enr.Swi,
						Usb: enr.Usb,		
						Validated: enr.Validated,						 
						Observations: enr.observations	
						
					};

					// Submit data.
					$http.post("../rest/api.php/maintenances", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									var enrStation = {
										CreateDate : enr.DateUpKeep,
										ZoneId : enr.zone.Id,
										ScreenId_Type : enr.station.ScreenId_Type,
										DesktopId : enr.station.DesktopId,
										FpId : enr.station.FpId,
										PpId : enr.station.PpId,
										KbdId : enr.station.KbdId,
										MosId : enr.station.MosId,
										UpsId : enr.station.UpsId,
										CamId : enr.station.CamId,
										StationId :enr.station.Id,
										IsActive : 1
									};


								// Added to clean the screen

								enr.Fp = false;
								enr.Pp = false;
								enr.Kbd = false;
								enr.Mos = false;
								enr.Ups = false;			
								Suw = false;
								Sus = false;
								Time1 = "";
								Time2 = "";
								Time3 = "";
								TimeAvg = false;			
								enr.Rcg = false;
								enr.Av = false;
								enr.Cln = false;
								enr.Ss = false;
								enr.Snd = false;
								enr.Net = false;
								enr.Swi = false;
								enr.Usb = false;						 
								enr.observations = "";	

								//								
									
								var _CDate = enrStation.CreateDate;									
								var StationData = EnregStation("../rest/api.php/stations",enrStation, _CDate);				
											
								// Show a success message.
 								
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});


							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "servicing.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	
	
	 // Data and functions related to the maintenances.
    $scope.device = {
		devices_categories:[],
		devices:[],		
		technicians: [],		
		CategorieId:null,
		Device:null,
		technicians:null,
		Observations:null,		
		DateAdd:new Date(),
		IsUsed: false,
		
		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.device;
				enr.submitting = true;
				
				// Validate form.
				enr.invalid = enr.Device === null|| enr.device_categorie === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {				
						DateAdd: enr.DateAdd,					
						CategorieId: enr.device_categorie.Id,
						Device: enr.Device,
						IsUsed: enr.IsUsed,							 
						Observations: enr.Observations +'\r\n'+"Ajouté au stock de l'operation de Côte d'ivoire par: "+$scope.session.userData.first_name+" "+$scope.session.userData.last_name +". A la date du "+ enr.DateAdd,						
					};

					// Submit data.
					$http.post("../rest/api.php/device", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									enr.device_categorie.Id = '';
									enr.Device = '';
									enr.IsUsed = false;		
									enr.Observations = '';
									
								// Show a success message.
								$translate('msgEnrollmentSubmitted').then(function (successMsg) {
									toastr.success(successMsg, null);
								});
							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "device.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	// Data and functions related to the maintenances.
    function EnregStation(str,data,CDate) {							
					// Submit Station data.
					$http.post(str, data)
						.success(function (data, status, headers, config) { 
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.	
									var Azulh = document.getElementById("enrForm");
									var DateUp = new Date();
									
									// clearing Inputs
									var inputs = Azulh.getElementsByTagName('input');
										for (var i = 0; i<inputs.length; i++) {
											switch (inputs[i].type) {
												// case 'hidden':
												case 'text':
													inputs[i].value = '';
													break;
												case 'radio':
												case 'checkbox':
													inputs[i].checked = false;
												//case 'datetime-local':	
													//inputs[i].value = new Date();
											}
										}
										
									// clearing Selects	
									var selects = Azulh.getElementsByTagName('select');
									for (var i = 3; i<selects.length; i++)
										selects[i].value = '';										
									
									// clearing textarea
									var text= Azulh.getElementsByTagName('textarea');
									for (var i = 0; i<text.length; i++)
										text[i].value = '';		
																										
									//Set new date 
									document.getElementById("DateUpKeep").value = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
									
									//Update Stations List
									var _Date = $filter('date')(CDate, "yyyy-MM-dd");
									var _DateMin = _Date + " 00:00:00.000000";
									var _DateMax = _Date + " 23:59:59.000000";
									var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [$scope.maintenance.stations]);
									$scope.maintenance.stations = [];
									for (var i=0; i < arrData.length; i++){
									var dDate = arrData[i]["CreateDate"];	
										if (dDate.date < _DateMin || dDate.date > _DateMax)
										{ 
											$scope.maintenance.stations.push(arrData[i]);
										}
									}										
										
									//Show a success message.
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});
									
							}
						})		
		return data;
	}
    	
	function SetDate(){	
		var _utc = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
		return _utc;
	}									
		
		
	function GetDesktop(){		
		var year = parseInt(matches[3], 10);
		var month = parseInt(matches[2], 10) - 1; // months are 0-11
		var day = parseInt(matches[1], 10);
		var hour = parseInt(matches[4], 10);
		var minute = parseInt(matches[5], 10);
		var second = parseInt(matches[6], 10);
		
	}	
	
	function verifyDate(value) {
		// capture all the parts
		var matches = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
		if (matches === null) {
			return false;
		} else{
			// now lets check the date sanity
			var year = parseInt(matches[3], 10);
			var month = parseInt(matches[2], 10) - 1; // months are 0-11
			var day = parseInt(matches[1], 10);
			var hour = parseInt(matches[4], 10);
			var minute = parseInt(matches[5], 10);
			var second = parseInt(matches[6], 10);
			var date = new Date(year, month, day, hour, minute, second);
			if (date.getFullYear() !== year
			  || date.getMonth() != month
			  || date.getDate() !== day
			  || date.getHours() !== hour
			  || date.getMinutes() !== minute
			  || date.getSeconds() !== second
			) {
			   return false;
			} else {
			   return true;
			}
		
		}
	}
		
	function UpdateStations(str,data) {	
	// Submit Station update data.
	$http.post(str, data)
		.success(function (data, status, headers, config) { 
			// Verify if the call was succesful.
			if(data !== null && data.error === null) {
				// Clear the form.															
			}
		})	
	return data;						
	}

	$scope.historiesMaintenances = function (dStart,dEnd) {
	
	}
	
	$scope.DevicesMouvement = {
		 
		
	}
	    
    // Shared values and functions.   || Maintenace
    $scope.shared = {
        loading: null,
        dateFormat: 'YYYY-MM-DD',
        toNiceDate: function(text) {
            var res = '';
            try {
                if(text !== null && text.length > 0) {
                    var date = moment(text);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
        },
        getInitDataFromServer: function() {
            // Ask for the list utile data. position-location-zone-maintenance-station-devices_categories-device
            $http.get("../rest/api.php/list/position-location-zone-maintenance-station-devices_categories-device") //-movement-device-devicesCategorie
                .success(function (data, status, headers, config) {         
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Load the data.
 
						$scope.maintenance.locations = alasql('SELECT * FROM ? WHERE Id !=6', [data.lists.location]);
						$scope.maintenance.positions = data.lists.position;
						$scope.maintenance.zones = data.lists.zone;	
						$scope.maintenance.maintenances = data.lists.maintenance;						
						var _Date = $filter('date')(new Date(), "yyyy-MM-dd");
						var _DateMin = _Date + " 00:00:00.000000";
						var _DateMax = _Date + " 23:59:59.000000";
						var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						for (var i=0; i < arrData.length; i++){
							var dDate = arrData[i]["CreateDate"];	
							if (dDate.date < _DateMin || dDate.date > _DateMax)
								{ 
									$scope.maintenance.stations.push(arrData[i]);
								}
						}										
						//$scope.maintenance.movements = data.lists.movement;	

						$scope.DevicesMouvement.locations = data.lists.location;						
						$scope.DevicesMouvement.positions = data.lists.position;
						$scope.DevicesMouvement.zones = data.lists.zone;
						$scope.DevicesMouvement.stations = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);	
						$scope.DevicesMouvement.devices_categories = data.lists.devices_categories;	
						$scope.DevicesMouvement.devices = data.lists.device;
						//$scope.DevicesMouvement.movements = data.lists.movement;												
						
						$scope.DevicesMouvement.locationsSrc = data.lists.location;
						$scope.DevicesMouvement.positionsSrc = data.lists.position;
						$scope.DevicesMouvement.zonesSrc = data.lists.zone;	
						$scope.DevicesMouvement.stationsSrc = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						$scope.DevicesMouvement.devices_categoriesSrc = data.lists.devices_categories;
						$scope.DevicesMouvement.devicesSrc = data.lists.device;
						//$scope.DevicesMouvement.movementsSrc = data.lists.movement;						
											
						$scope.device.devices_categories = data.lists.devices_categories;
						$scope.device.devices = data.lists.device;		
						//
												
						$scope.maintenancesRecords.MRmValues = data.lists.maintenance;
						$scope.maintenancesRecords.MRsValues = data.lists.station;
						
						//MHValues = alasql('SELECT MHm.DateUpKeep, MHm.StationId, MHs.Id, MHs.ScreenId_Type, MHs.DesktopId, MHs.FpId, MHs.PpId, MHs.KbdId, MHs.MosId, MHs.UpsId, MHs.CamId FROM ? as MHs RIGHT JOIN ? as MHm ON MHs.Id = MHm.StationId ',[data.lists.station],[data.lists.maintenance]);
						
                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;

            // Show dialog.
            $scope.shared.loading.show();            
        }
    };
    

	
    // Initialize date format.
    $translate('formatDate').then(function (format) {
        $scope.shared.dateFormat = format;
    });    
    
    // Show loading dialog and load initialization data from server.
    ons.createDialog('loading-dialog.html').then(function(dialog) {
        // Store dialog.
        $scope.shared.loading = dialog;
        
        // Call the ping service in order to verify if the user is already logged.
        $http.get("../rest/api.php")
            .success(function (data, status, headers, config) {
                // Verify if the user is logged.
                if(data !== null && data.user !== null) {
                    // Save user data.
                    $scope.session.logged = true;
                    $scope.session.userData = data.user;
                    $scope.session.username = data.user.username;
                    
                    // Load initialization data from the server.
                    $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                } else {
                    // Redirect to login page.
                    $scope.session.loginReturn = "servicing.html";
                    menu.setMainPage("login.html");
                }                
            })
            .error(function(data, status, headers, config) {
                // Redirect to login page.
                $scope.session.loginReturn = "servicing.html";
                menu.setMainPage("login.html");
            })
        ;
    });
    
    // Chronometer's values and functions.
    $scope.chrono = {
        secondsCounted: 0,
        start: null,
        intervalId: null,
        play: function() {
            if($scope.chrono.intervalId === null) {
                $scope.chrono.intervalId = setInterval($scope.chrono.updateDisplay, 500);
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
            }
        },
        pause: function() {
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },
        clear: function() {
            $scope.chrono.secondsCounted = 0;
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },		
        SendValues: function() {
			if (window.opener != null && !window.opener.closed && $scope.chrono.secondsCounted !=null ) {
				var Azul = window.opener.document.getElementById(window.name);
				Azul.value = $scope.chrono.secondsCounted;
				Azul.Text = $scope.chrono.secondsCounted;
			}
			window.close();
        },		
        reset: function() {
            
            // Reset chronometer.
            $scope.chrono.clear();
        },
        edit: function() {
            // Show edition dialog.
            ons.createDialog('chrono-dialog.html').then(function(dialog) {
                // Update dialog's data.
                $scope.chrono.dialog.reference = dialog;
                $scope.chrono.dialog.seconds = $scope.chrono.secondsCounted % 60;
                $scope.chrono.dialog.minutes = parseInt($scope.chrono.secondsCounted / 60, 10);
                        
                // Show dialog.
                dialog.show();
            });
        },
        dialog: {
            seconds: null,
            minutes: null,
            reference: null,
            close: function() {
                $scope.chrono.dialog.reference.hide();
            },
            save: function() {
                // Update seconds counted and start time.
                $scope.chrono.secondsCounted = parseInt($scope.chrono.dialog.seconds,10) + parseInt($scope.chrono.dialog.minutes,10)*60;
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
                
                // Hide dialog.
                $scope.chrono.dialog.reference.hide();
            }
        },
        secondsCountedToString: function() {
            var sec = $scope.chrono.secondsCounted % 60;
            if(sec < 10) sec = '0' + sec;
            var min = parseInt($scope.chrono.secondsCounted/60);
            return min + ':' + sec;
        },
        updateDisplay: function() {
            var now = new Date();
            $scope.chrono.secondsCounted = parseInt((now.getTime() - $scope.chrono.start.getTime())/1000, 10);
            $scope.$apply();
        }
    };
    
    // Values and functions for the settings related to multi-language support.
    $scope.language = {
        value: amplify.store('language'),
        save: function() {
            $translate.use($scope.language.value);
            amplify.store('language', $scope.language.value);
        }
    };

    // Values and functions for the settings related to the historial feature.
    var now = moment();
    var lastWeek = moment().subtract(7, 'days');
    $scope.historial = {
        submitting: false,
        historial: null,
        startYear: lastWeek.year(),
        startMonth: lastWeek.month(),
        startDate: lastWeek.date(),
        endYear: now.year(),
        endMonth: now.month(),
        endDate: now.date(),
        searched: false,
        getDays: function(month) {
            var res = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
            if(month !== 1) {
                res.push(29);
                res.push(30);
                if(month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) res.push(31);
            }
            return res;
        },
        getMonths: function() {					

            if($scope.language.value === 'es') return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
            if($scope.language.value === 'fr') return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôut", "Sept", "Oct", "Nov", "Dec"];
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        },
        getYears: function() {
            var res = [];
            for(var i=0; i<10; i++) res.push(now.year() - i);
            return res;
        },
        submit: function() {
            // Initialize variables.
            var hist = $scope.historial;
            hist.submitting = true;
            hist.searched = true;
            
            // Show loading dialog.
            $scope.shared.loading.show();

            // Get dates.
            var start = hist.startYear + "-" + (hist.startMonth+1) + "-" + hist.startDate + " 00:00:00";
            var end = hist.endYear + "-" + (hist.endMonth+1) + "-" + hist.endDate + " 23:59:59";
			
            // Package data.
            var histData = {
                start: start,
                end: end
            };

            // Submit data.
            $http.post("../rest/api.php/maintenances/search", histData)
                .success(function (data, status, headers, config) {              
                    // Verify if the call was successful.
                    if(data !== null && data.error === null) {
                        // Get list of records.
                        hist.records = data.records;
                    } else {
                        // An error occured, verify which time of error was.
                        if(data.error === "InvalidLogin") {
                            // Show a warning and display the login view.
                            $translate('msgYouMustBeLogged').then(function (message) {
                                toastr.warning(message, null);
                                $scope.session.loginReturn = "records.html";
                                menu.setMainPage("login.html");
                            });
                            $scope.session.clearLoginData();
                        } else {
                            // Show the error.
                            $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                            });
                            console.log(data);
                        }
                    }

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submitting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submiting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
            ;    
        },
        deleteEntry: function(entry) {
            // Ask confirmation.
            $translate('msgAreYouSureYouWantToDeleteEnrollment').then(function (confirmationMsg) {
                if(confirm(confirmationMsg)) {
                    // Show loading dialog.
                    $scope.shared.loading.show();

                    // Invoke service.    
                    $http.post("../rest/api.php/maintenances/delete/" + entry.id)
                        .success(function (data, status, headers, config) {                   
                            // Hide loading dialog.
                            $scope.shared.loading.hide();
                            
                            // Verify if the call was successful.
                            if(data.error === null) {
                                // Reload list of entries.
                                $scope.historial.submit();
                            } else {
                                // Show the error.
                                $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                    toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                                });
                                console.log(data);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            // Show the error.
                            $translate('errorNetworking').then(function (errorMsg) {
                                toastr.error(errorMsg, null);
                            });

                            // Update the UI.
                            $scope.shared.loading.hide();
                            if(!$scope.$$phase) $scope.$apply();
                        })
                    ;                
                }
            });
        }
    };
	
    $scope.historial.months = $scope.historial.getMonths();
	$scope.maintenancesRecords = {
	
		MHmValues :[],
		MHsValues :[],
	};

	

});
var module = angular.module('myApp', ['onsen', 'pascalprecht.translate', 'toastr']);

module.controller('servicingCtrl', function ($scope, $window, $filter, $http, $translate, toastr) {
    // Functions related to navigation.
    $scope.nav = {
        setPage: function(page) {
            // Verify if the user is trying to access some sections without being logged.
            if(!$scope.session.logged && (page === 'servicing.html' || page === 'devices.html')) {
                // Show warning.
                $translate('msgYouMustBeLogged').then(function (errorMsg) { toastr.warning(errorMsg, null); });
            } else {                
                // Set main page.
                menu.setMainPage(page);                
                menu.closeMenu();
                
                // If the user wants to see his records, load the last 7 days.
                if(page === 'records.html') {
                    $scope.historial.submit();
                }
            }
        }
    };
    
    // Data and functions related to the login.
    $scope.session = {
        logged: false,
        username: '',
        password: '',
        userData: null,
        loginReturn: '',
        submit: function() {
            // Verify that neither the username nor the password are empty.
            if($scope.session.username === null || $scope.session.username.length === 0 || $scope.session.password === null || $scope.session.password.length === 0) {
                // Show error and return.
                $translate('errorEmptyUsernameOrPassword').then(function (errorMsg) {
                    toastr.error(errorMsg, null);
                });
                return;
            }
            
            // Show the loading dialog.
            $scope.shared.loading.show();

            // Invoke the login service.
            $http.post("../rest/api.php/login", {'username': $scope.session.username, 'password': $scope.session.password})
                .success(function (data, status, headers, config) {                                                          
                    // Verify if the call was succesful.            
                    if(data !== null && data.error === null) {
                        // Update logged flag and save user's data.
                        $scope.session.logged = true;
                        $scope.session.userData = data.user;
                    } else {
                        // Show an error message.
                        var errorCode = "errorUnexpectedAtServer";
                        if(data.error === "InvalidLogin") errorCode = "errorInvalidLogin";
                        if(data.error === "AccessDenied") errorCode = "errorAccessDenied";
                        $translate(errorCode).then(function (errorMsg) {
                            toastr.error(errorMsg, null);
                        });
                    }

                    // Clear the password.
                    $scope.session.password = '';

                    // Hide dialog.
                    $scope.shared.loading.hide();

                    // If logged, verify if another page must be displayed.
                    if($scope.session.logged && $scope.session.loginReturn !== null && $scope.session.loginReturn.length > 0) {
                        menu.setMainPage($scope.session.loginReturn);
                        $scope.session.loginReturn = null;
                    }
                    
                    // If logged, load initialization data from the server.
                    if($scope.session.logged) $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        },
        clearLoginData: function() {
            $scope.session.logged = false;
            $scope.session.username = '';
            $scope.session.password = '';
            $scope.session.userData = null;            
        },
        logout: function() {
            // Show loading dialog.
            $scope.shared.loading.show();
            
            // Call logout service.
            $http.get("../rest/api.php/logout")
                .success(function (data, status, headers, config) {
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Remove login data.
                        $scope.session.clearLoginData();

                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        }
    };
	
//PopUp function
	//Data and functions related to the pop-up.   ||  
    $scope.OpenPopupWindow = function () {	
			 var CallerId = document.activeElement.attributes[1].nodeValue;
			 CallerId = CallerId.replace('_','');
             $window.open("pchronos.html", CallerId, "width=400,height=200,left=100,top=150,toolbar=0,menubar=0,location=0,directories=0,channelmode=1,titlebar=0,addressbar=0, status=1");				
    }
	
	
	// Update datalist  || 
	$scope.UpDataList = function () {
		if(document.getElementById("positionSrc").value == document.getElementById("position").value && document.getElementById("locationSrc").value == document.getElementById("location").value){
			$("#zoneSrc").val(document.getElementById("zone").value);
			var x = document.getElementById("zoneSrc");
			x.remove(x.selectedIndex);
		}
	}
	
	SomeDateFunction = function(waty) {
      var res = '';
            try {
                if(waty !== null && waty.length > 0) {
                    var date = new Date(waty);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
    }	
	
	mySplit = function(string, nb) {
    var array = string.split(',');
    return array[nb];
}
	
	$scope.IDeviceRecorde = function (arrData,dDate) {
		//var dd = toNiceDate(dDate);
 		
		var KprDate = $filter('date')(dDate, "yyyy-MM-dd");
		var KprDateMin = KprDate + " 00:00:00.000000";
		var KprDateMax = KprDate + " 23:59:59.000000";
		
		KprDateMin = $filter('date')(KprDateMin, "yyyy-MM-ddThh:mm:ss");
		KprDateMax = $filter('date')(KprDateMax, "yyyy-MM-ddThh:mm:ss");
		
		var kaz = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1', [arrData]);
						
		var kAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		$scope.maintenance.stations = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		var zAll0 = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate < "'+KprDateMin +'"', [arrData]);
		
		var k1 = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		var k2 = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		
		var zAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate >'+KprDate, [arrData]);
		var k = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		var z = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		
		
		for (var i=0; i < kAll.length; i++){
			//_Y = SomeDateFunction(kAll[i]["CreateDate"]);
			var _KprDate = kAll[i]["CreateDate"];			
			_KprDate = $filter('date')(_KprDate,"yyyy-MM-dd");
			KprDateY = new Date(_KprDate);
			KprDateZ = kAll[i]["CreateDate"];
			DateZ = KprDateZ.date;


			var arr = [];
			

			
			if (KprDateZ.date < KprDateMin || KprDateZ.date > KprDateMax)
			{ 
				$scope.maintenance.stations.push(kAll[i]);
			}
		}
	}
	
	function findElement(arr, propName, propValue) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue)
			  return arr[i];
	}
	
		
	function _findElement(arr, propName, propValue, propCondition, propConditionValue, propReturn, propReturnValue, arrZone, arrLocation ) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue && arr[i][propCondition] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
			 var arrStock = $scope.DevicesMouvement.devices;
			 
			for (var i=0; i < arr.length; i++)
			if (arrStock[i]["Device"] == propValue && arrStock[i]["used"] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
	}

	
	function findElementValue(arr,IdDevice) {
		for (var i=0; i < arr.length; i++)	
			if( arr[i]["IsActive"] == 0 && arr[i]["DesktopId"] == IdDevice)
				return arr[i];
	}
	
	//IFonction to manage Devices  || Mouvement d'equipement
	$scope.DeviceDetails = function (dev,K,devCat,DevPosition, DevLocation, DevZone, DevStation) {	
		var res = alasql('SELECT *  FROM ? WHERE Id ='+K.Id,[dev]);
		var IDevice = alasql('SELECT value CClasse FROM ? WHERE Id ='+K.CategorieId, [devCat]);		
		IDevice = IDevice+'Id';		
		document.getElementById("DeviceSelected_Cat").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [devCat]);
		
		var y = _findElement(DevStation, IDevice, K.Device, "IsActive", 0, "ZoneId", "zone", DevZone, DevLocation);
		
		var x = findElement(DevStation, IDevice, K.Device);		
		var z = findElementValue(DevStation,K.Device);
				
		ZIdSelected = alasql('SELECT ZoneId, Id FROM ? WHERE IsActive = 0', [DevStation]);		
		var ZoneIdSelected = alasql('SELECT ZoneId FROM ? WHERE IsActive = 0 and ? = ?', [DevStation, IDevice, K.Device]);
		
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE IsActive = 0 and DesktopId = '+K.Device, [DevStation]);
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE '+ IDevice+' = '+K.Device+' and IsActive = 0', [DevStation]);
		
		document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevPosition]);
		document.getElementById("zone").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevZone]);
		document.getElementById("location").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevLocation]);
		//document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [DevPosition]);
	}
	
	
    // Data and functions related to the maintenances.   || Servicing 
    $scope.maintenance = {

		locations:[],
		positions:[],
		zones:[],
		maintenances:[],
		movements:[],
		stations:[],
		
		technicians: [],
		
		submitting: false,
        invalid: false,
		
		location:null,
		position:null,
		zone:null,
		maintenance:null,
		movement:null,
		station:null,
		//DateUpKeep:SetDate(),
		DateUpKeep:new Date(),
		UserId:null,
		StationId:null,
		Screen:null,
		Desktop:null,
		Av:false,
		Cam:false,
		Fp:false,
		Pp:false,
		Kbd:false,
		Mos:false,
		Ups:false,
		Rcg:false,
		Cln:false,
		Ss:false,
		Snd:false,
		Net:false,
		Swi:false,
		Usb:false,
 		Suw:null,
		Sus:null,
		Time1:null,
		Time2:null,
		Time3:null,
		TimeAvg:null, 
		observations:null,
			
			CreateDate : null,
			ZoneId : null,
			PositionId :null,
			ScreenId_Type : null,
			DesktopId : null,
			FpId : null,
			PpId : null,
			KbdId : null,
			MosId : null,
			UpsId : null,
			CamId : null,
			IsActive : 0,

		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.maintenance;  // || Servicing 
				enr.submitting = true;
				enr.Validated = false;
				var MoyTime = parseInt((parseInt(Time1.Text) + parseInt(Time2.Text) + parseInt(Time3.Text)) / 3);
				
				// Validate form.
				enr.invalid = enr.position === null|| enr.zone === null|| enr.location === null || enr.station === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {			
						StationId: enr.station !== null? enr.station.Id : null,		
						DateUpKeep: enr.DateUpKeep,					
						Fp: enr.Fp,
						Pp: enr.Pp,
						Kbd: enr.Kbd,
						Mos: enr.Mos,
						Ups: enr.Ups,			
						Suw: parseInt(Suw.Text),
						Sus: parseInt(Sus.Text),
						Time1: parseInt(Time1.Text),
						Time2: parseInt(Time2.Text),
						Time3: parseInt(Time3.Text),
						TimeAvg: MoyTime,			
						Rcg: enr.Rcg,
						Av: enr.Av,
						Cln: enr.Cln,
						Ss: enr.Ss,
						Snd: enr.Snd,
						Net: enr.Net,
						Swi: enr.Swi,
						Usb: enr.Usb,		
						Validated: enr.Validated,						 
						Observations: enr.observations	
						
					};

					// Submit data.
					$http.post("../rest/api.php/maintenances", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									var enrStation = {
										CreateDate : enr.DateUpKeep,
										ZoneId : enr.zone.Id,
										ScreenId_Type : enr.station.ScreenId_Type,
										DesktopId : enr.station.DesktopId,
										FpId : enr.station.FpId,
										PpId : enr.station.PpId,
										KbdId : enr.station.KbdId,
										MosId : enr.station.MosId,
										UpsId : enr.station.UpsId,
										CamId : enr.station.CamId,
										StationId :enr.station.Id,
										IsActive : 1
									};


								// Added to clean the screen

								enr.Fp = false;
								enr.Pp = false;
								enr.Kbd = false;
								enr.Mos = false;
								enr.Ups = false;			
								Suw = false;
								Sus = false;
								Time1 = "";
								Time2 = "";
								Time3 = "";
								TimeAvg = false;			
								enr.Rcg = false;
								enr.Av = false;
								enr.Cln = false;
								enr.Ss = false;
								enr.Snd = false;
								enr.Net = false;
								enr.Swi = false;
								enr.Usb = false;						 
								enr.observations = "";	

								//								
									
								var _CDate = enrStation.CreateDate;									
								var StationData = EnregStation("../rest/api.php/stations",enrStation, _CDate);				
											
								// Show a success message.
 								
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});


							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "servicing.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	
	
	 // Data and functions related to the maintenances.
    $scope.device = {
		devices_categories:[],
		devices:[],		
		technicians: [],		
		CategorieId:null,
		Device:null,
		technicians:null,
		Observations:null,		
		DateAdd:new Date(),
		IsUsed: false,
		
		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.device;
				enr.submitting = true;
				
				// Validate form.
				enr.invalid = enr.Device === null|| enr.device_categorie === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {				
						DateAdd: enr.DateAdd,					
						//CategorieId: enr.device_categorie.Id,
                                                CategorieId: enr.device_categorie,
						Device: enr.Device,
						IsUsed: enr.IsUsed,							 
						Observations: enr.Observations +'\r\n'+"Ajouté au stock de l'operation de Côte d'ivoire par: "+$scope.session.userData.first_name+" "+$scope.session.userData.last_name +". A la date du "+ enr.DateAdd,						
					};

					// Submit data.
					$http.post("../rest/api.php/device", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									enr.device_categorie.Id = '';
									enr.Device = '';
									enr.IsUsed = false;		
									enr.Observations = '';
									
								// Show a success message.
								$translate('msgEnrollmentSubmitted').then(function (successMsg) {
									toastr.success(successMsg, null);
								});
							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "device.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	// Data and functions related to the maintenances.
    function EnregStation(str,data,CDate) {							
					// Submit Station data.
					$http.post(str, data)
						.success(function (data, status, headers, config) { 
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.	
									var Azulh = document.getElementById("enrForm");
									var DateUp = new Date();
									
									// clearing Inputs
									var inputs = Azulh.getElementsByTagName('input');
										for (var i = 0; i<inputs.length; i++) {
											switch (inputs[i].type) {
												// case 'hidden':
												case 'text':
													inputs[i].value = '';
													break;
												case 'radio':
												case 'checkbox':
													inputs[i].checked = false;
												//case 'datetime-local':	
													//inputs[i].value = new Date();
											}
										}
										
									// clearing Selects	
									var selects = Azulh.getElementsByTagName('select');
									for (var i = 3; i<selects.length; i++)
										selects[i].value = '';										
									
									// clearing textarea
									var text= Azulh.getElementsByTagName('textarea');
									for (var i = 0; i<text.length; i++)
										text[i].value = '';		
																										
									//Set new date 
									document.getElementById("DateUpKeep").value = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
									
									//Update Stations List
									var _Date = $filter('date')(CDate, "yyyy-MM-dd");
									var _DateMin = _Date + " 00:00:00.000000";
									var _DateMax = _Date + " 23:59:59.000000";
									var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [$scope.maintenance.stations]);
									$scope.maintenance.stations = [];
									for (var i=0; i < arrData.length; i++){
									var dDate = arrData[i]["CreateDate"];	
										if (dDate.date < _DateMin || dDate.date > _DateMax)
										{ 
											$scope.maintenance.stations.push(arrData[i]);
										}
									}										
										
									//Show a success message.
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});
									
							}
						})		
		return data;
	}
    	
	function SetDate(){	
		var _utc = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
		return _utc;
	}									
		
		
	function GetDesktop(){		
		var year = parseInt(matches[3], 10);
		var month = parseInt(matches[2], 10) - 1; // months are 0-11
		var day = parseInt(matches[1], 10);
		var hour = parseInt(matches[4], 10);
		var minute = parseInt(matches[5], 10);
		var second = parseInt(matches[6], 10);
		
	}	
	
	function verifyDate(value) {
		// capture all the parts
		var matches = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
		if (matches === null) {
			return false;
		} else{
			// now lets check the date sanity
			var year = parseInt(matches[3], 10);
			var month = parseInt(matches[2], 10) - 1; // months are 0-11
			var day = parseInt(matches[1], 10);
			var hour = parseInt(matches[4], 10);
			var minute = parseInt(matches[5], 10);
			var second = parseInt(matches[6], 10);
			var date = new Date(year, month, day, hour, minute, second);
			if (date.getFullYear() !== year
			  || date.getMonth() != month
			  || date.getDate() !== day
			  || date.getHours() !== hour
			  || date.getMinutes() !== minute
			  || date.getSeconds() !== second
			) {
			   return false;
			} else {
			   return true;
			}
		
		}
	}
		
	function UpdateStations(str,data) {	
	// Submit Station update data.
	$http.post(str, data)
		.success(function (data, status, headers, config) { 
			// Verify if the call was succesful.
			if(data !== null && data.error === null) {
				// Clear the form.															
			}
		})	
	return data;						
	}

	$scope.historiesMaintenances = function (dStart,dEnd) {
	
	}
	
	$scope.DevicesMouvement = {
		 
		
	}
	    
    // Shared values and functions.   || Maintenace
    $scope.shared = {
        loading: null,
        dateFormat: 'YYYY-MM-DD',
        toNiceDate: function(text) {
            var res = '';
            try {
                if(text !== null && text.length > 0) {
                    var date = moment(text);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
        },
        getInitDataFromServer: function() {
            // Ask for the list utile data. position-location-zone-maintenance-station-devices_categories-device
            $http.get("../rest/api.php/list/position-location-zone-maintenance-station-devices_categories-device") //-movement-device-devicesCategorie
                .success(function (data, status, headers, config) {         
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Load the data.
 
						$scope.maintenance.locations = alasql('SELECT * FROM ? WHERE Id !=6', [data.lists.location]);
						$scope.maintenance.positions = data.lists.position;
						$scope.maintenance.zones = data.lists.zone;	
						$scope.maintenance.maintenances = data.lists.maintenance;						
						var _Date = $filter('date')(new Date(), "yyyy-MM-dd");
						var _DateMin = _Date + " 00:00:00.000000";
						var _DateMax = _Date + " 23:59:59.000000";
						var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						for (var i=0; i < arrData.length; i++){
							var dDate = arrData[i]["CreateDate"];	
							if (dDate.date < _DateMin || dDate.date > _DateMax)
								{ 
									$scope.maintenance.stations.push(arrData[i]);
								}
						}										
						//$scope.maintenance.movements = data.lists.movement;	

						$scope.DevicesMouvement.locations = data.lists.location;						
						$scope.DevicesMouvement.positions = data.lists.position;
						$scope.DevicesMouvement.zones = data.lists.zone;
						$scope.DevicesMouvement.stations = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);	
						$scope.DevicesMouvement.devices_categories = data.lists.devices_categories;	
						$scope.DevicesMouvement.devices = data.lists.device;
						//$scope.DevicesMouvement.movements = data.lists.movement;												
						
						$scope.DevicesMouvement.locationsSrc = data.lists.location;
						$scope.DevicesMouvement.positionsSrc = data.lists.position;
						$scope.DevicesMouvement.zonesSrc = data.lists.zone;	
						$scope.DevicesMouvement.stationsSrc = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						$scope.DevicesMouvement.devices_categoriesSrc = data.lists.devices_categories;
						$scope.DevicesMouvement.devicesSrc = data.lists.device;
						//$scope.DevicesMouvement.movementsSrc = data.lists.movement;						
											
						$scope.device.devices_categories = data.lists.devices_categories;
						$scope.device.devices = data.lists.device;		
						//
												
						$scope.maintenancesRecords.MRmValues = data.lists.maintenance;
						$scope.maintenancesRecords.MRsValues = data.lists.station;
						
						//MHValues = alasql('SELECT MHm.DateUpKeep, MHm.StationId, MHs.Id, MHs.ScreenId_Type, MHs.DesktopId, MHs.FpId, MHs.PpId, MHs.KbdId, MHs.MosId, MHs.UpsId, MHs.CamId FROM ? as MHs RIGHT JOIN ? as MHm ON MHs.Id = MHm.StationId ',[data.lists.station],[data.lists.maintenance]);
						
                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;

            // Show dialog.
            $scope.shared.loading.show();            
        }
    };
    

	
    // Initialize date format.
    $translate('formatDate').then(function (format) {
        $scope.shared.dateFormat = format;
    });    
    
    // Show loading dialog and load initialization data from server.
    ons.createDialog('loading-dialog.html').then(function(dialog) {
        // Store dialog.
        $scope.shared.loading = dialog;
        
        // Call the ping service in order to verify if the user is already logged.
        $http.get("../rest/api.php")
            .success(function (data, status, headers, config) {
                // Verify if the user is logged.
                if(data !== null && data.user !== null) {
                    // Save user data.
                    $scope.session.logged = true;
                    $scope.session.userData = data.user;
                    $scope.session.username = data.user.username;
                    
                    // Load initialization data from the server.
                    $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                } else {
                    // Redirect to login page.
                    $scope.session.loginReturn = "servicing.html";
                    menu.setMainPage("login.html");
                }                
            })
            .error(function(data, status, headers, config) {
                // Redirect to login page.
                $scope.session.loginReturn = "servicing.html";
                menu.setMainPage("login.html");
            })
        ;
    });
    
    // Chronometer's values and functions.
    $scope.chrono = {
        secondsCounted: 0,
        start: null,
        intervalId: null,
        play: function() {
            if($scope.chrono.intervalId === null) {
                $scope.chrono.intervalId = setInterval($scope.chrono.updateDisplay, 500);
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
            }
        },
        pause: function() {
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },
        clear: function() {
            $scope.chrono.secondsCounted = 0;
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },		
        SendValues: function() {
			if (window.opener != null && !window.opener.closed && $scope.chrono.secondsCounted !=null ) {
				var Azul = window.opener.document.getElementById(window.name);
				Azul.value = $scope.chrono.secondsCounted;
				Azul.Text = $scope.chrono.secondsCounted;
			}
			window.close();
        },		
        reset: function() {
            
            // Reset chronometer.
            $scope.chrono.clear();
        },
        edit: function() {
            // Show edition dialog.
            ons.createDialog('chrono-dialog.html').then(function(dialog) {
                // Update dialog's data.
                $scope.chrono.dialog.reference = dialog;
                $scope.chrono.dialog.seconds = $scope.chrono.secondsCounted % 60;
                $scope.chrono.dialog.minutes = parseInt($scope.chrono.secondsCounted / 60, 10);
                        
                // Show dialog.
                dialog.show();
            });
        },
        dialog: {
            seconds: null,
            minutes: null,
            reference: null,
            close: function() {
                $scope.chrono.dialog.reference.hide();
            },
            save: function() {
                // Update seconds counted and start time.
                $scope.chrono.secondsCounted = parseInt($scope.chrono.dialog.seconds,10) + parseInt($scope.chrono.dialog.minutes,10)*60;
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
                
                // Hide dialog.
                $scope.chrono.dialog.reference.hide();
            }
        },
        secondsCountedToString: function() {
            var sec = $scope.chrono.secondsCounted % 60;
            if(sec < 10) sec = '0' + sec;
            var min = parseInt($scope.chrono.secondsCounted/60);
            return min + ':' + sec;
        },
        updateDisplay: function() {
            var now = new Date();
            $scope.chrono.secondsCounted = parseInt((now.getTime() - $scope.chrono.start.getTime())/1000, 10);
            $scope.$apply();
        }
    };
    
    // Values and functions for the settings related to multi-language support.
    $scope.language = {
        value: amplify.store('language'),
        save: function() {
            $translate.use($scope.language.value);
            amplify.store('language', $scope.language.value);
        }
    };

    // Values and functions for the settings related to the historial feature.
    var now = moment();
    var lastWeek = moment().subtract(7, 'days');
    $scope.historial = {
        submitting: false,
        historial: null,
        startYear: lastWeek.year(),
        startMonth: lastWeek.month(),
        startDate: lastWeek.date(),
        endYear: now.year(),
        endMonth: now.month(),
        endDate: now.date(),
        searched: false,
        getDays: function(month) {
            var res = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
            if(month !== 1) {
                res.push(29);
                res.push(30);
                if(month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) res.push(31);
            }
            return res;
        },
        getMonths: function() {					

            if($scope.language.value === 'es') return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
            if($scope.language.value === 'fr') return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôut", "Sept", "Oct", "Nov", "Dec"];
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        },
        getYears: function() {
            var res = [];
            for(var i=0; i<10; i++) res.push(now.year() - i);
            return res;
        },
        submit: function() {
            // Initialize variables.
            var hist = $scope.historial;
            hist.submitting = true;
            hist.searched = true;
            
            // Show loading dialog.
            $scope.shared.loading.show();

            // Get dates.
            var start = hist.startYear + "-" + (hist.startMonth+1) + "-" + hist.startDate + " 00:00:00";
            var end = hist.endYear + "-" + (hist.endMonth+1) + "-" + hist.endDate + " 23:59:59";
			
            // Package data.
            var histData = {
                start: start,
                end: end
            };

            // Submit data.
            $http.post("../rest/api.php/maintenances/search", histData)
                .success(function (data, status, headers, config) {              
                    // Verify if the call was successful.
                    if(data !== null && data.error === null) {
                        // Get list of records.
                        hist.records = data.records;
                    } else {
                        // An error occured, verify which time of error was.
                        if(data.error === "InvalidLogin") {
                            // Show a warning and display the login view.
                            $translate('msgYouMustBeLogged').then(function (message) {
                                toastr.warning(message, null);
                                $scope.session.loginReturn = "records.html";
                                menu.setMainPage("login.html");
                            });
                            $scope.session.clearLoginData();
                        } else {
                            // Show the error.
                            $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                            });
                            console.log(data);
                        }
                    }

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submitting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submiting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
            ;    
        },
        deleteEntry: function(entry) {
            // Ask confirmation.
            $translate('msgAreYouSureYouWantToDeleteEnrollment').then(function (confirmationMsg) {
                if(confirm(confirmationMsg)) {
                    // Show loading dialog.
                    $scope.shared.loading.show();

                    // Invoke service.    
                    $http.post("../rest/api.php/maintenances/delete/" + entry.id)
                        .success(function (data, status, headers, config) {                   
                            // Hide loading dialog.
                            $scope.shared.loading.hide();
                            
                            // Verify if the call was successful.
                            if(data.error === null) {
                                // Reload list of entries.
                                $scope.historial.submit();
                            } else {
                                // Show the error.
                                $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                    toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                                });
                                console.log(data);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            // Show the error.
                            $translate('errorNetworking').then(function (errorMsg) {
                                toastr.error(errorMsg, null);
                            });

                            // Update the UI.
                            $scope.shared.loading.hide();
                            if(!$scope.$$phase) $scope.$apply();
                        })
                    ;                
                }
            });
        }
    };
	
    $scope.historial.months = $scope.historial.getMonths();
	

});
var module = angular.module('myApp', ['onsen', 'pascalprecht.translate', 'toastr']);

module.controller('servicingCtrl', function ($scope, $window, $filter, $http, $translate, toastr) {
    // Functions related to navigation.
    $scope.nav = {
        setPage: function(page) {
            // Verify if the user is trying to access some sections without being logged.
            if(!$scope.session.logged && (page === 'servicing.html' || page === 'devices.html')) {
                // Show warning.
                $translate('msgYouMustBeLogged').then(function (errorMsg) { toastr.warning(errorMsg, null); });
            } else {                
                // Set main page.
                menu.setMainPage(page);                
                menu.closeMenu();
                
                // If the user wants to see his records, load the last 7 days.
                if(page === 'records.html') {
                    $scope.historial.submit();
                }
            }
        }
    };
    
    // Data and functions related to the login.
    $scope.session = {
        logged: false,
        username: '',
        password: '',
        userData: null,
        loginReturn: '',
        submit: function() {
            // Verify that neither the username nor the password are empty.
            if($scope.session.username === null || $scope.session.username.length === 0 || $scope.session.password === null || $scope.session.password.length === 0) {
                // Show error and return.
                $translate('errorEmptyUsernameOrPassword').then(function (errorMsg) {
                    toastr.error(errorMsg, null);
                });
                return;
            }
            
            // Show the loading dialog.
            $scope.shared.loading.show();

            // Invoke the login service.
            $http.post("../rest/api.php/login", {'username': $scope.session.username, 'password': $scope.session.password})
                .success(function (data, status, headers, config) {                                                          
                    // Verify if the call was succesful.            
                    if(data !== null && data.error === null) {
                        // Update logged flag and save user's data.
                        $scope.session.logged = true;
                        $scope.session.userData = data.user;
                    } else {
                        // Show an error message.
                        var errorCode = "errorUnexpectedAtServer";
                        if(data.error === "InvalidLogin") errorCode = "errorInvalidLogin";
                        if(data.error === "AccessDenied") errorCode = "errorAccessDenied";
                        $translate(errorCode).then(function (errorMsg) {
                            toastr.error(errorMsg, null);
                        });
                    }

                    // Clear the password.
                    $scope.session.password = '';

                    // Hide dialog.
                    $scope.shared.loading.hide();

                    // If logged, verify if another page must be displayed.
                    if($scope.session.logged && $scope.session.loginReturn !== null && $scope.session.loginReturn.length > 0) {
                        menu.setMainPage($scope.session.loginReturn);
                        $scope.session.loginReturn = null;
                    }
                    
                    // If logged, load initialization data from the server.
                    if($scope.session.logged) $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        },
        clearLoginData: function() {
            $scope.session.logged = false;
            $scope.session.username = '';
            $scope.session.password = '';
            $scope.session.userData = null;            
        },
        logout: function() {
            // Show loading dialog.
            $scope.shared.loading.show();
            
            // Call logout service.
            $http.get("../rest/api.php/logout")
                .success(function (data, status, headers, config) {
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Remove login data.
                        $scope.session.clearLoginData();

                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;
        }
    };
	
//PopUp function
	//Data and functions related to the pop-up.   ||  
    $scope.OpenPopupWindow = function () {	
			 var CallerId = document.activeElement.attributes[1].nodeValue;
			 CallerId = CallerId.replace('_','');
             $window.open("pchronos.html", CallerId, "width=400,height=200,left=100,top=150,toolbar=0,menubar=0,location=0,directories=0,channelmode=1,titlebar=0,addressbar=0, status=1");				
    }
	
	
	// Update datalist  || 
	$scope.UpDataList = function () {
		if(document.getElementById("positionSrc").value == document.getElementById("position").value && document.getElementById("locationSrc").value == document.getElementById("location").value){
			$("#zoneSrc").val(document.getElementById("zone").value);
			var x = document.getElementById("zoneSrc");
			x.remove(x.selectedIndex);
		}
	}
	
	SomeDateFunction = function(waty) {
      var res = '';
            try {
                if(waty !== null && waty.length > 0) {
                    var date = new Date(waty);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
    }	
	
	mySplit = function(string, nb) {
    var array = string.split(',');
    return array[nb];
}
	
	$scope.IDeviceRecorde = function (arrData,dDate) {
		//var dd = toNiceDate(dDate);
 		
		var KprDate = $filter('date')(dDate, "yyyy-MM-dd");
		var KprDateMin = KprDate + " 00:00:00.000000";
		var KprDateMax = KprDate + " 23:59:59.000000";
		
		KprDateMin = $filter('date')(KprDateMin, "yyyy-MM-ddThh:mm:ss");
		KprDateMax = $filter('date')(KprDateMax, "yyyy-MM-ddThh:mm:ss");
		
		var kaz = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1', [arrData]);
						
		var kAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		$scope.maintenance.stations = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate NOT BETWEEN "'+KprDateMax +'" AND "'+ KprDateMin+'"', [arrData]);
		var zAll0 = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate < "'+KprDateMin +'"', [arrData]);
		
		var k1 = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		var k2 = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		
		var zAll = alasql('SELECT * FROM ? WHERE IsActive = 1 and CreateDate >'+KprDate, [arrData]);
		var k = alasql('SELECT DesktopId FROM ? WHERE IsActive = 1 and date(CreateDate) > "'+KprDate +'"', [arrData]);
		var z = alasql('SELECT ScreenId_Type FROM ? WHERE IsActive = 1 and CreateDate > "'+KprDate +'"', [arrData]);
		
		
		for (var i=0; i < kAll.length; i++){
			//_Y = SomeDateFunction(kAll[i]["CreateDate"]);
			var _KprDate = kAll[i]["CreateDate"];			
			_KprDate = $filter('date')(_KprDate,"yyyy-MM-dd");
			KprDateY = new Date(_KprDate);
			KprDateZ = kAll[i]["CreateDate"];
			DateZ = KprDateZ.date;


			var arr = [];
			

			
			if (KprDateZ.date < KprDateMin || KprDateZ.date > KprDateMax)
			{ 
				$scope.maintenance.stations.push(kAll[i]);
			}
		}
	}
	
	function findElement(arr, propName, propValue) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue)
			  return arr[i];
	}
	
		
	function _findElement(arr, propName, propValue, propCondition, propConditionValue, propReturn, propReturnValue, arrZone, arrLocation ) {
		for (var i=0; i < arr.length; i++)
			if (arr[i][propName] == propValue && arr[i][propCondition] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
			 var arrStock = $scope.DevicesMouvement.devices;
			 
			for (var i=0; i < arr.length; i++)
			if (arrStock[i]["Device"] == propValue && arrStock[i]["used"] == propConditionValue)
			{
				document.getElementById(propReturnValue).value = arr[i][propReturn];
				document.getElementById("location").value = alasql('SELECT value LocationId FROM ? WHERE Id ='+arr[i][propReturn], [arrZone]);
				var L_Id = document.getElementById("location").value;
				document.getElementById("position").value = alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				ValRtn =  alasql('SELECT value PositionId FROM ? WHERE Id ='+L_Id, [arrLocation]);
				return ValRtn;
			};
			
	}

	
	function findElementValue(arr,IdDevice) {
		for (var i=0; i < arr.length; i++)	
			if( arr[i]["IsActive"] == 0 && arr[i]["DesktopId"] == IdDevice)
				return arr[i];
	}
	
	//IFonction to manage Devices  || Mouvement d'equipement
	$scope.DeviceDetails = function (dev,K,devCat,DevPosition, DevLocation, DevZone, DevStation) {	
		var res = alasql('SELECT *  FROM ? WHERE Id ='+K.Id,[dev]);
		var IDevice = alasql('SELECT value CClasse FROM ? WHERE Id ='+K.CategorieId, [devCat]);		
		IDevice = IDevice+'Id';		
		document.getElementById("DeviceSelected_Cat").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [devCat]);
		
		var y = _findElement(DevStation, IDevice, K.Device, "IsActive", 0, "ZoneId", "zone", DevZone, DevLocation);
		
		var x = findElement(DevStation, IDevice, K.Device);		
		var z = findElementValue(DevStation,K.Device);
				
		ZIdSelected = alasql('SELECT ZoneId, Id FROM ? WHERE IsActive = 0', [DevStation]);		
		var ZoneIdSelected = alasql('SELECT ZoneId FROM ? WHERE IsActive = 0 and ? = ?', [DevStation, IDevice, K.Device]);
		
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE IsActive = 0 and DesktopId = '+K.Device, [DevStation]);
		var ZoneIdSelected = alasql('SELECT value zone_id FROM ? WHERE '+ IDevice+' = '+K.Device+' and IsActive = 0', [DevStation]);
		
		document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevPosition]);
		document.getElementById("zone").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevZone]);
		document.getElementById("location").value = alasql('SELECT value CDesignation FROM ? WHERE Id = '+K.CategorieId, [DevLocation]);
		//document.getElementById("position").value = alasql('SELECT value CDesignation FROM ? WHERE Id ='+K.CategorieId, [DevPosition]);
	}
	
	
    // Data and functions related to the maintenances.   || Servicing 
    $scope.maintenance = {

		locations:[],
		positions:[],
		zones:[],
		maintenances:[],
		movements:[],
		stations:[],
		
		technicians: [],
		
		submitting: false,
        invalid: false,
		
		location:null,
		position:null,
		zone:null,
		maintenance:null,
		movement:null,
		station:null,
		//DateUpKeep:SetDate(),
		DateUpKeep:new Date(),
		UserId:null,
		StationId:null,
		Screen:null,
		Desktop:null,
		Av:false,
		Cam:false,
		Fp:false,
		Pp:false,
		Kbd:false,
		Mos:false,
		Ups:false,
		Rcg:false,
		Cln:false,
		Ss:false,
		Snd:false,
		Net:false,
		Swi:false,
		Usb:false,
 		Suw:null,
		Sus:null,
		Time1:null,
		Time2:null,
		Time3:null,
		TimeAvg:null, 
		observations:null,
			
			CreateDate : null,
			ZoneId : null,
			PositionId :null,
			ScreenId_Type : null,
			DesktopId : null,
			FpId : null,
			PpId : null,
			KbdId : null,
			MosId : null,
			UpsId : null,
			CamId : null,
			IsActive : 0,

		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.maintenance;  // || Servicing 
				enr.submitting = true;
				enr.Validated = false;
				var MoyTime = parseInt((parseInt(Time1.Text) + parseInt(Time2.Text) + parseInt(Time3.Text)) / 3);
				
				// Validate form.
				enr.invalid = enr.position === null|| enr.zone === null|| enr.location === null || enr.station === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {			
						StationId: enr.station !== null? enr.station.Id : null,		
						DateUpKeep: enr.DateUpKeep,					
						Fp: enr.Fp,
						Pp: enr.Pp,
						Kbd: enr.Kbd,
						Mos: enr.Mos,
						Ups: enr.Ups,			
						Suw: parseInt(Suw.Text),
						Sus: parseInt(Sus.Text),
						Time1: parseInt(Time1.Text),
						Time2: parseInt(Time2.Text),
						Time3: parseInt(Time3.Text),
						TimeAvg: MoyTime,			
						Rcg: enr.Rcg,
						Av: enr.Av,
						Cln: enr.Cln,
						Ss: enr.Ss,
						Snd: enr.Snd,
						Net: enr.Net,
						Swi: enr.Swi,
						Usb: enr.Usb,		
						Validated: enr.Validated,						 
						Observations: enr.observations	
						
					};

					// Submit data.
					$http.post("../rest/api.php/maintenances", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									var enrStation = {
										CreateDate : enr.DateUpKeep,
										ZoneId : enr.zone.Id,
										ScreenId_Type : enr.station.ScreenId_Type,
										DesktopId : enr.station.DesktopId,
										FpId : enr.station.FpId,
										PpId : enr.station.PpId,
										KbdId : enr.station.KbdId,
										MosId : enr.station.MosId,
										UpsId : enr.station.UpsId,
										CamId : enr.station.CamId,
										StationId :enr.station.Id,
										IsActive : 1
									};


								// Added to clean the screen

								enr.Fp = false;
								enr.Pp = false;
								enr.Kbd = false;
								enr.Mos = false;
								enr.Ups = false;			
								Suw = false;
								Sus = false;
								Time1 = "";
								Time2 = "";
								Time3 = "";
								TimeAvg = false;			
								enr.Rcg = false;
								enr.Av = false;
								enr.Cln = false;
								enr.Ss = false;
								enr.Snd = false;
								enr.Net = false;
								enr.Swi = false;
								enr.Usb = false;						 
								enr.observations = "";	

								//								
									
								var _CDate = enrStation.CreateDate;									
								var StationData = EnregStation("../rest/api.php/stations",enrStation, _CDate);				
											
								// Show a success message.
 								
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});


							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "servicing.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	
	
	 // Data and functions related to the maintenances.
    $scope.device = {
		devices_categories:[],
		devices:[],		
		technicians: [],		
		CategorieId:null,
		Device:null,
		technicians:null,
		Observations:null,		
		DateAdd:new Date(),
		IsUsed: false,
		
		    submit: function() {
				// Initialize variables.
				
				var enr = $scope.device;
				enr.submitting = true;
				
				// Validate form.
				enr.invalid = enr.Device === null|| enr.device_categorie === null;
				if(!enr.invalid) {
					// Package data.
					var enrData = {				
						DateAdd: enr.DateAdd,					
						CategorieId: enr.device_categorie.Id,
						Device: enr.Device,
						IsUsed: enr.IsUsed,							 
						Observations: enr.Observations +'\r\n'+"Ajouté au stock de l'operation de Côte d'ivoire par: "+$scope.session.userData.first_name+" "+$scope.session.userData.last_name +". A la date du "+ enr.DateAdd,						
					};

					// Submit data.
					$http.post("../rest/api.php/device", enrData)
						.success(function (data, status, headers, config) {               
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.
									enr.device_categorie.Id = '';
									enr.Device = '';
									enr.IsUsed = false;		
									enr.Observations = '';
									
								// Show a success message.
								$translate('msgEnrollmentSubmitted').then(function (successMsg) {
									toastr.success(successMsg, null);
								});
							} else {
								// An error occured, verify which time of error was.
								if(data.error === "InvalidLogin") {
									// Show a warning and display the login view.
									$translate('msgYouMustBeLogged').then(function (message) {
										toastr.warning(message, null);
									});
									$scope.session.clearLoginData();
									$scope.session.loginReturn = "device.html";
									menu.setMainPage('login.html');
								} else {
									// Show the error.
									$translate('errorUnexpectedAtServer').then(function (errorMsg) {
										toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
									});
								}
							}
							
							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
						.error(function(data, status, headers, config) {
							// Show the error.
							$translate('errorNetworking').then(function (errorMsg) {
								toastr.error(errorMsg, null);
							});

							// Update the UI.
							enr.submitting = false;
							if(!$scope.$$phase) $scope.$apply();
						})
					;        
				} else {
					// Invalid data. Cancel submit.
					enr.submitting = false;
					
					// Show error message.
					$translate('errorInvalidForm').then(function (errorMsg) {
						toastr.error(errorMsg, null);
					});
				}
			}
	}
	
	
	// Data and functions related to the maintenances.
    function EnregStation(str,data,CDate) {							
					// Submit Station data.
					$http.post(str, data)
						.success(function (data, status, headers, config) { 
							// Verify if the call was succesful.
							if(data !== null && data.error === null) {
								// Clear the form.	
									var Azulh = document.getElementById("enrForm");
									var DateUp = new Date();
									
									// clearing Inputs
									var inputs = Azulh.getElementsByTagName('input');
										for (var i = 0; i<inputs.length; i++) {
											switch (inputs[i].type) {
												// case 'hidden':
												case 'text':
													inputs[i].value = '';
													break;
												case 'radio':
												case 'checkbox':
													inputs[i].checked = false;
												//case 'datetime-local':	
													//inputs[i].value = new Date();
											}
										}
										
									// clearing Selects	
									var selects = Azulh.getElementsByTagName('select');
									for (var i = 3; i<selects.length; i++)
										selects[i].value = '';										
									
									// clearing textarea
									var text= Azulh.getElementsByTagName('textarea');
									for (var i = 0; i<text.length; i++)
										text[i].value = '';		
																										
									//Set new date 
									document.getElementById("DateUpKeep").value = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
									
									//Update Stations List
									var _Date = $filter('date')(CDate, "yyyy-MM-dd");
									var _DateMin = _Date + " 00:00:00.000000";
									var _DateMax = _Date + " 23:59:59.000000";
									var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [$scope.maintenance.stations]);
									$scope.maintenance.stations = [];
									for (var i=0; i < arrData.length; i++){
									var dDate = arrData[i]["CreateDate"];	
										if (dDate.date < _DateMin || dDate.date > _DateMax)
										{ 
											$scope.maintenance.stations.push(arrData[i]);
										}
									}										
										
									//Show a success message.
										$translate('msgEnrollmentSubmitted').then(function (successMsg) {
											toastr.success(successMsg, null);
										});
									
							}
						})		
		return data;
	}
    	
	function SetDate(){	
		var _utc = $filter('date')(Date.now(), "yyyy-MM-ddThh:mm:ss");
		return _utc;
	}									
		
		
	function GetDesktop(){		
		var year = parseInt(matches[3], 10);
		var month = parseInt(matches[2], 10) - 1; // months are 0-11
		var day = parseInt(matches[1], 10);
		var hour = parseInt(matches[4], 10);
		var minute = parseInt(matches[5], 10);
		var second = parseInt(matches[6], 10);
		
	}	
	
	function verifyDate(value) {
		// capture all the parts
		var matches = value.match(/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
		if (matches === null) {
			return false;
		} else{
			// now lets check the date sanity
			var year = parseInt(matches[3], 10);
			var month = parseInt(matches[2], 10) - 1; // months are 0-11
			var day = parseInt(matches[1], 10);
			var hour = parseInt(matches[4], 10);
			var minute = parseInt(matches[5], 10);
			var second = parseInt(matches[6], 10);
			var date = new Date(year, month, day, hour, minute, second);
			if (date.getFullYear() !== year
			  || date.getMonth() != month
			  || date.getDate() !== day
			  || date.getHours() !== hour
			  || date.getMinutes() !== minute
			  || date.getSeconds() !== second
			) {
			   return false;
			} else {
			   return true;
			}
		
		}
	}
		
	function UpdateStations(str,data) {	
	// Submit Station update data.
	$http.post(str, data)
		.success(function (data, status, headers, config) { 
			// Verify if the call was succesful.
			if(data !== null && data.error === null) {
				// Clear the form.															
			}
		})	
	return data;						
	}

	$scope.historiesMaintenances = function (dStart,dEnd) {
	
	}
	
	$scope.DevicesMouvement = {
		 
		
	}
	    
    // Shared values and functions.   || Maintenace
    $scope.shared = {
        loading: null,
        dateFormat: 'YYYY-MM-DD',
        toNiceDate: function(text) {
            var res = '';
            try {
                if(text !== null && text.length > 0) {
                    var date = moment(text);
                    res = date.format($scope.shared.dateFormat);
                }
            }catch(e) {console.log(e);}
            return res;
        },
        getInitDataFromServer: function() {
            // Ask for the list utile data. position-location-zone-maintenance-station-devices_categories-device
            $http.get("../rest/api.php/list/position-location-zone-maintenance-station-devices_categories-device") //-movement-device-devicesCategorie
                .success(function (data, status, headers, config) {         
                    // Verify if the call was succesful.
                    if(data !== null && data.error === null) {
                        // Load the data.
 
						$scope.maintenance.locations = alasql('SELECT * FROM ? WHERE Id !=6', [data.lists.location]);
						$scope.maintenance.positions = data.lists.position;
						$scope.maintenance.zones = data.lists.zone;	
						$scope.maintenance.maintenances = data.lists.maintenance;						
						var _Date = $filter('date')(new Date(), "yyyy-MM-dd");
						var _DateMin = _Date + " 00:00:00.000000";
						var _DateMax = _Date + " 23:59:59.000000";
						var arrData = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						for (var i=0; i < arrData.length; i++){
							var dDate = arrData[i]["CreateDate"];	
							if (dDate.date < _DateMin || dDate.date > _DateMax)
								{ 
									$scope.maintenance.stations.push(arrData[i]);
								}
						}										
						//$scope.maintenance.movements = data.lists.movement;	

						$scope.DevicesMouvement.locations = data.lists.location;						
						$scope.DevicesMouvement.positions = data.lists.position;
						$scope.DevicesMouvement.zones = data.lists.zone;
						$scope.DevicesMouvement.stations = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);	
						$scope.DevicesMouvement.devices_categories = data.lists.devices_categories;	
						$scope.DevicesMouvement.devices = data.lists.device;
						//$scope.DevicesMouvement.movements = data.lists.movement;												
						
						$scope.DevicesMouvement.locationsSrc = data.lists.location;
						$scope.DevicesMouvement.positionsSrc = data.lists.position;
						$scope.DevicesMouvement.zonesSrc = data.lists.zone;	
						$scope.DevicesMouvement.stationsSrc = alasql('SELECT * FROM ? WHERE IsActive = 1', [data.lists.station]);
						$scope.DevicesMouvement.devices_categoriesSrc = data.lists.devices_categories;
						$scope.DevicesMouvement.devicesSrc = data.lists.device;
						//$scope.DevicesMouvement.movementsSrc = data.lists.movement;						
											
						$scope.device.devices_categories = data.lists.devices_categories;
						$scope.device.devices = data.lists.device;		
						//
												
						$scope.maintenancesRecords.MRmValues = data.lists.maintenance;
						$scope.maintenancesRecords.MRsValues = data.lists.station;
						
						//MHValues = alasql('SELECT MHm.DateUpKeep, MHm.StationId, MHs.Id, MHs.ScreenId_Type, MHs.DesktopId, MHs.FpId, MHs.PpId, MHs.KbdId, MHs.MosId, MHs.UpsId, MHs.CamId FROM ? as MHs RIGHT JOIN ? as MHm ON MHs.Id = MHm.StationId ',[data.lists.station],[data.lists.maintenance]);
						
                        // Update the UI.
                        if(!$scope.$$phase) $scope.$apply();
                    } else {
                        // An error occured, show a warning.
                         $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                            toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                        });
                    }

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
                .error(function(data, status, headers, config) {
                    // Show a warning.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Hide dialog.
                    $scope.shared.loading.hide();
                })
            ;

            // Show dialog.
            $scope.shared.loading.show();            
        }
    };
    

	
    // Initialize date format.
    $translate('formatDate').then(function (format) {
        $scope.shared.dateFormat = format;
    });    
    
    // Show loading dialog and load initialization data from server.
    ons.createDialog('loading-dialog.html').then(function(dialog) {
        // Store dialog.
        $scope.shared.loading = dialog;
        
        // Call the ping service in order to verify if the user is already logged.
        $http.get("../rest/api.php")
            .success(function (data, status, headers, config) {
                // Verify if the user is logged.
                if(data !== null && data.user !== null) {
                    // Save user data.
                    $scope.session.logged = true;
                    $scope.session.userData = data.user;
                    $scope.session.username = data.user.username;
                    
                    // Load initialization data from the server.
                    $scope.shared.getInitDataFromServer();

                    // Update the UI.
                    if(!$scope.$$phase) $scope.$apply();
                } else {
                    // Redirect to login page.
                    $scope.session.loginReturn = "servicing.html";
                    menu.setMainPage("login.html");
                }                
            })
            .error(function(data, status, headers, config) {
                // Redirect to login page.
                $scope.session.loginReturn = "servicing.html";
                menu.setMainPage("login.html");
            })
        ;
    });
    
    // Chronometer's values and functions.
    $scope.chrono = {
        secondsCounted: 0,
        start: null,
        intervalId: null,
        play: function() {
            if($scope.chrono.intervalId === null) {
                $scope.chrono.intervalId = setInterval($scope.chrono.updateDisplay, 500);
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
            }
        },
        pause: function() {
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },
        clear: function() {
            $scope.chrono.secondsCounted = 0;
            clearInterval($scope.chrono.intervalId);
            $scope.chrono.intervalId = null;
        },		
        SendValues: function() {
			if (window.opener != null && !window.opener.closed && $scope.chrono.secondsCounted !=null ) {
				var Azul = window.opener.document.getElementById(window.name);
				Azul.value = $scope.chrono.secondsCounted;
				Azul.Text = $scope.chrono.secondsCounted;
			}
			window.close();
        },		
        reset: function() {
            
            // Reset chronometer.
            $scope.chrono.clear();
        },
        edit: function() {
            // Show edition dialog.
            ons.createDialog('chrono-dialog.html').then(function(dialog) {
                // Update dialog's data.
                $scope.chrono.dialog.reference = dialog;
                $scope.chrono.dialog.seconds = $scope.chrono.secondsCounted % 60;
                $scope.chrono.dialog.minutes = parseInt($scope.chrono.secondsCounted / 60, 10);
                        
                // Show dialog.
                dialog.show();
            });
        },
        dialog: {
            seconds: null,
            minutes: null,
            reference: null,
            close: function() {
                $scope.chrono.dialog.reference.hide();
            },
            save: function() {
                // Update seconds counted and start time.
                $scope.chrono.secondsCounted = parseInt($scope.chrono.dialog.seconds,10) + parseInt($scope.chrono.dialog.minutes,10)*60;
                $scope.chrono.start = new Date();
                $scope.chrono.start.setTime($scope.chrono.start.getTime() - $scope.chrono.secondsCounted*1000);
                
                // Hide dialog.
                $scope.chrono.dialog.reference.hide();
            }
        },
        secondsCountedToString: function() {
            var sec = $scope.chrono.secondsCounted % 60;
            if(sec < 10) sec = '0' + sec;
            var min = parseInt($scope.chrono.secondsCounted/60);
            return min + ':' + sec;
        },
        updateDisplay: function() {
            var now = new Date();
            $scope.chrono.secondsCounted = parseInt((now.getTime() - $scope.chrono.start.getTime())/1000, 10);
            $scope.$apply();
        }
    };
    
    // Values and functions for the settings related to multi-language support.
    $scope.language = {
        value: amplify.store('language'),
        save: function() {
            $translate.use($scope.language.value);
            amplify.store('language', $scope.language.value);
        }
    };

    // Values and functions for the settings related to the historial feature.
    var now = moment();
    var lastWeek = moment().subtract(7, 'days');
    $scope.historial = {
        submitting: false,
        historial: null,
        startYear: lastWeek.year(),
        startMonth: lastWeek.month(),
        startDate: lastWeek.date(),
        endYear: now.year(),
        endMonth: now.month(),
        endDate: now.date(),
        searched: false,
        getDays: function(month) {
            var res = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
            if(month !== 1) {
                res.push(29);
                res.push(30);
                if(month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) res.push(31);
            }
            return res;
        },
        getMonths: function() {					

            if($scope.language.value === 'es') return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];
            if($scope.language.value === 'fr') return ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aôut", "Sept", "Oct", "Nov", "Dec"];
            return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        },
        getYears: function() {
            var res = [];
            for(var i=0; i<10; i++) res.push(now.year() - i);
            return res;
        },
        submit: function() {
            // Initialize variables.
            var hist = $scope.historial;
            hist.submitting = true;
            hist.searched = true;
            
            // Show loading dialog.
            $scope.shared.loading.show();

            // Get dates.
            var start = hist.startYear + "-" + (hist.startMonth+1) + "-" + hist.startDate + " 00:00:00";
            var end = hist.endYear + "-" + (hist.endMonth+1) + "-" + hist.endDate + " 23:59:59";
			
            // Package data.
            var histData = {
                start: start,
                end: end
            };

            // Submit data.
            $http.post("../rest/api.php/maintenances/search", histData)
                .success(function (data, status, headers, config) {              
                    // Verify if the call was successful.
                    if(data !== null && data.error === null) {
                        // Get list of records.
                        hist.records = data.records;
                    } else {
                        // An error occured, verify which time of error was.
                        if(data.error === "InvalidLogin") {
                            // Show a warning and display the login view.
                            $translate('msgYouMustBeLogged').then(function (message) {
                                toastr.warning(message, null);
                                $scope.session.loginReturn = "records.html";
                                menu.setMainPage("login.html");
                            });
                            $scope.session.clearLoginData();
                        } else {
                            // Show the error.
                            $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                            });
                            console.log(data);
                        }
                    }

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submitting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
                .error(function(data, status, headers, config) {
                    // Show the error.
                    $translate('errorNetworking').then(function (errorMsg) {
                        toastr.error(errorMsg, null);
                    });

                    // Update the UI.
                    $scope.shared.loading.hide();
                    hist.submiting = false;
                    if(!$scope.$$phase) $scope.$apply();
                })
            ;    
        },
        deleteEntry: function(entry) {
            // Ask confirmation.
            $translate('msgAreYouSureYouWantToDeleteEnrollment').then(function (confirmationMsg) {
                if(confirm(confirmationMsg)) {
                    // Show loading dialog.
                    $scope.shared.loading.show();

                    // Invoke service.    
                    $http.post("../rest/api.php/maintenances/delete/" + entry.id)
                        .success(function (data, status, headers, config) {                   
                            // Hide loading dialog.
                            $scope.shared.loading.hide();
                            
                            // Verify if the call was successful.
                            if(data.error === null) {
                                // Reload list of entries.
                                $scope.historial.submit();
                            } else {
                                // Show the error.
                                $translate('errorUnexpectedAtServer').then(function (errorMsg) {
                                    toastr.error(errorMsg + (data.message !== null? '\n[' + data.message + ']' : ''), null);
                                });
                                console.log(data);
                            }
                        })
                        .error(function(data, status, headers, config) {
                            // Show the error.
                            $translate('errorNetworking').then(function (errorMsg) {
                                toastr.error(errorMsg, null);
                            });

                            // Update the UI.
                            $scope.shared.loading.hide();
                            if(!$scope.$$phase) $scope.$apply();
                        })
                    ;                
                }
            });
        }
    };
	
    $scope.historial.months = $scope.historial.getMonths();
	$scope.maintenancesRecords = {
	
		MHmValues :[],
		MHsValues :[],
	};

	

});

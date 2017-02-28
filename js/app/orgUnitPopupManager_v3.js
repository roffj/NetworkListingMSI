
// -------------------------------------------
// OrgUnitPopupManager Class
function OrgUnitPopupManager( dialogFormTag, mapTag, dataListingTableManager, oProviderNetwork )
{
	var me = this;

	me.dataListingTableManager = dataListingTableManager;
	me.oProviderNetwork = oProviderNetwork;

	me.dialogFormTag = dialogFormTag;
	me.mapTag = mapTag;

	me.width = dialogFormTag.attr( 'formWidth' );
	me.height = dialogFormTag.attr( 'formHeight' );
	me.height_noMap = me.height;

	me.latitude = 0;
	me.longitude = 0;
	me.useLocation = false; // This one is TRUE if orgunit property "coordinates" is set in Network setting

	me.map;
	me.mapLoaded = false;
	me.mapZoomLevel = 14;
	
	me.overlays = new Array();
	me.markers = [];
	me.searchBox;
	me.buttonClicked = false;

	me.countryBounds = {};

	me.device_Mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent );

	me.clickEvent_Current = null;

	me.redIcon = 'img/red.png';
	me.blueIcon = 'img/blue.png';

	//me.dateEndingTimeZone = 'T23:59:00.000Z';

	me._loadingCss = { 
		border: 'none'
		,padding: '15px'
		,backgroundColor: '#000'
		,'-webkit-border-radius': '10px'
		,'-moz-border-radius': '10px'
		,opacity: .5
		,color: '#fff'
		,width: '100px'
		,margin: '300px 0px 0px 250px'
	};


	// -- Tags ---------

	me.orgUnitAddTabTag = $( '#orgUnitAddTab' );
	me.orgUnitFormTabUlTag = $( '#orgUnitFormTabUl' );

	me.orgUnitGroupTabLink = me.dialogFormTag.find( 'a[href="#orgUnitGroupTab"]' ).closest( 'li' );
	me.orgUnitGroupTab = me.dialogFormTag.find( "#orgUnitGroupTab" );	
	me.programDataSetTabLink = me.dialogFormTag.find( 'a[href="#programDataSetTab"]' ).closest( 'li' );
	me.programDataSetTab = me.dialogFormTag.find( "#programDataSetTab" );
	

	me.orgUnitAddTitleTag = $( '#orgUnitAddTitle' );
	me.parentOrgUnitTag = $( '#parentOrgUnit' );
	me.parentOrgUnitSearchTag = $( '#parentOrgUnitSearch' );
	me.parentOuLoadingTag = $( '#parentOuLoading' );
	me.divParentOrgUnitMsgTag = $( '#divParentOrgUnitMsg' );

	me.addOrgunitFormBtnTag = $( '#addOrgunitFormBtn' );

	me.ouDetailsTableTag = $( '#ouDetailsTable' );

	me.trOuAdd_ParentTag = $( '#trOuAdd_Parent' );


	me.trOuCoordinateSectionTag = $( '#trOuCoordinateSection' );
	me.trOuAdd_LocationFindTag = $( '#trOuAdd_LocationFind' );
	me.trOuAdd_MapTag = $( '#trOuAdd_Map' );
	me.ouCoordinatesTag = me.dialogFormTag.find( '.ouAdd_coordinates' );
	me.spanCoordinateInfoTag = $( '#spanCoordinateInfo' );
	me.searchAddressTag = $( '#searchLocation' );
	me.searchParentOuTRTag = $("#searchParentOuTR");

	me.divCoordinateNoteTag = $( '#divCoordinateNote' );

	me.mapLocationInfoTag = $( '#mapLocationInfo' );
	me.locateTextTag = $( '#locateText' );
	

	me.avalableProgramAssignedOUTag = $( '#avalableProgramAssignedOU' );
	me.selectedProgramAssignedOUTag = $( '#selectedProgramAssignedOU' );
	me.avalableDatasetAssignedOUTag = $( '#avalableDatasetAssignedOU' );
	me.selectedDatasetAssignedOUTag = $( '#selectedDatasetAssignedOU' );
	me.avalableOUGroupAssignedOUTag = $( '#avalableOUGroupAssignedOU' );
	me.selectedOUGroupAssignedOUTag = $( '#selectedOUGroupAssignedOU' );

	me.runBtnTag = $("#runBtn");
	
	me.customer_phoneTag = $( '#customer_phone' );

	
	me.PARAM_SELECTED_OU = "@PARAM_SELECTED_OU";
	
	me.queryURL_OrgUnit_SearchParentByCoord = _queryURL_api + "organisationUnitLocations/orgUnitByLocation?";
	me._queryURL_Programs = _queryURL_api + "programs.json?paging=false&fields=id,name";
	me._queryURL_Datasets = _queryURL_api + "dataSets.json?paging=false&fields=id,name";
	me._queryURL_OUGroups = _queryURL_api + "organisationUnitGroups.json?paging=false&fields=id,name,organisationUnitGroupSet[id]";
	
	me.mode;

	me.programLoaded = false;
	me.datasetLoaded = false;

	me.orgUnitInfo = {}; // { "ouId": "", "countryInfo": undefined, "orgUnitLevel": 0, "networkTypeName": "",  ...  };

	me.shape_Point = "Point";
	me.shape_None = "None";

	// ----------------------------------------------
	
	// ----------------------------------------------
	// ------- Initial and open Methods -------------

	// Initial Setup Call
	me.initialSetup = function()
	{				
		me.FormPopupSetup();

		me.setUp_Events();
	};

	me.getShapeStr = function( shape )
	{
		var shapeStr = "";

		if ( ( me.oProviderNetwork.loadedInfo.dhisVersion !== undefined 
					&& me.oProviderNetwork.loadedInfo.dhisVersion <= 2.20 ) )
		{
			if ( shape == me.shape_Point ) shapeStr = "Point";
			else if ( shape == me.shape_None ) shapeStr = "None";
		}
		else
		{
			if ( shape == me.shape_Point ) shapeStr = "POINT";
			else if ( shape == me.shape_None ) shapeStr = "NONE";
		}

		return shapeStr;
	}


	me.openForm = function( countryInfo, orgUnitLevel, networkTypeName, mode, ouId, ouName, parentId, parentName )
	{

		AppUtil.checkAndRedirect_DHISSession( function()
		{
			// Save Data into 'orgUnitInfo' object and reuse this.
			me.setOrgUnitInfo( me.orgUnitInfo, countryInfo, orgUnitLevel, networkTypeName, ouId, ouName, parentId, parentName );
			me.mode = mode;

			// Reset the form..
			var button_SaveTag = me.resetFormStatus();

			// Setup OrgUnit		
			me.orgUnitFormSetup( me.orgUnitInfo, button_SaveTag );
			

			// Open the dialog form
			me.orgUnitAddTabTag.tabs( "refresh" );
			me.orgUnitAddTabTag.tabs( {active: 0} );
			me.dialogFormTag.dialog( "open" );
		});
	};


	// ---------------------------------------------------------------------------------------

	me.setOrgUnitInfo = function( orgUnitInfo, countryInfo, orgUnitLevel, networkTypeName, ouId, ouName, parentId, parentName )
	{
		orgUnitInfo.ouId = ouId;
		orgUnitInfo.name = ( ouName !== undefined ) ? ouName : "";
		orgUnitInfo.countryInfo = countryInfo;
		orgUnitInfo.orgUnitLevel = orgUnitLevel;

		orgUnitInfo.networkTypeName = networkTypeName;

		orgUnitInfo.isType_Network = ( networkTypeName == me.oProviderNetwork.network_Name );
		orgUnitInfo.isType_NetworkChild = ( networkTypeName == me.oProviderNetwork.networkChild_Name );
		
		orgUnitInfo.parentId = parentId;
		orgUnitInfo.parentName = parentName;

		orgUnitInfo.orgUnitLevelName = AppUtil.getOrgUnitLevelName_ByNetworkType( networkTypeName, me.oProviderNetwork.networkData, me.oProviderNetwork );
	}


	me.orgUnitFormSetup = function( orgUnitInfo, button_SaveTag )
	{
		
		// Set popup form title and Initial all the form data and events
		var formTitle = ( me.mode == _mode_Add ) ? orgUnitInfo.orgUnitLevelName + " " + me.mode : orgUnitInfo.name + " - " + me.mode;
		me.orgUnitAddTitleTag.text( formTitle );


		// STEP 1. Initialize & Set Form
		me.initializeAndSetForm( me.orgUnitAddTabTag );  // ? Done in prevous stage?


		// STEP 2. Generate OrgUnit Rows/Tables - via Network Attribute Setting
		me.useLocation = me.generateOrgUnitTable( orgUnitInfo.countryInfo );


		// STEP 3. Depending on map being displayed or not, change the popup form height.
		me.setFormHeight( me.useLocation );


		// STEP 4. Setup the Maps - initialize the map, boundaries, etc ????  <-- More Look Into
		me.mapSetup( orgUnitInfo.countryInfo, me.mode );


		// STEP 5. Clear And Populate Custom HTML Tab
		me.clearCustomHtmlTabs();
		me.generateCustomHtmlTabs();

				
		// STEP 6. Populate data and Disable tags - Depending on mode ('Add', 'Edit', 'Info')
		if ( orgUnitInfo.ouId !== undefined && ( me.mode == _mode_Edit || me.mode == _mode_View ) )
		{
			// Retrieve OrgUnit Data
			me.retrieveOrgUnitData( orgUnitInfo.ouId, me.orgUnitAddTabTag, { message: 'Loading..', css: me.loadingCss }, function( ouData )
			{	
				// Why set to false??
				//me.parentOrgUnitSearchTag.attr( "mandatory", "false" );		
				

				// 1. Show/Hide Map by using Network configuration
				me.formConfigure_ByNetworkSetting( ouData );
				

				// 3. Populate the form with OrgUnit Data
				me.populateOrgUnitData( ouData, me.orgUnitAddTabTag );
				
				// 4. Populate Parents Data
				me.populateParentData( ouData.parent.id, ouData.parent.name );	
				

				// 5. Set form by mode..
				if ( me.mode == _mode_Edit )
				{
					// If 'Edit' Mode, and does not have orgUnit Move authority, make the parent change as read-only.
					if ( !me.oProviderNetwork.getUserPermission_Authorities().OrgUnit_Move )
					{
						// Disable the parent search textbox.
						Util.disableTag( me.parentOrgUnitSearchTag, true );
					}
					else
					{
						// TODO: Do not set ???  - Not being properly used anymore..
						me.setFormViewOnly( false );
					}

					// Show initially hidden 'Save' button
					button_SaveTag.show();
				}
				else if ( me.mode == _mode_View ) 
				{
					me.setFormViewOnly( true );	
				}
				
			});
		}
		else if ( me.mode == _mode_Add )
		{		
			me.parentOrgUnitSearchTag.attr( "mandatory", "true" );
			
			me.formConfigure_ByNetworkSetting();
						
			me.setFormViewOnly( false );		
			
			// Populate Parents Data - if exists
			me.populateParentData( orgUnitInfo.parentId, orgUnitInfo.parentName );

			// Show initially hidden 'Save' button
			button_SaveTag.show();
		}
	};


	me.populateParentData = function( selectedParentId, selectedParentName )
	{
		// populate the parent
		if( selectedParentName !== undefined ) me.parentOrgUnitSearchTag.val( selectedParentName );
		
		if( selectedParentId !== undefined ) me.parentOrgUnitTag.val( selectedParentId );
	}

	// -----------------------------------------------
	

	me.performFormClose = function()
	{
		me.dialogFormTag.dialog( "close" );
	};


	me.FormPopupSetup = function()
	{
	
		me.orgUnitAddTabTag.tabs({active: 0});
		
		// -- Set up the form -------------------
		me.dialogFormTag.dialog(
		{
			autoOpen: false
			,title: "Organisation Unit Info"
			,width: me.width
			,height: me.height				  
			,modal: true				
			,close: function( event, ui ) 
			{
				me.performFormClose();
			}				
			,buttons: 
			{
				"Save": function() 
				{
					// Depending on the mode, add/update it.
					// me.mode == "Add" / _mode_Edit

					var dialogFormTag = $( this );
					dialogFormTag.block( "Please wait.." );

					var divLoadingTag = dialogFormTag.find( 'div.blockMsg' );
					divLoadingTag.find( 'table.tableSubMsg' ).remove();

					var tableSubMsgTag = $( '<table class="tableSubMsg"><tr>'
						+ '<td style="min-height:15px;><div class="loadingSubImg" style="display:none; margin-left: 8px;"><img src="img/ui-anim_basic.gif"></div></td>'
						+ '<td><div class="loadingSubMsg"></div></td></tr></table>' );
					divLoadingTag.append( tableSubMsgTag );


					var checkValid = me.validateForm();
					
					if ( !checkValid.valid )
					{
						dialogFormTag.unblock();
						alert( checkValid.message );
					}					
					else
					{	
						var ouId = me.orgUnitAddTabTag.attr( 'ouid' );
						var nameField = me.orgUnitAddTabTag.find( 'input.ouAdd_name' );
						var shortNameField = me.orgUnitAddTabTag.find( 'input.ouAdd_shortName' );
						var codeField = me.orgUnitAddTabTag.find( 'input.ouAdd_code' );
						
						Util.paintWhite( nameField );
						Util.paintWhite( shortNameField );
						Util.paintWhite( codeField );
						
						var name = nameField.val();
						var code = codeField.val();

						//tableSubMsgTag.find( 'div.loadingSubImg' ).show();
						//tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Checking for existing OrgUnit with Name and Code..' );

						me.checkDuplicateOU( ouId, name, code, tableSubMsgTag, function( json_Data )
						{

							//tableSubMsgTag.find( 'div.loadingSubImg' ).hide();
							//tableSubMsgTag.find( 'div.loadingSubMsg' ).text( '' );


							var valid = true;
							for( var i in json_Data )
							{
								var invalidFieldName = json_Data[i].field;
								var elementTag = me.orgUnitAddTabTag.find( 'input.ouAdd_' + json_Data[i].field );
								if( invalidFieldName == "name" )
								{
									var message = "Warning, name already exists. \nDo you want to add new Org Unit with duplicate name ?";
									var result = confirm( message );
									if( !result )
									{
										dialogFormTag.unblock();
										elementTag.focus();
										valid = false;
									}
								}
								else
								{	
									Util.paintWarning( elementTag );
									
									var colTag = elementTag.closest( "td" );
									
									colTag.find( "br" ).remove();
									colTag.find( "span" ).remove();
									colTag.append( "<br>" );
									colTag.append( "<span class='error'>The " + invalidFieldName + " is already in use. Please choose a different " + invalidFieldName + ".</span>" );
									
									dialogFormTag.unblock();
									valid = false;
								}
								
							}
							
							if( json_Data.length == 0 || valid )
							{	
								if ( me.mode == _mode_Edit )
								{
									me.editOrgUnitAction( me.orgUnitAddTabTag, me.dialogFormTag, tableSubMsgTag, _mode_Edit + " organisation unit information successfully.");
								}
								else if ( me.mode == "Add" )
								{
									// Actual Create perform
									var orgUnitsJSON = me.generateOrgUnit_MetaData( me.orgUnitAddTabTag, "Add" );

									me.createOrgUnitAction( orgUnitsJSON, me.dialogFormTag, tableSubMsgTag, "Add organisation unit information successfully.");
								}
								else
								{
									alert( "Invalid save mode: " + me.mode );
								}
							}
							else
							{
								
								
							}
						});
					}
				}
				,"Close": function() 
				{
					me.dialogFormTag.dialog( "close" );
				}
			}				
		});

	};

	me.validateForm = function()
	{
		var message = "";
		
		// CHECK if the coordinate is valid
		var checkCoordinate = me.validateCoordinate( me.ouCoordinatesTag.val() );
		if( !checkCoordinate )
		{
			Util.paintWarning( me.ouCoordinatesTag );
			message += "Coordinates is invalid. \n Longitude have to be in [-180, +180], latitude have to be in [-90, +90] \n";
		}
		else
		{
			Util.paintClear( me.ouCoordinatesTag );
		}


		// CHECK Parent OrgUnit Field - Proper Selection & Mandatory
		var parentValidity = me.validateParentField( me.parentOrgUnitTag, me.parentOrgUnitSearchTag, me.divParentOrgUnitMsgTag );
		
		if ( !parentValidity.valid ) 
		{
			message += parentValidity.msg + '\n';
		}


		// CHECK mandatory fields (Except the Parent OrgUnit Field)
		var mandatoryFail = false;

		me.orgUnitAddTabTag.find( 'select[mandatory="true"],input[mandatory="true"]' ).not( '#parentOrgUnitSearch' ).each( function(){
			Util.paintClear( $( this ) );
		});
		
		me.orgUnitAddTabTag.find( 'select[mandatory="true"],input[mandatory="true"]' ).not( '#parentOrgUnitSearch' ).each( function()
		{
			if ( Util.trim( $( this ).val() ) == "" )
			{
				mandatoryFail = true;

				// Add backgound color to the manatory ones
				Util.paintWarning( $( this ) );
			}
		});

		if ( mandatoryFail )
		{
			message += 'Please fill all the Mandatory fields first.';
		}
		

		var valid = ( message.length == 0 );

		if ( !valid ) dialogFormTag.unblock();


		return { "valid" : valid , "message" : message };
	};

	// Set up Events..
	me.setUp_Events = function()
	{
		// Parent Auto Search set
		me.setUp_ParentSearch();


		me.searchAddressTag.change( function()
		{				
			google.maps.event.trigger( me.searchAddressTag[0], 'focus');

			setTimeout( function() 
			{
				google.maps.event.trigger( me.searchBox, 'places_changed', 'btnClicked' );
			}, 700 );

		});

		// Auto Search Address Suggestion dropdown showing
		me.searchAddressTag.keypress( function () 
		{
			$( '.pac-container' ).css( 'z-index', '9999' );
		});		

		
		me.avalableProgramAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'avalableProgramAssignedOU', 'selectedProgramAssignedOU' );
		});
		
		me.selectedProgramAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'selectedProgramAssignedOU', 'avalableProgramAssignedOU' );
		});
		
		me.avalableDatasetAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'avalableDatasetAssignedOU', 'selectedDatasetAssignedOU' );
		});
		
		me.selectedDatasetAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'selectedDatasetAssignedOU', 'avalableDatasetAssignedOU' );
		});
		
		me.avalableOUGroupAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'avalableOUGroupAssignedOU', 'selectedOUGroupAssignedOU' );
		});
		
		me.selectedOUGroupAssignedOUTag.dblclick( function()
		{
			Util.moveSelectedById( 'selectedOUGroupAssignedOU', 'avalableOUGroupAssignedOU' );
		});
		
		me.ouCoordinatesTag.change( function()
		{
			var value = $( this ).val();

			var valid = me.validateCoordinate( value );

			if( !valid )
			{
				Util.paintWarning( me.ouCoordinatesTag );
				alert( "Coordinates is invalid. \n Longitude have to be in [-180, +180], latitude have to be in [-90, +90]" );
			}
			else
			{
				Util.paintClear( me.ouCoordinatesTag );

				// TODO: If empty, remove marker is exists, set span to empty.. etc..
				if ( Util.trim( value ) == "" )
				{
					me.spanCoordinateInfoTag.text( '' );

					me.resetMarkers();
				}
				else
				{
					// Move the map center to this coordinate
					var coordinate = $.parseJSON( "[" + value + "]" );

					if ( me.useLocation && me.map !== undefined &&  me.isGoogleMapAvailable() )
					{
						if ( coordinate.length == 2 )
						{
							var coordinateLatLng = new google.maps.LatLng( coordinate[1], coordinate[0] );
							
							me.setMapCenter( coordinateLatLng );
						}
					}
				}
			}
		});
	};

	
	// Max/Min of them are lat +90 to -90 ; long +180 to -180
	me.validateCoordinate = function( value )
	{
		if( value != "" )
		{
			value = "[" + value + "]";
			var coordinate = $.parseJSON( value );

			if ( coordinate.length == 2 )
			{
				var longitude = coordinate[0];
				var latitude  = coordinate[1];
				
				return ( longitude <= 180 && longitude >= -180
					&& latitude <= 90 && latitude >= -90 )
			}
			else
			{
				return false;
			}
		}
		
		return true;
	}	

	// ------- Initial and open Methods -------------
	// ----------------------------------------------


	// -------------------------------------------------------------------------


	me.clearCustomHtmlTabs = function()
	{				
		// Remove both 'li' & 'div' tag - they have same named class
		me.orgUnitAddTabTag.find( '.customHtmlTab' ).remove();
	}


	me.generateCustomHtmlTabs = function( input_ouId )
	{
		var networkData = me.oProviderNetwork.getSelectedNetworkData();
		var htmlTabs = networkData.htmlTabs;
		var networkTypeName = me.orgUnitInfo.networkTypeName;
		var ouId = "";
		
		if ( input_ouId !== undefined ) ouId = input_ouId;
		else if ( me.orgUnitInfo.ouId !== undefined ) ouId = me.orgUnitInfo.ouId;
		else ouId = "";

		try
		{
			// Need to varify if this is 'Network' or 'NetworkChild'
			var htmlTabList = htmlTabs[ networkTypeName + "_HtmlTabs" ];

			$.each( htmlTabList, function( i_tb, item_tb )
			{
				var tabId_withCount = 'customHtmlTab_' + i_tb;

				// 1. 'li' tag append
				var liTag = $( '<li class="customHtmlTab"><a href="#' + tabId_withCount + '">' + item_tb.name + '</a></li>' );

				me.orgUnitFormTabUlTag.append( liTag );


				// 2. matching 'div' tag append
				var divTag = $( '<div id="' + tabId_withCount + '" class="customHtmlTab"></div>' );

				divTag.append( Util.valueUnescape( item_tb.value ) );

				me.orgUnitAddTabTag.append( divTag );


				// 3. run script
				//var script = item_tb.script.replace( new RegExp( '[ouid]', 'g' ), ouId ).replace( '[countrycode]', me.orgUnitInfo.countryInfo.name ).replace( '[HtmlTabId]', '#' + tabId_withCount );
				var script = item_tb.script.replace( '[ouid]', ouId ).replace( '[countrycode]', me.orgUnitInfo.countryInfo.name ).replace( '[HtmlTabId]', '#' + tabId_withCount );

				eval( script );	
				//console.log( 'htmlTab script: ' + script );

			});
		}
		catch (err)
		{
			console.log( 'Error Caught in generateCustomHtmlTabs: ' + err.message );
		}
	}

	me.executeNetworkScript = function( actionType, orgUnitsJSON, returnFunc )
	{
		// Get Network Scripts and orgUnit Id if available
		var networkData = me.oProviderNetwork.getSelectedNetworkData();
		var scripts = networkData.scripts;

		var networkTypeName = me.orgUnitInfo.networkTypeName;
		var ouId = "";

		if ( orgUnitsJSON !== undefined && orgUnitsJSON.id !== undefined ) ouId = orgUnitsJSON.id;
		else if ( me.orgUnitInfo.ouId !== undefined ) ouId = me.orgUnitInfo.ouId;
		else ouId = "";

		try
		{
			// Need to varify if this is 'Network' or 'NetworkChild'
			var actionScripts = scripts[ networkTypeName + "Scripts" ];
			var script = actionScripts[ actionType ].replace( "[ouid]", ouId );

			// Reset the '_fromScriptCallFunc' before the 'script'
			_fromScriptCallFunc = undefined;

			// Set some variables to have it available from script
			_script_CountryOuid = me.orgUnitInfo.countryInfo.id;
			_orgUnitsJson = orgUnitsJSON;

			eval( script );

			//orgUnitsJSON = mergeDeep( orgUnitsJSON, _orgUnitJsonAddition );

			// Ajax Asynch Callback function defined in the script..
			if ( _fromScriptCallFunc !== undefined ) {
				_fromScriptCallFunc( function(orgUnitsJSON) {
					returnFunc(orgUnitsJSON);
				});
			}
			else
			{
				returnFunc(orgUnitsJSON);				
			}

		}
		catch (err)
		{
			console.log( 'Error Caught in executeNetworkScript: ' + err.message );

			// return the additional JSON that it to be merged with orgUnitJSON.
			returnFunc(orgUnitsJSON);							
		}
	}

	// -------------------------------------------------------------------------

	me.loadSelectedPrograms = function( selectedProgram )
	{
		Util.clearList( me.selectedProgramAssignedOUTag );
		Util.clearList( me.avalableProgramAssignedOUTag );
		
		me.selectedProgramAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
		me.avalableProgramAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
		
		me.programLoaded = false;
		
		me.loadPrograms( function( allPrograms ){
			me.programSelected(allPrograms, selectedProgram);			
			me.programLoaded = true;
		});
	};

	me.programSelected = function( allPrograms, selectedPrograms )
	{
		var availablePrograms = [];
		var flag = false;
		var k = 0;
		for( var j in allPrograms ){
			var availableId = allPrograms[j].id;
			flag = false;
			for( var i in selectedPrograms ){
				var selectedId = selectedPrograms[i].id;
				if( selectedId == availableId ){
					flag = true;
				}
			}
			if( !flag ){
				availablePrograms[k] = allPrograms[j];
				k++;
			}
		}

		Util.clearList( me.selectedProgramAssignedOUTag );
		Util.clearList( me.avalableProgramAssignedOUTag );


		for( var i in selectedPrograms ){
			me.selectedProgramAssignedOUTag.append("<option value='" + selectedPrograms[i].id + "' selectedOpt='true'>" + selectedPrograms[i].name + "</option>");
		}

		for( var i in availablePrograms ){
			me.avalableProgramAssignedOUTag.append("<option value='" + availablePrograms[i].id + "'>" + availablePrograms[i].name + "</option>");
		}
	};
	
	me.loadSelectedDatasets = function( selectedDatasets )
	{
		Util.clearList( me.selectedDatasetAssignedOUTag );
		Util.clearList( me.avalableDatasetAssignedOUTag );
		
		me.selectedDatasetAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
		me.avalableDatasetAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
					
		me.datasetLoaded = false;
		
		me.loadDatasets( function( allDatasets ){			
			me.datasetSelected( allDatasets, selectedDatasets );				
			me.datasetLoaded = true;
		});
	};
	
	me.datasetSelected = function( allDatasets, selectedDatasets )
	{
		var availableDatasets = [];
		var flag = false;
		var k = 0;
		for( var j in allDatasets ){
			var availableId = allDatasets[j].id;
			flag = false;
			for( var i in selectedDatasets ){
				var selectedId = selectedDatasets[i].id;
				if( selectedId == availableId ){
					flag = true;								
				}
			}
			if( !flag ){
				availableDatasets[k] = allDatasets[j];
				k++;
			}
		}
		
		Util.clearList( me.selectedDatasetAssignedOUTag );
		Util.clearList( me.avalableDatasetAssignedOUTag );


		for( var i in selectedDatasets ){
			me.selectedDatasetAssignedOUTag.append("<option value='" + selectedDatasets[i].id + "' selectedOpt='true'>" + selectedDatasets[i].name + "</option>");
		}
		
		for( var i in availableDatasets ){
			me.avalableDatasetAssignedOUTag.append("<option value='" + availableDatasets[i].id + "'>" + availableDatasets[i].name + "</option>");
		}
	};
	
	me.loadSelectedOUGroups = function( selectedOUGroups )
	{
		Util.clearList( me.selectedOUGroupAssignedOUTag );
		Util.clearList( me.avalableOUGroupAssignedOUTag );
		
		me.selectedOUGroupAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
		me.avalableOUGroupAssignedOUTag.append("<optgroup style='font-style:italic;'><option>Loading ....</option></optgroup>");
		
		
		me.groupsLoaded = false;
		
		me.loadOUGroups( function( allOUGroups ){
			me.ouGroupSelected( allOUGroups, selectedOUGroups );	
			me.groupsLoaded = true;
		});
	};
	
	me.ouGroupSelected = function( allOUGroups, selectedOUGroups )
	{
		var selectedGroups  = [];
		for( var i in selectedOUGroups ){
			var selectedGroup = selectedOUGroups[i];
			var foundData = Util.findItemFromList( allOUGroups, "id", selectedGroup.id );
			if( foundData )
			{
				selectedGroups.push( selectedGroup );
			}
		}
		
		var availableOUGroups = [];
		if( selectedGroups.length > 0 )
		{
			var flag = false;
			var k = 0;
			for( var j in allOUGroups ){
				var availableId = allOUGroups[j].id;
				flag = false;
				for( var i in selectedGroups ){
					var selectedId = selectedGroups[i].id;
					if( selectedId == availableId ){
						flag = true;								
					}
				}
				if( !flag ){
					availableOUGroups[k] = allOUGroups[j];
					k++;
				}
			}
		}
		else
		{
			availableOUGroups = allOUGroups;
		}
		
		Util.clearList( me.selectedOUGroupAssignedOUTag );
		Util.clearList( me.avalableOUGroupAssignedOUTag );


		for( var i=0; i<selectedGroups.length; i ++ ){
			me.selectedOUGroupAssignedOUTag.append("<option value='" + selectedGroups[i].id + "' selectedOpt='true'>" + selectedGroups[i].name + "</option>");
		}
		
		for( var i=0; i<availableOUGroups.length; i ++ ){
			me.avalableOUGroupAssignedOUTag.append("<option value='" + availableOUGroups[i].id + "'>" + availableOUGroups[i].name + "</option>");
		}
	};
	
	me.loadPrograms = function( doneFunc ){
		
		RESTUtil.retrieveManager.retrieveData( me._queryURL_Programs
		, function( data ) 
		{
			doneFunc(data.programs);
		});
	};	
	
	me.loadDatasets = function( doneFunc ){
		
		RESTUtil.retrieveManager.retrieveData( me._queryURL_Datasets
		, function( data ) 
		{
			doneFunc(data.dataSets);
		});
	};
	
	// Load OU Groups without group sets
	me.loadOUGroups = function( doneFunc ){
		
		RESTUtil.retrieveManager.retrieveData( me._queryURL_OUGroups
		, function( data ) 
		{
			var ouGroups = [];
			for( var i in data.organisationUnitGroups )
			{
				var group = data.organisationUnitGroups[i];
				if( group.organisationUnitGroupSet === undefined || group.organisationUnitGroupSet.length == 0 ){
					ouGroups.push( group );
				}
			}
			doneFunc( ouGroups );
		});			
	};
	

	me.setUp_ParentSearch = function()
	{		
		var inputTag = me.parentOrgUnitSearchTag.addClass( "ui-widget" );

		// 'Autocomplete' Setup
		inputTag.autocomplete(
		{
			// use default delay time.
			//delay: 0,  
			//minLength: 2			
			source: function( request, response ) 
			{
				// Reset the selected hidden id value
				me.parentOrgUnitTag.val( "" );
				Util.paintWarning( inputTag );
				
				//me.parentOuLoadingTag.hide();				
				inputTag.removeClass( "ui-autocomplete-loading" );

						
				if ( request.term.length >= 2 )
				{
					// prepare data
					var networkCountryId = me.orgUnitInfo.countryInfo.id;
					var parentOuLevel = me.orgUnitInfo.orgUnitLevel - 1;
					var queryURL = _queryURL_api + 'organisationUnits.json?paging=false&fields=id,name,parents,ancestors&filter=level:eq:' + parentOuLevel + '&filter=name:ilike:';		
			
					// Retrieving data (the match ) from user input
					RESTUtil.getAsynchData( queryURL + inputTag.val(), function( json_Data )
					{					
						AppUtil.copyAncestorsToParents( json_Data.organisationUnits );

						var filteredList = me.filterOuByEditPermission( json_Data.organisationUnits );

						// filter by network country ID from 'parents'  - data: { label: item.name, id: item.id }
						filteredList = me.filterOuByCountry( filteredList, networkCountryId );

						response( filteredList );
					}
					, function() { alert( 'Failed to retrieve parents orgUnit list.' ); }
					, function() { QuickLoading.dialogShowAdd( 'parentOuLoading' ); }
					, function() { QuickLoading.dialogShowRemove( 'parentOuLoading' ); }
					);

				}
			}
			,open: function () 
			{
				// When result list OPENs, we are re-adjusting z index to show on top.
				var onTopElem = inputTag.closest( '.ui-front' );

				if( onTopElem.length > 0 )
				{
					var widget = inputTag.autocomplete( 'widget' );
					widget.zIndex( onTopElem.zIndex() + 1 );
				}
			}
			,select: function( event, ui ) 
			{
				// Mouse click select event
				//inputTag.val( ui.item.value );
				inputTag.val( ui.item.label );
				me.parentOrgUnitTag.val( ui.item.id );
				//Util.paintClear( inputTag );	
				me.validateParentField( me.parentOrgUnitTag, me.parentOrgUnitSearchTag, me.divParentOrgUnitMsgTag );

				inputTag.removeClass( "ui-autocomplete-loading" );
				inputTag.autocomplete( "close" );
			}
		});



		// Do Invalid selection handling here

		inputTag.on( 'change focusout', function() {
		
			me.validateParentField( me.parentOrgUnitTag, me.parentOrgUnitSearchTag, me.divParentOrgUnitMsgTag );
		});

	};


	me.validateParentField = function( parentOrgUnitTag, parentOrgUnitSearchTag, divParentOrgUnitMsgTag )
	{
		var validity = { 'valid': false, 'validMandatory': false, 'validSelection': false, 'msg': '' };

		var valid = false;

		// Check hidden selection tag.. 
		// Which get catched
		validity.validSelection = ( parentOrgUnitTag.val() != "" );
		validity.validMandatory = ( Util.trim( parentOrgUnitSearchTag.val() ) != "" );


		if ( validity.validSelection && validity.validMandatory ) validity.valid = true;


		// Show hidden message..
		if ( validity.valid ) 
		{
			divParentOrgUnitMsgTag.hide();
			Util.paintClear( parentOrgUnitSearchTag );
		}
		else 
		{
			divParentOrgUnitMsgTag.show();
			Util.paintWarning( parentOrgUnitSearchTag );
			validity.msg = divParentOrgUnitMsgTag.text();
		}
		
		return validity;
	}


	me.filterOuByEditPermission = function( ouList )
	{
		var filteredOuList = [];

		$.each( ouList, function( i_ou, item_ou )
		{
			if ( item_ou.parents !== undefined && me.oProviderNetwork.checkOrgunitEditPermission( item_ou ) )
			{
				filteredOuList.push( item_ou );
			}
		});

		return filteredOuList;
	}


	me.filterOuByCountry = function( ouList, networkCountryId )
	{
		var filteredOuList = [];

		$.each( ouList, function( i_ou, item_ou )
		{
			var foundMatch = false;

			if ( item_ou.parents !== undefined )
			{
				$.each( item_ou.parents, function( i_p, item_p )
				{
					if ( item_p.id == networkCountryId )
					{
						foundMatch = true;
						return false;
					}
				});
			}

			if ( foundMatch ) filteredOuList.push( { label: item_ou.name, id: item_ou.id } );
		});

		return filteredOuList;
	}


	me.resetFormStatus = function()
	{
		// me.setFormViewOnly( me.dialogFormTag, true );			

		// Find 'Save' button on this dialog form and hide it initially
		var button_SaveTag = me.dialogFormTag.parent( 'div' ).find( '.ui-dialog-buttonpane' ).find( 'button:contains("Save")' ).button();
		button_SaveTag.hide();

		me.dialogFormTag.show();

		return button_SaveTag;
	};


	me.setFormViewOnly = function( viewOnly )
	{
		if( viewOnly )
		{
			// If viewOnly, disable all the form..
			Util.disableTag( me.dialogFormTag.find( 'input,button,select' ), true );
		}
		else
		{
			// Enable search address tag..
			Util.disableTag( me.searchAddressTag, false );		
		}
	};

	// -- Form Related Methods ----------
	// ----------------------------------


	// ----------------------------------
	// -- Org Unit Related Methods ------
	

	// Generate the orgUnit Table Structure
	me.generateOrgUnitTable = function( countryInfo )
	{
		// ** Does not require orgUnit Data to generate the table structure/rows.
		//    It uses Network Attribute Selections!!

		var useLocation = false;

		me.ouDetailsTableTag.find("tr[rowType='added']").remove();

		var attributeValueList = ( me.orgUnitInfo.isType_NetworkChild ) ? me.oProviderNetwork.getNetworkChildAttributeValueList_FromSetting() : me.oProviderNetwork.getNetworkAttributeValueList_FromSetting();

		if( me.mode == "Add" ) 
		{			
			// Check and add required fields which are missing in Network configuation
			var basicAttributeList = me.getBasicAttributeList();
		
			for( var i = 0; i < basicAttributeList.length; i++ )
			{
				var fieldAttr = basicAttributeList[i];
			
				if ( ( fieldAttr.mandatory || fieldAttr.hidden ) && !me.checkExistRequiredField( attributeValueList, fieldAttr.value ) ) 
				{
					var maxlength = ( fieldAttr.length !== undefined ) ? "maxlength=\"" + fieldAttr.length + "\"" : "";
					var hidden = ( fieldAttr.hidden ) ? "style='display:none;'" : "";
					var mandatory = ( fieldAttr.mandatory ) ? "mandatory=\"" + fieldAttr.mandatory + "\"" : "";
					var mandatorySpan =  ( fieldAttr.mandatory ) ? "<span class='required'>*</span>" : "";

					var rowTag = $( "<tr rowType='added' " + hidden + "></tr>" );

					rowTag.append( "<td>" + fieldAttr.name + " " + mandatorySpan + "</td>" );
					
					rowTag.append( '<td><input type="text" class="ouAdd_' + fieldAttr.value + ' ouForm" size="60" ' + maxlength + '  ' + mandatory + ' /></td>' );
					
					if( fieldAttr.valueType == "date" )
					{
						rowTag.find( 'input' ).datepicker( { dateFormat: "yy-mm-dd" } );
					}
					
					me.ouDetailsTableTag.append( rowTag );
				}
			}
		}

		
		// Get Network/NetworkChild OU Group		
		var ouGroupId = ( me.orgUnitInfo.isType_NetworkChild  ) ? me.oProviderNetwork.networkData.networkChild_OUGroupID : me.oProviderNetwork.networkData.network_OUGroupID;

		
		// Generate fields in Network/NetworkChild	
		me.trOuCoordinateSectionTag.hide()
		for( var i =0; i<attributeValueList.length; i++ )
		{
			var rowTag = $("<tr rowType='added'></tr>");
			
			var attributeValue = attributeValueList[i].value;
			var readOnly = ( attributeValueList[i].readOnly === undefined ) ? false : attributeValueList[i].readOnly;
			
			// Orgunit Dynamic attributes
			if( attributeValueList[i].type == 'ou_attr' )
			{
				var dynamicField = me.getDynamicAttributeObject( attributeValue.replace( "dynamicAttr_","" ) );
				
				// Fixed Org Unit Properties
				if( dynamicField === undefined &&  attributeValue != "id" )
				{

					// If 'coordinate', show the section
					if( attributeValue == 'coordinates' )
					{
						me.trOuCoordinateSectionTag.show();

						// if country shape info is available, show 'map' and 'locationFind'
						if ( countryInfo !== undefined
						&& Util.checkValue( countryInfo.shape ) )
						{
							useLocation = true;

							me.trOuAdd_MapTag.show();
							me.trOuAdd_LocationFindTag.show();

							$( '#divCountryBoundaryNotReady' ).hide();
						}
						else
						{
							$( '#divCountryBoundaryNotReady' ).show();
						}
					}
					else
					{
						var maxlength = "";
						var mandatory = "";
						var mandatorySpan = "";
						var ouField = me.getRequiredOuField( attributeValue );
						var nameField = Util.upcaseFirstCharacterWord( attributeValue );
			
						if( ouField != "" )
						{
							maxlength = ( ouField.length !== undefined ) ? "maxlength=\"" + ouField.length + "\"" : "";
							mandatory= ( ouField.mandatory ) ? "mandatory=\"" + ouField.mandatory + "\"" : "";					
							mandatorySpan = ( ouField.mandatory ) ? "<span class='required'>*</span>" : "";
							nameField = ouField.name;
						}
						

						rowTag.append( "<td>" + nameField + " " + mandatorySpan + "</td>" );
						rowTag.append( '<td><input type="text" class="ouAdd_' + attributeValue +  ' ouForm" size="60" ' + maxlength + ' ' + mandatory + ' /></td>' );
							

						if( ouField != "" )
						{
							if( ouField.valueType == "date" )
							{
								rowTag.find( 'input' ).datepicker( { dateFormat: "yy-mm-dd" } );
							}
							else if( ouField.valueType == "bool" || ouField.valueType == "BOOLEAN" )
							{
								rowTag.find("input").replaceWith( "<select class=\"ouAdd_" + attributeValue +  "\" " + maxlength + " " + mandatory + " style='width: 400px;'>" 
									+ "<option value=''>[Please select]</option>"
									+ "<option value='true'>Yes</option>"
									+ "<option value='false'>No</option></select>" );
							}
						}
					}
				}
				// Dynamic Org Unit properties
				else if( dynamicField !== undefined )
				{
					var attributeValue = attributeValue.replace( "dynamicAttr_", "" );
					var maxlength = ( dynamicField.length !== undefined ) ? "maxlength=\"" + ouField.length + "\"" : "";
					var mandatory = ( dynamicField.mandatory ) ? "mandatory=\"" + dynamicField.mandatory + "\"" : "";
					var mandatorySpan =  ( dynamicField.mandatory ) ? "<span class='required'>*</span>" : "";
					
					rowTag.append("<td>" + dynamicField.displayName + mandatorySpan + "</td>" );

					rowTag.append( '<td><input type="text" class="dynamicAttr_' + attributeValue +  ' ouForm" size="60" ' + mandatory + ' ' + maxlength + '/></td>' );
					
					if( dynamicField.valueType == "date" )
					{
						rowTag.find( 'input' ).datepicker( { dateFormat: "yy-mm-dd" } );
					}
					else if( dynamicField.valueType == 'bool' || dynamicField.valueType == 'BOOLEAN' )
					{
						rowTag.find( 'input' ).replaceWith( "<select class='dynamicAttr_" + attributeValue +  "' " + maxlength + " " + mandatory + " style='width: 400px;'>" 
							+ "<option value=''>[Please select]</option>"
							+ "<option value='true'>Yes</option>"
							+ "<option value='false'>No</option></select>" );
					}

				}
			}
			// OUGS fields
			else if( attributeValueList[i].type == "ougs" )
			{
				var orgunitGroupSet = me.getOrgunitGroupSetById( attributeValue );
			
				if ( orgunitGroupSet !== undefined )
				{
					var groups = ( orgunitGroupSet.organisationUnitGroups === undefined ) ? [] : orgunitGroupSet.organisationUnitGroups;
					
					rowTag.append( "<td>" + orgunitGroupSet.name + "</td>" );
					
					rowTag.append("<td><select class='ougs_" + orgunitGroupSet.id + "' style='width:400px;'></select></td>");
					
					var selector = rowTag.find("select");

					Util.populateSelectDefault( selector, '[Please selected]', groups );
					
					if( ouGroupId !== undefined && ouGroupId != "" )
					{
						var selectedOption = selector.find("option[value='" + ouGroupId + "']");
					
						if( selectedOption.length > 0 )
						{
							selectedOption.attr('selected', 'selected');
							Util.disableTag( selector, true );
						}
					}
				}				
			}
			
			if( readOnly && me.mode == _mode_Edit )
			{
				Util.disableTag( rowTag.find( "input,select" ), true );
			}
			else
			{
				rowTag.find( "input,select" ).css( "background-color", "#ffffff" );
			}


			// TODO: What is this 'td' count check??
			if( rowTag.find( "td" ).length > 0 )
			{
				me.ouDetailsTableTag.append( rowTag );
			}			
		}
		
		
		me.setup_mandatoryFieldWarning( me.orgUnitAddTabTag );


		return useLocation;
	};
	

	// Populate the orgUnit Form
	me.populateOrgUnitData = function( ouData, tableTag )
	{
		tableTag.attr( 'ouid', ouData.id );
		

		// 1. populate Fixed property rows and values
		tableTag.find( "input,select" ).each( function()
		{
			var tag = $( this );

			var tagClass = AppUtil.getOUTagClass( tag );
		
			if( tagClass != "" )
			{
				var attrName = tagClass.replace( "ouAdd_", "" );
				var value = "";
				
				if( tagClass.indexOf( 'ouAdd_' ) >= 0 && attrName.indexOf( 'dynamicAttr_' ) < 0 )
				{
					var value = ouData[ attrName ];
					
					var valueType = Util.findItemFromList( me.oProviderNetwork.orgUnitAttributeManager.basicAttributeList, "value", attrName ).valueType;
				
					if( attrName == "coordinates" )
					{
						var featureType = Util.getNotEmpty( ouData.featureType );
						if ( featureType == "NONE" ||  featureType == "None" )  featureType = "";

						me.spanCoordinateInfoTag.text( featureType );

						if ( value !== undefined && ( ouData.featureType == "Point" || ouData.featureType == "POINT" ) )
						{
							value = value.replace( "[", "" ).replace( "]", "" );

							if ( Util.trim( value ) != "" ) 
							{
								me.map.setZoom( me.mapZoomLevel );
								me.setMapCenter( me.getLocationCoordinateLatLng( ouData ) );
							}
						}
					}
					else if( valueType == 'date' && value !== undefined && value != "" )
					{
						value = value.substring( 0, 10 );
					}
				}
				else if( AppUtil.startsWith( attrName, 'dynamicAttr_' ) )
				{
					var attrId = attrName.replace( "dynamicAttr_", "" );

					for( var i = 0; i < ouData.attributeValues.length; i++ )
					{
						var attValue = ouData.attributeValues[i];

						if( attValue.attribute.id == attrId )
						{
							value = attValue.value;
							break;
						}
					}					
				}
				
				tag.val( value );
			}
		});

		
		// 2. Populate the Dynamic attributes
		$.each( ouData.attributeValues, function( i_attr, item_attr )
		{
			// if matching data exists in ouData, 
			//var attributeIdFilter = '[attrid="' + item_attr.attribute.id + '"]';

			var value = item_attr.value;
			
			tableTag.find( 'input.ouAdd_dynamicAttr_' + item_attr.attribute.id + ',select.ouAdd_dynamicAttr_' + item_attr.attribute.id ).val( value );

		});


		// 3. Populate the OU Groups
		$.each( ouData.organisationUnitGroups, function( i, ouGroup )
		{
			tableTag.find( 'select[class^=ougs_]').find("option[value='" + ouGroup.id + "']").attr('selected', 'selected').attr('selectedopt', true);
		});
		

		// 4. For update, store featureType as table attribute
		tableTag.attr( 'featureType', Util.getNotEmpty( ouData.featureType ) );

	};


	me.getLocationCoordinateLatLng = function( ouData )
	{
		var coordinateLatLng;

		var featureType = Util.getNotEmpty( ouData.featureType );

		if ( ( featureType == "Point" || featureType == "POINT" ) && Util.checkValue( ouData.coordinates ) )
		{
			var coordinate = $.parseJSON( ouData.coordinates );

			if ( coordinate.length == 2 )
			{
				if ( me.isGoogleMapAvailable() ) coordinateLatLng = new google.maps.LatLng( coordinate[1], coordinate[0] );
			}
		}

		return coordinateLatLng;
	};


	me.formConfigure_ByNetworkSetting = function( ouData )
	{
		var networkData = me.oProviderNetwork.getSelectedNetworkData();
		

		// 1. Set Map Area Visibility

		// Reset the display - done in generate or populate the form..
		//me.divCoordinateNoteTag.hide();


		// Check if it has 'coordinates' attribute
		var hasCoordinateAttribute = false;

		var attributeValueList = ( me.orgUnitInfo.isType_NetworkChild ) ? me.oProviderNetwork.getNetworkChildAttributeValueList_FromSetting() : me.oProviderNetwork.getNetworkAttributeValueList_FromSetting();
		

		for( var i = 0; i < attributeValueList.length; i++ )
		{
			if( attributeValueList[i].value == "coordinates" )
			{
				hasCoordinateAttribute = true;
				break;
			}
		}

		
		if( networkData.coordinateMapShow == "" || !hasCoordinateAttribute )
		{			
			me.trOuCoordinateSectionTag.hide();
		}
		else if( networkData.coordinateMapShow == "Editable" && hasCoordinateAttribute )
		{
			me.trOuCoordinateSectionTag.show();
			
			// me.setUp_MapClick();

			me.divCoordinateNoteTag.show();

			//if( ouData !== undefined ) me.setMapCenter( me.getLocationCoordinateLatLng( ouData ) );
			
			if ( me.useLocation )
			{
				me.trOuAdd_LocationFindTag.show();
				me.trOuAdd_MapTag.show();
			}
			else
			{
				me.trOuAdd_LocationFindTag.hide();
				me.trOuAdd_MapTag.hide();
			}
		}
		else if( networkData.coordinateMapShow == "ReadOnly" && hasCoordinateAttribute )
		{
			me.trOuCoordinateSectionTag.show();

			//if( ouData !== undefined ) me.setMapCenter( me.getLocationCoordinateLatLng( ouData ) );
			
			me.trOuAdd_LocationFindTag.hide();

			if ( me.useLocation ) me.trOuAdd_MapTag.show();
			
			me.remove_MapClick();
		}
		
		
		// 2. Set Org Unit Group Tab visibility
		var oUGroupsTabShow = networkData.oUGroupsTabShow;

		if( oUGroupsTabShow == "" )// hide tab
		{
			me.orgUnitGroupTabLink.hide();
		}
		else 
		{

			me.orgUnitGroupTabLink.show();
			
			var orgUnitGroups = ( ouData === undefined ) ? [] : ouData.organisationUnitGroups;


			me.loadSelectedOUGroups( orgUnitGroups );
			
			var readOnly = ( oUGroupsTabShow == "ReadOnly" );

			Util.disableTag( me.orgUnitGroupTab.find("select"), readOnly );


			if( readOnly )
			{
				me.orgUnitGroupTab.find( "table td:nth-child(1)" ).hide();
				me.orgUnitGroupTab.find( "table td:nth-child(2)" ).css( "border-left", "" );
			}
			else
			{
				me.orgUnitGroupTab.find( "table td:nth-child(1)" ).show();
				me.orgUnitGroupTab.find( "table td:nth-child(2)" ).css( "border-left", "none" );
			}
		}
		

		// 3. Set Programs & DataSets Tab visibility
		var programsDataSetsTabShow = networkData.programsDataSetsTabShow;

		if( programsDataSetsTabShow == "" )// hide tab
		{
			me.programDataSetTabLink.hide();
		}
		else 
		{
			me.programDataSetTabLink.show();
			
			var programs = [];
			var dataSets = [];

			if( ouData !== undefined )
			{
				programs = ouData.programs;
				dataSets = ouData.dataSets;
			}
			
			me.loadSelectedPrograms( programs );
			me.loadSelectedDatasets( dataSets );
						
			var readOnly = ( programsDataSetsTabShow == "ReadOnly" );

			Util.disableTag( me.programDataSetTab.find("select"), readOnly );


			if( readOnly )
			{
				me.programDataSetTab.find( "table.tbNone td:nth-child(1)" ).hide();
			}
			else
			{
				me.programDataSetTab.find( "table.tbNone td:nth-child(1)" ).show();
			}
		}

	}


	me.getBasicAttributeList = function()
	{
		return me.oProviderNetwork.orgUnitAttributeManager.basicAttributeList;
	};
	

	me.getRequiredOuField = function( fieldName )
	{
		var basicAttributeList = me.getBasicAttributeList();

		for( var i=0; i< basicAttributeList.length; i++ )
		{
			var ouField = basicAttributeList[i];
			if( fieldName == ouField.value )
			{
				return ouField;
			}
		}
		
		return "";
	};
	

	me.getDynamicAttributeObject = function( id )
	{
		var dynamicAttributeList = me.oProviderNetwork.orgUnitAttributeManager.getDynamicAttributeList();
		for( var i=0; i<dynamicAttributeList.length; i++ )
		{
			if( dynamicAttributeList[i].id == id ){
				return dynamicAttributeList[i];
			}
		}
		
		return undefined;
	};
	
	me.checkDuplicateOU = function( id, name, code, tableSubMsgTag, exeFunc )
	{
		me.checkedOUName = false;
		me.checkedOUCode = false;
		
		me.checkedOUNameResult = false;
		me.checkedOUCodeResult = false;

		// Check duplicate name
		me.checkDuplicateOUProperty( id, "name", name, tableSubMsgTag, function( valid ){
			me.checkedOUNameResult = valid;
			me.checkedOUName = true;
			me.runCheckDuplicateOU( exeFunc );
		});
		
		// Check duplicate code
		me.checkDuplicateOUProperty( id, "code", code, tableSubMsgTag, function( valid ){
			me.checkedOUCodeResult = valid;
			me.checkedOUCode = true;
			me.runCheckDuplicateOU( exeFunc );
		});
	};
	
	me.runCheckDuplicateOU = function( exeFunc )
	{
		if( me.checkedOUName && me.checkedOUCode )
		{		
			var json_Data = [];
			if( !me.checkedOUNameResult ){
				var result = {
					"valid" : false
					,"field" : "name"
				};
				json_Data.push( result );
			}
			
			if( !me.checkedOUCodeResult ){
				var result = {
					"valid" : false
					,"field" : "code"
				};
				json_Data.push( result );
			}
			

			// Use 'setTimeout' for displaying message
			setTimeout( function()
			{
				exeFunc( json_Data );
			}, 200 );
		}
	};
	
	me.checkDuplicateOUProperty = function( id, propertyName, value, tableSubMsgTag, exeFunc )
	{
		if( value !== undefined && value != "" )
		{	
			var _queryURL_OrgUnit = _queryURL_api + "organisationUnits.json?fields=id,name,displayName&filter=" + propertyName + ":eq:" + value;
			
			RESTUtil.getAsynchData( _queryURL_OrgUnit
			, function( json_Data )
			{
				var ouList = json_Data.organisationUnits;
				
				var valid = ( ouList === undefined || ouList.length == 0 || ( ouList.length > 0 && ouList[0].id==id ) );
				exeFunc( valid );
			}
			, function() {}
			, function() 
			{
				tableSubMsgTag.find( 'div.loadingSubImg' ).show();
				tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Checking existing orgUnit by ' + propertyName );
			}
			, function() 
			{
				tableSubMsgTag.find( 'div.loadingSubImg' ).hide();
				tableSubMsgTag.find( 'div.loadingSubMsg' ).text( '' );
			});
		}
		else
		{
			return exeFunc( true );
		}
	};
	
	me.checkExistRequiredField = function( attributeValueList, fieldName ){
		return ( Util.findItemFromList( attributeValueList, "value", fieldName ) !== undefined );
	};

	me.checkExistNetworkChild = function(){
		return( me.oProviderNetwork.networkData.NetworkChild_LVL !== undefined );
	};


	me.getOrgunitGroupSetById = function( ougsId )
	{
		var groupSetList = me.oProviderNetwork.getOrgUnitGroupSetList();
		
		for( var i=0; i < groupSetList.length; i++ )
		{
			if( groupSetList[i].id == ougsId )
			{
				return groupSetList[i];
			}
		}

		return undefined;
	};
	
	me.getOrgunitDynamicAttr = function( attrId )
	{
		var dynamicAttributeList = me.oProviderNetwork.getOUDynamicAttributeList();
		var attrName = "";
		for( var i=0; i<dynamicAttributeList.length; i++ )
		{
			if( dynamicAttributeList[i].id == attrId )
			{
				return dynamicAttributeList[i].displayName;
			}
		}
		
		return attrName;
	};

	me.initializeAndSetForm = function( tableTag )
	{
		tableTag.attr( 'ouid', '' );		
		tableTag.attr( 'featureType', '' );
		tableTag.find( 'ouAdd_dynamicAttr' ).val( '' );

		// reset parents selection related
		Util.paintClear( me.parentOrgUnitSearchTag );		
		me.parentOrgUnitSearchTag.val( "" );
		me.parentOrgUnitTag.val( "" );
		//me.parentOuLoadingTag.hide();
		QuickLoading.dialogShowRemove( 'parentOuLoading' );
		me.divParentOrgUnitMsgTag.hide();

		Util.selectAllOption( me.selectedProgramAssignedOUTag );
		Util.selectAllOption( me.selectedDatasetAssignedOUTag );
		Util.selectAllOption( me.selectedOUGroupAssignedOUTag );
		Util.moveSelectedById( 'selectedProgramAssignedOU', 'avalableProgramAssignedOU' );
		Util.moveSelectedById( 'selectedDatasetAssignedOU', 'avalableDatasetAssignedOU' );
		Util.moveSelectedById( 'selectedOUGroupAssignedOU', 'avalableOUGroupAssignedOU' );
		Util.unselectAllOption( me.avalableProgramAssignedOUTag );
		Util.unselectAllOption( me.avalableDatasetAssignedOUTag );
		Util.unselectAllOption( me.avalableOUGroupAssignedOUTag );
		
		me.ouCoordinatesTag.val( '' );
		me.searchAddressTag.val( '' );		

		me.trOuCoordinateSectionTag.hide();			
		me.trOuAdd_MapTag.hide();
		me.trOuAdd_LocationFindTag.hide();
		$( '#divCountryBoundaryNotReady' ).hide();
		me.spanCoordinateInfoTag.text( '' );
		me.divCoordinateNoteTag.hide();
		
		tableTag.find( 'input[mandatory="true"],select[mandatory="true"]' ).not( '#parentOrgUnitSearch' ).off( 'change focusout' );

	};

	me.setFormHeight = function( useLocation )
	{
		// set the visibility of map, height of popup, location title text, and row order switching.
		if ( useLocation ) 
		{
			me.dialogFormTag.dialog( "option", "height", me.height_noMap );
		}
		else
		{
			me.dialogFormTag.dialog( "option", "height", me.height );
		}		
	}

	// --------------------------------------

	/*
	me.createOrgUnit = function( tableTag, dialogFormTag )
	{
		var orgUnitsJSON = me.generateOrgUnit_MetaData( tableTag );

		var msg = { message: 'Processing..', css: me.loadingCss };

		// Check for orgunit code and shortname
		OrgUnitUtil.checkOrgUnitCode( orgUnitsJSON, dialogFormTag, msg, function()
		{
			OrgUnitUtil.checkOrgUnitShortName( orgUnitsJSON, dialogFormTag, msg, function()
			{
				// Continue
				me.createOrgUnitAction( orgUnitsJSON, dialogFormTag, msg );
				
			});
		} );
	};


	me.updateOrgUnit = function( tableTag, dialogFormTag )
	{
		var orgUnitsJSON = me.generateOrgUnit_MetaData( tableTag );

		var msg = { message: 'Processing..', css: me.loadingCss };

		// Check for orgunit code and shortname
		OrgUnitUtil.checkOrgUnitCode( orgUnitsJSON, dialogFormTag, msg, function()
		{
			OrgUnitUtil.checkOrgUnitShortName( orgUnitsJSON, dialogFormTag, msg, function()
			{
				// Continue
				me.editOrgUnitAction( tableTag, dialogFormTag, msg );
				
			} );
		} );
	};
	*/


	me.generateOrgUnit_MetaData = function( tableTag, mode, orgUnitJSON  )
	{		
		// Get the selected network setting
		var networkData = me.oProviderNetwork.getSelectedNetworkData();
		var oUGroupsTabShow = networkData.oUGroupsTabShow;
		var programsDataSetsTabShow = networkData.programsDataSetsTabShow;
		
		
		if ( orgUnitJSON === undefined )
		{
			orgUnitJSON = {};
		}
		else
		{
			var ouid = tableTag.attr( 'ouid' );
			if ( Util.checkValue( ouid ) ) orgUnitJSON[ "id" ] = ouid;
		}

		// for update case, add orgUnit id
		
		var long = "";
		var lat = "";
		var attributeValues = [];

		orgUnitJSON[ "parent" ] = { "id": me.parentOrgUnitTag.val() };

		if( oUGroupsTabShow == 'ReadWrite' || orgUnitJSON[ "organisationUnitGroups" ] === undefined )
		{
			orgUnitJSON[ "organisationUnitGroups" ] = [];
		}
		
		orgUnitJSON[ "organisationUnitGroupAdded" ] = [];
		orgUnitJSON[ "organisationUnitGroupDeleted" ] = [];
		


		tableTag.find( "#detailTab" ).find( "input,select" ).each(function()
		{
			if( Util.getNotEmpty( $(this).val() ) != "" )
			{
				var value = Util.trim( $(this).val() );

				var attributeName = AppUtil.getOUTagClass( $(this) );
				

				// Note: If date type value, set it with last timezone
				// - so that all the timezone will have same date
				//if ( $(this).hasClass( "hasDatepicker" ) && value != "" ) value += me.dateEndingTimeZone;


				if ( attributeName != "" && attributeName != "ouAdd_id" ) 
				{
					// Dynamic attribute values
					if ( AppUtil.startsWith( attributeName, "dynamicAttr_" ) && value != "" ) 
					{
						attrId = attributeName.replace( "dynamicAttr_", "");

						var attributeData = { "value": value, "attribute": { "id": attrId } };

						attributeValues.push( attributeData );
					}
					// Fixed properties
					else if ( attributeName.indexOf( "ouAdd_" ) == 0 ) 
					{
						attributeName = attributeName.replace( "ouAdd_", "" );

						if ( attributeName == "coordinates" ) 
						{
							if ( Util.trim( value ) == "" )
							{
								orgUnitJSON[ "featureType" ] = me.getShapeStr( me.shape_None );
								value = "";
							}
							else
							{
								// TODO: CAN NOT ALWAYS OVERWRITE AS POINT!!!
								orgUnitJSON[ "featureType" ] = me.getShapeStr( me.shape_Point );
								value = "[" + value + "]";
							}

							orgUnitJSON[ attributeName ] = value;

						}
						else if ( value != "" )
						{
							// if value is empty, simply skip adding??
							// TODO: Need to discuss this..
							orgUnitJSON[ attributeName ] = value;
						}

					}
					// Group set
					else if ( AppUtil.startsWith( attributeName, "ougs_" ) ) 
					{
					
						var ougsId = $(this).find("option:selected").val();
						var ougsText = $(this).find("option:selected").text();
							
						// Set the organisationUnitGroups of OU
						if( ougsId != "" )
						{
							if( Util.findItemFromList( orgUnitJSON["organisationUnitGroups"], "id", ougsId ) === undefined )
							{
								orgUnitJSON[ "organisationUnitGroups" ].push( { "id" : ougsId, "name" : ougsText } );
															
								orgUnitJSON[ attributeName ] = [];
								orgUnitJSON[ attributeName ].push( { "id" : ougsId, "name" : ougsText } );
							}
						}
						
						var selectedOugId = $(this).find("option[selectedopt=true]").val();

						// Set OUGs added/deleted
						if( ougsId !== selectedOugId )
						{
							if( selectedOugId !== undefined && selectedOugId != ""){
								var selectedOugName = $(this).find("option[selectedopt=true]").text();
								orgUnitJSON["organisationUnitGroupDeleted"].push( { "id" : selectedOugId, "name" : selectedOugName } );
								
								for( var i=0; i<orgUnitJSON.organisationUnitGroups.length; i++ )
								{
									var ougId = orgUnitJSON.organisationUnitGroups[i].id;
									if( selectedOugId == ougId )
									{
										orgUnitJSON.organisationUnitGroups.splice( i, 1 ); 
									}
								}
							}
							
							if( ougsId !== undefined && ougsId != "" ){
								orgUnitJSON["organisationUnitGroupAdded"].push( { "id" : ougsId, "name" : ougsText } );								
							}
						}
					}	
				}
			}
		});
		
		if( oUGroupsTabShow == 'ReadWrite' )
		{
			// Set the organisationUnitGroups of OU
			me.selectedOUGroupAssignedOUTag.find("option").each( function(){
				orgUnitJSON["organisationUnitGroups"].push( { "id" : $(this).val(), "name" : $(this).text() } );
			});
		}
		
		// Re-set programs && dataSets relationship
		if( programsDataSetsTabShow == 'ReadWrite' )
		{
			// Set the Programs of OU
			orgUnitJSON["programs"] = [];
			me.selectedProgramAssignedOUTag.find("option").each( function(){
				orgUnitJSON["programs"].push( { "id" : $(this).val(), "name" : $(this).text() } );
			});
		
			// Set the dataSets of OU
			orgUnitJSON["dataSets"] = [];
			me.selectedDatasetAssignedOUTag.find("option").each( function(){
				orgUnitJSON["dataSets"].push( { "id" : $(this).val(), "name" : $(this).text() } );
			});
		}
		
		if( attributeValues.length > 0 ){
			orgUnitJSON[ "attributeValues" ] = attributeValues;
		}
		
		return orgUnitJSON;
	};


	this.createOrgUnitAction = function( orgUnitsJSON, dialogFormTag, tableSubMsgTag, msg )
	{
		var queryURL_MetaData = _queryURL_api + "organisationUnits";
		
		// Need to pass the parent orgUnit code..?

		me.executeNetworkScript( "BeforeCreation", orgUnitsJSON, function( orgUnitsJSON ) 
		{

			RESTUtil.submitPostAsyn( "POST", orgUnitsJSON, queryURL_MetaData		
			, function( data )
			{

				if( data.response.importConflicts !== undefined )
				{
					dialogFormTag.unblock();
					var message = data.response.importConflicts[0].value;
					if( message.indexOf("message=") < 0 ){
						alert( message );
					}
					else
					{
						var startIdx = message.indexOf("message=") + 9;
						var endIdx = message.substring( startIdx, message.length ).indexOf( "'" );
						alert( message.substring( startIdx, endIdx ) );
					}
				}
				else
				{
					// Create JSON data for mapping
					var ouId = '';

					// Make it compatible for both DHIS 2.25 and 2.22
					if ( data.response.uid !== undefined ) ouId = data.response.uid;
					else if ( data.response.lastImported !== undefined ) ouId = data.response.lastImported;


					if ( ouId == '' )
					{
						// Display message
						MsgManager.msgAreaShow( 'There are some issue with orgUnit addition - uid not returned' );
					}
					else
					{
						orgUnitsJSON.id = ouId;	
						
						// Save relationship
						var networkGroupCount = 0;
						
						var ouGroupId = ( me.orgUnitInfo.isType_NetworkChild ) ? me.oProviderNetwork.networkData.networkChild_OUGroupID : me.oProviderNetwork.networkData.network_OUGroupID;
						

						if( ouGroupId !== undefined && ouGroupId != "" ){
							networkGroupCount++;
						}
						
						var selectedPrograms = me.selectedProgramAssignedOUTag.find("option[selectedOpt!='true']");
						var selectedDataSets = me.selectedDatasetAssignedOUTag.find("option[selectedOpt!='true']");
						me.dataRetrieveCount = selectedPrograms.length + selectedDataSets.length + networkGroupCount + orgUnitsJSON.organisationUnitGroups.length + 1;


						// Show loading message..
						tableSubMsgTag.find( 'div.loadingSubImg' ).show();
						tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Adding Programs, DataSets, OrgUnitGroups..' );


						// Add programs into selected OU
						selectedPrograms.each(function(){
							var programId = $(this).val();
							var programName = $(this).text();
							me.addProgramToOrgunit( ouId, programId, programName, orgUnitsJSON );
						});
						
						// Add datasets into selected OU
						selectedDataSets.each(function(){
							var datasetId = $(this).val();
							var datasetName = $(this).val();
							me.addDatasetToOrgunit( ouId, datasetId, datasetName, orgUnitsJSON );
						});
						
						var addedNetworkgroup = false;
					
						// Add org unit in selected OUG from Details tab
						$.each( orgUnitsJSON.organisationUnitGroups, function( i, item ){
							var groupId = item.id;
							var groupName = item.name;
							if( groupId == ouGroupId){
								addedNetworkgroup = true;
							}
							me.addOrgunitInGroup( ouId, groupId, groupName, orgUnitsJSON );
						});			
					
						// Add org unit in Network/NetworkChild OUGgroup				
						if( ouGroupId !== undefined && ouGroupId != "" && !addedNetworkgroup ){
							me.addOrgunitInGroup( ouId, ouGroupId, "", orgUnitsJSON );
						}
						else if( addedNetworkgroup ){
							me.dataRetrieveCount --;
						}
						
						me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
							

						// Display message
						MsgManager.msgAreaShow( 'Added the orgUnit' );
					}

					dialogFormTag.dialog( "close" );
				}

			}
			, function()
			{
				MsgManager.networkListingMsgShow( 'Failed to create the organisation unit!' );
			}
			, function() 
			{
				tableSubMsgTag.find( 'div.loadingSubImg' ).show();
				tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Adding OrgUnit Info..' );				
			}
			, function() 
			{ 
				if ( dialogFormTag !== undefined ) dialogFormTag.unblock(); 
			} 
			);

		} );

	};
	

	me.checkNapplyOrgUnitInDataTable = function( orgUnitsJSON )
	{
		me.dataRetrieveCount--;
			
		if( me.dataRetrieveCount <= 0 )
		{
			me.applyOrgUnitInDataTable( orgUnitsJSON );
			
			if( me.progressSuccess )
			{
				me.performFormClose();
			}
			else
			{
				me.dialogFormTag.unblock();
			}
		}		
	}

	me.applyOrgUnitInDataTable = function( orgUnitsJSON )
	{
		if(  me.mode == "Add" )
		{
			me.executeNetworkScript( "AfterCreation", orgUnitsJSON, function( orgUnitsJSON ) 
			{
				var ouId = ( me.orgUnitInfo.isType_Network ) ? orgUnitsJSON.id : me.parentOrgUnitTag.val();

				me.oProviderNetwork.dataListingTableManager.popupPivotOneOrgUnitData( ouId, me.mode );
			});
		}
		else if( me.mode == _mode_Edit )
		{
			// if 'openingDate' and 'closedDate', remove the time marker..
			//AppUtil.replaceObjectValue( orgUnitsJSON, me.dateEndingTimeZone );

			me.executeNetworkScript( "AfterUpdate", orgUnitsJSON, function( orgUnitsJSON ) 
			{
				var mainOU_Data = orgUnitsJSON;
			
				if( me.orgUnitInfo.isType_NetworkChild )
				{
					ouId = me.parentOrgUnitTag.val();
					var ouList = me.dataListingTableManager.pivotOrgUnitRetrieved_InMemory;

					if( Util.findItemFromList( ouList, "id", ouId ) != undefined )
					{
						mainOU_Data = Util.findItemFromList( ouList, "id", ouId );
						
						Util.RemoveFromArray( mainOU_Data.children, "id", orgUnitsJSON.id );
						
						mainOU_Data.children.push( orgUnitsJSON );	
						orgUnitsJSON.parent = mainOU_Data;
					}
				}
				
				me.oProviderNetwork.dataListingTableManager.popupPivotOneOrgUnitJsonData( orgUnitsJSON, me.mode, me.orgUnitInfo.networkTypeName );
			});
		}	
	}

	me.editOrgUnitAction = function( tableTag, dialogFormTag, tableSubMsgTag, msg )
	{
		var orgunitId = tableTag.attr( 'ouid' );

		var queryURL_MetaData = _queryURL_api + "organisationUnits/" + orgunitId;
		
		me.getOrgUnitInforAction( orgunitId, function( data )
		{
			var orgUnitsJSON = me.generateOrgUnit_MetaData( tableTag, _mode_Edit, data );
			
			me.executeNetworkScript( "BeforeUpdate", orgUnitsJSON, function( orgUnitsJSON ) 
			{

				RESTUtil.submitPostAsyn( "PUT", orgUnitsJSON, queryURL_MetaData
				, function( result )
				{
					me.progressSuccess = true;

					if( result.response.importConflicts !== undefined )
					{
						dialogFormTag.unblock();
						var message = data.response.importConflicts[0].value;
						if( message.indexOf("message=") < 0 ){
							alert( message );
						}
						else
						{
							var startIdx = message.indexOf("message=") + 9;
							var endIdx = message.substring( startIdx, message.length ).indexOf( "'" );
							alert( message.substring( startIdx, endIdx ) );
						}
					}
					else
					{
						var removePrograms = me.avalableProgramAssignedOUTag.find("option[selectedOpt='true']");
						var selectedPrograms = me.selectedProgramAssignedOUTag.find("option[selectedOpt!='true']");
						var removeDatasets = me.avalableDatasetAssignedOUTag.find("option[selectedOpt='true']");
						var selectedDataSets = me.selectedDatasetAssignedOUTag.find("option[selectedOpt!='true']");
						var removeOUGroups = me.avalableOUGroupAssignedOUTag.find("option[selectedOpt='true']");
						var selectedOUs = me.selectedOUGroupAssignedOUTag.find("option[selectedOpt!='true']");
						var ouGroupSetsLen = orgUnitsJSON.organisationUnitGroupAdded.length + orgUnitsJSON.organisationUnitGroupDeleted.length;
						me.dataRetrieveCount = selectedPrograms.length + selectedDataSets.length + selectedOUs.length + removePrograms.length + removeDatasets.length + removeOUGroups.length + ouGroupSetsLen;	
						

						// NOTE: Has a mechanizm to call the dataListing row Edit - only when everything is done.
						tableSubMsgTag.find( 'div.loadingSubImg' ).show();
						tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Removing Existing and Adding Programs, DataSets, OrgUnitGroups..' );


						// Delete programs into selected OU
						removePrograms.each(function(){
							var programId = $(this).val();
							var programName = $(this).text();
							me.deleteProgramToOrgunit( orgunitId, programId, programName, orgUnitsJSON );
						});
						
						// Add programs into selected OU
						selectedPrograms.each(function(){
							var programId = $(this).val();
							var programName = $(this).text();
							me.addProgramToOrgunit( orgunitId, programId, programName, orgUnitsJSON );
						});
						
						// Delete datasets into selected OU
						removeDatasets.each(function(){
							var datasetId = $(this).val();
							var datasetName = $(this).text();
							me.deleteDatasetToOrgunit( orgunitId, datasetId, datasetName, orgUnitsJSON );
						});
						
						// Add datasets into selected OU
						selectedDataSets.each(function(){
							var datasetId = $(this).val();
							var datasetName = $(this).text();
							me.addDatasetToOrgunit( orgunitId, datasetId, datasetName, orgUnitsJSON );
						});
						
						// Delete OUGs into selected OU
						removeOUGroups.each(function(){
							var groupId = $(this).val();
							var groupName = $(this).text();
							me.deleteOrgunitInGroup( orgunitId, groupId, groupName, orgUnitsJSON );
						});
						
						// Add OUGs into selected OU
						selectedOUs.each(function(){
							var groupId = $(this).val();
							var groupName = $(this).text();
							me.addOrgunitInGroup( orgunitId, groupId, groupName, orgUnitsJSON );
						});
						
						// Delete org unit in selected OUG from Details tab
						$.each( orgUnitsJSON.organisationUnitGroupDeleted, function( i, item ){
							var groupId = item.id;
							var groupName = item.name;
							me.deleteOrgunitInGroup( orgunitId, groupId, groupName, orgUnitsJSON );
						});
						
						// Add org unit in selected OUG from Details tab
						$.each( orgUnitsJSON.organisationUnitGroupAdded, function( i, item ){
							var groupId = item.id;
							var groupName = item.name;
							me.addOrgunitInGroup( orgunitId, groupId, groupName, orgUnitsJSON );
						});
																		
						me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
						
						
						// Display message
						MsgManager.msgAreaShow( _mode_Edit + ' the orgUnit performed.' );

					}
				}
				, function()
				{
					MsgManager.msgAreaShow( "Failed to update the organisation unit!" );
				}
				, function() 
				{
					tableSubMsgTag.find( 'div.loadingSubImg' ).show();
					tableSubMsgTag.find( 'div.loadingSubMsg' ).text( ' - Editing OrgUnit Info..' );			
				}
				, function() 
				{ 
					if ( dialogFormTag !== undefined ) dialogFormTag.unblock(); 
				} 
				)
			});
		});
	};

	me.addProgramToOrgunit = function( ouId, programId, programName, orgUnitsJSON ){
		var url = _queryURL_api + "programs/" + programId + "/organisationUnits/" + ouId;
		RESTUtil.submitData_URL( url
		, function( result )
		{
			console.log( "Added organisation unit " + ouId + " to " + programId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			alert( "Failed to add program '" + programName + "' to the orgUnit.  Error Msg: " + result.responseJSON.message );
		});
	};

	me.deleteProgramToOrgunit = function( ouId, programId, programName, orgUnitsJSON ){
		var url = _queryURL_api + "programs/" + programId + "/organisationUnits/" + ouId;
		RESTUtil.submitDeleteData_URL( url
		, function( result )
		{
			console.log( "Deleted organisation unit " + ouId + " to " + programId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			alert( "Failed to delete program '" + programName, + "' from the orgUnit.  Error Msg: " + result.responseJSON.message );
		});
	};

	me.addDatasetToOrgunit = function( ouId, dataSetId, dataSetName, orgUnitsJSON ){
		var url = _queryURL_api + "dataSets/" + dataSetId + "/organisationUnits/" + ouId;
		RESTUtil.submitData_URL( url
		, function( result )
		{
			console.log( "Added organisation unit " + ouId + " to " + dataSetId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			alert( "Failed to add dataSet '" + dataSetName + "' to the orgUnit.  Error Msg: " + result.responseJSON.message );
		});
	};

	me.deleteDatasetToOrgunit = function( ouId, dataSetId, dataSetName, orgUnitsJSON ){
		var url = _queryURL_api + "dataSets/" + dataSetId + "/organisationUnits/" + ouId;
		RESTUtil.submitDeleteData_URL( url
		, function( result )
		{
			console.log( "Deleted organisation unit " + ouId + " to " + dataSetId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			alert( "Failed to delete dataSet '" + dataSetName + "' from the orgUnit.  Error Msg: " + result.responseJSON.message );
		});
	};

	me.addOrgunitInGroup = function( ouId, groupId, groupName, orgUnitsJSON )
	{
		var url = _queryURL_api + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;
		
		RESTUtil.submitData_URL( url
		, function( result )
		{
			console.log( "added organisation unit " + ouId + " to org unit group " + groupId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			var errorTag = me.orgUnitAddTabTag.find( "select[class*=ougs_] option[value='" + groupId + "']" ).closest( "select" );
			Util.paintWarning( errorTag );
			alert( "Failed to add orgUnitGroup '" + groupName + "' to the orgUnit.  Error Msg: " + result.responseJSON.message );
		});

	};
	
	me.deleteOrgunitInGroup = function( ouId, groupId, groupName, orgUnitsJSON ){
		var url = _queryURL_api + "organisationUnitGroups/" + groupId + "/organisationUnits/" + ouId;
		RESTUtil.submitDeleteData_URL( url
		, function( result )
		{
			console.log( "Deleted organisation unit " + ouId + " to " + groupId );
			me.checkNapplyOrgUnitInDataTable( orgUnitsJSON );
		}
		, function( result )
		{
			me.progressSuccess = false;
			var errorTag = me.orgUnitAddTabTag.find( "select[class*=ougs_] option[value='" + groupId + "']" ).closest( "select" );
			Util.paintWarning( errorTag );
			alert( "Failed to delete orgUnitGroup '" + groupName + "' from the orgUnit.  Error Msg: " + result.responseJSON.message );
		});
	};
	
	me.getOrgUnitInforAction = function( orgunitId, doneFunc )
	{
		var queryURL_MetaData = _queryURL_api + "organisationUnits/" + orgunitId + ".json?fields=*,parent[id,name,level],parents[id,name,level],ancestors[id,name,level]";

		RESTUtil.getAsynchData( queryURL_MetaData
		,function( data )
		{
			AppUtil.copyAncestorsToParents_Single( data );	

			doneFunc( data );
		}
		);
	};
	
	me.retrieveOrgUnitData = function( ouId, tag, msg, runFunc )
	{
		RESTUtil.getAsynchData( _queryURL_OrgUnit + '/' + ouId + '.json?fields=*,organisationUnitGroups[name,id],dataSets[name,id],children[name,id],programs[name,id],parent[id,name,level],parents,ancestors[name,id]'
		, function( json_Data )
		{
			AppUtil.copyAncestorsToParents_Single( json_Data );

			runFunc( json_Data );
		}
		, function() {}
		, function() { if ( tag !== undefined ) tag.block( msg ); }
		, function() { 
			if ( tag !== undefined ) tag.unblock(); 
		}
		);			
	};

	
	// -- Org Unit Related Methods ----
	// --------------------------------


	// --------------------------------
	// -- Org Unit Events Related -----


	me.setup_mandatoryFieldWarning = function( tableTag )
	{
		console.log( 'SETTING UP THE MANDATORY FIELDS!' );


		var inputTags = tableTag.find( 'input[mandatory="true"],select[mandatory="true"]' ).not( '#parentOrgUnitSearch' );
		// Since parent has 2 error check, mandatory & proper selection
		// We need to skip this and handle it else where..
		// --- Or handle it inteligently?

		inputTags.on( 'change focusout', function()
		{
			var tag = $( this );
			
			if( Util.trim( tag.val() ) == "" )
			{
				Util.paintWarning( tag );
			}
			else
			{
				Util.paintClear( tag );
			}
		});
	};


	// -- Org Unit Related Methods ------
	// ----------------------------------



	// ----------------------------------------------
	// -- Map Related Methods -----------------------

	me.setGmapMenu = function( mapTag )
	{
		var menu = new Gmap3Menu( mapTag );

		menu.add( "Set Location Here", "setLocationHere", function()
		{ 
			//var newLoc = new google.maps.LatLng( me.currentEvent.latLng.lat(), me.currentEvent.latLng.lng() );
			
			//me.setLocation( newLoc );

			//me.renderMap();

			menu.close(); 
		});

		return menu;
	};

	me.getCountryBounds = function( countryBounds, countryInfo )
	{
		if ( countryBounds[countryInfo.id] === undefined )
		{
			countryBounds[countryInfo.id] = me.getBounds( countryInfo.shape );
		}

		return countryBounds[countryInfo.id];
	};


	me.setMapCenter = function( coordinateLatLng, placeInfo )
	{
		if ( me.map !== undefined && coordinateLatLng !== undefined )
		{
			mapOpt_Center = coordinateLatLng;
			zoomLevel = me.mapZoomLevel;

			var intervalCount = 0; 
			
			// Check the map loaded and perform the zoom, centering, marker drop
			var mapLoadedCheckInterval = setInterval( function() 
			{ 
				intervalCount++;

				if ( me.mapLoaded )
				{
					console.log( 'Map Loaded before Interval finishes: ' + intervalCount );

					clearInterval( mapLoadedCheckInterval );


					// Also think about Line 2380 - Set map bounds
					setTimeout( function() 
					{ 
						me.map.setZoom( zoomLevel );
						me.map.setCenter( coordinateLatLng ); 
						
						if ( placeInfo !== undefined )
						{
							me.setMapMainMarker( mapOpt_Center, placeInfo.name, placeInfo );
						}
						else
						{
							me.setMapMainMarker( mapOpt_Center, 'Current OrgUnit Coordinate' );
						}					
					}, 100 );


				}
				else if ( intervalCount >= 15 )
				{
					console.log( 'MapLoading Interval expired: ' + intervalCount );

					clearInterval( mapLoadedCheckInterval );
				}
			}, 300 );
		}
	};


	me.isGoogleMapAvailable = function()
	{
		return ( typeof google === 'object' && typeof google.maps === 'object' );
	}
	

	me.mapSetup = function( countryInfo, mode ) //centerLoc )
	{
		// 1. Initialize and Set Map
		me.resetMarkers();

		// Google map offline check
		// - try catch, typeof
		if ( me.isGoogleMapAvailable() ) 
		{
			me.mapLoaded = false;


			// Map Create
			me.mapTag.gmap3({
				map:{
					options: {
						mapTypeId: google.maps.MapTypeId.ROADMAP
						,streetViewControl: false
					}
				}
			});

			// Get google map reference from gmap3
			me.map = me.mapTag.gmap3( 'get' );

			// Map click - marker drop setup.
			if ( mode != _mode_View ) me.setUp_MapClick( me.map );

			
			// Create a map loaded event.
			google.maps.event.addListenerOnce( me.map, 'tilesloaded', function()
			{
				me.mapLoaded = true;
				// Also, 'idel' event exists..
			});


			// Get country Bounds and handle ....
			var countryBounds = me.getCountryBounds( me.countryBounds, countryInfo );

			if ( countryBounds === undefined ) $( '#divCountryBoundaryNotReady' ).show();
			else
			{
				// Set map bounds - 'setTimeout' is used for 2nd call bound issue.
				setTimeout( function() { me.map.fitBounds( countryBounds ); }, 1 ); 

				// 2. SearchBox Set
				me.searchBox = new google.maps.places.SearchBox( me.searchAddressTag[0] );

				me.searchBox.setBounds( countryBounds );

				google.maps.event.addListener( me.searchBox, 'places_changed', function( btnClicked ) 
				{
					if ( btnClicked !== undefined && btnClicked == 'btnClicked' )
					{
						me.runLocationSearch( me.searchBox, me.map );
					}
				});
			}
		}
	};


	me.runLocationSearch = function( searchBox, map )
	{
		if ( searchBox !== undefined )
		{
			var places = searchBox.getPlaces();

			if ( places === undefined || places.length == 0 ) return;
			else if ( places.length == 1 )
			{
				// if found only one, go to that place.
				var place = places[0];
				
				var latLng = place.geometry.location;

				me.setMapCenter( latLng, place );
			}
			else
			{
				me.resetMarkers();

				var bounds = new google.maps.LatLngBounds();
			
				for ( var i = 0, place; place = places[i]; i++ ) 
				{
					// Create a marker for each place.
					var marker = new google.maps.Marker({
						map: map,
						icon: 'img/blue.png',
						title: place.name,
						position: place.geometry.location,
						placeInfo: place
					});

					// Is not working properly..
					me.setUp_MarkerClick( marker );

					me.markers.push( marker );

					bounds.extend( place.geometry.location );
				}

				map.fitBounds( bounds );
			}
		}
	};


	// ---------------------------------------
	// --- Get Bounds Related ----------------

	me.getBounds = function( countryCoordinate )
	{
		var countryCoord_JSON = eval( countryCoordinate );

		var bounds = new google.maps.LatLngBounds(); 

		var resultData = new Array();
		var boundary = { top: undefined , bottom: undefined , left: undefined , right: undefined };

		me.arrayDataGet( countryCoord_JSON, resultData, boundary );

		$.each( resultData, function( i_coord, item_coord )
		{
			bounds.extend( new google.maps.LatLng( item_coord.lat, item_coord.lng ) );
		});

		
		if ( resultData.length == 0 )
		{
			// if the country boundary is still not available, set it as 'undefined'!!
			return undefined;
		}
		else
		{
			return bounds;
		}


		// Bounds - (south-west latitude, longitude),(north-east latitude, longitude)			
		//return new google.maps.LatLngBounds(
		//	 new google.maps.LatLng( boundary.bottom, boundary.left ), 
		//	 new google.maps.LatLng( boundary.top, boundary.right ) );

	};

	me.arrayDataGet = function( arrayData, resultData, boundary )
	{
		if ( me.checkCoordinate( arrayData ) )
		{
			// in DHIS, latitude and longitude order is switched.
			var latData = arrayData[1];
			var lngData = arrayData[0];

			resultData.push( { lat: latData, lng: lngData } );

			if ( boundary.top === undefined || boundary.top < latData ) boundary.top = latData;

			if ( boundary.bottom === undefined || boundary.bottom > latData ) boundary.bottom = latData;

			if ( boundary.right === undefined || boundary.right < lngData ) boundary.right = lngData;

			if ( boundary.left === undefined || boundary.left > lngData ) boundary.left = lngData;

		}
		else if ( $.isArray( arrayData ) )
		{
			$.each( arrayData, function( i, item )
			{
				me.arrayDataGet( item, resultData, boundary );
			});
		}
		else
		{
			//alert( "We don't have boundary for this country yet");
		}
	};

	me.checkCoordinate = function( data )
	{
		if ( $.isArray( data ) && data.length == 2 && typeof data[0] === 'number' && typeof data[1] === 'number' )
		{
			return true;
		}
		else
		{
			return false;
		}
	};

	// --- Get Bounds Related ----------------
	// ---------------------------------------


	// ---------------------------------------------
	// --- Map Click Related --------------------

	me.setUp_MapClick = function( map )
	{
		if( !me.device_Mobile )
		{
			google.maps.event.addListener( map, 'rightclick', function( event ) 
			{
				me.setMapMainMarker( event.latLng, 'User Clicked Place' );
			});
		}
		else
		{
			alert( 'Mobile Interface Not Yet Properly Implemented' );

			// Set Long Hold Click here - on mobile.
			google.maps.event.addListener( marker, 'mousedown', function() 
			{
				console.log( 'mouse down' );
			});

			google.maps.event.addListener( marker, 'mouseup', function() 
			{
				console.log( 'mouse up' );
			});

			google.maps.event.addListener( marker, 'drag', function() 
			{
				console.log( 'drag' );
			});
		}
	};
	
	me.remove_MapClick = function( map )
	{
		if( !me.device_Mobile )
		{
			google.maps.event.clearListeners( me.map, 'rightclick' );
		}
		else
		{
			google.maps.event.clearListeners( me.map, 'mousedown' );
			google.maps.event.clearListeners( me.map, 'mouseup' );
			google.maps.event.clearListeners( me.map, 'drag' );
		}
	};

	// --- Map Click Related --------------------
	// ---------------------------------------------


	// ---------------------------------------------
	// --- Marker Click Related --------------------

	me.setUp_MarkerClick = function( marker )
	{

		// if device is not mobile, but normal computer browser
		// enable right click menu open
		if( !me.device_Mobile )
		{
			google.maps.event.addListener( marker, 'rightclick', function() 
			{
				marker.setIcon( me.redIcon );

				me.populatePlaceInfo( marker.placeInfo, me.mode );

				// Make all other ones as blue - not selected color.
				me.setOtherMarkersBlue( marker, me.markers );

			});

			google.maps.event.addListener( marker, 'click', function() 
			{
				// TODO: Any Interaction when clicked?  Popup?  Follow Google interaction if possible.
			});

		}
		else
		{
			alert( 'Mobile Interface Not Yet Properly Implemented' );

			// Set Long Hold Click here - on mobile.
			google.maps.event.addListener( marker, 'mousedown', function() 
			{
				console.log( 'mouse down' );
			});

			google.maps.event.addListener( marker, 'mouseup', function() 
			{
				console.log( 'mouse up' );
			});

			google.maps.event.addListener( marker, 'drag', function() 
			{
				console.log( 'drag' );
			});
		}
	};
	
	
	me.setOtherMarkersBlue = function( marker, markers )
	{
		$.each( markers, function( i_mk, item_mk )
		{
			if ( !item_mk.position.equals( marker.position ) )
			{
				item_mk.setIcon( me.blueIcon );
			}
		});
	}

	
	me.removeMarker = function( marker, markers )
	{
		var index;

		$.each( markers, function( i_marker, item_marker )
		{
			if ( item_marker == marker )
			{
				index = i_marker;

				item_marker.setMap( null );
			}
		});

		if ( index !== undefined )
		{
			markers.splice( index, 1 );
		}
	};


	// --- Marker Click Related --------------------
	// ---------------------------------------------

	me.setMapMainMarker = function( latLng, input_title, input_place )
	{
		var marker;

		if ( input_title === undefined ) input_title = '';

		me.spanCoordinateInfoTag.text( me.getShapeStr( me.shape_Point ) );

		me.ouCoordinatesTag.val( latLng.lng() + "," + latLng.lat() );

		if ( me.map !== undefined )
		{
			marker = new google.maps.Marker({
				map: me.map,
				title: input_title,
				icon: me.redIcon,
				animation: google.maps.Animation.DROP,
				position: latLng,
				action: 'marked'
			});

			if ( input_place !== undefined ) marker.placeInfo = input_place;

			if ( marker !== undefined )
			{
				// Clear all other markers..
				me.resetMarkers();

				me.markers.push( marker );

				me.populatePlaceInfo( marker.placeInfo, me.mode );
			}
		}

		return marker;
	}

	me.resetMarkers = function()
	{
		for ( var i = 0, marker; marker = me.markers[i]; i++ ) 
		{
			marker.setMap( null );
		}

		// For each place, get the icon, place name, and location.
		me.markers = [];
	};


	me.populatePlaceInfo = function( place, mode )
	{
		if ( place !== undefined )
		{
			if( mode == 'Add' )
			{
				var nameTag = me.orgUnitAddTabTag.find( 'input.ouAdd_name' );
				var shortNameTag = me.orgUnitAddTabTag.find( 'input.ouAdd_shortName' );
				var addressTag = me.orgUnitAddTabTag.find( 'input.ouAdd_address' );
				var featureTypeTag =  me.orgUnitAddTabTag.find(".ouAdd_featureType");
				var phoneNumberTag =  me.orgUnitAddTabTag.find(".ouAdd_phoneNumber");
				var urlTag =  me.orgUnitAddTabTag.find(".ouAdd_url");
				
				addressTag.val( Util.getNotEmpty( place.formatted_address ) );


				// Populate Tags from Place Info..
				nameTag.val( Util.getNotEmpty( place.name ) );
				shortNameTag.val( ( Util.getNotEmpty( place.name ) ).substring(0, 50) );

				me.customer_phoneTag.val( place.international_phone_number );
				//place.formatted_phone_number
				//place.international_phone_number
				
				featureTypeTag.val( me.getShapeStr( me.shape_Point ) );
				addressTag.val( place.formatted_address );
				phoneNumberTag.val( place.international_phone_number );
				urlTag.val( place.website );		
			}
			
			me.ouCoordinatesTag.val( place.geometry.location.lng() + "," + place.geometry.location.lat() );			
		}		
	};

	me.setup_orgUnitDynamicAttributeRows = function( attributes )
	{
		var tableTag = me.orgUnitAddTabTag;

		$.each( attributes, function( i_attr, item_attr )
		{
			var trRow = $( '<tr attrid="' + item_attr.id + '"><td>' + item_attr.displayName + '</td><td>' + me.getControlByAttributeType( item_attr ) + '</td></tr>' );

			tableTag.append( trRow );
		});


		// Add calendar setting here
		tableTag.find( 'input.datepicker' ).datepicker( { dateFormat: "yy-mm-dd" } );

	};


	me.getControlByAttributeType = function( attr )
	{
		var output = "";

		if ( attr.valueType == 'bool' || attr.valueType == 'BOOLEAN' )
		{
			output = '<select class="ouAdd_dynamicAttr" attrtype="' + attr.valueType + '" attrid="' + attr.id + '"><option value="Yes">Yes</option><option value="No">No</option></select>';
		}
		else
		{
			var otherClasses = "";				
			if ( attr.valueType == 'date' ) otherClasses += ' datepicker';

			output = '<input type="text" class="ouAdd_dynamicAttr' + otherClasses + ' ouForm" attrtype="' + attr.valueType + '" attrid="' + attr.id + '" />';
		}

		return output;
	};


	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();
}

// -------------------------------------------
// OrgUnit Map Popup2 Class

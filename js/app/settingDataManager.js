

var _sectionName_General = "General";
var _listDisplayName_General = "GLOBAL SETTINGS";

// =============================================
// --- Classes in this file --------------------
//
//		- SettingDataPopupForm <-- The main popup UI class
//		- NetworkRenamePopupForm <-- network rename popup form
//		- SystemSettingDataManager <-- Setting Data Manager class
//		- PNSettingDataManager() <-- Static Network Listing Data Manager class
//
//		- ScriptDataManagerForm <-- The script Management UI form class
//		- PNScriptDataManager() <-- Static Network Listing Script Data Manager class
//
//		- HtmlPartDataManagerForm <-- The htmlPart Management UI form class
//		- PNHtmlPartDataManager() <-- Static Network Listing HtmlPart Data Manager class
//
// ==============================================


// =============================================
// Class - SettingDataPopupForm
//		- Used for popup Setting Form

function SettingDataPopupForm( oProviderNetwork, settingDialogDiv, systemSettingDataManager )
{
	var me = this;

	me.oProviderNetwork = oProviderNetwork;
	me.systemSettingDataManager = systemSettingDataManager;
	me.dialogFormTag = settingDialogDiv;
	me.networkRenamePopupForm;

	me.scriptDataManagerForm;
	me.scriptDataManager;

	me.htmlTabDataManagerForm;
	me.htmlTabDataManager;


	me.width = me.dialogFormTag.attr( 'formWidth' );
	me.height = me.dialogFormTag.attr( 'formHeight' );

	// --- Tags -------------
	me.settingDataEditLinkDivTag = $( '#settingDataEditLinkDiv' );
	me.settingDataClearLinkDivTag = $( '#settingDataClearLinkDiv' );
	me.settingDataEditLinkTag = $( '#settingDataEditLink' );
	me.settingDataClearLinkTag = $( '#settingDataClearLink' );

	me.settingDataEditDivTag = $( '#settingDataEditDiv' );
	me.settingDataEditTag = $( '#settingDataEdit' );
	me.settingDataEdit_SaveTag = $( '#settingDataEdit_Save' );
	me.settingDataEdit_CancelTag = $( '#settingDataEdit_Cancel' );

	me.mainSecTag = $( '#mainSec' );

	me.settingModeTag = $( '#settingMode' );

	me.sectionListTag = $( '#sectionList' );
	me.btnAddNetworkTag = $( '#btnAddNetwork' );

	me.tdNetworkAddTag = $( '#tdNetworkAdd' );
	me.networkNameTag = $( '#networkName' );
	me.btnCreateSectionTag = $( '#btnCreateSection' );
	me.btnCreateSection_CancelTag = $( '#btnCreateSection_Cancel' );

	me.divSettingMainContentTag = $( '#divSettingMainContent' );

	//me.settingsTableTag = $( '#settingsTable' );

	me.tblNetworkSettingTags = me.divSettingMainContentTag.find( '.tblNetworkSetting' );

	me.tblNetworkDetailsTag = me.divSettingMainContentTag.find( '.tblNetworkDetails' );
	me.tblNetworkAttributesTag = me.divSettingMainContentTag.find( '.tblNetworkAttributes' );
	me.tblNetworkChildAttributesTag = me.divSettingMainContentTag.find( '.tblNetworkChildAttributes' );
	me.tblNetworkScriptsTag = me.divSettingMainContentTag.find( '.tblNetworkScripts' );

	me.divNetworkChildAttributesTag = me.divSettingMainContentTag.find( '.divNetworkChildAttributes' );
	me.divNetworkChildAttributesHideNoteTag = me.divSettingMainContentTag.find( '.divNetworkChildAttributesHideNote' );

	
	me.saveSettingDataBtnTag = $( '#save_SettingData' );


	me.divNetworkSettingSectionTag = $( '#divNetworkSettingSection' );
	//me.divSectionModifyTag = $( '#divSectionModify' );

	me.divDeleteSectionTag = $( '#divDeleteSection' );
	me.deleteSectionBtnTag = $( '#deleteSection' );

	me.divSecuritySectionTag = $( '#divSecuritySection' );
	me.securitySectionBtnTag = $( '#securitySection' );

	me.divSettingDataChangedTag = $( '#divSettingDataChanged' );

	me.divNetworkRenameSectionTag = $( '#divNetworkRenameSection' );
	me.btnNetworkRenameShowTag = $( '#btnNetworkRenameShow' );
	
	me.networkSettingTabsTag = $( "#networkSettingTabs" );


	// --- Variables -------------------

	me.settingData;
	me.viewList_StaticName = "viewList";

	me.generalAttributes = { 'Network_Attr': [], 'NetworkChild_Attr': [] };
	me.generalData = {};  // 'countryLvl' = '3', 'analytics' = 'Enable'

	me.changeMade = false;

	me.section_Previous = "";

	// -----------------------------
	// -- Methods ------------------

	// ----------------------------------------------------------------
	// ------------ Initial Setup and Open/Reset Methods --------------

	// Initial Setup Call
	me.initialSetup = function()
	{				
		me.FormPopupSetup();

		me.tabbingSetup();

		me.resetDisplay();

		// Set up Event Handlers
		me.setup_Events();

		// Set visibility by user permission
		me.setVisibility_ByUserPermission( me.oProviderNetwork.getUserPermission_Authorities() );

		// Instantiate the associated classes
		me.networkRenamePopupForm = new NetworkRenamePopupForm( me );

		// advanced Setup allow
		me.setUp_SettingDataEdit();


		// SetUp Script Data Manage Related (Form and dataManager)
		me.scriptDataManagerForm = new ScriptDataManagerForm( me.oProviderNetwork );
		me.scriptDataManager = me.scriptDataManagerForm.scriptDataManager;

		// SetUp Html Parts Data Manage Related (Form and dataManager)
		me.htmlTabDataManagerForm = new HtmlTabDataManagerForm( me.oProviderNetwork );
		me.htmlTabDataManager = me.htmlTabDataManagerForm.htmlTabDataManager;

	}

	// ------------------------------------------------------

	me.openForm = function( selectedNetworkVal )
	{
		me.dialogFormTag.show();

		me.resetDisplay();
		me.resetData();


		// Retrieve and Populate Data to HTML
		me.retrieveAndPopulate( function()
		{
			me.dialogFormTag.dialog( "open" );

			// Default 'SettingMode' selection when opening the form.
			me.settingModeTag.val( 'network' ).change();

			me.sectionListTag.focus().val( selectedNetworkVal ).change();
		});
	}


	me.retrieveAndPopulate = function( returnFunc )
	{
		// Step 0. Initialize Table
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			me.populateSectionList( me.sectionListTag, settingData );

			me.getAndMemorizeGeneralData( settingData );

			// Initially, show the 'General'
			//me.populateNetworkSettingTables( me.tblNetworkSettingTags, settingData, _sectionName_General );

			if ( returnFunc !== undefined ) returnFunc();
		});
	}

	me.resetDisplay = function()
	{
		me.mainSecTag.show();
		me.settingDataEditDivTag.hide();

		me.networkNameTag.val( '' );
		me.tdNetworkAddTag.hide();

		me.divSettingDataChangedTag.hide();

		// if 'Saving Data' does not exists, create one..
		var divNetworkSettingLoadingTag = $( '#divNetworkSettingLoading' );

		if ( divNetworkSettingLoadingTag.length == 0 )
		{
			divNetworkSettingLoadingTag = $( '<div id="divNetworkSettingLoading" class="ui-dialog-buttonset" style="display:none; margin-top: 10px; margin-right: 10px; "><img src="img/ui-anim_basic.gif"/> <span style="color: #777;">Saving Data.. Please Wait..</span></div>' );
				
			divNetworkSettingLoadingTag.insertAfter( me.dialogFormTag.closest( 'div.ui-dialog' ).find( '.ui-dialog-buttonset' ) );
		}
	}

	me.resetData = function()
	{
		me.section_Previous = "";

		// Mode temp data initialize..
		me.changeMade = false;
	}


	me.FormPopupSetup = function()
	{
		// -- Set up the form ---
		me.dialogFormTag.dialog( 
		{
			autoOpen: false
			//,dialogClass: "noTitleClose"
			,width: me.width
			,height: me.height				  
			,modal: true
			,title: "Settings"
			,buttons: {
				"Close": function() 
				{
					me.closeButtonClickAction();
				}
			 }
		});		
	}

	// ------------ Initial Setup and Open/Reset Methods --------------
	// ----------------------------------------------------------------

	me.closeButtonClickAction = function()
	{
		me.checkNetworkMandatory( undefined, function()
		{
			me.resetNetworkList( me.changeMade );

			me.dialogFormTag.dialog( "close" );
		});
	}


	me.checkNetworkMandatory = function( section_Previous, successFunc, failFunc )
	{
		// if previous one is empty one, do not need to check mandatory - since form is cleared..
		if ( section_Previous !== undefined && section_Previous == "" )
		{
			successFunc();
		}
		else
		{
			// If the network selection is empty, and content div is already hidden (originally hidden case (including deleted case), do not check for mandatory validation
			if (  me.sectionListTag.val() == "" && !me.divSettingMainContentTag.is( ':visible' ) )
			{
				successFunc();
			}
			else
			{
				var mandatoryFields = me.divSettingMainContentTag.find( 'input[mandatory="true"],select[mandatory="true"]' ).filter( function() { return $( this ).closest( 'tr' ).css( 'display' ) != 'none'; } );


				// Clear the highlights
				Util.paintClear( mandatoryFields );


				// if empty mandatory fields exists, paint it and do not returnFunc
				var emptyMandatories = mandatoryFields.filter( function() { return ( !$( this ).prop( 'disabled' ) && $( this ).val() == "" ); } );


				if ( emptyMandatories.length > 0 ) 
				{
					Util.paintWarning( emptyMandatories );

					// Set to 'Network Setup' tab
					me.divSettingMainContentTag.find( 'li[code="details"] a.tabAnchor' ).click();

					// Pull back to previous one..
					if ( section_Previous !== undefined )
					{
						me.sectionListTag.val( section_Previous );
					}


					alert( 'Please fill mandatory fields before closing/changing the network!' );


					if ( failFunc !== undefined ) failFunc();
				}
				else 
				{
					successFunc();
				}
			}
		}
	}


	me.resetNetworkList = function( changeMade )
	{
		me.getSectionList( function( sectionNetworkList )
		{
			// Reset the Network Selection only if there were changes on 'Setting'
			if ( changeMade )
			{
				me.oProviderNetwork.populateNetworkList( sectionNetworkList );

				me.oProviderNetwork.sectionNetworkListTag.change();
			}
		});
	}


	// ------------------------------------------------------
	// ----------------- Exposed Methods -------------------

	me.getNetworkData = function( secCode, returnFunc )
	{

		var networkData = {};

		me.getPrepareData_ForNetworkData( secCode, function( secData_General, sectionObj, scriptDataList, htmlTabList )
		{
			var secData = sectionObj.data;

			// CountryInfo
			var countryInfo = {};

			countryInfo.level = Number( me.getValueByType( "Country_LVL", secData_General ) );
			countryInfo.id = Util.getNotEmpty( me.getValueByType( "CountryID", secData ) );
			countryInfo.shape = ( sectionObj.countryInfo !== undefined ) ? sectionObj.countryInfo.shape : undefined ;
			countryInfo.name = ( sectionObj.countryInfo !== undefined ) ? sectionObj.countryInfo.name : "";

			// Network data.
			networkData.countryInfo = countryInfo;

			networkData.Network_LVL = Number( me.getValueByType( "Network_LVL", secData ) );
			networkData.NetworkChild_LVL = networkData.Network_LVL + 1;

			networkData.useNetworkChild = ( Util.getNotEmpty( me.getValueByType( "NetworkChild_Use", secData ) ) == "Y" ) ? true : false;
			networkData.network_OUGroupID = Util.getNotEmpty( me.getValueByType( "Network_OUGroup", secData ) );
			networkData.networkChild_OUGroupID = Util.getNotEmpty( me.getValueByType( "NetworkChild_OUGroup", secData ) );


			networkData.orgUnitLevels = me.getOrgUnitLevelRanges( countryInfo.level, networkData.Network_LVL, networkData.useNetworkChild, networkData.NetworkChild_LVL );


			networkData.coordinateMapShow = Util.getNotEmpty( me.getValueByType( "CoordinateMapShow", secData ) );
			networkData.oUGroupsTabShow = Util.getNotEmpty( me.getValueByType( "OUGroupsTabShow", secData ) );
			networkData.programsDataSetsTabShow = Util.getNotEmpty( me.getValueByType( "ProgramsDataSetsTabShow", secData ) );
			networkData.analytics = Util.getNotEmpty( me.getValueByType( "Analytics", secData ) );


			// TODO:  <-- THESE (scripts, htmlTabs (and even country info ) should be retreived on demand.
			//		- From orgUnit Popup!!   So that if popup is not called, it does not get loaded.
			networkData.scripts = me.convertToActionScripts( scriptDataList, Util.getFromList( secData, "Script", "type" ) );

			networkData.htmlTabs = me.convertToHtmlTabs( htmlTabList, scriptDataList, Util.getFromList( secData, "Network_HtmlTab", "type" ), Util.getFromList( secData, "NetworkChild_HtmlTab", "type" ) );


			returnFunc( networkData );

		});
	}


	me.getPrepareData_ForNetworkData = function( secCode, returnFunc )
	{
		me.getSection( _sectionName_General, function( sectionObj_General )
		{
			var secData_General = sectionObj_General.data;

			me.getSection( secCode, function( sectionObj )
			{
				me.scriptDataManager.getSettingData( function( scriptDataList )
				{
					me.htmlTabDataManager.getSettingData( function( htmlTabList )
					{
						returnFunc( secData_General, sectionObj, scriptDataList, htmlTabList );
					});
				});
			});
		});
	}


	// ---------------------------------------------------------------------------


	me.convertToHtmlTabs = function( htmlTabList, scriptDataList, network_HtmlTabs, networkChild_HtmlTabs )
	{			
		var data = { "Network_HtmlTabs":[], "NetworkChild_HtmlTabs":[] };
		
		if ( network_HtmlTabs !== undefined )
		{
			$.each( network_HtmlTabs.HtmlTabData, function( i_ht, item_ht )
			{
				data.Network_HtmlTabs.push( { "name": item_ht.name
					, "value": me.getActionListContent( item_ht.value, htmlTabList )
					, "script": me.getActionListContent( item_ht.script, scriptDataList ) } );
			});
		}


		if ( networkChild_HtmlTabs !== undefined )
		{
			$.each( networkChild_HtmlTabs.HtmlTabData, function( i_ht, item_ht )
			{
				data.NetworkChild_HtmlTabs.push( { "name": item_ht.name
					, "value": me.getActionListContent( item_ht.value, htmlTabList )
					, "script": me.getActionListContent( item_ht.script, scriptDataList ) } );
			});
		}

		//console.log( 'convertToHtmlTabs Data: ' + JSON.stringify( data ) );

		return data;
	}


	// MOVE TO PROPER LOCATION
	me.convertToActionScripts = function( scriptDataList, item )
	{
		var actionScripts = Util.getDeepCopy( PNSettingDataManager.scriptData_Initial );	
		

		if ( item !== undefined )
		{
			//console.log( 'actionScripts: ' + JSON.stringify( actionScripts ) );
			//console.log( '-------------------------' );
			//console.log( 'me.convertToActionScripts, item: ' + JSON.stringify( item ) );

			if ( item.NetworkScripts !== undefined )
			{
				actionScripts.NetworkScripts.BeforeCreation = me.getActionListContent( item.NetworkScripts.BeforeCreation, scriptDataList );

				actionScripts.NetworkScripts.AfterCreation = me.getActionListContent( item.NetworkScripts.AfterCreation, scriptDataList );

				actionScripts.NetworkScripts.BeforeUpdate= me.getActionListContent( item.NetworkScripts.BeforeUpdate, scriptDataList );

				actionScripts.NetworkScripts.AfterUpdate = me.getActionListContent( item.NetworkScripts.AfterUpdate, scriptDataList );
			}

			if ( item.NetworkChildScripts !== undefined )
			{
				actionScripts.NetworkChildScripts.BeforeCreation = me.getActionListContent( item.NetworkChildScripts.BeforeCreation, scriptDataList );

				actionScripts.NetworkChildScripts.AfterCreation = me.getActionListContent( item.NetworkChildScripts.AfterCreation, scriptDataList );

				actionScripts.NetworkChildScripts.BeforeUpdate= me.getActionListContent( item.NetworkChildScripts.BeforeUpdate, scriptDataList );

				actionScripts.NetworkChildScripts.AfterUpdate = me.getActionListContent( item.NetworkChildScripts.AfterUpdate, scriptDataList );
			}
		}
		else
		{
			console.log( 'script is missing for this network' );
		}

		return actionScripts;
	}


	me.getActionListContent = function( itemId, dataList )
	{
		var content = "";

		if ( itemId != "" )
		{
			var htmlTabData = Util.getFromList( dataList, itemId, "id" );

			if ( htmlTabData !== undefined )
			{
				content = htmlTabData.value;
			}
		}

		return content;
	}



	me.getOrgUnitLevelRanges = function( countryLevel, networkLevel, useNetworkChild, networkChildLevel )
	{
		var orgUnitLevels = [];

		// If country level exists, push the orgUnit level range up to network level.
		var startLvl = Number( countryLevel ) + 1;

		for ( i = startLvl; i < networkLevel; i++ )
		{
			orgUnitLevels.push( { name: "Level " + i, value: i } );
		}

		// Sort the list by level value.
		return Util.sortByKey( orgUnitLevels, "value" );
	}

	me.getCountryId = function( secCode, returnFunc )
	{
		me.getSectionDataValue( secCode, 'CountryID', returnFunc );
	}

	me.getCountryId_FromSecData = function( secCode, secData )
	{
		var countryId = "";

		if ( secData !== undefined )
		{
			countryId = me.getValueByType( 'CountryID', secData );
		}

		return countryId;
	}

	me.getSectionDataValue = function( secCode, typeName, returnFunc )
	{
		me.getSectionData( secCode, function( secData )
		{
			if ( secData !== undefined )
			{
				returnFunc( me.getValueByType( typeName, secData ) );
			}
		});
	}


	me.getSectionTypeData_FromInputData = function( settingData, secCode, typeName )
	{
		var returnData;

		var sectionData = PNSettingDataManager.getSectionData( settingData, secCode );

		if ( sectionData !== undefined )
		{
			returnData = Util.getFromList( sectionData, typeName, "type" );
		}

		return returnData;
	}

	me.getSectionDataObj = function( secCode, typeName, returnFunc )
	{
		me.getSectionData( secCode, function( secData )
		{
			if ( secData !== undefined )
			{
				var networkAttr = Util.getFromList( secData, typeName, "type" );
				
				returnFunc( networkAttr );
			}
		});
	}

	me.getSectionData = function( secCode, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			// Get secCode Data first..
			returnFunc( PNSettingDataManager.getSectionData( settingData, secCode ) );
		});
	}


	me.getSection = function( secCode, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			// Get secCode Data first..
			returnFunc( PNSettingDataManager.getSection( settingData, secCode ) );
		});
	}


	me.getSection_FromSettingData = function( settingData, secCode )
	{
		var sectionObj;

		$.each( settingData, function( i_sec, item_sec )
		{
			if ( Util.checkDefined( item_sec ) && item_sec.secCode == secCode )
			{
				sectionObj = item_sec;
				return false;
			}
		});

		return sectionObj;
	}

	// Get list of sections
	me.getSectionList = function( runFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			//var countryList = [];
			var networkList = [];

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( me.getSectionSecurityPermission( 'View', item_sec ) )
					{
						networkList.push( item_sec.secCode );
					}
				}
			});

			runFunc( networkList );
		});
	}


	me.updateSettingDataChanges = function( returnFunc )
	{
		me.systemSettingDataManager.updateSettingDataChanges( returnFunc );
	}


	me.getNetworkPivotList = function( secCode, returnFunc )
	{
		// Basic one will be 'Network'

		// If 'Network Child exists, add to the list.
		// check 'useNetworkChild bit in setting section!!
	}

	// ----------------- Exposed Methods -------------------
	// ------------------------------------------------------

	// ------------------------------------------------------
	// ----------------- Set / Get Methods -------------------
	me.setGeneralAttributes = function( generalOUAttrObj )
	{
		// Clear the list.
		me.generalAttributes.Network_Attr = [];
		me.generalAttributes.NetworkChild_Attr = [];

		if ( generalOUAttrObj !== undefined )
		{
			me.generalAttributes.Network_Attr = me.getAttributesFromNetworkObj( generalOUAttrObj.Network_Attr );

			me.generalAttributes.NetworkChild_Attr = me.getAttributesFromNetworkObj( generalOUAttrObj.NetworkChild_Attr );
		}
	}

	
	me.getAttributesFromNetworkObj = function( networkAttrObj )
	{
		var attributeList = [];

		if ( networkAttrObj !== undefined && networkAttrObj.AttrData !== undefined && networkAttrObj.AttrData.attributes !== undefined )
		{
			$.each( networkAttrObj.AttrData.attributes, function( i_attr, item_attr )
			{
				attributeList.push( item_attr );
			});
		}
		
		return attributeList;
	}

	me.getGeneralAttributes = function( networkType )
	{
		if ( networkType == 'Network_Attr' ) // || networkType == 'Network' )
		{
			return me.generalAttributes.Network_Attr;
		}
		else if ( networkType == 'NetworkChild_Attr' ) // || networkType == 'NetworkChild' )
		{
			return me.generalAttributes.NetworkChild_Attr;
		}
		else
		{
			return me.generalAttributes;
		}
	}


	// 
	me.getAndMemorizeGeneralData = function( settingData )
	{
		me.setGeneralAttributes( me.getGeneralAttributesObj( settingData ) );		


		me.generalData = {};  // Reset data.

		// Other info..
		var countryLvl = me.getSectionTypeData_FromInputData( settingData, _sectionName_General, 'Country_LVL' );
		var analytics = me.getSectionTypeData_FromInputData( settingData, _sectionName_General, 'Analytics' );

		if ( countryLvl !== undefined ) me.generalData.countryLvl = countryLvl.value;

		if ( analytics !== undefined ) me.generalData.analytics = analytics.value;
	}


	me.getNetworkAttributeValueList = function( secCode, networkType )
	{
		// networkType --> 'Network_Attr'
		// Get Attribute list from 'General' and specific 'Network'/'NetworkChild'

		var attributeValueList = [];
		
		me.getSectionDataObj( _sectionName_General, networkType, function( generalAttr )
		{
			if ( generalAttr !== undefined && generalAttr.AttrData !== undefined && generalAttr.AttrData.attributes !== undefined )
			{
				//console.log( '-- GeneralAttr.AttrData.attributes: ' + JSON.stringify( generalAttr.AttrData.attributes ) );

				$.each( generalAttr.AttrData.attributes, function( i_attrVal, item_attrVal )
				{
					// attributeValueList.push( item_attrVal );
					if ( item_attrVal.value != "" ) attributeValueList.push( item_attrVal );
				});
			}

			// Name conversion..
			//if ( networkType == 'NetworkChild_Attr' ) networkType = 'NetworkChild';
			//if ( networkType == 'Network_Attr' ) networkType = 'Network';

			me.getSectionDataObj( secCode, networkType, function( networkAttr )
			{
				if ( networkAttr !== undefined  && networkAttr.AttrData !== undefined && networkAttr.AttrData.attributes !== undefined)
				{				
					$.each( networkAttr.AttrData.attributes, function( i_attrVal, item_attrVal )
					{
						if( Util.findItemFromList( attributeValueList, "value", item_attrVal.value) === undefined )
						{
							// attributeValueList.push( item_attrVal );
							if ( item_attrVal.value != "" ) attributeValueList.push( item_attrVal );
						}
					});
				}
			});

		});
		
		return attributeValueList;

	}
	

	// ----------------- Set / Get Methods -------------------
	// ------------------------------------------------------

	// ------------------------------------------------------
	// ----------------- Get / Save Methods -------------------

	me.getNetworkDataPart = function( secCode, propertyName, runFunc )
	{

		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var dataPart;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						dataPart = item_sec[ propertyName ];

						return false;
					}
				}
			});

			runFunc( dataPart );
		});
	}


	me.saveNetworkDataPart = function( secCode, propertyName, json_Data, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var secFound = false;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						// Set column info on the section
						item_sec[ propertyName ] = json_Data;

						secFound = true;
						
						return false;
					}
				}
			});


			if ( secFound )
			{
				me.systemSettingDataManager.saveSettingData( settingData
				, function()
				{
					returnFunc( true );
				}
				, function()
				{
					returnFunc( false );
				}					
				);
			}

		});
	}

	me.markDataChanged = function()
	{
		me.changeMade = true;
		me.divSettingDataChangedTag.show();
	}


	// Good Util!!!
	// only if found.  if not found, do not change
	me.changeNetworks_ExistingValue = function( settingData, typeName, value )
	{
		var changed = false;

		// Except the 'General', go through networks data and change them.
		$.each( settingData, function( i_sec, item_sec )
		{
			if ( item_sec.secCode != _sectionName_General )
			{				
				$.each( item_sec.data, function( j, item_data )
				{
					if ( item_data.type == typeName )
					{
						item_data.value = value;
						changed = true;
					}
				});
			}
		});

		return changed;
	}


	// -----------------------------------------------------

	me.tabbingSetup = function()
	{
		// Set up 'tabbing' and On Tab Selection action
		me.networkSettingTabsTag.tabs( { collapsible : false } );   //.off( 'tabsactivate' ).on( 'tabsactivate'
	}

	me.setVisibility_ByUserPermission = function( authorities )
	{
		if ( authorities.Network_Edit ) me.btnAddNetworkTag.show();
	}

	// -----------------------------------------------------------
	// --- Network View Related

	me.getNetworkViewList = function( secCode, returnFunc )
	{

		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var viewList;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						viewList = item_sec[ me.viewList_StaticName ];

						return false;
					}
				}
			});

			returnFunc( viewList );
		});
	}


	me.checkNetworkViewByName = function( secCode, viewName, returnFunc )
	{

		me.getNetworkViewList( secCode, function( viewList )
		{
			var matchFound = false;

			if ( viewList !== undefined )
			{
				$.each( viewList, function( i_view, item_view )
				{
					if ( item_view.name == viewName )
					{
						matchFound = true;
						return false;
					}
				});
			}

			returnFunc( matchFound );
		});
	}


	me.getNetworkCodeByViewId = function( viewId, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					var viewList = item_sec[ me.viewList_StaticName ];

					if ( viewList !== undefined )
					{
						var viewObj = Util.getFromList( viewList, viewId );

						if ( viewObj !== undefined )
						{
							returnFunc( item_sec.secCode );

							return false;
						}
					}
				}
			});
		});
	}


	me.getNetworkViewObjData = function( secCode, viewId, returnFunc )
	{

		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var viewData;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						var viewList = item_sec[ me.viewList_StaticName ];

						if ( viewList !== undefined )
						{
							var viewObj = Util.getFromList( viewList, viewId );

							if ( viewObj !== undefined )
							{
								viewData = viewObj;
							}
						}

						return false;
					}
				}
			});

			returnFunc( viewData );
		});
	}

	me.saveNetworkViewObjData = function( secCode, viewObj, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var secFound = false;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						// Create viewList if does not already exists.
						if ( item_sec[ me.viewList_StaticName ] === undefined ) item_sec[ me.viewList_StaticName ] = [];

						var viewList = item_sec[ me.viewList_StaticName ];

						var viewId = viewObj.id;


						// Check it the view exists
						var viewObj_Existing = Util.getFromList( viewList, viewId );

						if ( viewObj_Existing === undefined )
						{
							viewList.push( viewObj );
						}
						else
						{
							// copy the data
							for( var prop in viewObj )
							{
								viewObj_Existing[ prop ] = viewObj[ prop ];
							}
						}
						
						secFound = true;
						
						return false;
					}
				}
			});


			if ( secFound )
			{
				me.systemSettingDataManager.saveSettingData( settingData
				, function()
				{
					returnFunc( true );
				}
				, function()
				{
					returnFunc( false );
				}					
				);
			}
			else
			{
				returnFunc( false );
			}
		});
	}


	me.renameNetworkView = function( secCode, viewId, newViewName, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var success = false;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						var viewList = item_sec[ me.viewList_StaticName ];

						// Check it the view exists
						var viewObj = Util.getFromList( viewList, viewId );

						if ( viewObj !== undefined )
						{
							viewObj.name = newViewName;
						}
						
						success = true;
						
						return false;
					}
				}
			});


			if ( success )
			{
				me.systemSettingDataManager.saveSettingData( settingData
				, function()
				{
					returnFunc( true );
				}
				, function()
				{
					returnFunc( false );
				}					
				);
			}
			else
			{
				returnFunc( false );
			}
		});
	}

	me.deleteNetworkView = function( secCode, viewId, returnFunc )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var viewDeleted = false;

			$.each( settingData, function( i_sec, item_sec )
			{
				if ( Util.checkDefined( item_sec ) )
				{
					if ( item_sec.secCode == secCode )
					{
						var viewList = item_sec[ me.viewList_StaticName ];

						if ( viewList !== undefined )
						{
							var viewObj = Util.getFromList( viewList, viewId );

							if ( viewObj !== undefined )
							{
								Util.RemoveFromArray( viewList, 'id', viewId );

								viewDeleted = true;
							}						
						}

						return false;
					}
				}
			});


			if ( viewDeleted )
			{
				me.systemSettingDataManager.saveSettingData( settingData
				, function()
				{
					returnFunc( true );
				}
				, function()
				{
					returnFunc( false );
				}					
				);
			}
			else
			{
				returnFunc( false );
			}

		});
	}

	// --- Network View Related
	// -----------------------------------------------------------


	me.checkTypeExists = function( typeName, rowsData )
	{
		var found = false;

		$.each( rowsData, function( i, item )
		{
			if ( typeName == item.type && item.value.length > 0 )
			{
				found = true;
				return false;
			}
		});

		return found;
	}


	me.getValueByType = function( typeName, rowsData )
	{
		var foundVal = "";

		$.each( rowsData, function( i, item )
		{
			if ( typeName == item.type )
			{
				foundVal = item.value;
				return false;
			}
		});

		return foundVal;
	}


	me.getOptionByType = function( typeName, rowsData )
	{
		var foundData;

		$.each( rowsData, function( i, item )
		{
			if ( typeName == item.type )
			{
				foundData = item.option;
				return false;
			}
		});

		return foundData;
	}

	me.getPropertyByType = function( propName, typeName, rowsData )
	{
		var foundData;

		$.each( rowsData, function( i_row, item_row )
		{
			if ( typeName == item_row.type )
			{
				foundData = item_row[ propName ];
				return false;
			}
		});

		return foundData;
	}


	me.getGeneralAttributesObj = function( settingData )
	{
		var networkAttrData = me.getSectionTypeData_FromInputData( settingData, _sectionName_General, 'Network_Attr' );
		var networkAttrChildData = me.getSectionTypeData_FromInputData( settingData, _sectionName_General, 'NetworkChild_Attr' );

		return { 'Network_Attr': networkAttrData, 'NetworkChild_Attr': networkAttrChildData };
	}

	// ----------------- Get Methods -------------------
	// ------------------------------------------------------


	me.checkCountryInfoAndSet = function( settingData, secCode, afterCountryShapeSetFunc )
	{
		me.getSection( secCode, function( json_secInfo )
		{
			if ( json_secInfo !== undefined && json_secInfo.data !== undefined )
			{
				var countryId = me.getCountryId_FromSecData( secCode, json_secInfo.data );

				if ( Util.checkValue( countryId ) )
				{
					// compare with existing countryId and any existance of shape

					// if countryShape part does not exists, create one.
					if ( json_secInfo.countryInfo === undefined 
						|| !Util.checkValue( json_secInfo.countryInfo.id ) ) 
					{
						json_secInfo.countryInfo = { id: countryId }

						// Need to save this at here?
					}


					// if existing matches countryId and has shape, skip it.
					// otherwise, retrieve the shape info.
					if ( json_secInfo.countryInfo.id == countryId
						&& Util.checkValue( json_secInfo.countryInfo.shape )						
						)
					{
						// Do Nothing.
						//console.log( 'shape exists' );
					}
					else
					{
						console.log( 'checking/retrieving shape information for countryId, ' + countryId );
						//console.log( 'shape data does not exists.  countryInfo.id: ' + json_secInfo.countryInfo.id + ', countryId: ' + countryId );

						// TODO: country could be changed twice quickly and 
						// first country could have big shape info which could
						// lead to 2nd country shape retrieving first.
						// This case would overwrite the latest country change
						// with the previously changed one.
						// Set retrieval numbers to check for this.
						me.retrieveCountryInfo( countryId, function( json_country ) 
						{
							if ( json_country.coordinates !== undefined )
							{
								json_secInfo.countryInfo.id = countryId;
								json_secInfo.countryInfo.name = json_country.name;
								json_secInfo.countryInfo.shape = json_country.coordinates;

								// Save the changed setting Data 
								me.systemSettingDataManager.saveSettingData( settingData
								, function() 
								{
									if ( afterCountryShapeSetFunc !== undefined )
									{
										afterCountryShapeSetFunc( json_secInfo.countryInfo );
									}
								}
								, function() {}
								);
							}
						});
					}
				}
			}

		});
	}


	me.retrieveCountryInfo = function( countryId, returnFunc )		
	{
		var query = _queryURL_api + 'organisationUnits/' + countryId + '.json?fields=name,coordinates';

		RESTUtil.getAsynchData( query
		, function( json_ou ) 
		{
			returnFunc( json_ou );
		}
		, function() {}
		, function() {}
		, function() {} 
		);
	}

	// ------------------------------------------------------
	// ----------------- Populate/Render Related -------------------

	me.populateSectionList = function( secListTag, settingData )
	{
		var hasGeneral = false;

		secListTag.empty();

		secListTag.append( '<option value="">Please Select Network</option>' );

		$.each( settingData, function( i_sec, item_sec )
		{
			if ( Util.checkDefined( item_sec ) )
			{
				if ( item_sec.secCode == _sectionName_General )
				{
					// Mark it to have general for adding to the bottom of the list.
					hasGeneral = true;
				}
				else
				{				
					if ( me.getSectionSecurityPermission( 'View', item_sec ) )
					{
						secListTag.append( '<option value="' + item_sec.secCode + '">' + item_sec.secCode + '</option>' );
					}
				}
			}
		});

		if ( hasGeneral ) secListTag.append( '<option value="' + _sectionName_General + '">' + _listDisplayName_General + '</option>' );
	}


	// <-- move back to older code..




	me.populateNetworkSettingTables = function( tableTag, settingData, sectionCode )
	{
		// populating table..  if the section data has 'notDeletable' as 'true', hide the delete button
		// Depending on 'General' or not, change displays..
		me.setTableRowInitialize( sectionCode, tableTag );


		var item_sec = me.getSection_FromSettingData( settingData, sectionCode );

		if ( Util.checkDefined( item_sec ) )
		{
			// update the network name
			tableTag.find( 'tr.trNetworkSetting span.spanNetworkName' ).text( sectionCode );

			// Populate Secton rows
			me.populateSectionRows( tableTag, item_sec.data );
			tableTag.attr( 'secCode', sectionCode );

			// Set 'Deletable' button/div by section 'deletable' setting
			me.setSectionDeletable( item_sec.notDeletable, me.divDeleteSectionTag );

			// Permission related visibility Settings
			me.setSectionVisibility_ByPermission( item_sec, tableTag, me.divNetworkSettingSectionTag );
		}					
	}


	// Depending on 'General' or not, change displays..
	me.setTableRowInitialize = function( sectionCode, tableTag )
	{
		// Reset divNetworkRenameSection Visibility

		// clear the data
		Util.paintClear( tableTag.find( 'tr.trData .settingValue' ).val( '' ) );

		// Clear the table info
		tableTag.find( 'tr.trData table.tblNetworkAttributes tr.divAttributeRow' ).remove();
		tableTag.find( 'tr.trData table.tblNetworkHtmlTab tr.divHtmlTabRow' ).remove();


		// Depending on 'General' or specific Network, show/hide.
		if ( sectionCode == _sectionName_General )
		{
			// Change this as rows?
			me.divNetworkRenameSectionTag.hide();

			// show country level selection
			tableTag.find( 'tr.trData[settingType="Country_LVL"]' ).show();

			// hide country ID
			tableTag.find( 'tr.trData[settingType="CountryID"]' ).hide();
			tableTag.find( 'tr.trData[settingType="Network_LVL"]' ).hide();
			tableTag.find( 'tr.trData[settingType="Network_OUGroup"]' ).hide();
			tableTag.find( 'tr.trData[settingType="NetworkChild_Use"]' ).hide();
			tableTag.find( 'tr.trData[settingType="CoordinateMapShow"]' ).hide();
			tableTag.find( 'tr.trData[settingType="OUGroupsTabShow"]' ).hide();
			tableTag.find( 'tr.trData[settingType="ProgramsDataSetsTabShow"]' ).hide();

			// Show/Enable this.  Label it as 'Allow Analytics'
			var rowAnalyticsGlobal = tableTag.find( 'tr.trData[settingType="Analytics"]' ).show();

			tableTag.find( 'tr.scriptAction' ).hide();
			tableTag.find( 'tr.HtmlTabList' ).hide();
	
			tableTag.find( 'tr.trData[settingType="NetworkChild_OUGroup"]' ).hide();	// Reset as hidden

			me.divNetworkChildAttributesTag.show();
			me.divNetworkChildAttributesHideNoteTag.hide();
		}
		else
		{
			me.divNetworkRenameSectionTag.show();

			// hide
			tableTag.find( 'tr.trData[settingType="Country_LVL"]' ).hide();

			// show
			tableTag.find( 'tr.trData[settingType="CountryID"]' ).show();
			tableTag.find( 'tr.trData[settingType="Network_LVL"]' ).show();
			tableTag.find( 'tr.trData[settingType="Network_OUGroup"]' ).show();
			tableTag.find( 'tr.trData[settingType="NetworkChild_Use"]' ).show();
			tableTag.find( 'tr.trData[settingType="CoordinateMapShow"]' ).show();
			tableTag.find( 'tr.trData[settingType="OUGroupsTabShow"]' ).show();
			tableTag.find( 'tr.trData[settingType="ProgramsDataSetsTabShow"]' ).show();
			tableTag.find( 'tr.trData[settingType="Analytics"]' ).hide();

			tableTag.find( 'tr.scriptAction' ).show();
			tableTag.find( 'tr.HtmlTabList' ).show();

			tableTag.find( 'tr.trData[settingType="NetworkChild_OUGroup"]' ).hide();	// Reset as hidden

			me.divNetworkChildAttributesTag.hide();
			me.divNetworkChildAttributesHideNoteTag.show();

			// Add General Attributes (on 'Network' & 'NetworkChild' ) by default
			me.populateGeneralAttributeList( sectionCode, 'Network_Attr', tableTag.find( 'tr.trData[settingType="Network_Attr"] table.tblNetworkAttributes' ) );
			me.populateGeneralAttributeList( sectionCode, 'NetworkChild_Attr', tableTag.find( 'tr.trData[settingType="NetworkChild_Attr"] table.tblNetworkAttributes' ) );
		}

		// REST of rows - will always show!!!
	}


	me.populateSectionRows = function( tableTag, rowsData )
	{
		// Clear table rows
		//tableTag.find( '.trData' ).hide();

		$.each( rowsData, function( i, item )
		{
			me.renderSectionRow( tableTag, item );
		});

		me.divSettingMainContentTag.show( "medium" );
	}


	me.setSectionDeletable = function( notDeletable, divDeleteSectionTag )
	{
		// Set 'Not deletable' property on tag.
		var sectionNotDeletable = ( Util.getNotEmpty( notDeletable ) == 'true' );

		// Deletable Button Setting - 'General' is not deletable
		divDeleteSectionTag.attr( 'notDeletable', sectionNotDeletable );

		// Set the visibility of section delete button tag
		if ( sectionNotDeletable )
		{
			divDeleteSectionTag.hide();
		}
		else
		{
			divDeleteSectionTag.show();
		}
	}

	me.setSectionVisibility_ByPermission = function( item_sec, tblNetworkSettingTag, divNetworkSettingSectionTag )
	{		
		var securityPermission = me.getSectionSecurityPermission( 'Edit', item_sec );
		var tableControls = tblNetworkSettingTag.find( 'input,select,textarea,button' );

		//console.log( 'setSectionVisibility_ByPermission, owner: ' + item_sec.owner );
		//console.log( 'securityPermission: ' + securityPermission );

		if ( !securityPermission )
		{
			// READ-ONLY

			divNetworkSettingSectionTag.hide();

			Util.disableTag( tableControls, true );

			// Disable the attribute row moving
			var trRowTags = tblNetworkSettingTag.find( '.tblNetworkAttributes tr' );
			AppUtil.disableRowMoving( trRowTags );

		}
		else
		{
			divNetworkSettingSectionTag.show();

			Util.disableTag( tableControls, false );
			// But set back to disable for attributes with displayOnly ones..

			var generalRowTags = tblNetworkSettingTag.find( 'tr.divAttributeRow[general="true"]' );
			var generalRowControlTags = generalRowTags.find( 'input,select,textarea,button' );

			Util.disableTag( generalRowControlTags, true );
		}
	}

	me.getSectionSecurityPermission = function( permType, sectionObj )
	{
		var allowed = false;

		// If view owner, enable the tags.
		var currentUserId = me.oProviderNetwork.getUserId();

		if ( ( sectionObj.owner !== undefined && currentUserId == sectionObj.owner )
			|| ( me.oProviderNetwork.isSecretUser() && me.oProviderNetwork.checkEnableAppSecretUserMode() ) 
			)
		{
			allowed = true;
		}
		else
		{
			if ( sectionObj.security !== undefined )
			{
				if ( permType == 'Edit' )
				{
					allowed = ( Util.checkValue( sectionObj.security.permissions ) ) ? me.oProviderNetwork.userSecurityManager.existsInUserGroupsWithList( sectionObj.security.permissions, permType ) : false ;
				}
				else if ( permType == 'View' )
				{
					if ( sectionObj.security.anybodyView )
					{
						hasPermission = true;
					}
					else
					{
						allowed = ( Util.checkValue( sectionObj.security.permissions ) ) ? me.oProviderNetwork.userSecurityManager.existsInUserGroupsWithList( sectionObj.security.permissions, permType ) : false ;
					}
				}
			}
			else
			{
				allowed = false;
			}
		}

		return allowed;
	}


	me.renderSectionRow = function( tableTag, item, isNewRow )
	{

		// Render HTML, load/set values, hide/show area by case.
		var trRow = tableTag.find( 'tr.trData[settingType="' + item.type + '"]' );


		if ( item.type == "Network_Attr" || item.type == "NetworkChild_Attr" )
		{
			var secCode = me.sectionListTag.val();
			var networkType = item.type;
			var tblNetworkAttributesTag = trRow.find( 'table.tblNetworkAttributes' );
			
			me.populateNetworkAttributeList( secCode, networkType, item, tblNetworkAttributesTag );					
		}
		else if ( item.type == "Script" )
		{
			me.populateScriptListsAndSelect( item, tableTag );
		}
		else if ( item.type == "Network_HtmlTab" || item.type == "NetworkChild_HtmlTab" )
		{
			var tblNetworkHtmlTabTag = trRow.find( 'table.tblNetworkHtmlTab' );

			me.populateHtmlTabListsAndSelect( item, tblNetworkHtmlTabTag );
		}
		else // if ( item.type == "Country_LVL" || item.type == "CountryID" || item.type == "Network_LVL" )
		{
			var selectTag = trRow.find( 'select.settingValue' );
			var loadingTag = trRow.find( 'div.dataLoading' );


			me.retrieveAndSetValueSelection( item.type, item.value, selectTag, loadingTag );


			// If 'NetworkChild_Use' case, show 'NetworkChild_OUGroup' and child attribute section
			if ( item.type == "NetworkChild_Use" && item.value == "Y" )
			{
				tableTag.find( 'tr.trData[settingType="NetworkChild_OUGroup"]' ).show();
				me.divNetworkChildAttributesTag.show();
				me.divNetworkChildAttributesHideNoteTag.hide();
			}

			if ( me.generalData.analytics && me.generalData.analytics == "Enable" )
			{
				tableTag.find( 'tr.trData[settingType="Analytics"]' ).show();
			}

		}			
	}


	me.populateScriptListsAndSelect = function( item, tableTag )
	{	
		var scriptSelectionTags_All = tableTag.find( 'tr.scriptAction select.scriptSelection' );

		// empty the lists and reset the color.
		Util.paintClear( scriptSelectionTags_All.empty() );

		// Get script list
		me.scriptDataManager.getSettingData( function( settingData )
		{
			// populate the script list to all the script selection tags (network and child together)
			Util.populateSelect( scriptSelectionTags_All, "Script", settingData );


			if ( item.NetworkScripts !== undefined )
			{
				// Network 
				var networkScriptTags = tableTag.find( 'tr.scriptAction.Network select.scriptSelection' );
				
				networkScriptTags.filter( 'select[action="BeforeCreation"]' ).val( item.NetworkScripts.BeforeCreation );
				networkScriptTags.filter( 'select[action="AfterCreation"]' ).val( item.NetworkScripts.AfterCreation );
				networkScriptTags.filter( 'select[action="BeforeUpdate"]' ).val( item.NetworkScripts.BeforeUpdate );
				networkScriptTags.filter( 'select[action="AfterUpdate"]' ).val( item.NetworkScripts.AfterUpdate );
			}


			if ( item.NetworkChildScripts !== undefined )
			{
				// Network Child
				var networkChildScriptTags = tableTag.find( 'tr.scriptAction.NetworkChild select.scriptSelection' );

				networkChildScriptTags.filter( 'select[action="BeforeCreation"]' ).val( item.NetworkChildScripts.BeforeCreation );
				networkChildScriptTags.filter( 'select[action="AfterCreation"]' ).val( item.NetworkChildScripts.AfterCreation );
				networkChildScriptTags.filter( 'select[action="BeforeUpdate"]' ).val( item.NetworkChildScripts.BeforeUpdate );
				networkChildScriptTags.filter( 'select[action="AfterUpdate"]' ).val( item.NetworkChildScripts.AfterUpdate );
			}
		});
	}


	me.populateGeneralAttributeList = function( secCode, networkType, tblNetworkAttributesTag )
	{
		// General Attribute show as read-only if current section is not 'General'
		var generalAttrList = [];
		
		if ( secCode != _sectionName_General )
		{
			generalAttrList = me.getGeneralAttributes( networkType );
			
			var attributeList_General = me.getOrgUnitAttributes_BySection( _sectionName_General, networkType );
			var ouGroupSetList_General = me.getOrgUnitGroupSets_BySection( _sectionName_General, networkType );
			var displayOnly = true;

			// OU Atttribute List && OU Group Set List
			if ( generalAttrList !== undefined || ouGroupSetList_General !== undefined  )
			{
				$.each( generalAttrList, function( i_attr, item_attr ) 
				{
					// skip the empty selection value
					if ( item_attr != "" )
					{
						me.addAttributeRow( tblNetworkAttributesTag, item_attr.type, attributeList_General, ouGroupSetList_General, item_attr, displayOnly );		
					}
				});
			}		
		}

		return generalAttrList;
	}


	me.populateNetworkAttributeList = function( secCode, networkType, item, tblNetworkAttributesTag )
	{
		// What happens if the added attributes already exists in 'General'?
		// For now, skip listing as editable.

		// Attribute Listing related
		var attributeList = me.getOrgUnitAttributes_BySection( secCode, networkType );
		var ouGroupSetList = me.getOrgUnitGroupSets_BySection( secCode, networkType );

		if ( item.AttrData !== undefined && item.AttrData.attributes !== undefined )
		{
			$.each( item.AttrData.attributes, function( i_attr, item_attr )
			{
				// If value is not in the list, skip displaying - case listed in both general and this section.
				if ( !( item_attr.value != "" 
						&& !Util.checkExistInList( attributeList, item_attr.value, "value" )  
						&& !Util.checkExistInList( ouGroupSetList, item_attr.value, "id" )  
					) )
				{
					var trAttributeRowTag = me.addAttributeRow( tblNetworkAttributesTag, item_attr.type, attributeList, ouGroupSetList, item_attr );
				}
				
			});
			
			/*
			// Order the list attributes		
			$.each( item.AttrData.attributes, function( i_attr, item_attr )
			{
				var trAttributeRowTag = tblNetworkAttributesTag.find( "select option:selected[value='" + item_attr + "']" ).closest( 'tr' );

				tblNetworkAttributesTag.append( trAttributeRowTag );					
			});
			*/

		}
	}


	me.populateHtmlTabListsAndSelect = function( item, tableTag )
	{	
		me.htmlTabDataManager.getSettingData( function( htmlTabList )
		{											
			if ( item.HtmlTabData !== undefined )
			{
				$.each( item.HtmlTabData, function( i_htmlTab, item_htmlTab )
				{
					// If value is not in the list, skip displaying - case listed in both general and this section.
					if ( !( item_htmlTab.value != "" && !Util.checkExistInList( htmlTabList, item_htmlTab.value, "id" ) ) )
					{
						var trHtmlTabRowTag = me.addHtmlTabRow( tableTag, htmlTabList, item_htmlTab );
					}					
				});
				
				/*
				$.each( item.HtmlTabData, function( i_htmlTab, item_htmlTab )
				{
					var trHtmlTabRowTag = tableTag.find( "select option:selected[value='" + item_attr + "']" ).closest( 'tr' );

					tableTag.append( trHtmlTabRowTag );					
				});
				*/
			}
		});
	}


	me.retrieveAndSetValueSelection = function( type, value, selectTag, loadingTag )
	{

		if ( value === undefined ) value = "";


		if ( type == "Country_LVL" || type == "Network_LVL" )
		{			
			// For Network Level case, get existing country level for later use.
			var existingCountryLevel = 0;
			if ( type == "Network_LVL" )
			{
				// Get country Level
				me.getSectionData( _sectionName_General, function( secData_General )
				{
					existingCountryLevel = Number( me.getValueByType( "Country_LVL", secData_General ) );
				});
			}

			
			// Get and Set OrgUnit Levels
			var orgUnitLevels = Util.sortByKey( me.oProviderNetwork.loadedInfo.orgUnitLevelsInfo, "level" );

			// new list
			var orgUnitLvlNew = [];

			// reorder the data
			$.each( orgUnitLevels, function( i_oul, item_oul )
			{
				// if Network Level, only select bigger than country level
				if ( type != "Network_LVL" || existingCountryLevel < item_oul.level )
				{
					orgUnitLvlNew.push( { id: item_oul.level, name: item_oul.name } );
				}
			});

			Util.populateSelectDefault( selectTag, 'Not Selected', orgUnitLvlNew );

			selectTag.val( value );

		}
		else if ( type == "CountryID" )
		{

			// Get country Level
			me.getSectionData( _sectionName_General, function( secData_General )
			{
				var countryLevel = Number( me.getValueByType( "Country_LVL", secData_General ) );

				if ( countryLevel > 0 )
				{
					var queryURL = _queryURL_api + 'organisationUnits.json?paging=false&fields=id,displayName&level=' + countryLevel;
					
					RESTUtil.retrieveManager.retrieveData( queryURL, function( json_Data )
					{
						if ( json_Data !== undefined && json_Data.organisationUnits !== undefined )
						{
							var orgUnitSorted = Util.sortByKey( json_Data.organisationUnits, 'displayName' );

							Util.populateSelectDefault( selectTag, 'Not Selected', orgUnitSorted, { 'val': 'id', 'name': 'displayName' } );

							selectTag.val( value );
						}
					}
					, function() {}
					, function() { loadingTag.show(); }
					, function() { loadingTag.hide(); }
					);
				}
			});
		}
		else if ( type == "Network_OUGroup" || type == "NetworkChild_OUGroup" )
		{			
			var queryURL = _queryURL_api + 'organisationUnitGroups.json?paging=false&fields=id,displayName';
			
			RESTUtil.retrieveManager.retrieveData( queryURL, function( json_Data )
			{
				if ( json_Data !== undefined && json_Data.organisationUnitGroups !== undefined )
				{
					var orgUnitGroups = json_Data.organisationUnitGroups;

					Util.populateSelectDefault( selectTag, 'Not Selected', orgUnitGroups, { 'val': 'id', 'name': 'displayName' } );

					selectTag.val( value );
				}
			}
			, function() {}
			, function() { loadingTag.show(); }
			, function() { loadingTag.hide(); }
			);
		}
		else
		{
			selectTag.val( value );
		}
	}


	// Where JSON/Object data for saving is created from HTML
	/*
	me.generateSettingData_FromTable = function( tableTag )
	{
		var list = new Array();

		tableTag.find( "tr.trData" ).each( function( i, item )
		{
			var trCurrent = $( item );

			list.push( me.generateSettingData_FromRow( trCurrent, i ) );
		});

		return list;
	}
	*/
	

	me.generateSettingData_FromRow = function( trRowTag )
	{

		var item = { name: "", type: "", value: "" };

		// This doesn't do anything..  mandatory has not been implemented, yet.
		item.mandatory = ( Util.getNotEmpty( trRowTag.attr( 'mandatory' ) ) == 'Y' ) ? true: false;


		if ( trRowTag.hasClass( 'trData' ) )
		{
			item.name = trRowTag.find( '.settingName' ).text();
			item.type = trRowTag.attr( 'settingType' );
		}

		item.value = trRowTag.find( '.settingValue:visible' ).val();
		if ( item.value !== undefined ) item.value = Util.valueEscape( item.value );


		// ---------------------------------
		// In 'NetworkAttribute' Case
		var tblNetworkAttributesTag = trRowTag.find( 'table.tblNetworkAttributes:visible' );

		if ( tblNetworkAttributesTag.length > 0 )
		{
			// var networkAttrTags = trRowTag.find( 'select.attribute:enabled' );
			var networkAttrTags = tblNetworkAttributesTag.find( 'select.attribute:enabled' );

			// Could be network / child
			item.AttrData = {};

			item.AttrData.attributes = [];
			
			networkAttrTags.each( function()
			{
				var attrTag = $( this );
				var attrVal = attrTag.val();

				if( attrVal != "" )
				{
					var trAttrTag = attrTag.closest( 'tr' );

					var typeVal = trAttrTag.find( "select.attributeType" ).val();
					var readOnly = trAttrTag.find( "input.attributeReadOnly" ).is( ":checked" );
					var required = trAttrTag.find( "input.attributeRequired" ).is( ":checked" );

					item.AttrData.attributes.push( { "type": typeVal, "value": attrVal, "readOnly": readOnly, "required": required } );
				}
			});
		}


		// ---------------------------------
		// In 'NetworkHtmlTab' Case
		var tblNetworkHtmlTabTag = trRowTag.find( 'table.tblNetworkHtmlTab:visible' );

		if ( tblNetworkHtmlTabTag.length > 0 )
		{
			var trHtmlTabRowTags = tblNetworkHtmlTabTag.find( 'tr.divHtmlTabRow' );

			// Could be network / child
			item.HtmlTabData = [];
			
			trHtmlTabRowTags.each( function()
			{
				var trHtmlTabRowTag = $( this ); // .htmlTabList:enabled'
				
				var htmlTabTitle = trHtmlTabRowTag.find( 'input.htmlTabName' ).val();
				var htmlTabSelection = trHtmlTabRowTag.find( 'select.htmlTabList' ).val();
				var htmlTabScript = trHtmlTabRowTag.find( 'select.scriptList' ).val();

				if ( htmlTabTitle != "" || htmlTabSelection != "" || htmlTabScript != "" )
				{
					item.HtmlTabData.push( { "name": htmlTabTitle, "value": htmlTabSelection, "script": htmlTabScript } );
				}
			});
		}


		//console.log( 'Row Generate: ' + JSON.stringify( item ) );

		return item;
	}


	// --------------------------------------------------------


	me.getOrgUnitGroupSets_BySection = function( secCode, networkType )
	{
		var attributeList = [];
		
		var fullList = me.oProviderNetwork.getOrgUnitGroupSetList();
		if ( fullList === undefined ) fullList = [];
		
		if ( secCode == _sectionName_General )
		{
			// List All
			attributeList = fullList;
		}
		else
		{
			// Get general list - for excluding
			var generalAttrList = me.getGeneralAttributes( networkType );

			if ( generalAttrList === undefined )
			{
				attributeList = fullList;
			}
			else
			{
				// Attribute list
				$.each( fullList, function( i_attr, item_attr ) 
				{
					// Exclude the attributes set in general
					// if ( $.inArray( item_attr.value, generalAttrList ) < 0 ) 
					if( !Util.checkExistInList( generalAttrList, item_attr.id, "value" ) )
					{
						attributeList.push( item_attr );
					}
				});
			}			
		}

		return attributeList;
	}

	
	me.getOrgUnitAttributes_BySection = function( secCode, networkType )
	{
		var attributeList = [];
		
		var fullList = me.oProviderNetwork.getOrgUnitAttributeList_FromTypeList();
		if ( fullList === undefined ) fullList = [];
		
		if ( secCode == _sectionName_General )
		{
			// List All
			attributeList = fullList;
		}
		else
		{
			// Get general list - for excluding
			var generalAttrList = me.getGeneralAttributes( networkType );

			if ( generalAttrList === undefined )
			{
				attributeList = fullList;
			}
			else
			{
				// Attribute list
				$.each( fullList, function( i_attr, item_attr ) 
				{
					// Exclude the attributes set in general
					// if ( $.inArray( item_attr.value, generalAttrList ) < 0 ) 
					if( !Util.checkExistInList( generalAttrList, item_attr.value, "value" ) )
					{
						attributeList.push( item_attr );
					}
				});
			}			
		}

		return attributeList;
	}

	// Populate the attributes selection
	me.populateAttributes = function( attributeSelectTag, attributeList, selectedValue )
	{		
		attributeSelectTag.empty();
		attributeSelectTag.append( '<option value="">Select Property</option>' );

		$.each( attributeList, function( i_attr, item_attr ) 
		{
			attributeSelectTag.append( $( '<option></option>' ).attr( "value", item_attr.value ).text( item_attr.name ) );
		});
		
		if ( selectedValue !== undefined ) attributeSelectTag.val( selectedValue );
	};
		

	me.addHtmlTabRow = function( tblNetworkHtmlTabTag, htmlTabList, item )
	{
		var rowId = "viewrow_HtmlTab-" + tblNetworkHtmlTabTag.find( 'tr.divHtmlTabRow' ).length; 
		
		var trHtmlTabRowTag = $( '<tr class="divHtmlTabRow" id="' + rowId + '">'
			+ '<td style="border:0px;">&nbsp;&nbsp;&nbsp;</td>'
			+ '<td style="border:0px;"><input type="text" class="htmlTabName"></td>' 
			+ '<td style="border:0px;"><select class="htmlTabList"></select></td>'
			+ '<td style="border:0px;"><select class="scriptList"></select></td>'
			+ '<td style="border:0px; padding: 0px 2px 0px 2px;"><input type="image" class="htmlTabRemove dimImgWHover" alt="Remove" title="Remove" src="img/cross.png" style="border: 0px solid;" /></td>'
			+ '</tr>' );

		var htmlTabNameTag = trHtmlTabRowTag.find( 'input.htmlTabName' );
		var htmlTabSelectTag = trHtmlTabRowTag.find( 'select.htmlTabList' );
		var scriptSelectTag = trHtmlTabRowTag.find( 'select.scriptList' );


		// Populate the dropdown list.
		Util.populateSelectDefault( htmlTabSelectTag, "Select HtmlTab", htmlTabList, { 'val': 'id', 'name': 'name' } );

		// Also, script list population
		me.scriptDataManager.getSettingData( function( settingData )
		{
			Util.populateSelectDefault( scriptSelectTag, "Select Script", settingData, { 'val': 'id', 'name': 'name' } );
			if ( item !== undefined && item.script !== undefined ) scriptSelectTag.val( item.script );
		});


		// Populate the title and htmlTab selection.
		if ( item !== undefined )
		{
			htmlTabNameTag.val( item.name );
			htmlTabSelectTag.val( item.value );
		}


		/*
		// For display only, and selected vlaue, set them here.
		if ( displayOnly !== undefined && displayOnly )
		{						
			Util.disableTag( trAttributeRowTag.find( 'select.attributeType' ), true );		
			Util.disableTag( attributeSelectTag, true );
			Util.disableTag( attributeReadOnlyTag, true );
			trAttributeRowTag.find( 'input.attributeRemove' ).remove();

			AppUtil.disableRowMoving( trAttributeRowTag );

			//attributeSelectTag.attr( 'sourceType', _sectionName_General );
		}
		else
		{
		*/
		
		trHtmlTabRowTag.find("td:first").addClass( "dragHandle" ).addClass( "dimImgWHover" );


		// ---- Events Handle -----------------
		htmlTabSelectTag.change( function()
		{
			me.saveNetworkRowData( $( this ) );
		});

		scriptSelectTag.change( function()
		{
			me.saveNetworkRowData( $( this ) );
		});

		htmlTabNameTag.change( function()
		{
			me.saveNetworkRowData( $( this ) );
		});

		// 'Remove' Event
		trHtmlTabRowTag.find( 'input.htmlTabRemove' ).click( function()
		{
			var trCurrent = $( this ).closest( 'tr.trData' );

			trHtmlTabRowTag.hide( "medium", function()
			{
				trHtmlTabRowTag.remove();
							
				me.saveNetworkRowData( undefined, trCurrent );	
			});
		});
		

		tblNetworkHtmlTabTag.find( 'tbody' ).append( trHtmlTabRowTag );

		me.setUp_RowMove( tblNetworkHtmlTabTag, trHtmlTabRowTag );

		
		return trHtmlTabRowTag;
	}


	me.addAttributeRow = function( tblNetworkAttributesTag, type, attributeList, ouGroupSetList, attrItem, displayOnly )
	{
		var rowId = "viewrow-" + tblNetworkAttributesTag.find( 'tr.divAttributeRow' ).length; 
		
		var trAttributeRowTag = $( '<tr class="divAttributeRow" id="' + rowId + '" general="' + displayOnly + '">'
			+ '<td style="border:0px;">&nbsp;&nbsp;&nbsp;</td>'
			+ '<td style="border:0px;"><select class="attributeType"><option value="ou_attr">OU Property</option><option value="ougs">OU GroupSet</option></select></td>' 
			+ '<td style="border:0px;"><select class="attribute" style="width:160px;"></select></td>'
			+ '<td style="border:0px; padding: 0px; text-align: center;"><input class="attributeReadOnly" type="checkbox" /></td>'
			+ '<td style="border:0px; padding: 0px; text-align: center;"><input class="attributeRequired" type="checkbox" /></td>'
			+ '<td style="border:0px; padding: 0px 2px 0px 2px;"><input type="image" class="attributeRemove dimImgWHover" alt="Remove" title="Remove" src="img/cross.png" style="border: 0px solid;" /></td>'
			+ '</tr>' );

		// Set selected attribute type
		trAttributeRowTag.find( 'select.attributeType' ).val( type );
		var attributeSelectTag = trAttributeRowTag.find( 'select.attribute' );
		var attributeReadOnlyTag = trAttributeRowTag.find( 'input.attributeReadOnly' );
		var attributeRequiredTag = trAttributeRowTag.find( 'input.attributeRequired' );
		var attrVal = ( attrItem !== undefined ) ? attrItem.value : undefined;			

		if( type == 'ou_attr' )
		{
			// Populate the attributes selection
			me.populateAttributes( attributeSelectTag, attributeList, attrVal );
		}
		else if( type == 'ougs' ){
			Util.populateSelectDefault( attributeSelectTag, 'Select GroupSet', ouGroupSetList );
			if ( attrVal !== undefined ) attributeSelectTag.val( attrVal );
		}

		if ( attrItem !== undefined && attrItem.readOnly !== undefined ) attributeReadOnlyTag.prop( 'checked', attrItem.readOnly );
		if ( attrItem !== undefined && attrItem.required !== undefined ) attributeRequiredTag.prop( 'checked', attrItem.required );
				

		// For display only, and selected vlaue, set them here.
		if ( displayOnly !== undefined && displayOnly )
		{						
			Util.disableTag( trAttributeRowTag.find( 'select.attributeType' ), true );		
			Util.disableTag( attributeSelectTag, true );
			Util.disableTag( attributeReadOnlyTag, true );
			Util.disableTag( attributeRequiredTag, true );
			trAttributeRowTag.find( 'input.attributeRemove' ).remove();

			AppUtil.disableRowMoving( trAttributeRowTag );

			//attributeSelectTag.attr( 'sourceType', _sectionName_General );
		}
		else
		{
			trAttributeRowTag.find("td:first").addClass( "dragHandle" ).addClass( "dimImgWHover" );
		}


		// ---- Events Handle -----------------
		attributeSelectTag.change( function()
		{
			me.saveNetworkRowData( $( this ) );
		});

		attributeReadOnlyTag.change( function()
		{
			console.log( 'attributeReadOnlyTag.change' );
			me.saveNetworkRowData( $( this ) );
		});

		attributeRequiredTag.change( function()
		{
			console.log( 'attributeRequiredTag.change' );
			me.saveNetworkRowData( $( this ) );
		});

		// 'Remove' Event
		trAttributeRowTag.find( 'input.attributeRemove' ).click( function()
		{
			var trCurrent = $( this ).closest( 'tr.trData' );

			trAttributeRowTag.hide( "medium", function()
			{
				trAttributeRowTag.remove();
							
				me.saveNetworkRowData( undefined, trCurrent );	
			});
		});
		
		// Attribute type change
		trAttributeRowTag.find( 'select.attributeType' ).change( function()
		{
			var type = $( this ).val();
			
			if( type == "ou_attr" )
			{
				// Populate the attributes selection
				me.populateAttributes( attributeSelectTag, attributeList );
			}
			else if( type == "ougs" )
			{
				var selector = trAttributeRowTag.find( 'select.attribute' );
				Util.populateSelectDefault( selector, 'Select Group Set', ouGroupSetList );
			}
			
			me.saveNetworkRowData( $( this ) );	
		});
		

		tblNetworkAttributesTag.find( 'tbody' ).append( trAttributeRowTag );

		me.setUp_RowMove( tblNetworkAttributesTag, trAttributeRowTag );
		
		return trAttributeRowTag;
	}


	me.setUp_RowMove = function( tableTag, trRowTag )
	{
		tableTag.tableDnD(
		{
			onDrop: function( table, row ) {
				console.log( 'SETTING moved row Num:' + row  );
				var trCurrent = tableTag.closest( 'tr.trData' );

				me.saveNetworkRowData( undefined, trCurrent );
			},
			dragHandle: ".dragHandle"
		});

		//trRowTag.off( 'mouseenter mouseleave' ).hover( 
		trRowTag.hover( 
			function() 
			{
				$( this.cells[0] ).addClass( 'showDragHandle' );
			}
			, function() 
			{
				$( this.cells[0] ).removeClass( 'showDragHandle' );
			});
	};


	AppUtil.disableRowMoving = function( trAttributeRowTags )
	{
		trAttributeRowTags.each( function()
		{
			var trRowTag = $( this );

			// Disabling (by inserting empty hidden td) before Row move is applied.
			if ( trRowTag.find( 'td.disableMoving' ).length == 0 ) trRowTag.prepend( '<td class="disableMoving" style="display:none;"></td>' );

			// This is for being called after already applied
			trRowTag.find( 'td.dragHandle,td.dimImgWHover' ).removeClass( 'dragHandle' ).removeClass( 'dimImgWHover' );
			trRowTag.addClass( 'nodrag nodrop' );
		});
	}

	// ----------------- Populate Related -------------------
	// ------------------------------------------------------


	me.addSectionSecurityPermissions = function( permission, returnFunc )
	{
		var secCode = me.sectionListTag.val();

		me.getSection( secCode, function( sectionObj )
		{				
			sectionObj.security.permissions.push( permission );

			PNSettingDataManager.saveSectionByAttr( me.systemSettingDataManager, secCode, sectionObj.security, 'security', undefined, function( success )
			{
				if ( returnFunc !== undefined )
				{
					if ( success ) MsgManager.msgAreaShow( "Added the user group on security." );

					returnFunc( success );				
				}
			});
		});
	}

	me.removeSectionSecurityPermissions = function( userGroupId, returnFunc )
	{
		var secCode = me.sectionListTag.val();

		me.getSection( secCode, function( sectionObj )
		{				
			Util.RemoveFromArray( sectionObj.security.permissions, 'id', userGroupId );

			PNSettingDataManager.saveSectionByAttr( me.systemSettingDataManager, secCode, sectionObj.security, 'security', undefined, function( success )
			{
				if ( returnFunc !== undefined ) 
				{
					if ( success ) MsgManager.msgAreaShow( "Removed the user group on security." );

					returnFunc( success );				
				}
			});
		});
	}


	me.setSectionSecurity_anybodyView = function( enabled, returnFunc )
	{
		var secCode = me.sectionListTag.val();

		me.getSection( secCode, function( sectionObj )
		{
			sectionObj.security.anybodyView = enabled;
			
			PNSettingDataManager.saveSectionByAttr( me.systemSettingDataManager, secCode, sectionObj.security, 'security', undefined, function( success )
			{
				if ( returnFunc !== undefined ) 
				{
					if ( success ) MsgManager.msgAreaShow( "Anybody View set to " + enabled );

					returnFunc( success );				
				}
			});
		});
	};


	// If 'Add Section' mode, hide 'Section Edit' controls and the section contents.
	me.sectionVisibilityChangeByMode = function( enable )
	{
		me.networkNameTag.val( '' );

		var sectionNotDeletable = me.divDeleteSectionTag.attr( 'notDeletable' );

		if ( enable )
		{
			// Disable the sectionList selection
			Util.disableTag( me.sectionListTag, enable );

			// Show
			me.tdNetworkAddTag.show( "medium" );
			me.divSettingMainContentTag.hide( "medium" );
		}
		else
		{
			// Enable the sectionList selection <-- But, what about the permission?
			Util.disableTag( me.sectionListTag, enable );

			me.tdNetworkAddTag.hide( "medium" );

			if ( me.sectionListTag.val() != "" ) me.divSettingMainContentTag.show( "medium" );
		}
	}


	me.checkInSectionList = function( networkName )
	{
		return ( me.sectionListTag.find( 'option[value="' + networkName + '"]' ).length > 0 ) ? true : false;
	}


	// -------------------------------
	// --  Events --------------------

	me.setup_DataChangeEvent = function( tableRowTags )
	{

		var targetTags = tableRowTags.find( 'input.settingValue,select.settingValue,textarea,settingValue' );

		// On any tag change (mostly 'select' dropdown), save that row data.
		targetTags.change( function()
		{
			var cntl = $( this );
			
			// If 'useNetworkChild' one, toggle networkChild OUGroup row and networkChild Attributes.
			if ( cntl.hasClass( "useNetworkChild" ) )
			{
				var networkChild_OUGroup_RowTag = tableRowTags.filter( '.trData[settingType="NetworkChild_OUGroup"]' );

				if ( cntl.val() == "Y" )
				{
					networkChild_OUGroup_RowTag.show( 'medium' );						
					me.divNetworkChildAttributesTag.show();
					me.divNetworkChildAttributesHideNoteTag.hide();
				}
				else
				{
					networkChild_OUGroup_RowTag.hide( 'fast' );
					me.divNetworkChildAttributesTag.hide();
					me.divNetworkChildAttributesHideNoteTag.show();
				}
			}


			// NOTE: HACK: If this is global and 'analytics' one is changed, change all the values..
			if ( cntl.closest( 'tr.trData' ).attr( 'settingtype' ) == "Analytics" && me.sectionListTag.val() == _sectionName_General && cntl.val() == "" )
			{
				me.systemSettingDataManager.getSettingData( function( settingData )
				{

					me.changeNetworks_ExistingValue( settingData, 'Analytics', '' );
				});
			}
	

			me.saveNetworkRowData( cntl );

		});
	}


	me.setup_NetworkAttr_AddButton = function( trRow )
	{

		trRow.find( '.addNewRow_Attributes' ).click( function()
		{
			me.markDataChanged();

			var tblNetworkAttributesTag = $( this ).closest( 'tr.trData' ).find( 'table.tblNetworkAttributes' );

			var networkType = tblNetworkAttributesTag.attr( 'networktype' );

			var secCode = me.sectionListTag.val();


			// Get the List attributes
			var attributeList = me.getOrgUnitAttributes_BySection( secCode, networkType );			
			
			// Get the OUGS List
			var ougsList = me.getOrgUnitGroupSets_BySection( secCode, networkType );		

			// Add Attribute Row (Render)
			me.addAttributeRow( tblNetworkAttributesTag, 'ou_attr', attributeList, ougsList );

			return false;
		});
	}


	me.setup_NetworkHtmlTab_AddButton = function( trRows )
	{

		trRows.find( '.addNewRow_HtmlTab' ).click( function()
		{
			me.markDataChanged();

			var tblNetworkHtmlTabTag = $( this ).closest( 'tr' ).find( 'table.tblNetworkHtmlTab' );

			var networkType = tblNetworkHtmlTabTag.attr( 'networktype' );

			var secCode = me.sectionListTag.val();


			me.htmlTabDataManager.getSettingData( function( htmlTabList )
			{								
				// Add HtmlTab Row (Render)
				me.addHtmlTabRow( tblNetworkHtmlTabTag, htmlTabList );
			});
			
			return false;
		});
	}



	// Setting JSON Data Direct Edit Mode 
	me.setUp_SettingDataEdit = function()
	{
		// If user is 'SuperUser' or 'SecretUser', show the 'Source Edit' link or 'Data Clear' link
		( me.oProviderNetwork.isAppSuperUser() ) ? me.settingDataEditLinkDivTag.show() : me.settingDataEditDivTag.hide();

		( me.oProviderNetwork.isSecretUser() ) ? me.settingDataClearLinkDivTag.show() : me.settingDataClearLinkDivTag.hide();

		
		me.settingDataEditLinkTag.click( function()
		{
			// Hide the Main setting section and show the editing of setting data
			me.mainSecTag.hide();
			me.settingDataEditDivTag.show( 'slow' );

			
			// populate the setting data
			me.systemSettingDataManager.getSettingData( function( settingData )
			{
				me.settingDataEditTag.val( JSON.stringify( settingData ) );
			});
			
			return false;
		});


		me.settingDataClearLinkTag.click( function()
		{
			me.systemSettingDataManager.clearSettingData( 
			function() 
			{ 
				MsgManager.msgAreaShow( 'Successfully erased the setting data.' );

				me.retrieveAndPopulate(); 
			}
			, function() { alert( 'Failed to erase the setting data.' ); }
			);

			return false;
		});


		me.settingDataEdit_SaveTag.click( function()
		{
			var settingData = $.parseJSON( me.settingDataEditTag.val() );

			me.systemSettingDataManager.saveSettingData( settingData
			, function() 
			{ 

				MsgManager.msgAreaShow( 'Successfully saved the data' );

				// Need to reload the data??  use below 'retrieveAndPopulate()' one.
				me.retrieveAndPopulate( function()
				{
					me.settingDataEditDivTag.hide();
					me.mainSecTag.show( 'slow' );
					
				});
			}
			, function() { alert( 'Failed to save the data.' ); } 
			);
		});

		me.settingDataEdit_CancelTag.click( function()
		{
			me.settingDataEditDivTag.hide();
			me.mainSecTag.show( 'slow' );					
		});

	}


	me.setup_Events = function()
	{

		// replace the 'close' button actions
		me.dialogFormTag.closest( '.ui-dialog' ).find( '.ui-dialog-titlebar .ui-dialog-titlebar-close' ).off( 'click' ).on( 'click', function()
		{
			me.closeButtonClickAction();
		});


		me.sectionListTag.change( function ()
		{	
			me.checkNetworkMandatory( me.section_Previous, function()
			{
				me.section_Previous = me.sectionListTag.val();

				// Reset Display Contents
				me.divSettingMainContentTag.hide( "fast" );
				// Select first tab
				me.networkSettingTabsTag.find( 'li[code]:first a.tabAnchor' ).click();


				if ( me.sectionListTag.val() != "" )
				{
					me.systemSettingDataManager.getSettingData( function( settingData )
					{
						// Retrieve and set in global variable for 'attribute list' of network/child and other global settings.
						me.getAndMemorizeGeneralData( settingData );


						// populate the section
						me.populateNetworkSettingTables( me.tblNetworkSettingTags, settingData, me.sectionListTag.val() );

						// check if country shape exists. If it does not exists, retrieve one.
						me.checkCountryInfoAndSet( settingData, me.sectionListTag.val(), function( countryInfo )
						{
							if ( Util.checkValue( countryInfo.shape ) )
							{
								MsgManager.msgAreaShow( "'" + countryInfo.name + "' country shape set for '" + me.sectionListTag.val() + "' network." );
							}
						});
					});
				}
			});
		});


		me.btnAddNetworkTag.click( function ()
		{
			me.checkNetworkMandatory( undefined, function()
			{
				// Add template Data, Show new country template
				me.systemSettingDataManager.getSettingData( function( settingData )
				{
					me.sectionVisibilityChangeByMode( true );
				});
			});
		});


		me.btnCreateSectionTag.click( function()
		{
			me.createNetwork( me.networkNameTag );		
		});


		me.btnCreateSection_CancelTag.click( function()
		{
			me.sectionVisibilityChangeByMode( false );
		});


		me.securitySectionBtnTag.click( function()
		{
			var secCode = me.sectionListTag.val();

			me.getSection( secCode, function( sectionObj )
			{			
				// if the security does not exists, create one and update it.
				if ( sectionObj.security === undefined )
				{
					sectionObj.security = me.oProviderNetwork.getInitialSecurity();
					
					PNSettingDataManager.saveSectionByAttr( me.systemSettingDataManager, secCode, sectionObj.security, 'security', undefined, function( success )
					{
						console.log( 'Note - new section security created: ' + JSON.stringify( sectionObj.security ) );	
					});	
				}

				var securityData = { 'sharingName': secCode, 'ownerId': sectionObj.owner, 'targetSecurityData': sectionObj.security };

				me.oProviderNetwork.securitySettingPopupForm.openForm( securityData
					, me.addSectionSecurityPermissions
					, me.removeSectionSecurityPermissions
					, me.setSectionSecurity_anybodyView
					);
				//me.oProviderNetwork.viewServiceManager.addViewSecurityPermissions

			});
		});


		me.deleteSectionBtnTag.click( function()
		{
			if ( confirm( "Are you sure you want to delete this section?" ) )
			{
				me.deleteNetwork( me.sectionListTag.val() );
			}
		});


		// -------- Network Rename Related  -----------------
		me.btnNetworkRenameShowTag.click( function()
		{
			me.networkRenamePopupForm.openForm( me.sectionListTag.val() );
		});

	
		// -------- Network Setting Values Related  -----------------
		var networkSettingRowTags = me.tblNetworkSettingTags.find( 'tr.trData' );

		// Change and Save Event Add
		me.setup_DataChangeEvent( networkSettingRowTags );


		// Setup Network Attribute Add Button (For both Network and Network Child)
		me.setup_NetworkAttr_AddButton( networkSettingRowTags );


		// Setup Network HtmlTab Add Button (For both Network and Network Child)
		me.setup_NetworkHtmlTab_AddButton( networkSettingRowTags );



		// -------- End of Network Setting Values Related  -----------------


		me.settingModeTag.change( function()
		{
			var settingModeSelected = $( this ).val();

			if ( settingModeSelected == "network" )
			{
				$( '#divSettingMode_Network' ).show( 'medium' );
				$( '#divSettingMode_Script' ).hide();
				$( '#divSettingMode_HtmlTab' ).hide();
			}
			else
			{
				// proceed with switch from network setting - only if the selected network
				// does not unfilled mandatory fields

				// <-- Need to check the previous selection for this!!!!
				
				// TODO:
				//	- Check the flag of 'Network' Listing being shown/visible  <-- Must set flag as well..

				me.checkNetworkMandatory( undefined, function()
				{
					$( '#divSettingMode_Network' ).hide();
					$( '#divSettingMode_Script' ).hide();
					$( '#divSettingMode_HtmlTab' ).hide();

					if ( settingModeSelected == "script" ) $( '#divSettingMode_Script' ).show( 'medium' );
					else if ( settingModeSelected == "htmlTab" ) $( '#divSettingMode_HtmlTab' ).show( 'medium' );

				}
				, function()
				{
					// switch back to network.
					me.settingModeTag.val( "network" );
				});
			}


		});


		// Script saving events
		var scriptSelectionTags = me.tblNetworkSettingTags.find( 'tr.scriptAction select.scriptSelection' );

		scriptSelectionTags.change( function()
		{
			me.saveScriptSelection( $( this ) );
		});

	}

	// --  Events --------------------
	// -------------------------------


	// ------------------------------------------
	// ----- Create/Rename/Delete/Save Methods -------


	me.saveScriptSelection = function( scriptTag )
	{
		var actionType = scriptTag.attr( 'action' );
		var areaType = scriptTag.closest( 'tr.scriptAction' ).attr( 'area' );

		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var sectionData = PNSettingDataManager.getSectionData( settingData, me.sectionListTag.val() );

			if ( sectionData !== undefined )
			{
				// Get scripts selection data of this Network (that has network and networkChild script info)
				var scriptSelectionData = Util.getFromList( sectionData, "Script", "type" );

				var areaScripts = scriptSelectionData[ areaType ];

				// set the script selection
				areaScripts[ actionType ] = scriptTag.val();

				// Save the change
				me.systemSettingDataManager.saveSettingData( settingData
				, function() 
				{
					me.markDataChanged();
					Util.paintSuccess( scriptTag, true );
				}
				, function() 
				{ 					
					Util.paintError( scriptTag, true );
					alert( 'Failed to save the value.' ); 
				} 
				);
			}
		});
	}


	me.createNetwork = function( networkNameTag )
	{
		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var networkName = Util.trim( networkNameTag.val() );

			if ( networkName == '' )
			{
				alert( "Network name is empty!" );
			}
			else
			{
				var existingNetwork = PNSettingDataManager.getSection( settingData, networkName );

				if ( existingNetwork !== undefined )
				{
					alert( "Network with name, '" + networkName + "', aleady exists!" );
				}
				else
				{
					var ownerId = me.oProviderNetwork.getUserId();
					var networkId = Util.generateRandomId();

					// Create section data
					var newSec = PNSettingDataManager.insertNewSectionData( settingData, networkName, ownerId, networkId, me.oProviderNetwork.getInitialSecurity() );
						

					// Order by network secCode
					settingData = Util.sortByKey( settingData, "secCode" );


					// Save Data
					me.systemSettingDataManager.saveSettingData( settingData
					, function() 
					{
						me.markDataChanged();

						// repopulate the dropdown and select it
						me.populateSectionList( me.sectionListTag, settingData );
						me.sectionListTag.val( networkName );

						me.getAndMemorizeGeneralData( settingData );

						// Populate the table
						me.populateNetworkSettingTables( me.tblNetworkSettingTags, settingData, networkName );


						// Set Section visibility
						me.sectionVisibilityChangeByMode( false );

					}
					, function() { alert( 'Failed to create the value.' ); } 
					);
					
				}
			}
		});
	}


	me.renameNetwork = function( inputRenameTag, existingNetworkCode, returnFunc )
	{
		Util.paintClear( inputRenameTag );


		me.systemSettingDataManager.getSettingData( function( settingData )
		{
			var newNetworkName = Util.trim( inputRenameTag.val() );

			if ( newNetworkName == '' )
			{
				Util.paintWarning( inputRenameTag );

				alert( "Network name can not be empty!" );
			}
			else
			{
				var sameNameNetwork = PNSettingDataManager.getSection( settingData, newNetworkName );

				if ( sameNameNetwork !== undefined )
				{
					Util.paintWarning( inputRenameTag );

					alert( "Network with name, '" + newNetworkName + "', aleady exists!" );
				}
				else
				{
					var existingNetwork = PNSettingDataManager.getSection( settingData, existingNetworkCode );

					existingNetwork.secCode = newNetworkName;


					// Save Data
					me.systemSettingDataManager.saveSettingData( settingData
					, function() 
					{
						me.markDataChanged();

						// repopulate the dropdown and select it
						me.populateSectionList( me.sectionListTag, settingData );
						me.sectionListTag.val( newNetworkName );

						// Populate the table
						me.populateNetworkSettingTables( me.tblNetworkSettingTags, settingData, newNetworkName );

						returnFunc( true );

					}
					, function() 
					{ 
						alert( 'Failed to rename the network .' ); 
						returnFunc( false );
					} 
					);
				}
			}
		});				
	}


	me.renameScript = function( inputRenameTag, scriptId, returnFunc )
	{
		me.scriptDataManagerForm.renameScript( inputRenameTag, scriptId, returnFunc );		
	}

	me.renameHtmlTab = function( inputRenameTag, htmlTabId, returnFunc )
	{
		me.htmlTabDataManagerForm.renameHtmlTab( inputRenameTag, htmlTabId, returnFunc );		
	}

	me.deleteNetwork = function( sectionCode )
	{
		me.markDataChanged();

		PNSettingDataManager.removeSection( me.systemSettingDataManager, sectionCode
		, function() 
		{ 
			me.divSettingMainContentTag.hide();

			MsgManager.msgAreaShow( "Successfully deleted the section!" );

			me.retrieveAndPopulate(); 
		}
		, function() { alert( 'Failed to delete the section!' ); }
		);
	};


	me.saveNetworkRowData = function( ctrlTag, trCurrent )
	{
		// if 'trCurrent' is not provided, if 'ctrlTag' is defined, get the 'trCurrent' from 'ctrlTag'.
		if ( ctrlTag !== undefined && trCurrent === undefined ) trCurrent = ctrlTag.closest( 'tr.trData' );

		if ( trCurrent !== undefined )
		{
			me.markDataChanged();

			// Generate the data
			var rowData = me.generateSettingData_FromRow( trCurrent );
			var secCode = me.sectionListTag.val();

			PNSettingDataManager.saveRowData( me.systemSettingDataManager, ctrlTag, secCode, rowData, function( settingData )
			{
				if ( rowData.type == "CountryID" )
				{
					// If the data is country Id, then, check for country shape info.
					me.checkCountryInfoAndSet( settingData, secCode, function( countryInfo )
					{
						MsgManager.msgAreaShow( "'" + countryInfo.name + "' country shape set for '" + secCode + "' network." );
					});
				}				
			});
		}
		else
		{
			console.log( 'Issue: On me.saveNetworkRowData, trCurrent could not be identified' );
		}
	}

	// ----- Create/Rename/Delete/Save Methods -------
	// ------------------------------------------


	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}

// Class - SettingDataPopupForm
// =============================================


// =============================================
// Class - ScriptDataManagerForm
//		- Used for Script Data Manager Form

function ScriptDataManagerForm( oProviderNetwork )
{
	var me = this;

	me.oProviderNetwork = oProviderNetwork;
	me.scriptDataManager;
	me.scriptRenamePopupForm;
	
	// ------ Tags ---------------
	me.scriptListTag = $( '#scriptList' );
	me.btnAddScriptTag = $( '#btnAddScript' );

	me.tdScriptAddTag = $( '#tdScriptAdd' );

	me.scriptNameTag = $( '#scriptName' );
	me.btnCreateScriptTag = $( '#btnCreateScript' );
	me.btnCreateScript_CancelTag = $( '#btnCreateScript_Cancel' );

	me.btnScriptRenameShowTag = $( '#btnScriptRenameShow' );

	me.divScriptMainContentTag = $( '#divScriptMainContent' );
	me.tblScriptDataTag = $( '#tblScriptData' );
	me.trScriptSettingTag = $( '#trScriptSetting' );
	me.spanScriptNameTag = $( 'span.spanScriptName' );
	me.divScriptSettingTag = $( '#divScriptSetting' );
	me.txtScriptDataTag = $( '#txtScriptData' );

	me.btnScriptSaveTag = $( '#btnScriptSave' );


	// ------------------------------------------
	// ----- Methods ------------------
	
	// ------------------------------------------
	// ----- Initial Setup and ... -------

	me.initialSetup = function()
	{

		me.scriptRenamePopupForm = new ScriptRenamePopupForm( me );

		// Create 'ScriptDataManager'
		me.scriptDataManager = new SystemSettingDataManager( "App_ProdiverNetwork_Scripts" );


		PNScriptDataManager.scriptDataInitialAction( me.scriptDataManager, function( scriptList ) 
		{
			// 1. load the dropdown
			me.populateScriptList( me.scriptListTag, scriptList );

			// 2. setup events ( 'Add Script' button, select script action )
			me.setup_Events();
			
		} );

		me.visibleTags();
	}

	// ----- End of Initial Setup and ... -------
	// ------------------------------------------


	me.visibleTags = function()
	{
		me.btnAddScriptTag.show();
	}

	me.populateScriptList = function( scriptListTag, scriptList )
	{
		scriptListTag.empty();

		// Add empty default selection
		scriptListTag.append( '<option value="">Select Script</option>' );		

		$.each( scriptList, function( i_script, item_script )
		{
			if ( Util.checkDefined( item_script ) )
			{
				scriptListTag.append( '<option value="' + item_script.id + '">' + item_script.name + '</option>' );
			}
		});
	}


	// --------------------------------------
	// --- Events ---------------------------

	me.setup_Events = function()
	{

		me.scriptListTag.change( function ()
		{	
			// Reset Display Contents
			me.divScriptMainContentTag.hide( "fast" );

			var scriptId = $( this ).val();

			if ( scriptId != "" )
			{
				me.scriptDataManager.getSettingData( function( settingData )
				{
					// get script
					var scriptData = PNScriptDataManager.getScript( settingData, scriptId, "id" );

					//console.log( 'Before ScriptData: ' + JSON.stringify( scriptData ) + ', scriptId: ' + scriptId );

					// populate the script
					me.populateScriptTable( scriptData ); 

					me.divScriptMainContentTag.show( "fast" );

					//me.populateNetworkSettingTables( me.tblNetworkSettingTags, settingData, me.sectionListTag.val() );
				});
			}
		});


		me.btnAddScriptTag.click( function ()
		{
			me.sectionVisibilityChangeByMode( true );
		});


		me.btnCreateScriptTag.click( function()
		{
			me.createScript( me.scriptNameTag );		
		});


		me.btnCreateScript_CancelTag.click( function()
		{
			me.sectionVisibilityChangeByMode( false );
		});


		me.btnScriptSaveTag.click( function()
		{
			me.scriptDataSave();
		});


		// -------- Network Rename Related  -----------------
		me.btnScriptRenameShowTag.click( function()
		{
			me.scriptRenamePopupForm.openForm( me.scriptListTag.val(), me.spanScriptNameTag.text() );			
		});

	}


	// If 'Add Section' mode, hide 'Section Edit' controls and the section contents.
	me.sectionVisibilityChangeByMode = function( enable )
	{
		me.scriptNameTag.val( '' );

		if ( enable )
		{
			// Disable the scriptList selection
			Util.disableTag( me.scriptListTag, enable );

			// Show
			me.tdScriptAddTag.show( "medium" );
			me.divScriptMainContentTag.hide( "medium" );
		}
		else
		{
			// Enable the scriptList selection
			Util.disableTag( me.scriptListTag, enable );

			me.tdScriptAddTag.hide( "medium" );

			if ( me.scriptListTag.val() != "" ) me.divScriptMainContentTag.show( "medium" );
		}
	}


	// -----------------------------------------------
	// ----- Create/Rename/Delete/Save Methods -------

	me.createScript = function( scriptNameTag )
	{

		me.scriptDataManager.getSettingData( function( settingData )
		{
			var scriptName = Util.trim( scriptNameTag.val() );

			if ( scriptName == '' )
			{
				alert( "Script name is empty!" );
			}
			else
			{			
				// Check for existing script name
				var existingScript = PNScriptDataManager.getScript( settingData, scriptName, "name" );

				if ( existingScript !== undefined )
				{
					alert( "Script with name, '" + scriptName + "', aleady exists!" );
				}
				else
				{
					var ownerId = me.oProviderNetwork.getUserId();
					var scriptId = Util.generateRandomId();

					//console.log( 'ownerId: ' + ownerId );

					// Create section data
					var newScriptData = { "id": scriptId, "owner": ownerId, "name": scriptName, "value": "" };

					settingData.push( newScriptData );

						
					// Save Data
					me.scriptDataManager.saveSettingData( settingData
					, function() 
					{
						// repopulate the dropdown and select it
						me.populateScriptList( me.scriptListTag, settingData )

						me.scriptListTag.val( scriptId );

						// Populate the table
						me.populateScriptTable( newScriptData );


						// Set Section Visibility
						me.sectionVisibilityChangeByMode( false );
					}
					, function() { alert( 'Failed to create the value.' ); } 
					);
					
				}
			}
		});
	}


	me.scriptDataSave = function()
	{
		Util.paintClear( me.txtScriptDataTag );

		me.scriptDataManager.getSettingData( function( settingData )
		{
			// get script
			var scriptData = PNScriptDataManager.getScript( settingData, me.scriptListTag.val(), "id" );

			scriptData.value = Util.valueEscape( me.txtScriptDataTag.val() );

			// save the info.
			me.scriptDataManager.saveSettingData( settingData
			, function() 
			{
				Util.paintSuccess( me.txtScriptDataTag, true );
			}
			, function() 
			{ 
				Util.paintError( me.txtScriptDataTag, true );
				alert( 'Failed to save the script data.' ); 
			} 
			);

		});
	}


	me.renameScript = function( inputRenameTag, scriptId, returnFunc )
	{
		Util.paintClear( inputRenameTag );

		var newScriptName = Util.trim( inputRenameTag.val() );

		me.scriptDataManager.getSettingData( function( settingData )
		{

			if ( newScriptName == '' )
			{
				Util.paintWarning( inputRenameTag );

				alert( "Script name can not be empty!" );
			}
			else
			{
				var existingScriptData = PNScriptDataManager.getScript( settingData, newScriptName, "name" );

				if ( existingScriptData !== undefined )
				{
					Util.paintWarning( inputRenameTag );

					alert( "Script with name, '" + newScriptName + "', aleady exists!" );
				}
				else
				{
					var scriptData = PNScriptDataManager.getScript( settingData, scriptId, "id" );

					scriptData.name = newScriptName;
					
					// Save Data
					me.scriptDataManager.saveSettingData( settingData
					, function() 
					{
						// repopulate the dropdown and select it
						me.populateScriptList( me.scriptListTag, settingData );
						me.scriptListTag.val( scriptId );

						// Populate the table
						me.populateScriptTable( scriptData );

						returnFunc( true );

					}
					, function() 
					{ 
						alert( 'Failed to rename the script .' ); 
						returnFunc( false );
					} 
					);
				}
			}
		});				
	}



	// ----- End of Create/Rename/Delete/Save Methods -------
	// -----------------------------------------------

	// ----- Populate Related ------

	me.populateScriptTable = function( scriptData )
	{
		// reset script data content
		me.resetScriptData();

		if ( scriptData !== undefined )
		{
			//console.log( 'ScriptData: ' + JSON.stringify( scriptData ) );

			me.spanScriptNameTag.text( scriptData.name );

			me.txtScriptDataTag.val( Util.valueUnescape( scriptData.value ) );
		}
		else
		{
			console.log( 'Script Data is undefined' );
		}
	}

	me.resetScriptData = function()
	{
		me.spanScriptNameTag.text( "" );

		Util.paintClear( me.txtScriptDataTag.val( "" ) );
	}


	// --------------------------
	// Initial Run methods

	// Initial Run Call
	me.initialSetup();
}

// Class - ScriptDataManagerForm
// =============================================



// =============================================
// Class - HtmlTabDataManagerForm
//		- Used for Html Tab Data Manager Form

function HtmlTabDataManagerForm( oProviderNetwork )
{
	var me = this;

	me.oProviderNetwork = oProviderNetwork;
	me.htmlTabDataManager;
	me.htmlTabRenamePopupForm;
	
	// ------ Tags ---------------
	me.htmlTabListTag = $( '#htmlTabList' );
	me.btnAddHtmlTabTag = $( '#btnAddHtmlTab' );

	me.tdHtmlTabAddTag = $( '#tdHtmlTabAdd' );

	me.htmlTabNameTag = $( '#htmlTabName' );
	me.btnCreateHtmlTabTag = $( '#btnCreateHtmlTab' );
	me.btnCreateHtmlTab_CancelTag = $( '#btnCreateHtmlTab_Cancel' );

	me.btnHtmlTabRenameShowTag = $( '#btnHtmlTabRenameShow' );

	me.divHtmlTabMainContentTag = $( '#divHtmlTabMainContent' );
	me.tblHtmlTabDataTag = $( '#tblHtmlTabData' );
	me.trHtmlTabSettingTag = $( '#trHtmlTabSetting' );
	me.spanHtmlTabNameTag = $( 'span.spanHtmlTabName' );
	me.divHtmlTabSettingTag = $( '#divHtmlTabSetting' );
	me.txtHtmlTabDataTag = $( '#txtHtmlTabData' );

	me.btnHtmlTabSaveTag = $( '#btnHtmlTabSave' );


	// ------------------------------------------
	// ----- Methods ------------------
	
	// ------------------------------------------
	// ----- Initial Setup and ... -------

	me.initialSetup = function()
	{

		me.htmlTabRenamePopupForm = new HtmlTabRenamePopupForm( me );

		// Create 'HtmlTabDataManager'
		me.htmlTabDataManager = new SystemSettingDataManager( "App_ProdiverNetwork_HtmlTab" );


		PNHtmlTabDataManager.htmlTabDataInitialAction( me.htmlTabDataManager, function( settingData ) 
		{
			// 1. load the dropdown
			me.populateHtmlTabList( me.htmlTabListTag, settingData );

			// 2. setup events ( 'Add HtmlTab' button, select htmlTab action )
			me.setup_Events();
			
		} );

		me.visibleTags();
	}

	// ----- End of Initial Setup and ... -------
	// ------------------------------------------


	me.visibleTags = function()
	{
		me.btnAddHtmlTabTag.show();
	}

	me.populateHtmlTabList = function( htmlTabListTag, settingData )
	{
		htmlTabListTag.empty();

		// Add empty default selection
		htmlTabListTag.append( '<option value="">Select HtmlTab</option>' );		

		$.each( settingData, function( i_htmlTab, item_htmlTab )
		{
			if ( Util.checkDefined( item_htmlTab ) )
			{
				htmlTabListTag.append( '<option value="' + item_htmlTab.id + '">' + item_htmlTab.name + '</option>' );
			}
		});
	}


	// --------------------------------------
	// --- Events ---------------------------

	me.setup_Events = function()
	{

		me.htmlTabListTag.change( function ()
		{	
			// Reset Display Contents
			me.divHtmlTabMainContentTag.hide( "fast" );

			var htmlTabId = $( this ).val();

			if ( htmlTabId != "" )
			{
				me.htmlTabDataManager.getSettingData( function( settingData )
				{
					// get htmlTab
					var htmlTabData = PNHtmlTabDataManager.getHtmlTab( settingData, htmlTabId, "id" );

					// populate the htmlTab
					me.populateHtmlTabTable( htmlTabData ); 

					me.divHtmlTabMainContentTag.show( "fast" );
				});
			}
		});


		me.btnAddHtmlTabTag.click( function ()
		{
			me.sectionVisibilityChangeByMode( true );
		});


		me.btnCreateHtmlTabTag.click( function()
		{
			me.createHtmlTab( me.htmlTabNameTag );		
		});


		me.btnCreateHtmlTab_CancelTag.click( function()
		{
			me.sectionVisibilityChangeByMode( false );
		});


		me.btnHtmlTabSaveTag.click( function()
		{
			me.htmlTabDataSave();
		});


		// -------- Network Rename Related  -----------------
		me.btnHtmlTabRenameShowTag.click( function()
		{
			me.htmlTabRenamePopupForm.openForm( me.htmlTabListTag.val(), me.spanHtmlTabNameTag.text() );			
		});

	}


	// If 'Add Section' mode, hide 'Section Edit' controls and the section contents.
	me.sectionVisibilityChangeByMode = function( enable )
	{
		me.htmlTabNameTag.val( '' );

		if ( enable )
		{
			// Disable the htmlTabList selection
			Util.disableTag( me.htmlTabListTag, enable );

			// Show Country Code Input
			me.tdHtmlTabAddTag.show( "medium" );
			me.divHtmlTabMainContentTag.hide( "medium" );
		}
		else
		{
			// Enable the htmlTabList selection
			Util.disableTag( me.htmlTabListTag, enable );

			me.tdHtmlTabAddTag.hide( "medium" );

			console.log( 'visibilityChangeMode, htmlTabListTagVal: ' + me.htmlTabListTag.val() );

			if ( me.htmlTabListTag.val() != "" ) 
			{
				console.log( 'me.divHtmlTabMainContentTag showing' );
				me.divHtmlTabMainContentTag.show( "medium" );
			}
		}
	}


	// -----------------------------------------------
	// ----- Create/Rename/Delete/Save Methods -------

	me.createHtmlTab = function( htmlTabNameTag )
	{

		me.htmlTabDataManager.getSettingData( function( settingData )
		{
			var htmlTabName = Util.trim( htmlTabNameTag.val() );

			if ( htmlTabName == '' )
			{
				alert( "HtmlTab name is empty!" );
			}
			else
			{			
				// Check for existing htmlTab name
				var existingHtmlTab = PNHtmlTabDataManager.getHtmlTab( settingData, htmlTabName, "name" );

				if ( existingHtmlTab !== undefined )
				{
					alert( "HtmlTab with name, '" + htmlTabName + "', aleady exists!" );
				}
				else
				{
					var ownerId = me.oProviderNetwork.getUserId();
					var htmlTabId = Util.generateRandomId();

					//console.log( 'ownerId: ' + ownerId );

					// Create section data
					var newHtmlTabData = { "id": htmlTabId, "owner": ownerId, "name": htmlTabName, "value": "" };

					settingData.push( newHtmlTabData );

						
					// Save Data
					me.htmlTabDataManager.saveSettingData( settingData
					, function() 
					{	
						// repopulate the dropdown and select it
						me.populateHtmlTabList( me.htmlTabListTag, settingData )

						me.htmlTabListTag.val( htmlTabId );

						// Populate the table
						me.populateHtmlTabTable( newHtmlTabData );

						me.sectionVisibilityChangeByMode( false );
					}
					, function() { alert( 'Failed to create the value.' ); } 
					);
					
				}
			}
		});
	}


	me.htmlTabDataSave = function()
	{
		Util.paintClear( me.txtHtmlTabDataTag );

		me.htmlTabDataManager.getSettingData( function( settingData )
		{
			// get htmlTab
			var htmlTabData = PNHtmlTabDataManager.getHtmlTab( settingData, me.htmlTabListTag.val(), "id" );

			htmlTabData.value = Util.valueEscape( me.txtHtmlTabDataTag.val() );

			// save the info.
			me.htmlTabDataManager.saveSettingData( settingData
			, function() 
			{
				Util.paintSuccess( me.txtHtmlTabDataTag, true );
			}
			, function() 
			{ 
				Util.paintError( me.txtHtmlTabDataTag, true );
				alert( 'Failed to save the htmlTab data.' ); 
			} 
			);

		});
	}


	me.renameHtmlTab = function( inputRenameTag, htmlTabId, returnFunc )
	{
		Util.paintClear( inputRenameTag );

		var newHtmlTabName = Util.trim( inputRenameTag.val() );

		me.htmlTabDataManager.getSettingData( function( settingData )
		{

			if ( newHtmlTabName == '' )
			{
				Util.paintWarning( inputRenameTag );

				alert( "HtmlTab name can not be empty!" );
			}
			else
			{
				var existingHtmlTabData = PNHtmlTabDataManager.getHtmlTab( settingData, newHtmlTabName, "name" );

				if ( existingHtmlTabData !== undefined )
				{
					Util.paintWarning( inputRenameTag );

					alert( "HtmlTab with name, '" + newHtmlTabName + "', aleady exists!" );
				}
				else
				{
					var htmlTabData = PNHtmlTabDataManager.getHtmlTab( settingData, htmlTabId, "id" );

					htmlTabData.name = newHtmlTabName;
					
					// Save Data
					me.htmlTabDataManager.saveSettingData( settingData
					, function() 
					{
						// repopulate the dropdown and select it
						me.populateHtmlTabList( me.htmlTabListTag, settingData );
						me.htmlTabListTag.val( htmlTabId );

						// Populate the table
						me.populateHtmlTabTable( htmlTabData );

						returnFunc( true );

					}
					, function() 
					{ 
						alert( 'Failed to rename the htmlTab .' ); 
						returnFunc( false );
					} 
					);
				}
			}
		});				
	}



	// ----- End of Create/Rename/Delete/Save Methods -------
	// -----------------------------------------------

	// ----- Populate Related ------

	me.populateHtmlTabTable = function( htmlTabData )
	{
		// reset htmlTab data content
		me.resetHtmlTabData();

		if ( htmlTabData !== undefined )
		{
			//console.log( 'HtmlTabData: ' + JSON.stringify( htmlTabData ) );

			me.spanHtmlTabNameTag.text( htmlTabData.name );

			me.txtHtmlTabDataTag.val( Util.valueUnescape( htmlTabData.value ) );
		}
		else
		{
			console.log( 'HtmlTab Data is undefined' );
		}
	}

	me.resetHtmlTabData = function()
	{
		me.spanHtmlTabNameTag.text( "" );

		Util.paintClear( me.txtHtmlTabDataTag.val( "" ) );
	}

	// --------------------------
	// Initial Run methods

	// Initial Run Call
	me.initialSetup();
}

// Class - HtmlTabDataManagerForm
// =============================================





// =============================================
// -- Class - NetworkRenamePopupForm
//		- Network Rename Popup Form
function NetworkRenamePopupForm( settingDataPopupForm )
{
	var me = this;

	me.oSettingDataPopupForm = settingDataPopupForm;
		
	me.dialogFormTag = $( "#networkRenameDialogForm" );

	me.inputNetworkRenameTag = $( '#inputNetworkRename' );
	me.btnNetworkRenameChangeTag = $( '#btnNetworkRenameChange' );
	//me.btnNetworkRenameCancelTag = $( '#btnNetworkRenameCancel' );

	me.width = me.dialogFormTag.attr( 'formWidth' );
	me.height = me.dialogFormTag.attr( 'formHeight' );

	me.secCodeName = "";

	// ---------------------------------------

	me.openForm = function( secCodeName )
	{	
		me.secCodeName = secCodeName;

		Util.paintWhite( me.inputNetworkRenameTag.val( secCodeName ) );

		me.dialogFormTag.dialog( "open" );
	};

	me.FormPopupSetup = function()
	{
		// -- Set up the form --
		me.dialogFormTag.dialog({
			autoOpen: false
			,title: "Network Rename"
			,width: me.width
			,height: me.height
			,modal: true
			,close: function( event, ui ) 
			{
				$( this ).dialog( "close" );
			}
		});
	};

	me.setup_Events = function()
	{
		me.btnNetworkRenameChangeTag.click( function()
		{
			me.oSettingDataPopupForm.renameNetwork( me.inputNetworkRenameTag, me.secCodeName, function( success )
			{
				if ( success ) 
				{
					MsgManager.msgAreaShow( "Successfully renamed the network to '" + me.inputNetworkRenameTag.val() + "'" );
					me.dialogFormTag.dialog( "close" );					
				}
			});
		});

		/*
		me.btnNetworkRenameCancelTag.click( function()
		{
			me.dialogFormTag.dialog( "close" );
		});
		*/
	}

	// -------------------------------------------
	// Initial Setup Call
	me.initialSetup = function()
	{
		me.FormPopupSetup();

		me.setup_Events();
	};

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}


// -------------------------------------------
// -- Class - ScriptRenamePopupForm
//		- Script Rename Popup Form
function ScriptRenamePopupForm( settingDataPopupForm )
{
	var me = this;

	me.oSettingDataPopupForm = settingDataPopupForm;
		
	me.dialogFormTag = $( "#scriptRenameDialogForm" );

	me.inputScriptRenameTag = $( '#inputScriptRename' );
	me.btnScriptRenameChangeTag = $( '#btnScriptRenameChange' );
	//me.btnScriptRenameCancelTag = $( '#btnScriptRenameCancel' );

	me.width = me.dialogFormTag.attr( 'formWidth' );
	me.height = me.dialogFormTag.attr( 'formHeight' );

	me.scriptId = "";
	me.scriptName = "";

	// ---------------------------------------

	me.openForm = function( id, name )
	{	
		me.scriptId = id;
		me.scriptName = name;

		Util.paintWhite( me.inputScriptRenameTag.val( me.scriptName ) );

		me.dialogFormTag.dialog( "open" );
	};

	me.FormPopupSetup = function()
	{
		// -- Set up the form --
		me.dialogFormTag.dialog({
			autoOpen: false
			,title: "Script Rename"
			,width: me.width
			,height: me.height
			,modal: true
			,close: function( event, ui ) 
			{
				$( this ).dialog( "close" );
			}
		});
	};

	me.setup_Events = function()
	{
		me.btnScriptRenameChangeTag.click( function()
		{
			me.oSettingDataPopupForm.renameScript( me.inputScriptRenameTag, me.scriptId, function( success )
			{
				if ( success ) 
				{
					MsgManager.msgAreaShow( "Successfully renamed the script to '" + me.inputScriptRenameTag.val() + "'" );
					me.dialogFormTag.dialog( "close" );					
				}
			});
		});

		/*
		me.btnScriptRenameCancelTag.click( function()
		{
			me.dialogFormTag.dialog( "close" );
		});
		*/
	}

	// -------------------------------------------
	// Initial Setup Call
	me.initialSetup = function()
	{
		me.FormPopupSetup();

		me.setup_Events();
	};

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}



// -------------------------------------------
// -- Class - HtmlTabRenamePopupForm
//		- HtmlTab Rename Popup Form
function HtmlTabRenamePopupForm( settingDataPopupForm )
{
	var me = this;

	me.oSettingDataPopupForm = settingDataPopupForm;
		
	me.dialogFormTag = $( "#htmlTabRenameDialogForm" );

	me.inputHtmlTabRenameTag = $( '#inputHtmlTabRename' );
	me.btnHtmlTabRenameChangeTag = $( '#btnHtmlTabRenameChange' );
	//me.btnHtmlTabRenameCancelTag = $( '#btnHtmlTabRenameCancel' );

	me.width = me.dialogFormTag.attr( 'formWidth' );
	me.height = me.dialogFormTag.attr( 'formHeight' );

	me.htmlTabId = "";
	me.htmlTabName = "";

	// ---------------------------------------

	me.openForm = function( id, name )
	{	
		me.htmlTabId = id;
		me.htmlTabName = name;

		Util.paintWhite( me.inputHtmlTabRenameTag.val( me.htmlTabName ) );

		me.dialogFormTag.dialog( "open" );
	};

	me.FormPopupSetup = function()
	{
		// -- Set up the form --
		me.dialogFormTag.dialog({
			autoOpen: false
			,title: "HtmlTab Rename"
			,width: me.width
			,height: me.height
			,modal: true
			,close: function( event, ui ) 
			{
				$( this ).dialog( "close" );
			}
		});
	};

	me.setup_Events = function()
	{
		me.btnHtmlTabRenameChangeTag.click( function()
		{
			me.oSettingDataPopupForm.renameHtmlTab( me.inputHtmlTabRenameTag, me.htmlTabId, function( success )
			{
				if ( success ) 
				{
					MsgManager.msgAreaShow( "Successfully renamed the htmlTab to '" + me.inputHtmlTabRenameTag.val() + "'" );
					me.dialogFormTag.dialog( "close" );					
				}
			});
		});

		/*
		me.btnHtmlTabRenameCancelTag.click( function()
		{
			me.dialogFormTag.dialog( "close" );
		});
		*/
	}

	// -------------------------------------------
	// Initial Setup Call
	me.initialSetup = function()
	{
		me.FormPopupSetup();

		me.setup_Events();
	};

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}


// -------------------------------------------
// -- Setting Data Manager Class
//		- Help manage setting Data.  (Get, Save, Load/Retrieve)
//		- Keep the data in memory after first retrieve.

function SystemSettingDataManager( dbSettingName )
{
	var me = this;

	me.queryURL_SystemSettings = _queryURL_api + 'systemSettings/';
	me.dbSettingName = dbSettingName; //"App_Outlets_Settings";

	me.dbSettingName_Back = dbSettingName + "_Back";

	// Retrieve Data store variables
	me.settingData;

	me.programsData;


	// --------- Methods ---------

	me.getSettingData = function( execFunc, notExistsFunc )
	{
		if ( me.settingData !== undefined )
		{
			execFunc( me.settingData );
		}
		else
		{

			RESTUtil.getAsynchData( me.queryURL_SystemSettings + me.dbSettingName
			, function( json_Data )
			{
				if ( Util.checkValue( json_Data ) )
				{					
					me.settingData = json_Data;
				}
				else
				{
					me.settingData = new Array();
				}

				execFunc( me.settingData );
			}
			, function()
			{
				if ( notExistsFunc !== undefined ) notExistsFunc();
			});
		}
	}


	me.getSettingValue = function( settingName, execFunc )
	{
		me.getSettingData( function( dataJson )
		{
			var settingValue = "";

			$.each( dataJson, function( i, item )
			{
				if ( item.name == settingName )
				{
					settingValue = item.value;
				}
			});

			execFunc( settingValue );
		});
	}


	me.getSettingDataByType = function( type, execFunc )
	{
		me.getSettingData( function( dataJson )
		{
			var typeList = new Array();

			$.each( dataJson, function( i, item )
			{
				if ( item.type == type )
				{
					typeList.push( item.value );
				}
			});

			execFunc( typeList );
		});
	}


	me.saveSettingData = function( settingData, successFunc, failFunc, loadingStart, loadingEnd )
	{		
		me.divNetworkSettingLoadingTag = $( '#divNetworkSettingLoading' );
		me.settingDialogFormTag = $( '#settingDialogForm' );

		var buttonsTag = me.settingDialogFormTag.closest( 'div.ui-dialog' ).find( 'button.ui-button' );


		RESTUtil.submitData_Text( me.queryURL_SystemSettings + me.dbSettingName, settingData
		, function()
		{
			me.settingData = settingData;

			if ( successFunc !== undefined ) successFunc();
		}
		, function( returnData )
		{
			if ( failFunc !== undefined ) failFunc( returnData );

			alert( 'Failed to save "Setting Data".  Reason: ' + returnData.responseJSON.message );
		}
		, function()
		{
			me.divNetworkSettingLoadingTag.show();
			
			Util.disableTag( buttonsTag, true );  
			buttonsTag.addClass( 'disableButton' );

			if ( loadingStart !== undefined ) loadingStart();
		}
		, function()
		{
			me.divNetworkSettingLoadingTag.hide();

			Util.disableTag( buttonsTag, false );  
			buttonsTag.removeClass( 'disableButton' );

			if ( loadingEnd !== undefined ) loadingEnd();
		}
		//, loadingStart
		//, loadingEnd
		);
	}

	me.updateSettingDataChanges = function( returnFunc )
	{
		me.getSettingData( function( settingData )
		{
			me.saveSettingData( settingData, function()
			{
				returnFunc( settingData );
			});
		});
	}

	me.saveSettingDataBackUp = function( settingData, successFunc, failFunc )
	{
		RESTUtil.submitData_Text( me.queryURL_SystemSettings + me.dbSettingName_Back, settingData
		, successFunc, failFunc );
	}


	me.clearSettingData = function( successFunc, failFunc )
	{
		if ( confirm( "Are you sure you want to erase setting data?" ) )
		{
			RESTUtil.submitPostAsyn( 'DELETE', new Object(), me.queryURL_SystemSettings + me.dbSettingName
			, function() 
			{
				delete me.settingData;
				successFunc();
			}
			, failFunc
			);
		}
	}

	// --------------------------------------------------------------------

	me.initialRun = function()
	{
		//me.htmlTabSettingDataInitialAction();
	}


	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialRun();

}

// -- Setting Data Manager Class
// -------------------------------------------


// -------------------------------------------
// -- Static Provider Network Data Manager Class
//		- Helper methods for easier data access/manipulation
//			specific to the Provider Network Data Structure.

function PNSettingDataManager() {}

// ----------------------------------------------------------------
// --- Network Setting Data initial Actions Related ---------------

PNSettingDataManager.networkSettingDataInitialAction = function( settingDataManager, userSecurityManager, afterInitFunc )
{
	settingDataManager.getSettingData( 
	function( settingData ) 
	{	
		// On initial load of network setting data, check the possible data update (due to data version diff), and perform the data update.
		var updated = PNSettingDataManager.updateSettingData_IfOld( settingData );
		
		if( updated )
		{
			settingDataManager.saveSettingData( settingData, function()
			{
				afterInitFunc( settingData );				
			});
		}
		else
		{
			afterInitFunc( settingData );
		}
	}
	, function() 
	{

		if ( confirm( "System setting for this does not exist.  Do you want to create one?" ) )
		{
			var ownerId = userSecurityManager.getUserId();

			settingData = PNSettingDataManager.generateInitialData( ownerId );

			settingDataManager.saveSettingData( settingData, function() 
			{ 				
				MsgManager.msgAreaShow( 'Successfully created system setting data.' ); 
				
				afterInitFunc( settingData );
			}
			, function() { alert( 'Failed to create the system setting data.' ); } 
			);
		}
	});
}

// REVIEW CHANGED #1
PNSettingDataManager.updateSettingData_IfOld = function( settingData )
{
	var updated = false;

	$.each( settingData, function( i, item )
	{
		if( item.version === undefined )
		{				
			$.each( item.data, function( j, item_data )
			{
				if( item_data.AttrData !== undefined && item_data.AttrData.attributes !== undefined )
				{
					var attributes = item_data.AttrData.attributes;
					var dataChanged = [];

					for( var k in attributes )
					{
						dataChanged.push( { "type": "ou_attr", "value" :  attributes[k] } );
					}
					
					item_data.AttrData.attributes = dataChanged;									
				}
			});

			item.version = "1";
			updated = true;
		}


		if ( item.version == "1" )
		{
			var networkObj = Util.getFromList( item.data, "Network", "type" );
			var networkChildObj = Util.getFromList( item.data, "NetworkChild", "type" );

			if ( networkObj !== undefined ) 
			{
				PNSettingDataManager.replaceNetworkPart( "Network", networkObj, item.data );
				Util.RemoveFromArray( item.data, "type", "Network" );
			}

			if ( networkChildObj !== undefined ) 
			{
				PNSettingDataManager.replaceNetworkPart( "NetworkChild", networkChildObj, item.data );
				Util.RemoveFromArray( item.data, "type", "NetworkChild" );
			}

			item.version = "2";
			updated = true;
		}

		if ( item.version == "2" )
		{
			var networkObj = Util.getFromList( item.data, "Network", "type" );
			var networkChildObj = Util.getFromList( item.data, "NetworkChild", "type" );

			if ( networkObj !== undefined ) 
			{
				Util.RemoveFromArray( item.data, "type", "Network" );
				updated = true;
			}

			if ( networkChildObj !== undefined ) 
			{
				Util.RemoveFromArray( item.data, "type", "NetworkChild" );
				updated = true;
			}

			// If script does not exists, create the script data.
			var scriptSelections = Util.getFromList( item.data, "Script", "type" );

			if ( scriptSelections === undefined )
			{
				item.data.push( Util.getDeepCopy( PNSettingDataManager.scriptData_Initial ) );

				updated = true;	
			}

		}

	});

	return updated;
}


PNSettingDataManager.replaceNetworkPart = function( typeStr, item_data, item_dataList )
{
	// typeStr == "NetworkChild"  && typeStr == "Network"
	if( item_data.type == typeStr )
	{
		
		var network_Attr = Util.getFromList( item_dataList, typeStr + "_Attr", "type" );
		if ( network_Attr === undefined ) 
		{
			network_Attr = { "name": typeStr + " Fields", "type": typeStr + "_Attr", "AttrData":{ "attributes":[] } };
			
			if ( item_data.AttrData !== undefined && item_data.AttrData.attributes !== undefined )
			{
				$.each( item_data.AttrData.attributes, function( i_attr, item_attr )
				{
					network_Attr.AttrData.attributes.push( item_attr );	
				});
			}

			item_dataList.push( network_Attr );
		}
		

		var network_OUGroup = Util.getFromList( item_dataList, typeStr + "_OUGroup", "type" );
		if ( network_OUGroup === undefined ) 
		{
			network_OUGroup = { "name": typeStr + " OrgUnitGroup", "type": typeStr + "_OUGroup", "value":"" };
			
			network_OUGroup.value = item_data.OUGroupID;

			item_dataList.push( network_OUGroup );
		}


		if ( typeStr == "NetworkChild" )
		{
			var networkChild_Use = Util.getFromList( item_dataList, typeStr + "_Use", "type" );
			if ( networkChild_Use === undefined ) 
			{
				networkChild_Use = { "name": typeStr + " Use", "type": typeStr + "_Use", "value":"" };
				
				networkChild_Use.value = ( item_data.useNetworkChild ) ? "Y" : "";

				item_dataList.push( networkChild_Use );
			}
		}
	}
}

// --- End of Network Setting Data initial Actions Related ---------------
// ----------------------------------------------------------------


// ---------- Network/Section GET ---------------
PNSettingDataManager.getSettingSecData_MatchingCountry = function( settingData, ouList )
{
	var secCountryObj;

	// 1. Loop through setting sections, get 'CountryID'.
	// 2. Compare CountryID against 'ouList' and see if any of them matches.
	// 3. If matches, return the reference of the matching section obj.

	$.each( settingData, function( i_sec, item_sec )
	{
		$.each( item_sec.data, function( i_secData, item_secData )
		{
			if ( item_secData.type == "CountryID" && Util.checkValue( item_secData.value ) )
			{
				$.each( ouList.organisationUnits, function( i_ou, item_ou )
				{
					if ( item_ou.id == item_secData.value )
					{
						secCountryObj = item_sec;
						return false;
					}
				});				
			}

			if ( Util.checkDefined( secCountryObj ) ) return false;
		});

		if ( Util.checkDefined( secCountryObj ) ) return false;
	});

	
	return secCountryObj;
}


PNSettingDataManager.getSettingSecData_CurrentCountry = function( settingData, currentLoc, execFunc )
{

	var secCountryObj;
	var deferredArrActions_countryFind = [];

	$.each( settingData, function( i_sec, item_sec )
	{
		$.each( item_sec.data, function( i_secData, item_secData )
		{
			if ( item_secData.type == "CountryID" && Util.checkValue( item_secData.value ) )
			{
				var requestUrl = _queryURL_checkLocationWithinOrgUnit + 'orgUnitUid=' + item_secData.value + '&longitude=' + currentLoc.lng() + '&latitude=' + currentLoc.lat();

				deferredArrActions_countryFind.push( 
					RESTUtil.getAsynchData( requestUrl
					, function( json_data )
					{
						if ( json_data == true )
						{
							secCountryObj = item_sec;
						}
					}, function() 
					{} )
				);
			}
		});
	});

	$.when.apply($, deferredArrActions_countryFind ).then( function() {																
		execFunc( secCountryObj );
	});								
}


PNSettingDataManager.getSectionDataValue = function( settingData, secCode, itemName )
{
	var foundVal = "";

	var secObj = Util.findItemFromList( settingData, 'secCode', secCode );
	
	if ( secObj !== undefined )
	{
		var itemObj = Util.findItemFromList( secObj.data, 'name', itemName );

		if ( itemObj !== undefined )
		{
			foundVal = itemObj.value;
		}
	}

	return foundVal;
}


PNSettingDataManager.getSectionData = function( settingData, secCode )
{
	var data;

	var secObj = Util.findItemFromList( settingData, 'secCode', secCode );
	
	if ( secObj !== undefined )
	{
		data = secObj.data;
	}

	return data;
}


PNSettingDataManager.getSection = function( settingData, secCode )
{
	return Util.findItemFromList( settingData, 'secCode', secCode );
}


// ---------- End of GET ---------------


// ------------------------------------------------
// ---------- Section Level Get/Save/Remove -------

PNSettingDataManager.removeSection = function( settingDataManager, secCode, successFunc, failFunc )
{
	settingDataManager.getSettingData( function( json_data )
	{
		var found = false;

		var newDataSet = new Array();

		$.each( json_data, function( i_sec, item_sec )
		{
			if ( item_sec.secCode != secCode )
			{
				newDataSet.push( item_sec );
			}
		});

		settingDataManager.saveSettingData( newDataSet
		, successFunc
		, failFunc
		);
		
	});
}


PNSettingDataManager.saveSectionByAttr = function( settingDataManager, secCode, data, attrName, tag, returnFunc )
{

	settingDataManager.getSettingData( function( json_data )
	{
		var secFound = false;

		$.each( json_data, function( i, item )
		{
			if ( item.secCode == secCode )
			{
				item[ attrName ] = data;

				secFound = true;
				return false;
			}

		});

		if ( secFound )
		{
			settingDataManager.saveSettingData( json_data
			, function()
			{
				if ( tag !== undefined ) Util.paintSuccess( tag, true );
				if ( returnFunc !== undefined ) returnFunc( true );
			}
			, function()
			{
				if ( tag !== undefined ) Util.paintError( tag, true );
				if ( returnFunc !== undefined ) returnFunc( false );
			}					
			);
		}
	});
}


PNSettingDataManager.saveSectionData = function( settingDataManager, tag, secCode, data )
{
	PNSettingDataManager.saveSectionByAttr( settingDataManager, secCode, data, 'data', tag );
}


PNSettingDataManager.scriptData_Initial = { "name": "Script Selections", "type": "Script", "NetworkScripts":{ "BeforeCreation": "", "AfterCreation": "", "BeforeUpdate": "", "AfterUpdate": "" }, "NetworkChildScripts":{ "BeforeCreation": "", "AfterCreation": "", "BeforeUpdate": "", "AfterUpdate": "" } };


PNSettingDataManager.insertNewSectionData = function( settingData, sectionName, ownerId, networkId, initialSecurity )
{
	var newSec = { secCode:sectionName, data:[], "id": networkId, "owner": ownerId, "security": initialSecurity, "version" : 2 };

	newSec.data.push( PNSettingDataManager.generateNewRowData( "Country", "CountryID", "", false, true ) );
	newSec.data.push( PNSettingDataManager.generateNewRowData( "Network Level", "Network_LVL", "", false, true ) );
	
	newSec.data.push( { "name": "Network Fields", "type": "Network_Attr", "AttrData":{ "attributes":[] } } );
	newSec.data.push( { "name": "NetworkChild Fields", "type": "NetworkChild_Attr", "AttrData":{ "attributes":[] } } );

	newSec.data.push( PNSettingDataManager.generateNewRowData( "Network OrgUnitGroup", "Network_OUGroup", "", false ) );
	newSec.data.push( PNSettingDataManager.generateNewRowData( "Network OrgUnitGroup", "NetworkChild_OUGroup", "", false ) );

	newSec.data.push( PNSettingDataManager.generateNewRowData( "NetworkChild Use", "NetworkChild_Use", "", false, true ) );

	newSec.data.push( Util.getDeepCopy( PNSettingDataManager.scriptData_Initial ) );


	settingData.push( newSec );

	var selectData = settingData[ settingData.length - 1 ];

	return selectData;
}


// ---------- Section Level Get/Save/Remove -------
// ------------------------------------------------


// -----------------------------------------------------
// ---------- Section Data Level Get/Save/Remove -------

PNSettingDataManager.saveRowData = function( settingDataManager, tag, secCode, rowData, successFunc )
{
	settingDataManager.getSettingData( function( json_data )
	{
		var secFound = false;

		$.each( json_data, function( i_sec, item )
		{
			if ( item.secCode == secCode )
			{
				
				// Look for row data.. by type!!
				// 1. If exists, find it and replace it.
				var typeFound = false;

				$.each( item.data, function( i_rowData, item_rowData )
				{
					if ( item_rowData.type == rowData.type )
					{
						// copy the properties (which is a overwrite)
						for ( var propName in rowData )
						{
							item_rowData[ propName ] = rowData[ propName ];
						}

						typeFound = true;
						return false;
					}
				});

				// If the type doesn't exists, add the rowData to data collection
				if ( !typeFound )
				{
					item.data.push( rowData );
				}

				secFound = true;
				return false;
			}
		});


		if ( secFound )
		{
			settingDataManager.saveSettingData( json_data
			, function()
			{
				if ( tag !== undefined )
				{
					// Paint the input
					Util.paintSuccess( tag, true );
				}

				if ( successFunc !== undefined ) successFunc( json_data );

			}
			, function()
			{
				if ( tag !== undefined )
				{
					// Paint the input
					Util.paintError( tag, true );
				}
			}					
			);
		}
	});
}


// ---------- Section Data Level Get/Save/Remove -------
// -----------------------------------------------------



// ---------- GENERATE DATA ---------------

PNSettingDataManager.generateInitialData = function( ownerId )
{
	var data = [ { secCode: "General"
					, data: 
					[
						{ name: "Country Level", type: "Country_LVL", value: "3", deletable: false, mandatory: true }
						,{ "name": "Network Fields", "type": "Network_Attr", "AttrData":{ "attributes":[] } }
						,{ "name": "NetworkChild Fields", "type": "NetworkChild_Attr", "AttrData":{ "attributes":[] } }
					]
					, owner: ownerId
					, notDeletable: "true"
				  } 
				];

	return data;
}


PNSettingDataManager.generateNewRowData = function( input_name, input_type, input_value, deletable, mandatory )
{
	if ( input_name === undefined ) input_name = "";
	if ( input_type === undefined ) input_type = "";
	if ( input_value === undefined ) input_value = "";

	var rowData = { name: input_name, type: input_type, value: input_value };

	if ( deletable !== undefined ) rowData.deletable = deletable;
	if ( mandatory !== undefined ) rowData.mandatory = mandatory;

	return rowData;
}

// ---------- End of GENERATE DATA ---------------


// -- Static Provider Network Data Manager Class
// -------------------------------------------


// -------------------------------------------
// -- Static Provider Network Script Data Manager Class
//		- Helper methods for easier data access/manipulation
//			specific to the Provider Network Script Data Structure.

function PNScriptDataManager() {}

// ----------------------------------------------------------------
// --- Script Data initial Actions Related ---------------

PNScriptDataManager.scriptDataInitialAction = function( scriptDataManager, afterInitFunc )
{
	scriptDataManager.getSettingData( 
	function( settingData ) 
	{	
		afterInitFunc( settingData );
	}
	, function() 
	{

		var settingData = [];  // { "id": "", "name": "", "value": "" }

		// Create empty list?
		scriptDataManager.saveSettingData( settingData, function() 
		{ 				
			//MsgManager.msgAreaShow( 'Successfully created script data.' ); 
			
			afterInitFunc( settingData );
		}
		, function() { alert( 'Failed to create the script data in DHIS AppSetting.' ); } 
		);
	});
}

// --- Script Data initial Actions Related ---------------
// ----------------------------------------------------------------

PNScriptDataManager.getScript = function( settingData, scriptPropVal, propName )
{
	return Util.getFromList( settingData, scriptPropVal, propName );
}

// -- Static Provider Network Script Data Manager Class
// ----------------------------------------------------


// -------------------------------------------
// -- Static Provider Network HtmlTab Data Manager Class
//		- Helper methods for easier data access/manipulation
//			specific to the Provider Network HtmlTab Data Structure.

function PNHtmlTabDataManager() {}

// ----------------------------------------------------------------
// --- HtmlTab Data initial Actions Related ---------------

PNHtmlTabDataManager.htmlTabDataInitialAction = function( htmlTabDataManager, afterInitFunc )
{
	htmlTabDataManager.getSettingData( 
	function( settingData ) 
	{	
		afterInitFunc( settingData );
	}
	, function() 
	{

		var settingData = [];  // { "id": "", "name": "", "value": "" }

		// Create empty list?
		htmlTabDataManager.saveSettingData( settingData, function() 
		{ 				
			//MsgManager.msgAreaShow( 'Successfully created htmlTab data.' ); 
			
			afterInitFunc( settingData );
		}
		, function() { alert( 'Failed to create the htmlTab data in DHIS AppSetting.' ); } 
		);
	});
}

// --- HtmlTab Data initial Actions Related ---------------
// ----------------------------------------------------------------

PNHtmlTabDataManager.getHtmlTab = function( settingData, htmlTabPropVal, propName )
{
	return Util.getFromList( settingData, htmlTabPropVal, propName );
}

// -- Static Provider Network HtmlTab Data Manager Class
// ----------------------------------------------------

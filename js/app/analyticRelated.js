
// -------------------------------------------
// Classes - Analytic Related ones
//
//		- AnalyticURL
//		- AnalyticEditPopupForm
//		- Period


function AnalyticURL(){
	
	var me = this;
	
	me.PARAM_AGGREGATED_DATA_ELEMENT = "aggregatedDE";
	me.PARAM_AGGREGATED_INDICATOR = "aggregatedIndicator";
	me.PARAM_EVENT_INDICATOR = "eventIndicator";
	me.PARAM_EVENT_DATA_ELEMENT = "eventDE";
	
	me.NO_LEGEND = "no";
	me.LEGEND_COLOR_CELL = "colorCell";
	me.LEGEND_COLOR_VALUE = "colorValue";
	me.LEGEND_TRAFFIC_LIGHT = "trafficLight";
	
	me.VALID = "valid";
	me.INVALID = "invalid";
	
	me.setURL = function( url ){
		me.url = url;
	};
	
	me.generateURL = function( definedUrl, countryId, pivotGroupId, pivotLevel  )
	{
		var url = "";
		definedUrl = definedUrl.replace('&filter=ou:{OrgUnit-ID}', '' );
		
		if ( Util.checkValue( pivotGroupId ) )
		{
			// ouGroup in level
			
			// dimension=dx:r9jwHbJJKu9&dimension=pe:2014&dimension=ou:LEVEL-1;OU_GROUP-eFUscwnTmaq
			
			url = _queryURL_api + definedUrl + '&dimension=ou:LEVEL-' + pivotLevel + ';OU_GROUP-' + pivotGroupId;
		}
		else
		{
			// var diffLevel = pivotLevel - selectedCountryInfo.level;
			//url = _queryURL_api + 'organisationUnits/' + selectedCountryInfo.id + '.json?level=' + diffLevel;
			url = _queryURL_api + definedUrl + '&dimension=ou:LEVEL-' + pivotLevel + ";" + countryId;
		}
		
		me.url = url;
	};
	
	me.getLegend = function()
	{
		var legend = Util.getURLParameterByName( me.url, "legend");
		return (legend=='') ? me.NO_LEGEND : legend;
	};
	
	me.getDataType = function()
	{
		return Util.getURLParameterByName( me.url, "dataType");
	};
	
	me.getObjectId = function()
	{
		if( me.getDataType() == me.PARAM_AGGREGATED_DATA_ELEMENT || me.getDataType() == me.PARAM_AGGREGATED_INDICATOR )
		{
			var urlValues = Util.getURLParameterByVariables( me.url, "dimension");
			for( var i=0; i<urlValues.length; i++ ){
				if( urlValues[i].indexOf("dx:") == 0 ){
					return urlValues[i].replace("dx:", "");
				}
			}
		}
		else
		{
			return Util.getURLParameterByName( me.url, "dimension");
		}
		
		return "";
	};
	
	// If period is relative period, then the periodId can have many periodId params
	me.getPeriodId = function()
	{
		if( me.getDataType() == me.PARAM_AGGREGATED_DATA_ELEMENT || me.getDataType() == me.PARAM_AGGREGATED_INDICATOR )
		{
			var urlValues = Util.getURLParameterByVariables( me.url, "dimension");
			for( var i=0; i<urlValues.length; i++ ){
				if( urlValues[i].indexOf("pe:") == 0 ){
					return urlValues[i].replace("pe:", "");
				}
			}
		}
		else
		{
			return Util.getURLParameterByName( me.url, "filter").replace("pe:", "");
		}
		
		return "";
	};
	
	// If period is relative period, then the periodId can have many periodId params
	me.getStageId = function()
	{
		return Util.getURLParameterByName( me.url, "stage");
	};
	
	me.checkValid = function()
	{
		var objectId = me.getObjectId();
		var periodId = me.getPeriodId();
		
		return ( objectId != "" && periodId != "" )? me.VALID : me.INVALID;
	}
}

function AnalyticEditPopupForm( providerNetwork, viewColumnsTableManager )
{
	var me = this;

	me.oProviderNetwork = providerNetwork;
	me.analyticURL = new AnalyticURL();
		
	me.dialogFormTag = $( "#analyticEditDialogForm" );
	me.rowTag;
	me.programLoaded = false;

	me.width = me.dialogFormTag.attr( 'formWidth' );
	me.height = me.dialogFormTag.attr( 'formHeight' );

	me.sharingNameTag = $( '#sharingName' );
	me.createdUserTag = $( '#createdUser' );
	me.analyticsDataTypeTag = $("#analyticsDataType");
	me.analyticsDataObjectNoteTag = $("#analyticsDataObjectNote");
	me.urlLinkTag = $("#urlLink");
	me.urlLinkTDTag = $("#urlLinkTD");
	me.periodSelectorTag = $("#periodSelector");
	me.relativePeriodRowTag = $("#relativePeriodRow");
	me.relativePeriodTag = me.dialogFormTag.find("input[type='checkbox'][relativePeriod='relativePeriod']");
	me.fixedPeriodRowTag = $("#fixedPeriodRow");
	me.periodTypeTag = $("#periodType");
	me.periodListTag = $("#periodList");
	me.periodDateTag = $("#periodDate");
	me.legendRowTag = $("#legendRow");
	me.legendTag = $("#legend");
	
	me.aggregateRowTag = $("tr[name='aggregateRow']");
	me.aggDeRowTag = $("#aggDeRow");
	me.aggIndicatorRowTag = $("#aggIndicatorRow");
	me.aggDeIdAutoCompleteTag = $("#aggDeIdAutoComplete");
	me.aggDeIdTag = $("#aggDeId");
	me.aggIndicatorIdAutoCompleteTag = $("#aggIndicatorIdAutoComplete");
	me.aggIndicatorIdTag = $("#aggIndicatorId");

	me.eventAnalyticRowTag = $("tr[name=eventAnalyticRow]");
	me.eventDeRowTag = $("#eventDeRow");
	me.eventIndicatorRowTag = $("#eventIndicatorRow");
	me.eventDeIdAutoCompleteTag = $("#eventDeIdAutoComplete");
	me.eventDeIdTag = $("#eventDeId");
	me.eventIndicatorIdAutoCompleteTag = $("#eventIndicatorIdAutoComplete");
	me.eventIndicatorIdTag = $("#eventIndicatorId");
	me.eventDateTag = $("#eventDate");
	me.programTag = $("#programId");
	me.stageTag = $("#programStageId");
	
	me.successURLDivTag = $("#successURLDiv");

	me.PARAM_OBJECT_ID = "@PARAM_DATA_ELEMENT";
	me.PARAM_PERIOD = "@PARAM_PERIOD";
	me.PARAM_DATA_TYPE = "@PARAM_DATA_TYPE";
	me.PARAM_PROGRAM = "@PARAM_PROGRAM";
	me.PARAM_STAGE = "@PARAM_STAGE";
	me.PARAM_LEGEND = "@PARAM_LEGEND";
	me.PARAM_ORGUNIT = "{OrgUnit-ID}";
	me.PARAM_RELATIVE_PERIOD_OPTION = "relativePe";
	me.PARAM_FIXED_PERIOD_OPTION = "fixedPe";
	me.DATE_FORMAT = "yy-mm-dd";

	me._queryURL_Programs = _queryURL_api + "programs.json?paging=false&fields=id,name";
	me._queryURL_Program_Stages = _queryURL_api + "programs/" + me.PARAM_PROGRAM + ".json?fields=programStages[id,name]";

	me._queryURL_Aggregate_Data_Value = "analytics.json?skipMeta=true&aggregationType=SUM&dimension=dx:"
	+ me.PARAM_OBJECT_ID + "&dimension=pe:" + me.PARAM_PERIOD + "&dataType=" + me.PARAM_DATA_TYPE + "&legend=" + me.PARAM_LEGEND + "&filter=ou:" + me.PARAM_ORGUNIT;

	//me._queryURL_Event_Data_Value = "analytics/events/query/" + me.PARAM_PROGRAM + ".json?stage=" + me.PARAM_STAGE + "&filter=pe:" + me.PARAM_PERIOD + "&dimension=" + me.PARAM_OBJECT_ID + "&outputType=EVENT&dataType=" + me.PARAM_DATA_TYPE + "&legend=" + me.PARAM_LEGEND + "&filter=ou:" + me.PARAM_ORGUNIT;

	me._queryURL_Event_Data_Value = "analytics.json?dimension=pe:" + me.PARAM_PERIOD + "&dimension=dx:" + me.PARAM_OBJECT_ID +"&dimension=ou:" + me.PARAM_ORGUNIT + "&program=" + me.PARAM_PROGRAM;


	me._queryURL_Agg_Data_Element = _queryURL_api + "dataElements.json?paging=false&fields=name,id,legendSet[legends[id]]&filter=domainType:eq:AGGREGATE";
	me._queryURL_Agg_Indicator = _queryURL_api + "indicators.json?paging=false&fields=name,id,legendSet[legends[id]]";

	me._queryURL_Event_Data_Element = _queryURL_api + "programStageDataElements.json?paging=false&fields=dataElement[id,name,legendSet[legends[id]]&filter=programStage.id:eq:" + me.PARAM_STAGE;
	me._queryURL_Event_Indicator = _queryURL_api + "programIndicators.json?paging=false&fields=id,name&filter=program.id:eq:" + me.PARAM_PROGRAM;


	// ---------------------------------------

	me.openForm = function( rowTag )
	{
		me.rowTag = rowTag;
		me.setParamValue();
		me.checkParams( me.rowTag.find("input.settingValue").val() );
		
		var dataType = me.analyticsDataTypeTag.val();
		var url = "";
		if ( dataType == me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT && me.aggDeIdTag.val() != "" ) {
			url = me._queryURL_Agg_Data_Element + "&filter=id:eq:" + me.aggDeIdTag.val();
			me.getObjectName(url);
		}
		else if( dataType == me.analyticURL.PARAM_AGGREGATED_INDICATOR && me.aggIndicatorIdTag.val() != "" ){
			url = me._queryURL_Agg_Indicator + "&filter=id:eq:" + me.aggIndicatorIdTag.val();
			me.getObjectName(url);
		}
		else if ( dataType == me.analyticURL.PARAM_EVENT_DATA_ELEMENT && me.eventDeIdTag.val() != "" ) {
			me.analyticURL.setURL( me.urlLinkTag.val() );
			url = me._queryURL_Event_Data_Element.replace( me.PARAM_STAGE, me.analyticURL.getStageId() );
			url += "&filter=dataElement.id:eq:" + me.eventDeIdTag.val();
			me.getObjectName(url);
		}
		else if( dataType == me.analyticURL.PARAM_EVENT_INDICATOR && me.eventIndicatorIdTag.val() != "" ){
			url = me._queryURL_Event_Indicator.replace( me.PARAM_PROGRAM, me.programTag.val() );
			url += "&filter=id:eq:" + me.eventIndicatorIdTag.val();
			me.getObjectName(url);
		}
		else
		{
			me.dialogFormTag.dialog( "open" );
		} 
	};

	me.FormPopupSetup = function()
	{
		me.periodDateTag.datepicker( { dateFormat: "yy-mm-dd" } );
		me.loadPrograms( function(){
			// -- Set up the form --
			me.dialogFormTag.dialog({
				autoOpen: false
				,title: "Analytic Edit"
				,width: me.width
				,height: me.height
				,modal: true
				,close: function( event, ui ) {
					$( this ).dialog( "close" );
				}
			});
		});
	};

	// ---------------------------------------
	// Fill param values in input fields
	// ---------------------------------------

	me.getObjectName = function( url )
	{
		RESTUtil.getAsynchData( url, function( data ){
			if( data.dataElements !== undefined && data.dataElements.length > 0 ) {
				me.aggDeIdAutoCompleteTag.val(data.dataElements[0].name);
				var legend = (data.dataElements[0].legendSet!==undefined );
				me.aggDeIdTag.attr("legend", legend );
				if( legend ){
					me.legendRowTag.show();
				}
				else{
					me.legendRowTag.hide();
				}
			}
			else if( data.indicators !== undefined && data.indicators.length > 0 )
			{
				me.aggIndicatorIdAutoCompleteTag.val(data.indicators[0].name);
				var legend = ((data.indicators[0].legendSet!==undefined )!==undefined );
				me.aggIndicatorIdTag.attr("legend", legend );
				if( legend ){
					me.legendRowTag.show();
				}
				else{
					me.legendRowTag.hide();
				}
			}
			else if( data.programStageDataElements !== undefined && data.programStageDataElements.length > 0 )
			{
				me.eventDeIdAutoCompleteTag.val(data.programStageDataElements[0].dataElement.name);
				var legend = (data.programStageDataElements[0].dataElement.legendSet!==undefined );
				me.eventDeIdTag.attr("legend", legend );
				if( legend ){
					me.legendRowTag.show();
				}
				else{
					me.legendRowTag.hide();
				}
			}
			else if( data.programIndicators !== undefined && data.programIndicators.length > 0 )
			{
				me.eventIndicatorIdAutoCompleteTag.val(data.programIndicators[0].name);
				me.legendRowTag.hide();
			}
			me.dialogFormTag.dialog( "open" );
		});
	};

	
	me.setParamValue = function() {
		me.analyticsDataTypeTag.val(me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT);
		me.dataTypeOnChange( me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT );
		
		me.aggDeIdTag.val("");
		me.aggDeIdAutoCompleteTag.val("");
		me.aggIndicatorIdTag.val("");
		me.aggIndicatorIdAutoCompleteTag.val("");

		me.eventDeIdTag.val("");
		me.eventDeIdAutoCompleteTag.val("");
		me.eventIndicatorIdTag.val("");
		me.eventIndicatorIdAutoCompleteTag.val("");
		
		me.urlLinkTag.val("");
		
		me.resetPeriodFields();
			
		var url = me.rowTag.find("input.settingValue").val();
		
		me.analyticURL.setURL( url );
		var dataType = me.analyticURL.getDataType();
		var objectId = me.analyticURL.getObjectId();
		var periodId = me.analyticURL.getPeriodId();
		var legend = me.analyticURL.getLegend();
		
		me.legendTag.val(legend);
		
		var isRelativePeriod = ( periodId.indexOf("LAST") == 0 || periodId.indexOf("THIS") == 0 ) ? true : false;
		if( isRelativePeriod )
		{
			me.periodSelectorTag.val( me.PARAM_RELATIVE_PERIOD_OPTION );
			me.relativePeriodRowTag.show();
			me.fixedPeriodRowTag.hide();
			var periodList = periodId.split(";");
			me.dialogFormTag.find("input[type='checkbox'][relativePeriod='relativePeriod']").prop("checked",false);
			for( var i=0; i<periodList.length; i++ ){
				me.dialogFormTag.find("input[type='checkbox'][relativePeriod='relativePeriod'][value='" + periodList[i] + "']").prop("checked",true);
			}
		}
		else{
			me.periodSelectorTag.val( me.PARAM_FIXED_PERIOD_OPTION );
			me.relativePeriodRowTag.hide();
			me.fixedPeriodRowTag.show();
		}

		if ( dataType !== undefined && dataType != "" ) {
			me.analyticsDataTypeTag.val(dataType);
			me.dataTypeOnChange( dataType, objectId, true );
		}
		
		if( periodId.length == 8 ){
			me.periodDateTag.show();
			me.periodTypeTag.val("Daily");
			var periodDate = periodId.substring(0,4) + "-" + periodId.substring(4,6) + "-" + periodId.substring(6,8);
			me.periodDateTag.val( periodDate );
			me.periodListTag.hide();
		}
		else
		{
			me.periodDateTag.hide();
			me.periodListTag.show();
			
			if( periodId.indexOf("W")==0 ){
				me.periodTypeTag.val("Weekly");
			}
			else if( periodId.indexOf("S")>=0 ){
				me.periodTypeTag.val("SixMonth");
			}
			else if( periodId.indexOf("Q")>=0 ){
				me.periodTypeTag.val("Quarterly");
			}
			else if( periodId.length == 6 ){
				me.periodTypeTag.val("Monthly");
			}
			else if( periodId.length == 4 ){
				me.periodTypeTag.val("Yearly");
			}
			else{
				me.periodTypeTag.val("Daily");
				me.periodDateTag.show();
				me.periodListTag.hide();
			}
			
			// Set Period List
			var periodType = me.periodTypeTag.val();
			Util.clearList( me.periodListTag );

			if( periodType!= "" ){
				me.period.generatePeriodList( periodType );
			}
			me.periodListTag.val(periodId);
		}

		// Event parameters

		if( !me.isAggregateTypeURL() ){
			var idx = url.indexOf("query/") + 6;
			var programId = url.substr( idx,11 );
			var stageId = Util.getURLParameterByName(url, "stage");
			me.programTag.val( programId );
			me.loadProgramStages( stageId );
		}

		// ---
		me.urlLinkTag.val( url );
		me.urlLinkTDTag.val( url );
		me.analyticURL.setURL( url );
		
		if( me.analyticURL.checkValid() == me.VALID ){
			me.rowTag.find("div.displayURL").css( "background-color", "LightGreen" );
			me.rowTag.find("div.displayURL").attr( "title", "Analytic is properly defined:\n" + url );
		}
		else
		{
			me.rowTag.find("div.displayURL").css( "background-color", "LightGray" );
			me.rowTag.find("div.displayURL").attr( "title", "Analytic is not properly defined yet" );
		}
	};
	
	me.dataTypeOnChange = function( dataType, objectId, initData ){
		if ( dataType !== undefined && dataType != "" ) {
			if (dataType == me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT) {
				if( objectId !== "" ){
					me.aggDeIdTag.val(objectId);
					if( initData ){
						me.aggDeIdAutoCompleteTag.val(" ");
					}
				}

				me.aggregateRowTag.show();
				me.eventAnalyticRowTag.hide();
				me.aggIndicatorRowTag.hide();
			}
			else if (dataType == me.analyticURL.PARAM_AGGREGATED_INDICATOR) {
				if( objectId !== "" ){
					me.aggIndicatorIdTag.val(objectId);
					if( initData ){
						me.aggIndicatorIdAutoCompleteTag.val(" ");
					}
				}

				me.aggregateRowTag.show();
				me.aggDeRowTag.hide();
				me.eventAnalyticRowTag.hide();
			}
			else if( dataType == me.analyticURL.PARAM_EVENT_DATA_ELEMENT ){
				if( objectId !== "" ){
					me.eventDeIdTag.val(objectId);
					if( initData ){
						me.eventDeIdAutoCompleteTag.val(" ");
					}
				}

				me.aggregateRowTag.hide();
				me.eventAnalyticRowTag.show();
				me.eventIndicatorRowTag.hide();
			}
			else if( dataType == me.analyticURL.PARAM_EVENT_INDICATOR ){
				if( objectId !== "" ){
					me.eventIndicatorIdTag.val(objectId);
					if( initData ){
						me.eventIndicatorIdAutoCompleteTag.val(" ");
					}
				}

				me.aggregateRowTag.hide();
				me.eventAnalyticRowTag.show();
				me.eventDeRowTag.hide();
			}
		}
	};

	me.checkParams = function( url )
	{				
		me.oProviderNetwork.dataListingTableManager.clearData = ( me.clearData === undefined ) ? true : me.clearData;
		
		if( url === undefined ){
			url = me.generateAnalyticsDataUrl();			
			
			// Set URL for Columns table 
			var inputTag = me.rowTag.find("input.settingValue");
			inputTag.val( url );
			inputTag.change();// Save URL generated
		}
		
		var networkData = me.oProviderNetwork.getSelectedNetworkData();
		var viewColumnsTableManager = me.oProviderNetwork.viewManager.viewColumnsTableManager;
		var countryId = networkData.countryInfo.id;	
		var pivotGroupId = viewColumnsTableManager.getPivotFilterGroupId();
		var pivotLevel = viewColumnsTableManager.getPivotLevel();
		
		
		me.analyticURL.generateURL( url, countryId, pivotGroupId, pivotLevel )
		
		// Set URL for url link and URL infor			
		me.urlLinkTag.val( url );
		me.urlLinkTDTag.val( url );
		me.rowTag.find("button.popupAction").attr("title", url);
		
		// Check if URL is valid
		
		
		// me.analyticURL.setURL( url );
		var valid = me.analyticURL.checkValid();
		
		if( valid == me.analyticURL.VALID ){
			me.rowTag.find("div.displayURL").css( "background-color", "LightGreen" );
			me.rowTag.find("div.displayURL").attr( "title", "Analytic is properly defined:\n" + url );
			me.setMarkFields( true );
			me.successURLDivTag.show( "500" );				
		}
		else{
			me.rowTag.find("div.displayURL").css( "background-color", "LightGray" );
			me.rowTag.find("div.displayURL").attr( "title", "Analytic is not properly defined yet" );
			me.successURLDivTag.hide( "300" );
			me.setMarkFields( false );
		}
		me.clearData = true;
		me.oProviderNetwork.dataListingTableManager.clearData = true;
	};
	
	me.setMarkFields = function( valid )
	{
		var color = ( valid ) ? "" : "#FF8080";
		var invalidPeriod = ( me.dialogFormTag.find("input[type='checkbox'][relativePeriod='relativePeriod']:checked").length == 0 ) ? true : false;;
		
		me.dialogFormTag.find("input,select").each(function(){
			var item = $(this);				
			
			if( item.attr("type") == 'checkbox' )
			{
				if( invalidPeriod || valid )
				{
					item.closest("td").css("color", color);
				}
				else
				{
					item.closest("td").css("color", "");
				}
			}
			else if( item.val() == null || item.val() == "" )
			{
				item.css("border-color", color);
			}
			else if( item.val() != null && item.val() != "" )
			{
				item.css("border-color", "");
			}
		});
	};
	
	me.getRelativePeriodChecked = function()
	{
		var list = [];
		for( var i=0;i< me.relativePeriodTag.length; i++){
			var checkbox = $(me.relativePeriodTag[i]);
			if( checkbox.is(":checked") ){
				list.push( checkbox );
			}
		}
		
		return list;
	};

	// --------------------------------------------------------------

	me.loadPrograms = function( doneFunc ){
		Util.clearList( me.programTag );
		me.programTag.append("<option value=''>[Please select]</option>");

		RESTUtil.getAsynchData( me._queryURL_Programs, function( data ){
			for( var i in data.programs ){
				me.programTag.append("<option value='" + data.programs[i].id + "'>" + data.programs[i].name + "</option>");
			}
		}
		, function(){}
		, function(){}
		, function(){
			doneFunc();
		});
	};

	me.loadProgramStages = function( stageId ){
		Util.clearList(me.stageTag);
		me.stageTag.css("border-color", "#FF8080");
		var programId = me.programTag.val();
		if( programId != null && programId != "" )
		{
			me.stageTag.append("<option style='font-style:italic;'>Loading ....</option>");
			if( programId != null && programId != "" ) {
				var programId = me.programTag.val();
				var url = me._queryURL_Program_Stages.replace( me.PARAM_PROGRAM, programId);
				RESTUtil.getAsynchData( url, function (data) {
					Util.clearList(me.stageTag);
					me.stageTag.append("<option value=''>[Please select]</option>");
					for (var i in data.programStages) {
						me.stageTag.append("<option value='" + data.programStages[i].id + "'>" + data.programStages[i].name + "</option>");
					}
					if( stageId !== undefined ){
						me.stageTag.val( stageId );
						me.stageTag.change();
					}
					else
					{
						me.checkParams(); 
					}
				});
			}
		}
	};

	me.setAutoCompletedField = function( input, idField, link ) {
		input.autocomplete({
			  delay: 0,
			  minLength: 2,
			  open: function () {
					var onTopElem = input.closest('.ui-front');
					if(onTopElem.length > 0){
						var widget = input.autocomplete('widget');
						widget.zIndex(onTopElem.zIndex() + 1);
					}
			  },
			  source: function( request, response ) {
				$.ajax({
						url: link + input.val(),
						dataType: "json",
						success: function( data ) {
							var dataType = me.analyticsDataTypeTag.val();
		
							if ( dataType == me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT ) {
								response($.map(data.dataElements, function (item) {
									return {
										label: item.name,
										id: item.id,
										legend: ( item.legendSet!==undefined )
									};
								}));
							}
							else if ( dataType == me.analyticURL.PARAM_AGGREGATED_INDICATOR )
							{
								response($.map(data.indicators, function (item) {
									return {
										label: item.name,
										id: item.id,
										legend: ( item.legendSet!==undefined )
									};
								}));
							}
							else if ( dataType == me.analyticURL.PARAM_EVENT_DATA_ELEMENT )
							{
								response($.map(data.programStageDataElements, function (item) {
									return {
										label: item.dataElement.name,
										id: item.dataElement.id,
										legend: ( item.dataElement.legendSet!==undefined )
									};
								}));
							}
							else if ( dataType == me.analyticURL.PARAM_EVENT_INDICATOR )
							{
								response($.map(data.programIndicators, function (item) {
									return {
										label: item.name,
										id: item.id
									};
								}));
							}
						}
				});
			  },
			  select: function( event, ui ) {
				input.val(ui.item.value);
				idField.val(ui.item.id);
				idField.attr('legend', ui.item.legend );
				input.change();
				input.autocomplete("close");
			  },
			  change: function( event, ui ) {
			  
				if( !ui.item ) {
				  var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($(this).val()) + "$", "i"),
					valid = false;
				  input.children("option").each(function() {
					if( $(this).text().match(matcher) ) {
					  this.selected = valid = true;
					  return false;
					}
				  });
				  if( !valid ) {
					// remove invalid value, as it didn't match anything
					$(this).val("");
					idField.val("");
					input.change();
					input.data("uiAutocomplete").term = "";
					return false;
				  }
				}
				else if( input.val() == "" )
				{
					idField.val("");
					input.change();
				}
			  }
			}).addClass("ui-widget");
	};

	me.setup_Events = function()
	{
		me.setAutoCompletedField( me.aggDeIdAutoCompleteTag, me.aggDeIdTag, me._queryURL_Agg_Data_Element + "&filter=name:ilike:" );
		me.setAutoCompletedField( me.aggIndicatorIdAutoCompleteTag, me.aggIndicatorIdTag, me._queryURL_Agg_Indicator + "&filter=name:ilike:" );


		me.periodSelectorTag.change( function(){
			// Reset fixed period
			me.resetPeriodFields();
			
			var value = me.periodSelectorTag.val();				
			if( value == me.PARAM_RELATIVE_PERIOD_OPTION ){
				me.relativePeriodRowTag.show();
				me.fixedPeriodRowTag.hide();
			}
			else if( value == me.PARAM_FIXED_PERIOD_OPTION ){
				me.relativePeriodRowTag.hide();
				me.fixedPeriodRowTag.show();
			}
			
			me.checkParams();
		});
		
		me.periodTypeTag.change( function(){ me.checkParams(); } );
		
		me.periodListTag.change( function(){ me.checkParams(); } );
		
		me.relativePeriodTag.click( function(){ me.checkParams(); } );
		
		me.periodDateTag.change( function(){ me.checkParams(); } );
		
		me.legendTag.change( function(){ me.clearData = false; me.checkParams(); } );

		me.aggDeIdAutoCompleteTag.change( function(){ 
			me.checkParams(); 
			if( me.aggDeIdTag.attr('legend') == 'true' ){
				me.legendRowTag.show();
			}
			else{
				me.legendRowTag.hide();
			}
		} );
		me.aggIndicatorIdAutoCompleteTag.change( function(){ 
			me.checkParams(); 
			if( me.aggIndicatorIdTag.attr('legend') == 'true' ){
				me.legendRowTag.show();
			}
			else{
				me.legendRowTag.hide();
			}
		} );
		me.eventDeIdAutoCompleteTag.change( function(){ 
			me.checkParams(); 
			if( me.eventDeIdTag.attr('legend') == 'true' ){
				me.legendRowTag.show();
			}
			else{
				me.legendRowTag.hide();
			}
		} );
		me.eventIndicatorIdAutoCompleteTag.change( function(){
			me.checkParams(); 
			me.legendRowTag.hide();
		} );
		
		me.programTag.change( function(){
			if( me.programTag.val() != "" )
			{
				me.programTag.css( "border-color", "" );
				me.stageTag.css( "border-color", "red" );
				me.loadProgramStages();
			}
			else
			{
				me.programTag.css( "border-color", "red" );
				me.stageTag.css( "border-color", "red" );
				me.stageTag.empty();
			}
		});

		me.stageTag.change( function(){

			// me.checkParams();
			if( me.stageTag.val() != "" )
			{
				me.stageTag.css( "border-color", "" );
				if ( me.eventDeIdAutoCompleteTag.data('autocomplete') ) {
					me.eventDeIdAutoCompleteTag.autocomplete("destroy");
					me.eventDeIdAutoCompleteTag.removeData('autocomplete');
				}

				if ( me.eventIndicatorIdAutoCompleteTag.data('autocomplete') ) {
					me.eventIndicatorIdAutoCompleteTag.autocomplete("destroy");
					me.eventIndicatorIdAutoCompleteTag.removeData('autocomplete');
				}

				var url = me._queryURL_Event_Data_Element.replace( me.PARAM_STAGE, me.stageTag.val() );
				url += "&filter=dataElement.name:ilike:";
				me.setAutoCompletedField( me.eventDeIdAutoCompleteTag, me.eventDeIdTag, url );

				url = me._queryURL_Event_Indicator.replace( me.PARAM_PROGRAM, me.programTag.val() );
				url += "&filter=name:ilike:";
				me.setAutoCompletedField( me.eventIndicatorIdAutoCompleteTag, me.eventIndicatorIdTag, url );
			}
			else
			{
				me.stageTag.css("border-color", "red" );
			}
		});
		
		me.analyticsDataTypeTag.change( function(){
			var dataType = me.analyticsDataTypeTag.val();
			me.setAnalyticsDataObjectNote( dataType );
			me.dataTypeOnChange( dataType );
			
			// Reset data in form
			
			me.periodSelectorTag.val( me.PARAM_FIXED_PERIOD_OPTION );
			me.resetPeriodFields();
			
			me.legendTag.val( me.analyticURL.NO_LEGEND );
			me.aggDeIdAutoCompleteTag.val("");
			me.aggDeIdTag.val("");
			me.aggIndicatorIdAutoCompleteTag.val("");
			me.aggIndicatorIdTag.val("");
			
			me.programTag.val("");
			Util.clearList( me.stageTag );
			me.eventDeIdAutoCompleteTag.val("");
			me.eventDeIdTag.val("");
			me.eventIndicatorIdAutoCompleteTag.val("");
			me.eventIndicatorIdTag.val("");	

			me.urlLinkTag.val("");
			
			me.checkParams();
		});
	};
	
	me.setAnalyticsDataObjectNote = function( dataType )
	{
		var analyticURLObject = new AnalyticURL();
		
		if( dataType == analyticURLObject.PARAM_AGGREGATED_DATA_ELEMENT )
		{
			me.analyticsDataObjectNoteTag.html( "** Default Aggregate Type is SUM" );
		}
		/* else if( dataType == analyticURLObject.PARAM_AGGREGATED_INDICATOR )
		{
			me.analyticsDataObjectNoteTag.html( "If one org unit has more than one data, the data result will be average of values which are not '0'" );
		}
		else if( dataType == analyticURLObject.PARAM_EVENT_DATA_ELEMENT )
		{
			me.analyticsDataObjectNoteTag.html( "If one org unit has more than one data, the data result will be average of values which are not '0'" );
		}
		else if( dataType == analyticURLObject.PARAM_EVENT_INDICATOR )
		{
			me.analyticsDataObjectNoteTag.html( "If one org unit has more than one data, the data result will be average of values which are not '0'" );
		} */
		else
		{
			me.analyticsDataObjectNoteTag.html( "** If one org unit has more than one data, the data result will be average of values which are not '0'" );
		}
	}

	me.resetPeriodFields = function()
	{	
		me.periodTypeTag.val( "Daily" );
		me.periodDateTag.val("");
		me.periodDateTag.show();
		Util.clearList( me.periodListTag );
		me.periodListTag.hide();
		
		me.relativePeriodTag.prop("checked", false);			
	};
	
	me.resetRelativePeriodFields = function()
	{
		me.periodSelectorTag.val( me.PARAM_FIXED_PERIOD_OPTION );
		me.periodTypeTag.val( "Daily" );
		me.periodDateTag.val("");
		me.periodDateTag.show();
		me.periodListTag.hide();
	};
	
	me.generateAnalyticsDataUrl = function()
	{
		var period = "";
		var periodType = me.periodTypeTag.val();
		if( me.periodSelectorTag.val() == me.PARAM_FIXED_PERIOD_OPTION ){
			if( periodType == "Daily" ){ 
				period = me.periodDateTag.val().replace(/-/g, '');
			}
			else{
				period = me.periodListTag.val();
			}
		}
		else{
			var list = me.getRelativePeriodChecked();
			for( var i=0; i<list.length; i++ )
			{
				period += list[i].val() + ";";
			}
			period = period.substring( 0, period.length - 1 );
		}
		
		var objectId = "";
		var dataType = me.analyticsDataTypeTag.val();
		if ( dataType !== undefined && dataType != "" ) {
			if (dataType == me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT) {
				objectId = me.aggDeIdTag.val();
			}
			else if (dataType == me.analyticURL.PARAM_AGGREGATED_INDICATOR) {
				objectId = me.aggIndicatorIdTag.val();
			}
			else if( dataType == me.analyticURL.PARAM_EVENT_DATA_ELEMENT ){
				objectId = me.eventDeIdTag.val();
			}
			else if( dataType == me.analyticURL.PARAM_EVENT_INDICATOR ){
				objectId = me.eventIndicatorIdTag.val();
			}
		}
		
		me.dataTypeOnChange( dataType, objectId );

		var programId = me.programTag.val();
		var stageId = me.stageTag.val();
		
		return me.generateAggregateAggDataUrl(objectId, period, programId, stageId );
	};


	me.generateAggregateAggDataUrl = function( objectId, period, programId, stageId )
	{
		var url = "";
		if( me.isAggregateTypeURL() ){
			url= me._queryURL_Aggregate_Data_Value;
		}
		else{
			url= me._queryURL_Event_Data_Value;
		}

		url = url.replace( me.PARAM_OBJECT_ID, objectId );
		url = url.replace( me.PARAM_PERIOD, period );
		url = url.replace( me.PARAM_DATA_TYPE, me.analyticsDataTypeTag.val() );
		url = url.replace( me.PARAM_PROGRAM, programId );
		url = url.replace( me.PARAM_STAGE, stageId );
		url = url.replace( me.PARAM_LEGEND, me.legendTag.val() )

		return url;
	};

	me.isAggregateTypeURL = function()
	{
		var dataType =  me.analyticsDataTypeTag.val();
		return ( dataType == me.analyticURL.PARAM_AGGREGATED_DATA_ELEMENT || dataType == me.analyticURL.PARAM_AGGREGATED_INDICATOR ) ? true : false;
	};


	me.setControlBackgroundColor = function( popupFormTag )
	{
		popupFormTag.find( 'input,select,textarea' ).css( 'background-color', 'White' );
	};


	// -------------------------------------------
	// Initial Setup Call
	me.initialSetup = function()
	{
		me.period = new Period();

		me.FormPopupSetup();
		me.setControlBackgroundColor( me.dialogFormTag );

		me.setup_Events();
	};

	// --------------------------
	// Run methods

	// Initial Run Call
	me.initialSetup();

}


function Period()
{
	var me = this;

	me.periodTypeTag = $("#periodType");
	me.periodListTag = $("#periodList");
	me.periodDateTag = $("#periodDate");

	me.START_YEAR_PARAM = 2012;
	me.monthlyNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	me.quarterlyNames = ["Jan - Mar", "Apr - Jun", "Jul - Sep", "Oct - Dec"];
	me.sixMonthNames = ["Jan - Jun", "Jul - Dec"];

	me.initialSetup = function()
	{
		me.setup_Event();
	};

	me.setup_Event = function()
	{
		me.periodTypeTag.change(function(){
			var periodType = me.periodTypeTag.val();
			Util.clearList( me.periodListTag );

			if( periodType!= "" ){
				me.generatePeriodList( periodType );
			}
		});

	};

	// --------------------------
	// Generate Period List
	me.generatePeriodList = function( )
	{
		Util.clearList( me.periodListTag );
		var periodType = me.periodTypeTag.val();
		var periodList = [];

		me.periodListTag.append("<option value=''>[Please select]</option>");
		if( periodType == "Daily" ){
			me.periodListTag.hide();
			me.periodDateTag.show();
		}
		else {
			me.periodListTag.show();
			me.periodDateTag.hide();
			
			if( periodType == "Yearly" ){
				periodList = me.generateYearlyPeriodList();
			}
			else if( periodType == "Monthly" ){
				periodList = me.generateMonthlyPeriodList();
			}
			else if( periodType == "Weekly" ){
				periodList = me.generateWeeklyPeriodList();
			}
			else if( periodType == "Quarterly" ){
				periodList = me.generateQuarterlyPeriodList();
			}
			else if( periodType == "SixMonthly" ){
				periodList = me.generateSixMonthPeriodList();
			}
			for( var i=0; i<periodList.length; i++ )
			{
				var value = periodList[i].value;
				var name = periodList[i].name;
				me.periodListTag.append("<option value='" + value + "'>" + name + "</option>");
			}
		}
	};

	me.generateYearlyPeriodList = function()
	{
		var periodList = [];
		var curDate = new Date();
		var curYear = curDate.getFullYear();
		for( var year=curYear; year>=me.START_YEAR_PARAM; year-- ){
			var period = {"value": year, "name": year };
			periodList.push( period );
		}

		return periodList;
	};

	me.generateQuarterlyPeriodList = function()
	{
		var periodList = [];
		
		var date = new Date();
		var month = eval( date.getMonth() ) + 1;
		var year = new Date().getFullYear();
		var idx = me.getQuarterlyPeriodStartMonth( month );
		
		while( year >= me.START_YEAR_PARAM ){
			var value = year + "Q" + idx;
			var name = me.quarterlyNames[idx-1] + " " + year;
			var period = {"value": value, "name": name };
			periodList.push( period );
			
			idx--;
			
			if( idx == 0 ){
				year--;
				idx = 4;
			}
		}
		
		return periodList;
	};
			
	me.generateSixMonthPeriodList = function()
	{
		var periodList = [];
		
		var date = new Date();
		var month = eval( date.getMonth() ) + 1;
		var year = new Date().getFullYear();
		var idx = me.getSixMonthPeriodStartMonth( month );
		
		while( year >= me.START_YEAR_PARAM ){
			var value = year + "S" + idx;
			var name = me.sixMonthNames[idx-1] + " " + year;
			var period = {"value": value, "name": name };
			periodList.push( period );
			
			idx--;
			
			if( idx == 0 ){
				year--;
				idx = 2;
			}
		}
		
		return periodList;
	};
	
	me.getQuarterlyPeriodStartMonth = function( month ){
		if( month <= 3 ) return 1;
		if( month <= 6 ) return 2;
		if( month <= 9 ) return 3;
		return 4;
	};
	
	me.getSixMonthPeriodStartMonth = function( month ){
		return ( month <= 6 ) ? 1 : 2;
	};
	me.generateMonthlyPeriodList = function()
	{
		var periodList = [];
		var curDate = new Date();
		var year = curDate.getFullYear();
		var curMonth = eval( curDate.getMonth() ) + 1;

		while( year>= me.START_YEAR_PARAM )
		{
			while( curMonth>0 ) {
				var month = ( curMonth >= 10 ) ? curMonth + "" : "0" + curMonth;
				var value = year + month;
				var name = me.monthlyNames[curMonth - 1] + " " + year;
				var period = {"value": value, "name": name};

				periodList.push(period);

				curMonth --;
			}

			if (curMonth == 0) {
				curMonth = 13;
				year--;
			}
			curMonth--;
		}

		return periodList;
	};

	me.generateWeeklyPeriodList = function()
	{
		var periods = [];
		// var year = new Date().getFullYear();
		// var startDate = new Date( year, 0, 1 );
		var startDate = new Date();
		var year = startDate.getFullYear();
		var day = startDate.getDay();
		var date = startDate.getDate();
		var i = 0;
		var oneDay = 24*60*60*1000;

		if ( day == 0 ) // Sunday (0), forward to Monday
		{
			startDate = new Date( startDate.getTime() - oneDay );
		}
		else
		{
			var intervalDays = ( day - 1 ) * oneDay;
			startDate = new Date( startDate.getTime() - intervalDays );
		}			
		
		var endDate = new Date(startDate.getTime() + 6 * oneDay);

		// Include all weeks where Thursday falls in same year
		
		var runDate = new Date(startDate.valueOf());
		runDate.setDate( runDate.getDate() + 3 );
		var runYear = runDate.getFullYear();
		while ( runYear >= me.START_YEAR_PARAM )
		{
			var period = [];
			var weekNo = me.getWeekNumber( startDate );
			period.name = 'W' + weekNo + ' - ' + Util.dateToString( startDate ) + " - " + Util.dateToString( endDate );
			period.value = year + 'W' + ( i + 1 );
			periods[i] = period;

			startDate.setDate( startDate.getDate() + -7 );
			endDate =  new Date(startDate.valueOf());
			endDate.setDate( endDate.getDate() + 6 );
			i++;
			
			runDate = new Date(startDate.valueOf());
			runDate.setDate( runDate.getDate() + 3 );
			runYear = runDate.getFullYear();
			
		}

		return periods;
	};

	
	me.getWeekNumber = function(d) {
		// Copy date so don't modify original
		d = new Date(+d);
		d.setHours(0,0,0);
		// Set to nearest Thursday: current date + 4 - current day number
		// Make Sunday's day number 7
		d.setDate(d.getDate() + 4 - (d.getDay()||7));
		// Get first day of year
		var yearStart = new Date(d.getFullYear(),0,1);
		// Calculate full weeks to nearest Thursday
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
		// Return array of year and week number
		return weekNo;
	};

	// --------------------------
	// Run methods

	// Initial Run Call
	 me.initialSetup();
}


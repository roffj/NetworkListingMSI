
// -------------------------------------------
// -- Utility Class/Methods

function Util() {}

Util.disableTag = function( tag, isDisable )
{
	tag.prop( 'disabled', isDisable);
	
	for( var i=0; i<tag.length; i++ )
	{
		var element = $(tag[i]);
		if( element.prop( "tagName" ) == 'SELECT' || element.prop( "tagName" ) == 'INPUT' )
		{
			if( isDisable )
			{
				element.css( 'background-color', '#FAFAFA' ).css( 'cursor', 'auto' ).css( 'color', '#444' );
			}
			else
			{
				element.css( 'background-color', 'white' ).css( 'cursor', '' );
			}
		}
	}
};

Util.sortByKey = function( array, key ) {
	return array.sort( function( a, b ) {
		var x = a[key]; var y = b[key];
		return ( ( x < y ) ? -1 : ( ( x > y ) ? 1 : 0 ) );
	});
};

Util.searchByName = function( array, propertyName, value )
{
	for( var i in array ){
		if( array[i][propertyName] == value ){
			return array[i];
		}
	}
	return "";
};

Util.trim = function( input )
{
	return input.replace( /^\s+|\s+$/gm, '' );
};

Util.stringSearch = function( inputString, searchWord )
{
	if( inputString.search( new RegExp( searchWord, 'i' ) ) == 0 )
	{
		return true;
	}
	else
	{
		return false;
	}
};

Util.upcaseFirstCharacterWord = function( text ){
	var result = text.replace( /([A-Z])/g, " $1" );
	return result.charAt(0).toUpperCase() + result.slice(1); 
};


Util.startsWith = function( input, suffix )
{
    return ( Util.checkValue( input ) && input.substring( 0, suffix.length ) == suffix );
};

Util.endsWith = function( input, suffix ) 
{
    return ( Util.checkValue( input ) && input.indexOf( suffix, input.length - suffix.length ) !== -1 );
}

Util.clearList = function( selector ) {
	selector.children().remove();
};


Util.moveSelectedById = function( fromListId, targetListId ) {
	return !$('#' + fromListId + ' option:selected').remove().appendTo('#' + targetListId ); 
}

Util.selectAllOption = function ( listTag ) {
	listTag.find('option').attr('selected', true);
}

Util.unselectAllOption = function ( listTag ) {
	listTag.find('option').attr('selected', true);
}

Util.getDeepCopy = function( obj )
{
	// Does not work..
	return $.extend( true, {}, obj );
}

Util.getObjectFromStr = function( str )
{
	return $.parseJSON( str );
}


Util.valueEscape = function( input )
{
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "'", "\'" );
	input = input.replace( '"', '\"' );

	return input;
}

Util.valueUnescape = function( input )
{
	//input.replaceAll( '\', '\\' );
	//input = input.replace( "\'", "'" );
	input = input.replace( '\"', '"' );

	return input;
}


// ----------------------------------
// Check Variable Related

Util.getNotEmpty = function( input ) {

	if ( Util.checkDefined( input ) )
	{
		return input
	}
	else return "";
}

Util.checkDefined = function( input ) {

	if( input !== undefined && input != null ) return true;
	else return false;
}

Util.checkValue = function( input ) {

	if ( Util.checkDefined( input ) && input.length > 0 ) return true;
	else return false;
}

Util.checkDataExists = function( input ) {

	return Util.checkValue( input );
}

Util.checkData_WithPropertyVal = function( arr, propertyName, value ) 
{
	var found = false;

	if ( Util.checkDataExists( arr ) )
	{
		for ( i = 0; i < arr.length; i++ )
		{
			var arrItem = arr[i];
			if ( Util.checkDefined( arrItem[ propertyName ] ) && arrItem[ propertyName ] == value )
			{
				found = true;
				break;
			}
		}
	}

	return found;
}

Util.isInt = function(n){
    return Number(n) === n && n % 1 === 0;
}

Util.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};


// Check Variable Related
// ----------------------------------


// ----------------------------------
// List / Array Related


Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	$.each( list, function( i, item )
	{
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			return false;
		}
	});

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return index;
}


Util.getFromListByName = function( list, name )
{
	var item;

	for( i = 0; i < list.length; i++ )
	{
		if ( list[i].name == name )
		{
			item = list[i];
			break;
		}
	}

	return item;
}

Util.getFromList = function( list, value, propertyName )
{
	var item;

	// If propertyName being compare to has not been passed, set it as 'id'.
	if ( propertyName === undefined )
	{
		propertyName = "id";
	}

	for( i = 0; i < list.length; i++ )
	{
		var listItem = list[i];

		if ( listItem[propertyName] == value )
		{
			item = listItem;
			break;
		}
	}

	return item;
}


Util.getMatchData = function( settingData, matchSet )
{
	var returnData = new Array();
	
	$.each( settingData, function( i, item )
	{
		var match = true;

		for ( var propName in matchSet )
		{
			if ( matchSet[ propName ] != item[ propName ] ) 
			{
				match = false;
				break;
			}
		}

		if ( match )
		{
			returnData.push( item );
		}
	});

	return returnData;
}


Util.getFirst = function( inputList ) 
{
	var returnVal;

	if( inputList !== undefined && inputList != null && inputList.length > 0 )
	{
		returnVal = inputList[0];
	}
	
	return returnVal;
}


Util.findItemFromList = function( listData, searchProperty, searchValue )
{
	var foundData;

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			foundData = item;
			return false;
		}
	});

	return foundData;
}


Util.findItemsFromList = function( listData, searchProperty, searchValue )
{
	var list = new Array();

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			list.push( item );
		}
	});

	return list;
}


// $.inArray( item_event.trackedEntityInstance, personList ) == -1

Util.checkExistInList = function( list, value, propertyName )
{
	var item = Util.getFromList( list, value, propertyName );

	if ( item === undefined ) return false;
	else return true;
}


Util.checkEmptyId_FromList = function( list )
{
	return ( Util.getFromList( list, '' ) !== undefined );
}


Util.getURLParameterByName = function( url, name )
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(url);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Util.getURLParameterByVariables = function( url, name )
{
	var result = [];
	var idx = 0;
	var pairs = url.split("&");
	for( var i=0; i< pairs.length; i++ ){
		var pair = pairs[i].split("=");
		if( pair[0] == name ){
			result[idx] = pair[1];
			idx++;
		}
	}
	return result;
}

// List / Array Related
// ----------------------------------


Util.copyProperties = function( source, dest )
{
	for ( var key in source )
	{
		dest[ key ] = source[ key ];
	}
}


// ----------------------------------
// Seletet Tag Populate, Etc Related


Util.populateSelect_ByList = function( selectTag, listData, dataType )
{
	selectTag.empty();

	$.each( listData, function( i, item ) 
	{
		var option = $( '<option></option>' );

		if ( dataType !== undefined && dataType == "Array" )
		{
			option.attr( "value", item ).text( item );
		}
		else
		{
			option.attr( "value", item.id ).text( item.name );
		}
			
		selectTag.append( option );
	});
}

Util.populateSelect_Simple = function( selectObj, json_Data )
{
	selectObj.empty();

	$.each( json_Data, function( i, item ) 
	{								
		selectObj.append( '<option value="' + item.id + '">' + item.name + '</option>' );
	});
}


Util.populateSelectDefault = function( selectObj, selectNoneName, json_Data, inputOption )
{
	selectObj.empty();

	selectObj.append( '<option value="">' + selectNoneName + '</option>' );

	var valuePropStr = "id";
	var namePropStr = "name";

	if ( inputOption !== undefined )
	{
		valuePropStr = inputOption.val;
		namePropStr = inputOption.name;
	}

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) 
		{
			var optionTag = $( '<option></option>' );

			optionTag.attr( "value", item[ valuePropStr ] ).text( item[ namePropStr ] );
				
			selectObj.append( optionTag );
		});
	}
}


Util.populateSelect = function( selectObj, selectName, json_Data, dataType )
{
	selectObj.empty();

	selectObj.append( '<option value="">Select ' + selectName + '</option>' );

	if ( json_Data !== undefined )
	{
		$.each( json_Data, function( i, item ) 
		{
			var option = $( '<option></option>' );

			if ( dataType !== undefined && dataType == "Array" )
			{
				option.attr( "value", item ).text( item );
			}
			else
			{
				option.attr( "value", item.id ).text( item.name );
			}
				
			selectObj.append( option );

		});
	}
}


Util.populateSelect_WithDefaultName = function( selectObj, selectName, json_Data, defaultName )
{
	selectObj.empty();

	selectObj.append( $( '<option value="">Select ' + selectName + '</option>' ) );

	$.each( json_Data, function( i, item ) {

		if( item.name == defaultName )
		{
			selectObj.append( $( '<option selected></option>' ).attr( "value", item.id ).text( item.name ) );
		}
		else
		{
			selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.name ) );
		}
	});
}


Util.selectOption_WithOptionalInsert = function ( selectObj, id, list )
{
	if ( selectObj.find( "option" ).length > 0 )
	{
		selectObj.val( id );				
	}

	// If not found, add the item.
	if ( selectObj.val() != id )
	{
		if ( list !== undefined && list != null )
		{
			// If list is provided, get item (name & id pair) from the list
			var item = Util.getFromList( list, id );

			if ( item !== undefined )
			{
				selectObj.append( $( '<option></option>' ).attr( "value", item.id ).text( item.name ) );
			}
		}
		else
		{
			// If list is not provided, simply add this id - as value & name
			selectObj.append( $( '<option></option>' ).attr( "value", id ).text( id ) );
		}

		selectObj.val( id );
	}
}


Util.setSelectDefaultByName = function( ctrlTag, name )
{
	ctrlTag.find( "option:contains('" + name + "')" ).attr( 'selected', true );
}

Util.getSelectedOptionName = function( ctrlTag )
{
	return ctrlTag.options[ ctrlTag.selectedIndex ].text();
}

// Seletet Tag Populate, Etc Related
// ----------------------------------


// ----------------------------------
// Write Message, Paint, Toggle Related

Util.write = function( data )
{
	$( "#testData" ).append( " [" + data + "] <br><br>" );
}


Util.paintControl = function( ctrlTarget, color ) 
{
	if ( ctrlTarget.is( "select" ) )
	{
		ctrlTarget.css( "background-color", color );
		ctrlTarget.find( 'option' ).css( "background-color", color );
	}	
	else
	{
		ctrlTarget.css( "background-color", color );
	}
}


Util.paintWarningIfEmpty = function( tag )
{
	if ( tag.val() == "" )
	{
		//Util.paintControl( tag, '#F0D0D0' );
		Util.paintWarning( tag );
	}
	else
	{
		Util.paintClear( tag );
	}
}


Util.paintWarning = function( ctrlTarget ) 
{
	Util.paintControl( ctrlTarget, "LightCoral" );
}

Util.paintAttention = function( ctrlTarget ) 
{
	Util.paintControl( ctrlTarget, "#CDEBFF" );
}


Util.paintLightGreen = function( ctrlTarget ) 
{
	Util.paintControl( ctrlTarget, "#EEFEEE" );
}
	

Util.paintWhite = function( ctrlTarget ) 
{
	Util.paintControl( ctrlTarget, "White" );
}


Util.paintClear = function( ctrlTarget ) 
{
	ctrlTarget.css( "background-color", "" );
}


Util.paintResult = function( ctrlTarget, result ) 
{
	if( result )
	{
		Util.paintControl( ctrlTarget, "#BBEEBB" );
	}
	else 
	{
		Util.paintControl( ctrlTarget, "#FFFFFF" );
	}
}


Util.paintSuccess = function( ctrlTarget, result ) 
{
	if( result )
	{
		Util.paintControl( ctrlTarget, "#BBEEBB" );
	}
	else 
	{
		Util.paintControl( ctrlTarget, "#FFFFFF" );
	}
}

Util.paintError = function( ctrlTarget, result ) 
{
	if( result )
	{
		Util.paintControl( ctrlTarget, "Orange" );
	}
	else 
	{
		Util.paintControl( ctrlTarget, "#FFFFFF" );
	}
}

Util.paintBorderClear = function( ctrlTarget ) 
{
	ctrlTarget.css( "border-color", "" );
}

Util.paintBorderWarning = function( ctrlTarget ) 
{
	ctrlTarget.css( "border-color", "#ff0000" );
}

Util.toggleTarget = function( toggleAnchor, target, expand )
{

	// If 'expand' it is defined, display accordingly.
	// If not, toggle based on current display setting.
	if ( expand !== undefined )
	{
		if ( expand )
		{
			target.show( "fast" );					
			toggleAnchor.text( '[-]' );
		}
		else
		{
			target.hide( "fast" );
			toggleAnchor.text( '[+]' );
		}
	}
	else
	{
		if( toggleAnchor.text() == '[+]' )
		{
			target.show( "fast" );					
			toggleAnchor.text( '[-]' );
		}
		else if( toggleAnchor.text() == '[-]' )
		{
			target.hide( "fast" );
			toggleAnchor.text( '[+]' );
		}
	}
}


Util.toggleTargetButton = function( toggleButtonTag, targetTag, expand, expendFunc, collapseFunc )
{

	var expendText = toggleButtonTag.attr( 'expand' );
	var collapseText = toggleButtonTag.attr( 'collapse' );

	//if ( !Util.checkValue( expendText ) ) expendText = '[+]';
	//if ( !Util.checkValue( collapseText ) ) collapseText = '[-]';

	var show = false;

	// If 'expand' it is defined, display accordingly.
	// If not, toggle based on current display setting.
	if ( expand !== undefined )
	{
		if ( expand ) show = true;
		else show = false;
	}
	else
	{
		if( toggleButtonTag.text() == expendText ) show = true;
		else if( toggleButtonTag.text() == collapseText ) show = false;
	}


	if ( show )
	{
		targetTag.show( "fast" );					
		toggleButtonTag.text( collapseText );
		if ( expendFunc !== undefined ) expendFunc();
	}
	else
	{
		targetTag.hide( "fast" );
		toggleButtonTag.text( expendText );
		if ( collapseFunc !== undefined ) collapseFunc();
	}
}


Util.setRowRemoval = function( trCurrent, runFunc )
{
	trCurrent.slideUp( 200, function() {

		trCurrent.remove();

		if ( runFunc !== undefined )
		{
			runFunc();
		}
	
	});
}

// Write Message, Paint, Toggle Related
// ----------------------------------

Util.checkInteger = function( input )
{
	var intRegex = /^\d+$/;
	return intRegex.test( input );
}

Util.checkCalendarDateStrFormat = function( inputStr )
{
	if( inputStr.length == 10
		&& inputStr.substring(4, 5) == '/'
		&& inputStr.substring(7, 8) == '/'
		&& Util.checkInteger( inputStr.substring(0, 4) )
		&& Util.checkInteger( inputStr.substring(5, 7) )
		&& Util.checkInteger( inputStr.substring(8, 10) )
		)
	{
		return true;
	}
	else
	{
		return false;
	}
}

Util.isDate = function(date) {
   return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
}

// ----------------------------------
// Date Formatting Related


Util.formatDate = function( strDate )
{
	var returnVal = "";

	if( strDate.length == 10 )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var date = strDate.substring(8);

		returnVal = year + "-" + month + "-" + date;
	}

	return returnVal;
}


Util.formatDateBack = function( strDate )
{
	if ( Util.checkValue( strDate ) )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var date = strDate.substring(8, 10);

		return year + "/" + month + "/" + date;
	}
	else
	{
		return "";
	}
}


Util.getDate_FromYYYYMMDD = function( strDate )
{
	var date;

	if ( Util.checkValue( strDate ) )
	{
		var year = strDate.substring(0, 4);
		var month = strDate.substring(5, 7);
		var date = strDate.substring(8, 10);

		date = new Date( year, month - 1, date );
	}

	return date;
}


Util.getDateStrYYYYMMDD_FromDate = function( date )
{
	return $.format.date( date, _dateFormat_YYYYMMDD);
}


Util.formatDate_LongDesc = function( date )
{
	return $.format.date( date, _dateFormat_DDMMMYYYY );
}

Util.dateToString = function( date )
{
	var month = eval( date.getMonth() ) + 1;
	month = ( month < 10 ) ? "0" + month : month;
	
	var day = eval( date.getDate() );
	day = ( day < 10 ) ? "0" + day : day;
		
	return date.getFullYear() + "-" + month + "-" + day;
}


// Date Formatting Related
// ----------------------------------

// ----------------------------------
// Others

Util.showDiv = function( tag, show )
{
	if ( tag !== undefined && tag.length > 0 )
	{
		( show ) ? tag.show() : tag.hide();
	}
}

Util.generateRandomId = function() 
{
	var id = '';
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id_size = 12;

	for (var i = 1; i <= id_size; i++) 
	{
		var randPos = Math.floor( Math.random() * charSet.length );
		id += charSet[ randPos ];
	}
	
	return id;
}


Util.getParameterByName = function( name ) 
{
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


Util.parseInt = function( input )
{
	if ( input === undefined || input == null || input.length == 0 )
	{
		return 0;
	}
	else
	{
		return parseInt( input );
	}
}

// Others
// ----------------------------------

	
// -------------------------------------------
// -- Data Loading Message Util Class/Methods


function DialogLoading() {}

DialogLoading.dialogLoadingMsg_Initial = "";
DialogLoading.dialogOpenCount = 0;
DialogLoading.dialogCountClean = "countClean";

$( document ).ready( function() { DialogLoading.initialSetup(); });

DialogLoading.getDialog = function()
{
	return $( "#dialog-loading" );			
}

DialogLoading.initialSetup = function()
{
	var dialogTag = DialogLoading.getDialog();

	dialogTag.dialog({
		  autoOpen: false,
		  dialogClass: "noTitleStuff",
		  height: 100,
		  modal: true,
		  position: { at: "center top+20%" }
		});
	
	dialogTag.find( '#forceClose' ).click( function() {

		DialogLoading.close();
		return false;
	});

	DialogLoading.dialogLoadingMsg_Initial = dialogTag.find( '#loadingMsg' ).text();
}

DialogLoading.open = function( loadingMsg )
{
	var dialogTag = DialogLoading.getDialog();

	if ( loadingMsg !== undefined )
	{
		dialogTag.find( '#loadingMsg' ).text( loadingMsg );
	}
	else
	{
		dialogTag.find( '#loadingMsg' ).text( DialogLoading.dialogLoadingMsg_Initial );
	}

	DialogLoading.dialogOpenCount++;


	dialogTag.show().dialog( "open" );
}

DialogLoading.openWithCallback = function( callback )
{
	DialogLoading.open();

	// Due to use of Synchronized calls & chrome browser optimization, 
	// Use setTimeout to delay things a bit. 
	setTimeout( callback, 50 );
}

DialogLoading.close = function( option )
{
	DialogLoading.dialogOpenCount--;

	if ( option !== undefined && option == DialogLoading.dialogCountClean )
	{
		DialogLoading.dialogOpenCount = 0;
	}

	if ( DialogLoading.dialogOpenCount <= 0)
	{
		DialogLoading.dialogOpenCount = 0;
		DialogLoading.getDialog().dialog( "close" );
	}
}

// -- Data Loading Message Util Class/Methods
// -------------------------------------------

// -------------------------------------------
// -- Quick Loading Message Util Class/Methods

// Sample loading message format
//<div id='orgUnitLoading' style='display:none'>
//	<img src='img/ui-anim_basic.gif'/> retrieving..
//</div>

var _quickLoadingCountObj = {};

function QuickLoading() {}

QuickLoading.getLoadingCountObj = function( loadingTagName )
{
	// if property exists, return the object
	// otherwise, create the property with 0 and return
	if ( !_quickLoadingCountObj.hasOwnProperty( loadingTagName ) ) 
	{
		_quickLoadingCountObj[ loadingTagName ] = { "count": 0 };
	}

	return _quickLoadingCountObj[ loadingTagName ];
}

// ------- With Tag Name ------------

QuickLoading.dialogShowAdd = function( loadingTagName )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTagName );

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		$( '#' + loadingTagName ).show();
	}

	loadingCountObj.count++;
}

QuickLoading.dialogShowRemove = function( loadingTagName )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTagName );

	loadingCountObj.count--;

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		$( '#' + loadingTagName ).hide();
	}
}

// ------- With Tag ('id' use assumed) ------------

QuickLoading.dialogTagShowAdd = function( loadingTag )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTag.attr( 'id' ) );

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		loadingTag.show();
	}

	loadingCountObj.count++;
}

QuickLoading.dialogTagShowRemove = function( loadingTag )
{
	var loadingCountObj = QuickLoading.getLoadingCountObj( loadingTag.attr( 'id' ) );

	loadingCountObj.count--;

	if ( loadingCountObj.count <= 0 )
	{
		loadingCountObj.count = 0;
		loadingTag.hide();
	}
}


// -- Quick Loading Message Util Class/Methods
// -------------------------------------------

function FormBlock() {}

FormBlock.block = function( block, msg, cssSetting, tag )
{
	var msgAndStyle = { message: msg, css: cssSetting };

	if ( tag === undefined )
	{
		if ( block ) $.blockUI( msgAndStyle );
		else $.unblockUI();
	}
	else
	{
		if ( block ) tag.block( msgAndStyle );
		else tag.unblock();
	}
}


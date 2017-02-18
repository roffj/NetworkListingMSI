

// -------------------------------------------
// -- Org Unit Form Utilities Class/Methods

function OrgUnitUtil() {}

// Check if the code already exists in the system
OrgUnitUtil.checkOrgUnitCode = function( orgUnitsJSON, tag, msg, execFunc)
{
	// Check for code existing already, first.
	var orgUnitInfo = orgUnitsJSON.organisationUnits[0];

	if ( orgUnitInfo.code == "" )
	{
		execFunc();
	}
	else
	{
		// Check for code existing on other org unit.

		RESTUtil.getAsynchData( _queryURL_api + 'organisationUnits.json?paging=no&fields=id&filter=code:eq:' + orgUnitInfo.code
		, function( json_orgUnits ) 
		{
			if ( Util.checkDefined( json_orgUnits.organisationUnits ) )
			{
				// Check for 'New' case and 'Update' case 
				if ( json_orgUnits.organisationUnits.length == 0 
					|| ( json_orgUnits.organisationUnits.length == 1
							&& orgUnitInfo.id !== undefined
							&& json_orgUnits.organisationUnits[0].id == orgUnitInfo.id ) 
					)
				{
					execFunc();
				}
				else
				{
					// Do not Continue
					alert( 'The org unit code, ' +  orgUnitInfo.code + ', already exists in other org unit.' );
				}
			}
		}
		, function() { alert( 'Failed to lookup org unit info.' ); }
		, function() { if ( tag !== undefined ) tag.block( msg ); }
		, function() { if ( tag !== undefined ) tag.unblock(); } 
		);
	}	
}


OrgUnitUtil.checkOrgUnitShortName = function( orgUnitsJSON, tag, msg, execFunc )
{
	// Check for code existing already, first.
	var orgUnitInfo = orgUnitsJSON.organisationUnits[0];

	if ( orgUnitInfo.shortName == "" )
	{
		alert( 'The short name has to be entered' );
	}				
	else if ( orgUnitInfo.shortName.length > 50 )
	{
		alert( 'The short name length should not be more than 50 characters.' );
	}
	else
	{
		// Check for code existing on other org unit.

		RESTUtil.getAsynchData( _queryURL_api + 'organisationUnits.json?paging=no&fields=id&filter=shortName:eq:' + orgUnitInfo.shortName
		, function( json_orgUnits ) 
		{
			if ( Util.checkDefined( json_orgUnits.organisationUnits ) )
			{
				if ( json_orgUnits.organisationUnits.length == 0 
					|| ( json_orgUnits.organisationUnits.length == 1
							&& orgUnitInfo.id !== undefined
							&& json_orgUnits.organisationUnits[0].id == orgUnitInfo.id ) 
					)
				{
					console.log( 'short name passed' );
					execFunc();
				}
				else
				{
					// Do not Continue
					alert( 'The org unit shortName, "' +  orgUnitInfo.shortName + '", already exists in other org unit.' );
				}
			}
		}
		, function() { alert( 'Failed to lookup org unit info.' ); }
		, function() { if ( tag !== undefined ) tag.block( msg ); }
		, function() { if ( tag !== undefined ) tag.unblock(); } 
		);
	}	
}


// -- Org Unit Utility Class/Methods
// -------------------------------------------

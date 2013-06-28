/*** settings ***/
var UtilitySetting = {};
UtilitySetting.debugMode = true;

/**** define global properties and methods here ****/

/** define console object in case lacking browser support **/
var alertFallback = true;
if (typeof console === "undefined" || typeof console.log === "undefined")
{
	 console = {};
	 if (alertFallback) {
		console.log = function(msg) {
			 // alert(msg);
		};
	} else {
		console.log = function() {};
	}
}

/*	trace debug message
	
	content	object	tracing content, usually a string
	level	int		console log level, 0 or execption will be log, 1 for warning, 2 for error
*/
function debug(content, level, jsonDecode)
{
	if(UtilitySetting.debugMode)
	{
		if(jsonDecode) content = JSON.stringify(content);
		
		if(level == 1)
			console.warn(content);
		else if(level == 2)
			console.error(content);
		else
			console.log(content);
	}
}

function debugJson(content){ debug(content, level, true); }
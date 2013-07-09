/*	singleton class for Utility to reference with, 
	
	currently it provide window.console method missing fix(it will be auto executed after loaded), 
	and provide methods to disable/enable console methods
	
	example:
	Utility.disableAllConsoleMethods(); // disable all console methods
	Utility.enableAllConsoleMethods(); // enable all console methods
	Utility.setConsoleMethod("log", false); // disable console.log() method only
*/
function Utility_singleton()
{	
	var _p = Utility_singleton.prototype = this;	
	var _oldConsoleMethod = {};
	var _consoleMethods = {};
	_consoleMethods["log"] = "log";
	_consoleMethods["warn"] = "warn";
	_consoleMethods["error"] = "error";
	_consoleMethods["debug"] = "debug";
	_consoleMethods["info"] = "info";
	
	this.setConsoleMethod = function(methodName/*string*/, enableIt/*boolean*/)
	{
		(enableIt == true) ? console[methodName] = _oldConsoleMethod[methodName] : console[methodName] = function(){};
	};
	
	this.disableAllConsoleMethods = function()
	{
		for(var key in _consoleMethods) this.setConsoleMethod(key, false);
	};
	
	this.enableAllConsoleMethods = function()
	{
		for(var key in _consoleMethods) this.setConsoleMethod(key, true);
	};
	
	// call constructor in the end so constructor function can use all public methods in instance
	init();
	function init()
	{
		if(Utility_singleton.instance) { console.error("Utility is singleton, shouldn't be construced again"); return; }
		Utility_singleton.instance = this;
		
		// fix console methods for some browser which don't support it
		if(!window.console) 
		{
			window.console = {};
		
			for(var key in _consoleMethods)
			{
				console[_consoleMethods[key]] = function(){};
			}
		}
		
		// store old console methods
		for(var key in _consoleMethods)
		{
			_oldConsoleMethod[_consoleMethods[key]] = console[_consoleMethods[key]];
		}
	};
	
	
	this.getRotationDegrees = function(jQueryObj) 
	{
		var matrix = jQueryObj.css("-webkit-transform") ||
		jQueryObj.css("-moz-transform")    ||
		jQueryObj.css("-ms-transform")     ||
		jQueryObj.css("-o-transform")      ||
		jQueryObj.css("transform");
		if(matrix !== 'none') {
			var values = matrix.split('(')[1].split(')')[0].split(',');
			var a = values[0];
			var b = values[1];
			var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
		} else { var angle = 0; }
		return (angle < 0) ? angle +=360 : angle;
	}
}
Utility_singleton.instance = null;

var Utility = new Utility_singleton(true);

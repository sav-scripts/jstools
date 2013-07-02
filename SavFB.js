/* 	example

	var savFB = new SavFB();
	savFB.init("212169482270500", ""user_about_me", allReady);
	
	savFB.strongLogin(funcSuccess, funcFail);
*/

function SavFB()
{
	var _p = SavFB.prototype = this;
	
	this.appId = null;
	this.authRecipe = "user_about_me,publish_stream,user_photos";
	
	this.isInit = false;
	this.isDebug = true;
	
	this.uid = null;
	this.uname = null;
	this.logged = false;
	this.fidList = null;
	
	/*	Initialize FB API
	
		appId		string			facebook application id
		cb_init		function(opt)	callback when initialized
		authRecipe	string(opt)		authorize for application
		isDebug		boolean(opt)	set to true for console log debug messages
		cb_connected				below are callbacks for each status when auth response changed
		cb_not_authorized
		cb_unknown
	*/
	this.init = function(appId, cb_init, authRecipe, isDebug, cb_connected, cb_not_authorized, cb_unknown)
	{
		this.appId = appId;
		if(isDebug != null) this.isDebug = isDebug;
		if(authRecipe != null) this.authRecipe = authRecipe;
		
		window.fbAsyncInit = function() {
			FB.init({
			  appId      : _p.appId,
			  status     : true,
			  cookie     : true,
			  oauth      : true,
			  xfbml      : false 
			});
			
			FB.Event.subscribe('auth.authResponseChange', function(response) {
				debug("FB authResponseChange event, status = " + response.status );
				if (response.status === 'connected') {
					if(cb_connected != null) cb_connected.apply(null, [response]);
				} else if (response.status === 'not_authorized') {
					if(cb_not_authorized != null) cb_not_authorized.apply(null, [response]);
					//FB.login();
				} else {
					this.uid = null;
					this.uname = null;
					this.logged = false;
					this.fidList = null;
					
					if(cb_unknown != null) cb_unknown.apply(null, [response]);
					//FB.login();
				}
			});
			
			_p.isInit = true;
			if(cb_init != null) cb_init.apply(null);
		};
		
		(function(d)
		{ 
			var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/zh_TW/all.js";
			ref.parentNode.insertBefore(js, ref);
		}(document));
	}
	
	/*	This will test if user is logged, and ask for login if not
	
		#notice: while user try logging after he logout in others tab of browser, the loggin status will still be connected when checking loginStatus, 
			calling getUser will still got response but response.id will be undefined.
	*/
	this.strongLogin = function(cb_yes, cb_no)
	{		
		debug("SavFB strongLogin");
		FB.getLoginStatus(function(response) 
		{	
			debug("response: " + JSON.stringify(response));	
			if (response.status === 'connected') 
			{
				_p.getUser(cb_yes, _p.login);
				
			} else {
				
				_p.login(cb_yes, cb_no);
			}
		});
	}
		
	this.login = function(cb_yes, cb_no) 
	{
		debug("SavFB login");
		FB.login(function (response) 
		{	
			debug("response: " + JSON.stringify(response));
			
			if (response.authResponse) 
			{	
				_p.logged = true;
				_p.getUser(cb_yes);
			} else {
				
				if(cb_no != null) cb_no.apply(null);
			}
		}, {
			scope: _p.authRecipe
		});
	}
	
	this.getUser = function(cb_yes, cb_no) 
	{
		debug("SavFB getUser");
		FB.api('/me', function (response) 
		{
			debug("response: " + JSON.stringify(response));
			if(response.id)
			{
				_p.uid = response.id;
				_p.uname = response.name;
				if(cb_yes != null) cb_yes.apply(null);
			}
			else
			{
				if(cb_no != null) cb_no.apply(null);
			}
		});
	}
	
	/*	get friend list from user, 
		if succes, response will be an array, , which store a list of friend uid
		
		cb_yes: callback if success, params [fidList:Array]
		cb_no: callback if fail, params [error message]
	*/
	this.getFriends = function(cb_yes, cb_no)
	{
		debug("SavFB getFriends");
		FB.api({ method: 'friends.get' }, function(response) 
		{
			if (!response || response.error) 
			{
				if(cb_no != null) (!response) ? cb_no.apply(null, ['no response from FB']) : cb_no.apply(null, [response.error]);
			}
			 else 
			{
				_p.fidList = response;
				if(cb_yes != null) cb_yes.apply(null, [response]);
			}
		});
	}
	
	/*	post img to user's photos album
	
		imgURL: string: url of posting image
		message: string: the message contact with post
		cb_yes: callback if success, params [id, post_id]
		cb_no: callback if fail, params [error message]
	*/
	this.postImg = function(imgURL, message, cb_yes, cb_no) 
	{
		debug("SavFB postImg");
		FB.api('/me/photos', 'post',
			{
				message: message,
				url: imgURL
			}
			, function (response) 
			{	
				var res;
				debug("response: " + JSON.stringify(response));
				if (!response || response.error) 
				{	
					if(cb_no != null) (!response) ? cb_no.apply(null, ['no response from FB']) : cb_no.apply(null, [response.error.message]);
				} 
				else 
				{
					if(cb_yes != null) cb_yes.apply(null, [response.id, response.post_id]);
				}
			});
	}
	
	/*	post to user stream
	
		cb_yes: callback if success, params [post_id]
		cb_no: callback if fail, params [response]
	*/
	this.simpleFeed = function(name, caption, description, pictureUrl, targetLink, cb_yes, cb_no)
	{
		debug("SavFB simpleFeed");
		FB.ui(
		  {
			method: 'feed',
			name: name,
			link: targetLink,
			picture: pictureUrl,
			caption: caption,
			description: description
		  },
		  function(response) 
		  {
			debug("response: " + JSON.stringify(response));
			if (response && response.post_id) 
			{
				if(cb_yes != null) cb_yes.apply(null, [response.post_id]);
			} else {
				if(cb_no != null) cb_no.apply(null, [response]);
			}
		  }
		);
	}
	
	function debug(obj)
	{
		if(_p.isDebug)
		{
			console.log(obj);
		}
	}
	
	/*** snippets ***/
	
	/*	FQL example
	
		FB.api(
		{
			method: 'fql.query',
			query: "SELECT like_info from photo WHERE object_id = 464791233608147",
			return_ssl_resources: 1
		}, 
		function(response)
		{
			console.log(response);
		});
	*/
}
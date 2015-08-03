/* 
 * Methods use shows below:
 * open : This method instantiates the player object and take input url as input paramter.
 * prepare: This method prepare the media player for playback. 
 * Player must have been created before this with a valid URI.
 * setDisplayRect:This method sets the display area for playing video content on TV screen
 * play: This method starts the playback of the stream.
 * close:This method destroys the avplay object.
 * prepareAsync:This method prepares the media player for playback, asynchronously. 
 * This API, would prepare the MM core module asynchronously. 
 * It means internal media elements will change the state asynchronously.
 * 
 */

/**
 * This object is used in order to obtain the Buffering, 
 * Playback Time, Playback mode, DRM mode information etc. * 
 */

var listener = {
	onbufferingstart : function() {
		console.log("Buffering start.");
		showLoading();
	},
	onbufferingprogress : function(percent) {
		console.log("Buffering progress data : " + percent);
		updateLoading(percent);
	},
	onbufferingcomplete : function() {
		console.log("Buffering complete.");
		hideLoading();
	},
	oncurrentplaytime : function(currentTime) {
		console.log("Current Playtime : " + currentTime);
		updateCurrentTime(currentTime);
	},
	onevent : function(eventType, eventData) {
		console.log("event type : " + eventType + ", data: " + eventData);
	},
	onerror : function(eventType) {
		console.log("error type : " + eventType);
	},
	onsubtitlechange : function(duration, text, data3, data4) {
		console.log("Subtitle Changed.");
	},
	ondrmevent : function(drmEvent, drmData) {
		console.log("DRM callback: " + drmEvent + ", data: " + drmData);
	},
	onstreamcompleted : function() {
		console.log("Stream Completed");
		//You should write stop code in onstreamcompleted.
		webapis.avplay.pause();
		webapis.avplay.seekTo(0);
	}
};

//Initialize function
var init = function() {
	//register video related keys
	tizen.tvinputdevice.registerKey("MediaPlayPause");
	tizen.tvinputdevice.registerKey("MediaPlay");
	tizen.tvinputdevice.registerKey("MediaPause");
	tizen.tvinputdevice.registerKey("MediaStop");
	tizen.tvinputdevice.registerKey("MediaFastForward");
	tizen.tvinputdevice.registerKey("MediaRewind");
	//You don't need to register volume related key.
	
	//add eventListener for video related keys
	document.addEventListener('keydown',function(e) {
		switch (e.keyCode) {
		case tizen.tvinputdevice.getKey("MediaPlayPause").code:
			console.log("Play/Pause toggle button clicked");
			if(webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "READY"){
				playVideo();
			}else if(webapis.avplay.getState() == "PLAYING"){
				pauseVideo();
			}
			break;
		case tizen.tvinputdevice.getKey("MediaPlay").code:
			console.log("Play button clicked");
			playVideo();
			break;
		case tizen.tvinputdevice.getKey("MediaPause").code:
			console.log("Pause button clicked");
			pauseVideo();
			break;
		case tizen.tvinputdevice.getKey("MediaStop").code:
			console.log("Stop button clicked");
			stopVideo();
			break;
		case tizen.tvinputdevice.getKey("MediaFastForward").code:
			console.log("FF button clicked");
			jumpForwardVideo(1000);
		break;
		case tizen.tvinputdevice.getKey("MediaRewind").code:
			console.log("RW button clicked");
			jumpBackwardVideo(1000);
		break;
		}
	});
};

// window.onload can work without <body onload="">
window.onload = init;

/**
 * open function
 * 
 * You should do this code sequence before you play video.
 * open -> setListener -> prepare -> setDisplayRect -> play
 */
var videoOpen = function() {
	try{
		console.log("Current state: " + webapis.avplay.getState());
		console.log("open start");
		//open API gets target URL. URL validation is done in prepare API.
		var url = document.getElementById("url").value;
		webapis.avplay.open(url);
		//setListener should be done before prepare API. Do setListener after open immediately.
		webapis.avplay.setListener(listener);		
		console.log("Current state: " + webapis.avplay.getState());
		console.log("open complete");
		//reset duration
		updateDuration();
	}
	catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log("Exception: " + e.name);
	}
};

/**
 * prepare function
 * 
 * You should do this code sequence before you play video.
 * open -> setListener -> prepare -> setDisplayRect -> play
 */
var prepare = function() {
	try{
		console.log("Current state: " + webapis.avplay.getState());
		console.log("prepare start");
		//prepare API should be done after open API. 
		webapis.avplay.prepare();	
		//set default position and size
		//setDisplayRect should be done to display video. without it, video is not shown.		
		var avPlayerObj = document.getElementById("av-player");	
		webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);
		console.log("Current state: " + webapis.avplay.getState());
		console.log("prepare complete");
		
		//duration can be get after prepare complete
		updateDuration();		 
	}
	catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}
};

/**
 * prepareAsync function
 * 
 * prepare blocks UX of App till buffering time.
 * If you don't like it, use prepareAsync.
 */
var prepareAsync = function() {
	try{
		console.log("Current state: " + webapis.avplay.getState());
		console.log("prepareAsync Start");
		//prepare API should be done after open API. 
		webapis.avplay.prepareAsync(function(){
			//set default position and size
			//setDisplayRect should be done to display video. without it, video is not shown.		
			var avPlayerObj = document.getElementById("av-player");	
			webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);
			
			console.log("Current state: " + webapis.avplay.getState());
			console.log("prepareAsync Success");
			
			//duration can be get after prepare complete
			updateDuration();	
		}, function(e){
			console.log("Current state: " + webapis.avplay.getState());
			console.log("prepareAsync Fail");
			console.log(e);			
		});	
	}
	catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}
};



/**
 * playVideo use to play the video
 */
var playVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Play Video');
	try {
		webapis.avplay.play();
		console.log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}

};

/**
 * closeVideo function is used to close the video
 */
var closeVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Close Video');
	try {
		webapis.avplay.close();
		console.log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}

};

/**
 * This is used to pause the video
 */
var pauseVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Pause Video');
	try {
		webapis.avplay.pause();
		console.log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}

};

/**
 * This function is used to stop the video
 */
var stopVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Stop Video');
	try {
		webapis.avplay.stop();
		console.log("Current state: " + webapis.avplay.getState());
	} catch (e) {
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * jump forward
 * @param time millisecond
 */
var jumpForwardVideo = function(time) {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('FF Video');
	try{
		webapis.avplay.jumpForward(time);		
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * jump backward
 * @param time millisecond
 */
var jumpBackwardVideo = function(time) {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('RW Video');
	try{
		webapis.avplay.jumpBackward(time);		
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};


/**
 * sample code for how to change video size
 */
var changeVideoSize = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Change video size');
	try{
		var avPlayerObj = document.getElementById("av-player");
		if(avPlayerObj.offsetLeft == 2){
			avPlayerObj.style.left = "200px";
			avPlayerObj.style.width = "1300px";
			avPlayerObj.style.height = "500px";
			webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);
		}else{
			avPlayerObj.style.left = "0px";
			avPlayerObj.style.width = "700px";
			avPlayerObj.style.height = "700px";
			webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);
		}
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * Show video object
 */
var showVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Show video');
	try{
		var avPlayerObj = document.getElementById("av-player");
		avPlayerObj.style.visibility = "visible";
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * Hide video object
 */
var hideVideo = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('Hide video');
	try{
		var avPlayerObj = document.getElementById("av-player");
		avPlayerObj.style.visibility = "hidden";
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * volume up
 */
var volUp = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('volume up');
	try{
		tizen.tvaudiocontrol.setVolumeUp();		
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * volume down
 */
var volDown = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('volume down');
	try{
		tizen.tvaudiocontrol.setVolumeDown();		
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/**
 * mute audio
 */
var mute = function() {
	console.log("Current state: " + webapis.avplay.getState());
	console.log('mute');
	try{
		tizen.tvaudiocontrol.setMute(!tizen.tvaudiocontrol.isMute());
		console.log("Current state: " + webapis.avplay.getState());
	}catch(e){
		console.log("Current state: " + webapis.avplay.getState());
		console.log(e);
	}	
};

/*
 * Handling time indicator
 */
var updateDuration = function(){
	//duration is given in millisecond
	var duration = webapis.avplay.getDuration();
	document.getElementById("totalTime").innerHTML = Math.floor(duration/3600000) + ":" + Math.floor((duration/60000)%60) + ":" + Math.floor((duration/1000)%60);	
}

var updateCurrentTime = function(currentTime){
	//current time is given in millisecond
	if(currentTime == null){
	    currentTime = webapis.avplay.getCurrentTime();
	}
	document.getElementById("currentTime").innerHTML = Math.floor(currentTime/3600000) + ":" + Math.floor((currentTime/60000)%60) + ":" + Math.floor((currentTime/1000)%60);	
}

/*
 * Handling loading indicator
 */
var showLoading = function(){
	var avPlayerObj = document.getElementById("av-player");
	document.getElementById("loading").style.display = "block";
	document.getElementById("loading").style.left = avPlayerObj.offsetLeft + (avPlayerObj.offsetWidth/2) - (document.getElementById("loading").offsetWidth/2);
	document.getElementById("loading").style.top = avPlayerObj.offsetTop + (avPlayerObj.offsetHeight/2) - (document.getElementById("loading").offsetHeight/2);
	document.getElementById("percent").innerHTML = 0;
}

var hideLoading = function(){
	document.getElementById("loading").style.display = "none";
}

var updateLoading = function(percent){
	document.getElementById("percent").innerHTML = percent;
}
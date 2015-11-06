
/* specifiy if we are in dev environment */
_DEV_MODE = false;

var stats = false;
/* initialize stats if necessary */
function createStats(){
	stats = new Stats();
	stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );
};
    



function getLocation(){
	
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET','http://freegeoip.net/json/');
	xmlhttp.send();
	xmlhttp.onreadystatechange = function(){
		
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			var response = JSON.parse( xmlhttp.responseText );						
			
			// check on this !
			// is this really causing the problem ??
			var location = ( response.region_name != '' ) ? response.region_name : response.country_name;
			//dynamicTexture.clear('transparent');
			dynamicTexture.clear();
			dynamicTexture.context.font	= " 60px Helvetica Neue";
			dynamicTexture.context.textAling = "center";
			dynamicTexture.context.fillRect = "center";
			dynamicTexture.drawText( location.toUpperCase(), null, 140, '#111');
			dynamicTexture.texture.needsUpdate = true;

		}
	};
}



/* constants parameters */
var clocks = {};

/* main setup */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.5, 200 );
var controls;
var frames = 0;
var tween;
var dynamicTexture = new THREEx.DynamicTexture(512,512);
var numbers = [];

/* creating the canvas */
var devicePixelRatio = window.devicePixelRatio || 1;
var renderer = new THREE.WebGLRenderer( {antialias: true, alpha: true} );

// set the correct devicePixelRatio for correct size of the window
renderer.setSize( window.innerWidth * devicePixelRatio, window.innerHeight * devicePixelRatio);

/* shadow settings */ 
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

renderer.shadowCameraNear = 6;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;

renderer.shadowMapBias = 0.0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;

getLocation();

function main(){

	// show the stats if we are in dev mode
	if( _DEV_MODE === true ){
		createStats();
	}
	
	// set the size of the drawingBuffer			
	renderer.domElement.style.width = renderer.domElement.width / devicePixelRatio;
	renderer.domElement.style.height = renderer.domElement.height / devicePixelRatio;
	document.body.appendChild( renderer.domElement );
	
	/* setup the camera */
	camera.position.set(0,0,10);	
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	/* setup the light! */
	var directionalLight = new THREE.DirectionalLight( 0xffffff );			
	directionalLight.position.set( 0, 0, 15 );						
	directionalLight.castShadow = true;
	directionalLight.shadowDarkness = 0.8;
	
	// only for debugging
	//directionalLight.shadowCameraVisible = true; 

	// these six values define the boundaries of the yellow box seen above
	var dim = 8;
	directionalLight.shadowCameraNear = 6;
	directionalLight.shadowCameraFar = 30;
	directionalLight.shadowCameraLeft = -dim;
	directionalLight.shadowCameraRight = dim;
	directionalLight.shadowCameraTop = dim;
	directionalLight.shadowCameraBottom = -dim;
	scene.add( directionalLight );

	// ambient light 
	var light = new THREE.AmbientLight( 0xffffff ); // soft white light
	scene.add( light );
	// point light
	var light = new THREE.PointLight( 0xffffff, 1, 1500 );
	light.position.set( 0, 0, -15 );
	scene.add( light );
	
	//////////////////////////////////////////
	
	// define the objects 

	// define the red plane 
	var geometry = new THREE.CylinderGeometry( 4.5, 4.5, 0.4, 64 );	
	var material = new THREE.MeshPhongMaterial({
		emissive: 0x333333,		
		color: 0x666666,
		metal: true,
		specular: 0x333333,
		shininess: 20
	});
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.translateZ(0.3);
	cylinder.rotation.x = Math.PI / 2;
	scene.add( cylinder );


	// the white plane
	var geometry = new THREE.CylinderGeometry( 4, 4, 0.1, 64 );	
	var material = new THREE.MeshPhongMaterial({		
		color: 0x333333,
		// metal: true,
		specular: 0x666666,
		shininess: 10
	});

	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.translateZ(0.47);
	cylinder.rotation.x = Math.PI /2;
	scene.add( cylinder );


	var geometry = new THREE.CylinderGeometry( 4, 4, 0.1, 64 );	
	var material = new THREE.MeshPhongMaterial({		
		color: 0x333333,
		// metal: true,
		specular: 0x666666,
		shininess: 10
	});

	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.translateZ(0.47);
	cylinder.rotation.x = Math.PI /2;
	scene.add( cylinder );


	// the clock indicators
	// hours 
	var geometry = new THREE.BoxGeometry( 2.6, 0.25, 0.01 );
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation(1, 0, 0) );
	var material = new THREE.MeshPhongMaterial( {color: 0x000000, transparent:false} );

	clocks.hours = new THREE.Mesh( geometry, material );
	clocks.hours.translateZ(0.56);
	clocks.hours.rotation.z = getAngle(0,12);
	scene.add( clocks.hours );
	
	// minutes 
	var geometry = new THREE.BoxGeometry( 3.6, 0.15, 0.01 );
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation(1.4, 0, 0) );
	var material = new THREE.MeshPhongMaterial( {color: 0x000000,transparent:false} );

	clocks.minutes = new THREE.Mesh( geometry, material );
	clocks.minutes.translateZ(0.57);	
	clocks.minutes.rotation.z = getAngle(0,60);
	scene.add( clocks.minutes );

	// seconds
	var geometry = new THREE.BoxGeometry( 3.0, 0.1, 0.01 );
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation(1.2, 0, 0) );
	var material = new THREE.MeshPhongMaterial( {color: 0x440000, transparent:false} );

	clocks.seconds = new THREE.Mesh( geometry, material );
	clocks.seconds.translateZ(0.58);
	clocks.seconds.rotation.z = getAngle(0,60);	
	scene.add( clocks.seconds );

	//appdend the ball to the end of the seconds
	var geometry = new THREE.CylinderGeometry( 0.15, 0.15, 0.01, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0x440000, transparent:false} );
	var Indicator = new THREE.Mesh( geometry, material );
	Indicator.rotation.x = Math.PI /2;
	Indicator.translateX(2.8);
	clocks.seconds.add( Indicator );


	//////////////////////////////////


	// adding text 
	var geometry    = new THREE.BoxGeometry( 2, 2, 0.01);
	var material    = new THREE.MeshBasicMaterial({
		map : dynamicTexture.texture,
		transparent: true
	})
	var mesh    = new THREE.Mesh( geometry, material );
	mesh.translateZ(0.55);	
	mesh.translateY(-2);
	scene.add( mesh );
	dynamicTexture.clear();

	// add the numbers 
	for( var i = 0; i< 12; i++){

		numbers.push( new THREEx.DynamicTexture(128,128) );

		var geometry    = new THREE.BoxGeometry( 1, 1, 0.01);
		var material    = new THREE.MeshBasicMaterial({
			map : numbers[i].texture,
			transparent: true
		})
		var mesh    = new THREE.Mesh( geometry, material );
		mesh.translateZ(0.55);	
		mesh.translateY( Math.sin( getAngle( i+1 , 12 )) * 3.5 );
		mesh.translateX( Math.cos( getAngle( i+1, 12 )) * 3.5 );		
		// mesh.translateY(1 );
		// mesh.translateX(1 );		
		scene.add( mesh );

		numbers[i].clear('transparent');
		numbers[i].texture.needsUpdate = true;
		numbers[i].context.font	= "50px Helvetica Neue";
		numbers[i].context.textAling = "center";
		numbers[i].context.fillRect = "center";
		numbers[i].drawText(i+1, null, 80, '#111');
		

	}


	// draw all the ticks 
	for(var i=0; i<60; i++){
		
		// jump the multiples of 5
		if( i%5 == 0 ) continue;

		var geometry = new THREE.CircleGeometry( 0.03, 16, 2 );
		var material = new THREE.MeshBasicMaterial( {color: 0x333333, side: THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.translateZ(0.55);	
		mesh.translateY( Math.sin( getAngle( i , 60 )) * 3.5 );
		mesh.translateX( Math.cos( getAngle( i, 60 )) * 3.5 );		
		mesh.rotation.z = - 2 * Math.PI * i / 60;  
		scene.add( mesh );
	}

	
	// let's add the controls to the camera
	controls = new THREE.OrbitControls( camera );	
	
	// start! 
	startTiming( 1000 );
	// effectively render it 
	render();
}

//////////////////////////////////////////////////
/* end of config */


var old = {};
var changes = {};
var config = {
	seconds:60,
	minutes: 60,
	hours: 12
};

var rotation = {};
var tweens = [];

//console.log(TWEEN.Easing);
function startTiming( duration ){

	var ease = (typeof duration != 'undefined' ) ? TWEEN.Easing.Cubic.InOut : TWEEN.Easing.Elastic.Out;
	
	var duration = (typeof duration != 'undefined' ) ? duration : 300;
	var date = new Date();
	var now = {
		seconds:  date.getSeconds(),
		minutes: date.getMinutes(),
		hours: date.getHours() % 12
	};

	for( p in now ){

		// check the properties and set the updated values
		changes[p] = ( now[p] != old[p] ) ? ( now[p] == 0 ) ? config[p] : now[p] : false;
		old[p] = now[p];
		

		// update the tickers rotation accordingly to the values
		if( changes[p] !== false){

			( function(p){
				
				var rotation = { z: clocks[p].rotation.z },
					target = { z:  getAngle( changes[p], config[p]) };
								

				var tw = new TWEEN.Tween(rotation)
					.to(target, duration)
					.easing( ease  )
					.onUpdate( function(){ 						
						
						clocks[p].rotation.z = rotation.z;

					}).onComplete( function(){

						if( changes[p] === config[p] ){
							
							clocks[p].rotation.z = getAngle( 0 , config[p] );
						}

					})
					.start();
			})(p);
		}
	}

	// recall self every second
	setTimeout( startTiming, 998 );
}

function getAngle( value, divisor ){
	
	return Math.PI / 2 - ( value ) / divisor * 2 * Math.PI;
}


function render() {
	requestAnimationFrame( render );	
	
	if( _DEV_MODE ){
		stats.begin();
	}
	
	TWEEN.update();

	frames++;							
	renderer.render( scene, camera );

	if( _DEV_MODE ){
    	stats.end();
    }

}

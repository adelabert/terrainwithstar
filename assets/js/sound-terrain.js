var date = new Date();
var pn = new Perlin('rnd' + date.getTime());
var camera, scene, renderer, stars = [], floor = [];

var object, light;
var glitchPass, composer;

var context;
var source, sourceJs;
var analyser;
var buffer;
var url = 'assets/misc/ForgetEveryone.mp3';
var array = new Array();

function app(){
	if ( ! Detector.webgl ) {
		Detector.addGetWebGLMessage();
	}
	try {
	    if(typeof webkitAudioContext === 'function') { 
	    	// webkit-based
	    	context = new webkitAudioContext();
	    }else { 
	    	// other browsers that support AudioContext
	    	context = new AudioContext();
	    }
	}catch(e) {
    	// Web Audio API is not supported in this browser
    	alert("Web Audio API is not supported in this browser");
	}
	sound();
	init();
	animate();

}

function init(){
	// CAMERA
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = 5;

    // SCENE
    scene = new THREE.Scene();

	// RENDERER
	renderer = new THREE.WebGLRenderer();

    //set the size of the renderer
    renderer.setSize( window.innerWidth, window.innerHeight );

	//add the renderer to the html document body
	document.body.appendChild( renderer.domElement );

	// EVENT HANDLE
	window.addEventListener( 'resize', onWindowResize, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	// ACTUALLY ADD
	createScene();
}
/* ======================[ LOAD ]========================== */
function sound(){
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = "arraybuffer";

	request.onload = function(){
		context.decodeAudioData(
			request.response,
			function(buffer){
				if(!buffer){
                // Error decoding file data

                return;
            }

            sourceJs = context.createScriptProcessor(2048, 1, 1);
            sourceJs.buffer = buffer;
            sourceJs.connect(context.destination);
            analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.6;
            analyser.fftSize = 512;

            source = context.createBufferSource();
            source.buffer = buffer;

            source.connect(analyser);
            analyser.connect(sourceJs);
            source.connect(context.destination);

            sourceJs.onaudioprocess = function(e){
            	array = new Uint8Array(analyser.frequencyBinCount);
            	analyser.getByteFrequencyData(array);
            };

            source.start(0);
            
        },function(error) {
            // Decoding error
            
        });
	};
	request.send();
}
/* ======================[ ON EVENT ]========================== */
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );
	
}
function onDocumentMouseDown( event ) {
	event.preventDefault();
	glitchPass.renderToScreen = true;
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	glitchPass.renderToScreen = false;
}
/* =======================[ ON ANIM ]========================= */
function animate( time ){
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	animateStars();
	animateTerrain();
	animateGlitch();
	composer.render();
}

function animateStars(){
	// loop through each star
	for(var i=0; i<stars.length; i++) {

		star = stars[i];

		// move it forward by a 10th of its array position each time
		star.position.z += i/10;

		if(typeof array === 'object' && array.length > 0) {
			var k = 0;
			var scale = (array[k]) / 30;
			// star.position.y = (scale < 1 ? 1 : scale) * 10;
			var size_scale = (scale < 1 ? 1 : scale);
			star.scale.set(size_scale ,size_scale ,size_scale);
			k += (k < array.length ? 1 : 0);


		}

		// once the star is too close, reset its z position
		if(star.position.z>1000) star.position.z-=2000;
	}
}

function animateGlitch(){
	if(typeof array === 'object' && array.length > 0) {
		var k = 0;
		var scale = (array[k]) / 30;
		k += (k < array.length ? 1 : 0);

		if(scale > 8 && scale <8.6){
			glitchPass.renderToScreen = true;
		}else{
			glitchPass.renderToScreen = false;
		}

	}
}
function animateTerrain(){
	// if(typeof array === 'object' && array.length > 0) {
	// 	var k = 0;
	// 	for(var i = 0; i < floor.length; i++) {
	// 		// console.log(floor[i].geometry.length);
	// 		for(var j = 0; j < floor[i].geometry.vertices.length; j++) {
				
	// 			var scale = (array[k]) / 30;
	// 			// floor[i].geometry.vertices[j].z = (scale < 1 ? 1 : scale);
	// 			k += (k < array.length ? 1 : 0);
				
	// 		}
	// 	}
	// }
	for(var i=0; i<floor.length; i++) {
		ground = floor[i];

		// move it forward by a 10th of its array position each time
		ground.position.z +=  1.0;

		// if(typeof array === 'object' && array.length > 0) {
		// 	var k = 0;
		// 	var scale = (array[k]) / 30;
		// 	ground.position.y = -(scale < 1 ? 1 : scale);
		// 	k += (k < array.length ? 1 : 0);

		// }
		// once the star is too close, reset its z position
		if(ground.position.z>400) ground.position.z-=1600;

	}
}

/* ========================[ CONTROLLER ]======================== */
function createScene(){
	addSphere();
	addGround();
	addLight();

	// postprocessing
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );
	glitchPass = new THREE.GlitchPass();
	glitchPass.goWild = true;
	glitchPass.renderToScreen = false;
	composer.addPass( glitchPass );
}
/* =======================[ OBJECTS ]========================= */
function addSphere(){
    // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position.
    for ( var z= -1000; z < 1000; z+=20 ) {

		// Make a sphere (exactly the same as before).
		var geometry  = new THREE.SphereGeometry(0.5, 5, 5)
		var material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			wireframe: true,
		});
		var sphere = new THREE.Mesh(geometry, material)

		// This time we give the sphere random x and y positions between -500 and 500
		sphere.position.x = Math.random() * 1000 - 500;
		sphere.position.y = Math.random() * 1000 - 500;

		// Then set the z position to where it is in the loop (distance of camera)
		sphere.position.z = z;

		// scale it up a bit
		sphere.scale.x = sphere.scale.y = 2;

		//add the sphere to the scene
		scene.add(sphere);

		//finally push it to the stars array
		stars.push(sphere);
	}
}
function addGround(){
 	for ( var z= -1600; z < 1600; z+=800 ) {
		// create the ground material
		var groundMat = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			side: THREE.DoubleSide,
			wireframe: true,
		});

	    // create the plane geometry
	    var geometry = new THREE.PlaneGeometry(240, 800, 300, 300);
	    geometry.dynamic = true;
	    // create the ground form the geometry and material
	    var ground = new THREE.Mesh(geometry,groundMat);
		ground.position.y = -1.9; //lower it
		ground.doubleSided = true;

		// make the terrain bumpy
		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
			var vertex = geometry.vertices[i];
			var value = pn.noise(vertex.x / 10, vertex.y /10, 0);
			// vertex.z = value * 10;
			vertex.z = value * 10;
		}
		var ground = new THREE.Mesh(geometry, groundMat);
		ground.rotation.x = -Math.PI / -2;

		// Then set the z position to where it is in the loop (distance of camera)
        ground.position.z = z;
        ground.position.y -=4;

		// ensure light is computed correctly 
		geometry.computeFaceNormals(); 
		geometry.computeVertexNormals();

	    // add the ground to the scene
	    scene.add(ground);

	    // finally push it to the stars array
	    floor.push(ground);

	    

	}
	var groundMat_2 = new THREE.MeshLambertMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
	});
	var geometry_2 = new THREE.PlaneGeometry(240, 800, 300, 300);
	var ground_2 = new THREE.Mesh(geometry_2,groundMat_2);
		ground_2.doubleSided = true;
		ground_2.rotation.x = -Math.PI / -2;
		ground_2.position.y = -20; //lower it
		
		scene.add(ground_2);
}

function addLight(){
	// use directional light
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9);
	// set the position
 	directionalLight.position.set(10, 2, 20);
	// enable shadow
	directionalLight.castShadow = true;
	// enable camera
	directionalLight.shadowCameraVisible = true;

	// add light to the scene
	scene.add( directionalLight );
}
var camera, scene, renderer, controls, stats;

var object, light;
var glitchPass, composer;

function app() {

	if ( ! Detector.webgl ) {

		Detector.addGetWebGLMessage();

	}

	init();
	animate();

}

function init() {

	renderer = new THREE.WebGLRenderer( {
		antialias: true,
		alpha: true
	} );	

	renderer.setClearColor( 0x000000, 0.0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

	camera = new THREE.PerspectiveCamera( 45.0, window.innerWidth / window.innerHeight, 100, 800.0 );
	camera.position.z = 180.0;

	scene.add( new THREE.AmbientLight( 0x444444 ) );

	var light1 = new THREE.DirectionalLight( 0x999999, 0.1 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0x999999, 1.5 );
	light2.position.set( 0, -1, 0 );
	scene.add( light2 );

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 100.0;
	controls.maxDistance = 800.0;
	controls.dynamicDampingFactor = 0.1;

	// stat
	stats = new Stats();
	document.body.appendChild( stats.dom );

	// axis bar
	var axes = new THREE.AxisHelper(100);
	scene.add( axes );

	// EVENT HANDLE
	window.addEventListener( 'resize', onWindowResize, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );


	// ACTUALLY ADD
	createScene();

}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	glitchPass.renderToScreen = true;
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	glitchPass.renderToScreen = false;
}

function createGeometry() {
	var geometry = new THREE.SphereGeometry( 20, 20, 20 );
	var buffer_material = new THREE.MeshPhongMaterial( {
		color: 0x76c13a,
		specular: 0x333333,
		shininess: 5,
		vertexColors: THREE.NoColors,
		shading: THREE.SmoothShading,
	} );

	var sphere = new THREE.Mesh( geometry, buffer_material );
	sphere.position.set( 0, 0, 0 );	
	scene.add( sphere );
	
}

function createScene() {
	createGeometry();

	// postprocessing
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );
	glitchPass = new THREE.GlitchPass();
	glitchPass.goWild = true;
	glitchPass.renderToScreen = false;
	composer.addPass( glitchPass );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );
}

function animate( time ) {
	requestAnimationFrame( animate );
	controls.update();
	stats.update();
	renderer.render( scene, camera );
	composer.render();

}
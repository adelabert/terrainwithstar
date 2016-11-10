var camera, scene, renderer, controls, stats, 
	group, chocco_group, mouse, raycaster, projector;

var INTERSECTED, SELECTED;
var offset = new THREE.Vector3(),
	intersection = new THREE.Vector3();
var rays_obj = [];

var mouseZoomDelta = 0, overRenderer;
var panUp_trigger = document.getElementsByClassName("panup");
var panDown_trigger = document.getElementsByClassName("pandown");

function app() {
	if ( ! Detector.webgl ) {
		Detector.addGetWebGLMessage();
	}
	init();
	animate();
}

function init() {
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer( {
		antialias: true,
		alpha: true
	} );

	// GROUP
	group = new THREE.Object3D();
	chocco_group = new THREE.Object3D();

	// RENDER PROP
	renderer.setClearColor( 0xffffff, 1 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	// ADD SCENE
	scene = new THREE.Scene();
	// scene.background = texture;
	scene.background = new THREE.CubeTextureLoader()
					.setPath( 'assets/images/texture/pisa/' )
					.load( [ 'test.jpg', 'test.jpg', 'test.jpg', 'test.jpg', 'test.jpg', 'test.jpg' ] );
	// fog + depth
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.001 );

	camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 1, 800.0 );
	camera.position.z = 400.0;

	scene.add( new THREE.AmbientLight( 0x444444 ) );

	var light1 = new THREE.DirectionalLight( 0x999999, 0.1 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, 1, 0 );
	scene.add( light2 );

	// CRTL PROP
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.dampingFactor = 0.03;
	controls.enableZoom = true;
	controls.minPolarAngle = 1.5;
	controls.maxPolarAngle = 1.5;
	controls.minDistance = 100.0;
	controls.maxDistance = 600.0;
	controls.keys = { LEFT: null, UP: 38, RIGHT: null, BOTTOM: 40 };
	
	// BG
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
	var skyMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );	
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	skyBox.position.x = 0;
	skyBox.position.y = 0;
	skyBox.position.z = 0;

	// axis bar
	var axes = new THREE.AxisHelper(100);
	scene.add( axes );

	// stat
	stats = new Stats();
	document.body.appendChild( stats.dom );

	// EVENT HANDLE
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'mousemove', onMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	// window.addEventListener('DOMMouseScroll', onMouseWheel, false);
	// window.addEventListener('mousewheel', onMouseWheel, false);
	

	// ACTUALLY ADD
    scene.add(group);
    scene.add(chocco_group);
    scene.add( skyBox );

    createBase();
    createCone();
	createScene();

}


function createGeometry() {
	var geometry = new THREE.SphereGeometry( 4, 15, 15 );
	return geometry;
}

function createCone(){
	var materials = new THREE.MeshPhongMaterial( { color: 0x6b6b6b } );
	var cone = new THREE.Mesh(new THREE.CylinderGeometry(2, 100, 250, 30, 1, false), materials);

	cone.position.y = 0;
    group.add(cone);
}
function createBase(){
	var materials = new THREE.MeshPhongMaterial( { color: 0x6b6b6b } );
	var base = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 30, 30, 1, false), materials);

	base.position.y = -128;
    group.add(base);
}

function createScene() {
	var buffer_geometry = new THREE.BufferGeometry();
	var geometry = new THREE.SphereGeometry( 4, 15, 15 );
	var gold_texture = new THREE.ImageUtils.loadTexture( "assets/images/texture/gold.jpg" );
	var buffer_material;
	
	var radius = 300.0;
	var positions = 0;
	var normals = 0;
	var colors = 0;
	var shape_rows = 44;
	var sum = 0;
	var count = 1;

	for ( var num_lat = 0; num_lat <= shape_rows; num_lat++) {

		var lat_lhs = ( num_lat + 0 ) * 180 / ( shape_rows / 2 );
		var lat_rhs = ( num_lat + 1 ) * 180 / ( shape_rows / 2 );
		var lat = ( lat_lhs + lat_rhs ) / shape_rows;

		var item = num_lat + (num_lat+1);
		var testitem = parseInt(num_lat * ((radius*Math.PI) / 360.0));
		var area = parseInt(360 / item);
		sum += item;
		
		for ( var num_lng = 1; num_lng <= item; num_lng++ ) {

			var lng_lhs = ( num_lng + 0 ) * 360 / item ;
			var lng_rhs = ( num_lng + 1 ) * 360 / item ;
			var lng = ( lng_lhs + lng_rhs );
			
			var phi = lat * Math.PI / 360.0;
			var theta = lng * Math.PI / 360.0;

			var angle = (num_lat * ((Math.PI * radius) / 360.0));
			var x = angle * Math.cos( theta );
			var y = -radius * Math.sin( phi ) * 6 + (radius/2);
			var z = angle * Math.sin( theta );

			buffer_material = new THREE.MeshPhongMaterial( {
				color: 0xffffff,
				specular: 0x333333,
				shininess: 30,
				side: THREE.DoubleSide,
				vertexColors: THREE.NoColors,
				shading: THREE.SmoothShading,
				map: gold_texture
			} );
			if(count > 1000){
				// gold_texture = new THREE.ImageUtils.loadTexture( "assets/images/texture/silver.jpg" );
				
			}
			var chocco = new THREE.Mesh( geometry, buffer_material );
			chocco.position.set( x, y, z );	
			chocco.userData.item = count;
			chocco.userData.name = 'ferrero';
			chocco.userData.status = 'create';

			chocco_group.add( chocco );
			scene.add( chocco );
			rays_obj.push(chocco);
			count++;

		}

	}	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( rays_obj, true );
	if ( intersects.length > 0 ) {
		controls.enabled = false;
		SELECTED = intersects[ 0 ].object;
		console.log(SELECTED.userData);
		alert('select item: ' + SELECTED.userData.item);
	}

}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	
	controls.enabled = true;
	if ( INTERSECTED ) {
		SELECTED = null;
	}
	
}

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseWheel(event){
	event.preventDefault();
	var delta = 0;
	if (event.wheelDelta) { // WebKit / Opera / Explorer 9
		delta = event.wheelDelta / 8;
	} else if (event.detail) { // Firefox
		delta = -event.detail * 2;
	}
	if (overRenderer) {
		mouseZoomDelta += delta * camera.position.length() / 1200;
	}
	return false;
}

function animate( time ) {
	requestAnimationFrame( animate );
	render();
	controls.update();
	stats.update();
	
	
}

function render() {
	
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( rays_obj, true );

	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xffffff );
			document.body.style.cursor = "pointer";
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
		INTERSECTED = null;
		document.body.style.cursor = "default";
	}
	renderer.render( scene, camera );
}

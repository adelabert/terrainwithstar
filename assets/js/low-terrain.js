var camera, scene, renderer, controls, stats, mesh;



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

	camera = new THREE.PerspectiveCamera( 45.0, window.innerWidth / window.innerHeight, 100, 1500.0 );
	camera.position.z = 480.0;

	scene.add( new THREE.AmbientLight( 0x444444 ) );

	// var light1 = new THREE.DirectionalLight( 0x999999, 0.1 );
	// light1.position.set( 1, 1, 1 );
	// scene.add( light1 );

	// var light2 = new THREE.DirectionalLight( 0x999999, 1.5 );
	// light2.position.set( 0, -1, 0 );
	// scene.add( light2 );

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 100.0;
	controls.maxDistance = 1500.0;
	controls.dynamicDampingFactor = 0.1;

	// stat
	stats = new Stats();
	document.body.appendChild( stats.dom );

	// axis bar
	var axes = new THREE.AxisHelper(100);
	scene.add( axes );

	// EVENT HANDLE
	window.addEventListener( 'resize', onWindowResize, false );


	// ACTUALLY ADD
	createScene();

}


function createGeometry() {
	var data = generateHeight( 1024, 1024 );
	var texture = new THREE.CanvasTexture( generateTexture( data, 1024, 1024 ) );

	// var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	var material = new THREE.MeshBasicMaterial( { color: 0x76c13a, shading: THREE.FlatShading } );
	var quality = 16, step = 1024 / quality;
	var geometry = new THREE.PlaneGeometry( 2000, 2000, quality - 1, quality - 1 );
	// geometry.computeFaceNormals();
	geometry.rotateX( - Math.PI / 2 );

	console.log(geometry.vertices.length);
	for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
		var x = i % quality, y = Math.floor( i / quality );
		geometry.vertices[ i ].y = data[ ( x * step ) + ( y * step ) * (1024) ] * 2 - 128;
		

	}
	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	
}

function createScene() {
	createGeometry();

}

function generateHeight( width, height ) {
	var data = new Uint8Array( width * height ), perlin = new ImprovedNoise(),
	size = width * height, quality = 2, z = Math.random() * 100;
	for ( var j = 0; j < 4; j ++ ) {
		quality *= 4;
		for ( var i = 0; i < size; i ++ ) {
			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * 0.5 ) * quality + 10;
		}
	}
	return data;
}
function generateTexture( data, width, height ) {
	var canvas, context, image, imageData,
	level, diff, vector3, sun, shade;
	vector3 = new THREE.Vector3( 0, 0, 0 );
	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();
	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;
	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );
	image = context.getImageData( 0, 0, width, height );
	imageData = image.data;
	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++  ) {
		vector3.x = data[ j - 1 ] - data[ j + 1 ];
		vector3.y = 2;
		vector3.z = data[ j - width ] - data[ j + width ];
		vector3.normalize();
		shade = vector3.dot( sun );
		imageData[ i ] = ( 96 + shade * 128 ) * ( data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( data[ j ] * 0.007 );
	}
	context.putImageData( image, 0, 0 );
	return canvas;
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	
}

function animate( time ) {
	requestAnimationFrame( animate );
	controls.update();
	stats.update();
	renderer.render( scene, camera );
	

}
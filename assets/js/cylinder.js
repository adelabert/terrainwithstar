var camera, scene, renderer, controls, stats, group, mouse, raycaster, buffer_mesh, is_clicked = false, projector;

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

	renderer.setClearColor( 0xffffff, 1 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	// scene.background = new THREE.Color( 0xffffff );
	camera = new THREE.PerspectiveCamera( 45.0, window.innerWidth / window.innerHeight, 100, 1500.0 );
	camera.position.z = 480.0;

	scene.add( new THREE.AmbientLight( 0x444444 ) );

	var light1 = new THREE.DirectionalLight( 0x999999, 0.1 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, 1, 0 );
	scene.add( light2 );

	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 0;
	controls.maxDistance = 1000.0;
	controls.dynamicDampingFactor = 0.1;

	stats = new Stats();
	document.body.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'mousemove', onMouseMove, false );
	



	group = new THREE.Object3D();
    scene.add(group);

    createCone();
	createScene();


}
function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		

}


function createGeometry() {
	var geometry = new THREE.SphereGeometry( 4, 15, 15 );
	return geometry;
}
function createCone(){
	var materials = new THREE.MeshPhongMaterial( { color: 0x6b6b6b, ambient: 0xffffff } );
	var trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 120, 200, 30, 1, false), materials);

	trunk.position.y = -130 + 150;
    group.add(trunk);
}

function createScene() {
	var buffer_geometry = new THREE.BufferGeometry();
	
	var radius = 300.0;
	var positions = 0;
	var normals = 0;
	var colors = 0;
	var shape_rows = 44;
	var sum = 0;

	for ( var num_lat = 0; num_lat <= shape_rows; num_lat++) {

		var lat_lhs = ( num_lat + 0 ) * 180 / ( shape_rows / 2 );
		var lat_rhs = ( num_lat + 1 ) * 180 / ( shape_rows / 2 );
		var lat = ( lat_lhs + lat_rhs ) / shape_rows;

		var item = num_lat + (num_lat+1);
		var testitem = parseInt(num_lat * ((radius*Math.PI) / 360.0));
		var area = parseInt(360 / item);
		sum += item;
		
		for ( var num_lng = 0; num_lng <= item; num_lng++ ) {
			var lng_lhs = ( num_lng + 0 ) * 360 / item ;
			var lng_rhs = ( num_lng + 1 ) * 360 / item ;
			var lng = ( lng_lhs + lng_rhs );
			


			var phi = lat * Math.PI / 360.0;
			var theta = lng * Math.PI / 360.0;

			var angle = (num_lat * ((Math.PI * radius) / 360.0));
			var x = angle * Math.cos( theta );
			var y = -radius * Math.sin( phi ) * 5;
			var z = angle * Math.sin( theta ) ;


			var geometry = createGeometry();

			// geometry.translate( 0, 0, 0 );
			// geometry.rotateX(45);
			geometry.lookAt( new THREE.Vector3( - x , - y, - z ) );
			geometry.translate( x, y, z );	


			var color = new THREE.Color( 0xffffff );
			// color.setHSL( lat / 255.0, 1.0, 0.7 );

			if ( positions === 0 ) {
				var num_stacks = shape_rows * shape_rows * 2 ;

				positions = new Float32Array( num_stacks * geometry.faces.length * 3 * 3 );
				normals = new Float32Array( num_stacks * geometry.faces.length * 3 * 3 );
				// colors = new Float32Array( num_stacks * geometry.faces.length * 3 * 3 );

			}
			
			geometry.faces.forEach( function ( face, index ) {
				
				var cur_element = ( ( num_lng + num_lat * (shape_rows * 2)) * geometry.faces.length + index );

				positions[ cur_element * 9 + 0 ] = geometry.vertices[ face.a ].x;
				positions[ cur_element * 9 + 1 ] = geometry.vertices[ face.a ].y;
				positions[ cur_element * 9 + 2 ] = geometry.vertices[ face.a ].z;
				positions[ cur_element * 9 + 3 ] = geometry.vertices[ face.b ].x;
				positions[ cur_element * 9 + 4 ] = geometry.vertices[ face.b ].y;
				positions[ cur_element * 9 + 5 ] = geometry.vertices[ face.b ].z;
				positions[ cur_element * 9 + 6 ] = geometry.vertices[ face.c ].x;
				positions[ cur_element * 9 + 7 ] = geometry.vertices[ face.c ].y;
				positions[ cur_element * 9 + 8 ] = geometry.vertices[ face.c ].z;
				

				normals[ cur_element * 9 + 0 ] = face.normal.x;
				normals[ cur_element * 9 + 1 ] = face.normal.y;
				normals[ cur_element * 9 + 2 ] = face.normal.z;
				normals[ cur_element * 9 + 3 ] = face.normal.x;
				normals[ cur_element * 9 + 4 ] = face.normal.y;
				normals[ cur_element * 9 + 5 ] = face.normal.z;
				normals[ cur_element * 9 + 6 ] = face.normal.x;
				normals[ cur_element * 9 + 7 ] = face.normal.y;
				normals[ cur_element * 9 + 8 ] = face.normal.z;

				// colors[ cur_element * 9 + 0 ] = color.r;
				// colors[ cur_element * 9 + 1 ] = color.g;
				// colors[ cur_element * 9 + 2 ] = color.b;
				// colors[ cur_element * 9 + 3 ] = color.r;
				// colors[ cur_element * 9 + 4 ] = color.g;
				// colors[ cur_element * 9 + 5 ] = color.b;
				// colors[ cur_element * 9 + 6 ] = color.r;
				// colors[ cur_element * 9 + 7 ] = color.g;
				// colors[ cur_element * 9 + 8 ] = color.b;


			} );

		}

	}

	buffer_geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	buffer_geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	// buffer_geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

	buffer_geometry.computeBoundingSphere();

	var gold_texture = new THREE.ImageUtils.loadTexture( "assets/images/texture/gold.jpg" );
	var buffer_material = new THREE.MeshPhongMaterial( {
		color: 0xffffff,
		specular: 0x333333,
		shininess: 30,
		side: THREE.DoubleSide,
		// vertexColors: THREE.VertexColors,
		vertexColors: THREE.NoColors,
		// shading: THREE.FlatShading,
		shading: THREE.SmoothShading,
		map: gold_texture
	} );




	buffer_mesh = new THREE.Mesh( buffer_geometry, buffer_material );
	buffer_mesh.position.y = 150;
	scene.add( buffer_mesh );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate( time ) {
	raycaster.setFromCamera( mouse, camera );	

	var intersects = raycaster.intersectObject( buffer_mesh );

	
	if ( intersects.length > 0 ) {
		var intersect = intersects[ 0 ];
		var face = intersect.face;
		
		var meshPosition = buffer_mesh.geometry.attributes.position;

		buffer_mesh.updateMatrix();
		console.log(meshPosition);
		// line.visible = true;
	} else {
		// line.visible = false;
	}

	requestAnimationFrame( animate );
	controls.update();
	stats.update();
	renderer.render( scene, camera );

}


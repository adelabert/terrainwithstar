var date = new Date();
var pn = new Perlin('rnd' + date.getTime());

var camera, scene, renderer;

function app(){
	if ( ! Detector.webgl ) {
		Detector.addGetWebGLMessage();
	}

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

	// ACTUALLY ADD
	createScene();
}
/* ======================[ ON EVENT ]========================== */
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	
}
/* =======================[ ON ANIM ]========================= */
function animate( time ){
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}

/* ========================[ CONTROLLER ]======================== */
function createScene(){
	addGround();
}
/* =======================[ OBJECTS ]========================= */

function addGround(){
 
	//create the ground material
	var groundMat = new THREE.MeshBasicMaterial( {color: 0xffff00 }  );

    //create the plane geometry
    var geometry = new THREE.PlaneGeometry(120, 100, 100, 100);

    //create the ground form the geometry and material
    var ground = new THREE.Mesh(geometry,groundMat);
	ground.position.y = -1.9; //lower it
	ground.rotation.x = -Math.PI/2;
	ground.doubleSided = true;

	//make the terrain bumpy
	for (var i = 0, l = geometry.vertices.length; i < l; i++) {
		var vertex = geometry.vertices[i];
		var value = pn.noise(vertex.x / 10, vertex.y /10, 0);
		vertex.z = value * 10;
	}
    //add the ground to the scene
    scene.add(ground);

}

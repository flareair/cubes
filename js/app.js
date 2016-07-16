(function() {


'use strict';

let container;
let camera, controls, scene, renderer;
let clickable = [];

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

init();
animate();

// init view
function init() {


    // append container to dom

    container = document.createElement( 'div' );

    document.body.appendChild(container);

    // camera settings
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = 400;

    // trackball settings
    controls = new THREE.TrackballControls( camera );
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    scene = new THREE.Scene();


    // lights
    scene.add(new THREE.AmbientLight(0x505050));

    let light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 500, 2000);

    scene.add(light);


    // pupulate meshes
    populateBoxes();


    // renderer settings
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // append canvas
    container.appendChild( renderer.domElement );

    // make box with coordinates x, y, z
    function makeBox(x = 0, y = 0, z = 0) {

        // create basic wireframe box
        let cubeGeometry = new THREE.BoxGeometry( 40, 40, 40 );
        let cube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
            color: 'black',
            wireframe: true
        }));

        // init group and add box where, cube be always at 0 index
        let group = new THREE.Object3D();
        group.add(cube);


        // spheres geometry
        let sphereGeometry = new THREE.SphereGeometry(3, 32, 32);


        // iterate cube vertices
        cubeGeometry.vertices.forEach((vertice) => {

            // make sphere mesh with random color
            let sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff}));

            // move sphere to vertice
            sphere.position.x = vertice.x;
            sphere.position.y = vertice.y;
            sphere.position.z = vertice.z;


            group.add(sphere);
            clickable.push(sphere);

        });

        // set position
        group.position.set(x, y, z);

        // randomize rotation
        group.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);

        return group;
    }

    // populate 100 boxes
    function populateBoxes() {
        for (let i = -500; i < 500; i += 100) {
            for (let j = -500; j < 500; j += 100) {
                let box = makeBox(i, j, Math.random() * 500 - 250);
                scene.add(box);
            }
        }
    }

    // on mouse click
    function onDocumentMouseDown( event ) {

        event.preventDefault();

        // calculate mouse position
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        let intersects = raycaster.intersectObjects(clickable);


        // if intersects present take first
        if ( intersects.length > 0 ) {
            // get cube from parent froup, it always first!
            let parentCube = intersects[0].object.parent.children[0];
            // take clicked sphere color
            let sphereColor = intersects[0].object.material.color;

            // set color
            parentCube.material.color.set(sphereColor);

        }

    }

    // recalculate camero on window resize
    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize( window.innerWidth, window.innerHeight );

    }

    // event listeners
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    window.addEventListener( 'resize', onWindowResize, false );

}

// animate
function animate() {

  requestAnimationFrame(animate);

  render();

}


// render scene
function render() {

  controls.update();

  renderer.render(scene, camera);

}


})();
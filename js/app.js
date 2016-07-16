(function(THREE, window, document) {
'use strict';



class BoxScene {
    constructor(THREE) {
        this.three = THREE;

        this.raycaster = new this.three.Raycaster();
        this.mouse = new this.three.Vector2();

        this.clickable = [];

        this.container = {};
        this.camera = {};
        this.controls = {};
        this.scene = {};
        this.renderer = {};

        // animate function
        this.animate = () => {

            requestAnimationFrame(this.animate);
            this.render();
        };

    }
    init() {

        // camera settings
        this.camera = new this.three.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
        this.camera.position.z = 400;

        // trackball settings
        this.controls = new this.three.TrackballControls(this.camera);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        this.scene = new this.three.Scene();


        // lights
        this.scene.add(new this.three.AmbientLight(0x505050));

        let light = new this.three.SpotLight(0xffffff, 1.5);
        light.position.set(0, 500, 2000);

        this.scene.add(light);

        // renderer
        this.renderer = new this.three.WebGLRenderer({
            antialias: true
        });
        this.renderer.setClearColor(0xf0f0f0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.sortObjects = false;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.three.PCFShadowMap;

        // make container
        this.container = document.createElement('div');
        // append canvas
        this.container.appendChild(this.renderer.domElement);


        return this.container;
    }

    // make box
    makeBox(x = 0, y = 0, z = 0) {

        // create basic wireframe box
        let cubeGeometry = new this.three.BoxGeometry( 40, 40, 40 );
        let cube = new this.three.Mesh(cubeGeometry, new this.three.MeshBasicMaterial({
            color: 'black',
            wireframe: true
        }));

        // init group and add box where, cube be always at 0 index
        let group = new this.three.Object3D();
        group.add(cube);


        // spheres geometry
        let sphereGeometry = new this.three.SphereGeometry(3, 32, 32);


        // iterate cube vertices
        cubeGeometry.vertices.forEach((vertice) => {

            // make sphere mesh with random color
            let sphere = new this.three.Mesh(sphereGeometry, new this.three.MeshBasicMaterial( {color: Math.random() * 0xffffff}));

            // move sphere to vertice
            sphere.position.x = vertice.x;
            sphere.position.y = vertice.y;
            sphere.position.z = vertice.z;


            group.add(sphere);
            this.clickable.push(sphere);

        });

        // set position
        group.position.set(x, y, z);

        // randomize rotation
        group.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);

        return group;
    }

    // populate matrixWidth^2 boxes
    populateBoxes(width = 10) {

        if (!(Number(width) === width && width % 1 === 0 && width > 0)) {
            throw new Error('Wrong boxes matrix width parameter');
        }

        let step = 100;
        let bound = width / 2 * step;

        for (let i = -bound; i < bound; i += step) {
            for (let j = -bound; j < bound; j += step) {
                let box = this.makeBox(i, j, Math.random() * 500 - 250);
                this.scene.add(box);
            }
        }
    }

    // render scene
    render() {
        // console.log(this.animate)
        this.controls.update();

        this.renderer.render(this.scene, this.camera);

    }

    // on mouse click
    onDocumentMouseDown(event) {

        event.preventDefault();

        // calculate mouse position
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.clickable);


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
    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

}


let boxScene = new BoxScene(THREE);


try {
    let container = boxScene.init();


    document.body.appendChild(container);


    boxScene.populateBoxes(10);
    boxScene.animate();

    // event listeners
    document.addEventListener('mousedown', boxScene.onDocumentMouseDown.bind(boxScene), false);
    window.addEventListener('resize', boxScene.onWindowResize.bind(boxScene), false);

} catch(err) {
    console.error(err);
}




})(THREE, window, document);
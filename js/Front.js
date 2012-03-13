/**
 * entry point to our procedurally generated terrain project..
 * A typical usage is
 * 	new Front(100, 100, 10).start();
 *
 * Author(s): Huascar A. Sanchez
 * Date: 3/11/12 - 10:52 PM
 */
var Front = function(worldWidth, worldDepth) {
	var ww = (worldWidth === undefined) ? WORLD_WIDTH : worldWidth;
	var wd = (worldDepth === undefined) ? WORLD_DEPTH : worldDepth;
	this.init(SCREEN_WIDTH, SCREEN_HEIGHT, ww, wd);
};

Front.prototype = {

	/**
	 * starts the terrain generation application.
	 * @param width
	 * @param height
	 * @param worldWidth
	 * @param worldDepth
	 */
	init: function(width, height, worldWidth, worldDepth){
		if(!Detector.webgl){
			Detector.addGetWebGLMessage();
			document.getElementById( 'container' ).innerHTML = "";
		}

		this.width 	= width;
		this.height = height;
		this.animDelta = 0;
		this.animDeltaDir = -1;
		this.lightVal = 0;
		this.lightDir = 1;
		this.updateNoise = true;



		this.loading 		= document.getElementById('loading');
		this.loading.hidden = true;

		this.clock 			= new THREE.Clock();
		this.worldWidth 	= worldWidth;
		this.worldDepth 	= worldDepth;
		this.worldHalfWidth = worldWidth / 2;
		this.worldHalfDepth = worldDepth / 2;

		this.container 	= document.getElementById( 'container' );

		// SCENE (RENDER TARGET)
		this.sceneRenderTarget = new THREE.Scene();
		this.cameraOrtho = new THREE.OrthographicCamera(
			this.width / - 2,
			this.width / 2,
			this.width / 2,
			this.width / - 2,
			-10000,
			10000
		);
		this.cameraOrtho.position.z = 100;
		this.sceneRenderTarget.add( this.cameraOrtho );

		this.scene 		= new THREE.Scene();
		this.scene.fog 	= new THREE.Fog( 0x050505, 2000, 4000 );
		this.scene.fog.color.setHSV( 0.102, 0.9, 0.825 );


		this.camera 	= new THREE.PerspectiveCamera(
			40,
			this.width / this.height,
			2,
			4000
		);

		this.scene.add( this.camera );
		this.camera.position.set( -1200, 800, 1200 );

		// CONTROLLER Setup
		this.controls 	= this._newController(this.camera);

		// LIGHTS
		this.scene.add( new THREE.AmbientLight( 0x111111 ) );
		this.spotLight = new THREE.SpotLight( 0xffffff, 1.15 );
		this.spotLight.position.set( 500, 2000, 0 );
		this.spotLight.castShadow = true;
		this.scene.add( this.spotLight );

		this.pointLight = new THREE.PointLight( 0xff4400, 1.5 );
		this.pointLight.position.set( 0, 0, 0 );
		this.scene.add( this.pointLight );

		// HEIGHT MAPS
		var rx = 256, ry = 256;
		var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

		this.heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
		this.normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

		// TEXTURES

		this.data		= this.rise(this.worldWidth, this.worldDepth);
		this.camera.position.y = this.data[ this.worldHalfWidth + this.worldHalfDepth * this.worldWidth ] * 10 + 500;

		var geometry = new THREE.PlaneGeometry( 7500, 7500, this.worldWidth - 1, this.worldDepth - 1 );

		for ( var idx = 0, length = geometry.vertices.length; idx < length; idx ++ ) {
			geometry.vertices[ idx ].position.z = this.data[ idx ] * 10;
		}

		this.texture = new THREE.Texture(
			this.skin( this.data, this.worldWidth, this.worldDepth ),
			new THREE.UVMapping(),
			THREE.ClampToEdgeWrapping,
			THREE.ClampToEdgeWrappin
		);

		this.texture.needsUpdate = true;

		this.mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: this.texture }));
		this.mesh.rotation.x = - 90 * Math.PI / 180;
		this.scene.add( this.mesh );

		// RENDERER

		this.renderer = this._newRenderer(this.width, this.height);

		this.container.innerHTML = "";
		this.container.appendChild( this.renderer.domElement );

		// STATS

		this.stats = this._newStats(this.container);

		// EVENTS
		this._setupEvents();

		// COMPOSER
		this.renderer.autoClear = false;

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, this.renderTargetParameters );

		this.effectBloom = new THREE.BloomPass( 0.6 );
		var effectBleach = new THREE.ShaderPass( THREE.ShaderExtras[ "bleachbypass" ] );

		this.hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalTiltShift" ] );
		this.vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalTiltShift" ] );

		var bluriness = 6;

		this.hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
		this.vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

		this.hblur.uniforms[ 'r' ].value = this.vblur.uniforms[ 'r' ].value = 0.5;

		effectBleach.uniforms[ 'opacity' ].value = 0.65;

		this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );

		var renderModel = new THREE.RenderPass( this.scene, this.camera );

		this.vblur.renderToScreen = true;

		this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );

		this.composer.addPass( renderModel );

		this.composer.addPass( this.effectBloom );

		this.composer.addPass( this.hblur );
		this.composer.addPass( this.vblur );

		// MORPHS
		var loader = new THREE.JSONLoader();
		var startX = -3000;

		// TODO... fix Cross origin requests are only supported for HTTP error
		// when loading the models.
//		loader.load( "models/Parrot.js", function( geometry ) {
//
//			Morphs.convertMorphColorsToFaceColors( geometry );
//			Morphs.addMorph( geometry, 250, 500, startX -500, 500, 700 );
//			Morphs.addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, -200 );
//			Morphs.addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, 200 );
//			Morphs.addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, 1000 );
//
//		} );

//		loader.load( "models/Flamingo.js", function( geometry ) {
//
//			Morphs.convertMorphColorsToFaceColors( geometry );
//			Morphs.addMorph( geometry, 500, 1000, startX - Math.random() * 500, 350, 40 );
//
//		} );
//
//		loader.load( "models/Stork.js", function( geometry ) {
//
//			Morphs.convertMorphColorsToFaceColors( geometry );
//			Morphs.addMorph( geometry, 350, 1000, startX - Math.random() * 500, 350, 340 );
//
//		} );

		// PRE-INIT

		this.renderer.initWebGLObjects( this.scene );

	},

	_setupEvents: function() {
		var self = this;
		var onWindowResized = function(event) {
			self.adjustSize( window.innerWidth, window.innerHeight - 2 * MARGIN);
		};

		var onKeyDown = function(event) {
			switch( event.keyCode ) {

				case 78: /*N*/  self.incrementLightDirection(); break;
				case 77: /*M*/  self.incrementAnimationDeltaDirection(); break;
				case 66: /*B*/  break;

			}
		};

		onWindowResized();
		window.addEventListener( 'resize', onWindowResized, false );
		document.addEventListener( 'keydown', onKeyDown, false );
	},

	incrementLightDirection: function() {
		this.lightDir *= -1;
	},

	incrementAnimationDeltaDirection: function() {
		this.animDeltaDir *= -1;
	},

	_newStats: function(container) {
		var stats = new Stats();
		stats.getDomElement().style.position = 'absolute';
		stats.getDomElement().style.top = '0px';
		container.appendChild( stats.getDomElement() );

		stats.getDomElement().children[ 0 ].children[ 0 ].style.color = "#aaa";
		stats.getDomElement().children[ 0 ].style.background = "transparent";
		stats.getDomElement().children[ 0 ].children[ 1 ].style.display = "none";

		return stats;
	},

	_newRenderer: function(width, height) {
		var renderer = new THREE.WebGLRenderer( { clearColor: 0xefd1b5, clearAlpha: 1 } );
		renderer.setSize( width, height);
		renderer.setClearColor( this.scene.fog.color, 1 );
		renderer.domElement.style.position = "absolute";
		renderer.domElement.style.top = MARGIN + "px";
		renderer.domElement.style.left = "0px";
		return renderer;
	},

	_newController: function(camera) {
		var controls = new THREE.FirstPersonControls( camera );
		controls.movementSpeed = 1000;
		controls.lookSpeed = 0.1;

		return controls;
	},

	adjustSize: function(newWidth, newHeight) {
		this.width = newWidth;
		this.height = newHeight;
		this.renderer.setSize( this.width, this.height );
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	},

	/**
	 * It generates height of the world.
	 *
	 * @param worldWidth world's width
	 * @param worldDepth world's height
	 */
	rise: function(worldWidth, worldDepth) {
		var size 	= worldWidth * worldDepth;
		var data 	= new Float32Array( size );
		var perlin 	= new PerlinNoise();
		var quality = 1;
		var z 		= Math.random() * 100;

		var i;
		var j;
		for ( i = 0; i < size; i ++ ) {
			data[ i ] = 0
		}

		for ( j = 0; j < 4; j ++ ) {
			for ( i = 0; i < size; i ++ ) {
				var x = i % worldWidth;
				var y = Math.floor( i / worldWidth );
				data[ i ] += Math.abs(perlin.noise(x / quality, y / quality, z, worldWidth) * quality * 1.75);
			}

			quality *= 5;

		}

		return data;
	},

	/**
	 * It generates a texture for the world.
	 * @param data elevated terrain
	 * @param width  world's width
	 * @param height world's height
	 */
	skin: function(data, width, height) {
		return new Textures(data, width, height, document).generate();
	},

	start: function() {
		this.animate();
	},

	animate: function() {
		var self = this;
		requestAnimationFrame(function(){self.animate();});
		this.render();
		this.updateStats();
	},

	updateStats: function() {
		this.stats.update();
	},

	/**
	 * It renders the world ...
	 */
	render: function() {
		var delta = this.clock.getDelta();
		this.controls.update(delta);
		var fLow = 0.4, fHigh = 0.825;
		this.lightVal = THREE.Math.clamp( this.lightVal + 0.5 * delta * this.lightDir, fLow, fHigh );
		var valNorm = ( this.lightVal - fLow ) / ( fHigh - fLow );
		var sat = THREE.Math.mapLinear( valNorm, 0, 1, 0.95, 0.25 );
		this.scene.fog.color.setHSV( 0.1, sat, this.lightVal );
		this.renderer.setClearColor( this.scene.fog.color, 1 );
		this.spotLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.1, 1.15 );
		this.pointLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.9, 1.5 );
		this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.heightMap, true );
		this.renderer.render( this.sceneRenderTarget, this.cameraOrtho, this.normalMap, true );
		this.composer.render( 0.1 );
	}
};




MARGIN 		  	= 100;
SCREEN_WIDTH  	= window.innerWidth;
SCREEN_HEIGHT 	= window.innerHeight - 2 * MARGIN;
WORLD_WIDTH   	= 256;
WORLD_DEPTH   	= 256;

/**
 * entry point to our procedurally generated terrain project..
 * A typical usage is
 * 	new Front(100, 100, 10).start();
 *
 * Author(s): huascarsanchez
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
		self = this;
		if(!Detector.webgl){
			Detector.addGetWebGLMessage();
			document.getElementById( 'container' ).innerHTML = "";
		}


		this.loading 		= document.getElementById('loading');
		this.loading.hidden = true;

		this.clock 			= new THREE.Clock();
		this.worldWidth 	= worldWidth;
		this.worldDepth 	= worldDepth;
		this.worldHalfWidth = worldWidth / 2;
		this.worldHalfDepth = worldDepth / 2;

		this.container 	= document.getElementById( 'container' );
		this.scene 		= new THREE.Scene();
		this.scene.fog 	= new THREE.FogExp2( 0xefd1b5, 0.00025 );

		this.camera 	= new THREE.PerspectiveCamera( 60, width / height, 1, 10000 );
		this.scene.add( this.camera );

		this.controls 	= new THREE.FirstPersonControls( this.camera );
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

		this.renderer = new THREE.WebGLRenderer( { clearColor: 0xefd1b5, clearAlpha: 1 } );
		this.renderer.setSize( width, height);
		this.container.innerHTML = "";
		this.container.appendChild( this.renderer.domElement );

		this.stats = new Stats();
		this.stats.getDomElement().style.position = 'absolute';
		this.stats.getDomElement().style.top = '0px';
		this.container.appendChild( this.stats.getDomElement() );
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
				data[ i ] += Math.abs(perlin.noise(x / quality, y / quality, z, worldWidth) * quality * 1.75);//Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
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
		var sun 	= new THREE.Vector3( 1, 1, 1 );
		sun.normalize();

		var vector3 = new THREE.Vector3( 0, 0, 0 );

		var canvas 	= document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;


		var context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, width, height );

		var image = context.getImageData( 0, 0, canvas.width, canvas.height );
		var imageData = image.data;

		var shade;
		var i;
		var j;
		var l;

		for ( i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = data[ j - 2 ] - data[ j + 2 ];
			vector3.y = 2;
			vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
			vector3.normalize();
			shade = vector3.dot( sun );

			var offset = 0.007;

			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * offset );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * offset );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * offset );
		}

		context.putImageData( image, 0, 0 );

		var canvasScaled;

		// Scaled 4x
		canvasScaled = document.createElement( 'canvas' );
		canvasScaled.width 	= width	 * 4;
		canvasScaled.height = height * 4;

		context = canvasScaled.getContext( '2d' );
		context.scale( 4, 4 );
		context.drawImage( canvas, 0, 0 );
		image 	  = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
		imageData = image.data;

		for ( i = 0, l = imageData.length; i < l; i += 4 ) {
			var v = Math.floor( Math.random() * 5 );
			imageData[ i ] += v;
			imageData[ i + 1 ] += v;
			imageData[ i + 2 ] += v;
		}

		context.putImageData( image, 0, 0 );
		return canvasScaled;
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
		this.controls.update( this.clock.getDelta() );
		this.renderer.render(this.scene, this.camera);
	}
};

MARGIN 		  = 100;
SCREEN_WIDTH  = window.innerWidth;
SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;
WORLD_WIDTH   = 256;
WORLD_DEPTH   = 256;
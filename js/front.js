/**
 * entry point to our procedurally generated terrain project..
 * A typical usage is
 * 	new Front(100, 100, 10).start();
 *
 * Author(s): huascarsanchez
 * Date: 3/11/12 - 10:52 PM
 */
Front = function(width, height, worldWidth, worldDepth) {
	this.init(width, height, worldWidth, worldDepth);
};

Front.prototype = {
	init: function(width, height, worldWidth, worldDepth){
		if(!Detector.webgl){
			Detector.addGetWebGLMessage();
			document.getElementById( 'container' ).innerHTML = "";
		}


		this.worldWidth 	= 256;
		this.worldDepth 	= 256;
		this.worldHalfWidth = worldWidth / 2;
		this.worldHalfDepth = worldDepth / 2;

		this.container 	= document.getElementById( 'container' );
		this.scene 		= new THREE.Scene();
		this.scene.fog 	= new THREE.FogExp2( 0xefd1b5, 0.0025 );
		this.camera 	= new THREE.PerspectiveCamera( 60, width / height, 1, 10000 );
		this.scene.add( camera );

		this.controls 	= new THREE.FirstPersonControls( camera );
		this.data		= this.generateHeight(this.worldWidth, this.worldDepth);

		this.camera.position.y = this.data[ this.worldHalfWidth + this.worldHalfDepth * this.worldWidth ] * 10 + 500;

		var geometry = new THREE.PlaneGeometry( 7500, 7500, this.worldWidth - 1, this.worldDepth - 1 );

		for ( var idx = 0, length = geometry.vertices.length; idx < length; idx ++ ) {
			geometry.vertices[ idx ].position.z = data[ idx ] * 10;
		}

		this.texture = new THREE.Texture( this.generateTexture( data, worldWidth, worldDepth ), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping );
		this.texture.needsUpdate = true;

	},

	generateHeight: function(worldWidth, worldDepth) {

	},

	generateTexture: function(data, width, height) {

	},

	start: function(){

	},

	simplexNoise: function(){

	},

	diamondSquare: function(){

	},

	hybrid: function(){

	}
};
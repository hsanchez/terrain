/**
 * It deals with textures to be applied to the world being
 * generated.
 *
 * @author Huascar A. Sanchez
 */

TextureHelper = function(data, width, height, document) {
	this.init(data, width, height, document);
};

TextureHelper.prototype = {
	init: function(data, width, height) {
		this.data  	= data;
		this.width 	= width;
		this.height	= height;
		this.document = document;
	},

	generate: function() {
		var sun 	= new THREE.Vector3( 1, 1, 1 );
		sun.normalize();

		var vector3 = new THREE.Vector3( 0, 0, 0 );

		var canvas 		= this.document.createElement( 'canvas' );
		canvas.width 	= this.width;
		canvas.height 	= this.height;


		var context = canvas.getContext( '2d' );
		context.fillStyle = '#000';
		context.fillRect( 0, 0, this.width, this.height );

		var image = context.getImageData( 0, 0, canvas.width, canvas.height );
		var imageData = image.data;

		var shade;
		var i;
		var j;
		var l;

		for ( i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {
			vector3.x = this.data[ j - 2 ] - this.data[ j + 2 ];
			vector3.y = 2;
			vector3.z = this.data[ j - this.width * 2 ] - this.data[ j + this.width * 2 ];
			vector3.normalize();
			shade = vector3.dot( sun );

			var offset = 0.007;

			imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + this.data[ j ] * offset );
			imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + this.data[ j ] * offset );
			imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + this.data[ j ] * offset );
		}

		context.putImageData( image, 0, 0 );

		var canvasScaled;

		// Scaled 4x
		canvasScaled = this.document.createElement( 'canvas' );
		canvasScaled.width 	= this.width	 * 4;
		canvasScaled.height = this.height * 4;

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
	}
};



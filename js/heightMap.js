/**
 * Height map generating strategies
 * @author Zhongpeng Lin
 */

function　perlinNoise(worldWidth, worldDepth){
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
			var x = i % worldWidth, y = Math.floor( i / worldWidth );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
		}

		quality *= 5;

	}

	return data;
};

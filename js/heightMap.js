/**
 * Height map generating strategies
 * @author Zhongpeng Lin
 */

function　perlinNoise(worldWidth, worldDepth){
	var size 	= worldWidth * worldDepth;
	var data 	= new Array();
	var perlin 	= new PerlinNoise();
	var quality = 1;
	var z 		= Math.random() * 100;

	var i;
	var j;
	for ( i = 0; i < worldWidth; i ++ ) {
		data[ i ] = new Float32Array( worldDepth);
		for( j = 0; j <worldDepth; j ++) {
			data[i][j] = 0;
		}
	}

	for ( j = 0; j < 4; j ++ ) {
		for(var x = 0; x < worldWidth; x++){
			for(var y = 0; y < worldDepth; y++){
				data[x][y] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
			}
		}
		quality *= 5;
	}
	return data;
};

function diamondSquare(width, depth) {
	var ds = new DiamondSquare(width > depth ? width : depth, 200);
	var data = ds.start(); 
	return data;
}

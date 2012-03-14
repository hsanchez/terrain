/**
 * Height map generating strategies
 * @author Zhongpeng Lin
 */

HeightMap = {
	perlinNoise: function(worldWidth, worldDepth) {
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
	},
	
	simplex: function(worldWidth, worldDepth) {
		var data 	= new Array();
		var simplex = new SimplexNoise();
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
					data[x][y] += Math.abs( simplex.noise3d( x / quality, y / quality, z ) * quality * 1.75 );
				}
			}
			quality *= 5;
		}
		return data;
	},

	diamondSquare: function(width, depth) {
		var ds = new DiamondSquare(width > depth ? width : depth, 200);
		var data = ds.start();
		return data;
	},

	multiDiamondSquare: function(width, depth) {
		var NUM = 4;
		var ds = new DiamondSquare(width > depth ? width : depth, 800);
		var terrains = new Array();
		for(var i = 0; i < NUM; i++) {
			terrains[i] = ds.start();
		}
		for(var i = 0; i < width; i++) {
			for(var j = 0; j < depth; j++) {
				for(k = 1; k < NUM; k++) {
					terrains[0][i][j] += terrains[k][i][j];
				}
			}
		}
		return terrains[0];
	},

	perlinDiamond: function(width, depth) {
		var terrain = HeightMap.perlinNoise(width, depth);
		var ds = new DiamondSquare(width > depth ? width : depth, 200);
		var data = ds.start();
		for(var i = 0; i < width; i++) {
			for(var j = 0; j < depth; j++) {
				terrain[i][j] += data[i][j];
			}
		}
		return terrain;
	}


};
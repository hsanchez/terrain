/**
 * followed the implementation -> http://mrl.nyu.edu/~perlin/noise/ of KEN PERLIN
 * to code this javascript file.
 *
 * @author Huascar A. Sanchez
 */

PerlinNoise = function() {
	this.init();
};

PerlinNoise.prototype = {
	/**
	 * initialize the Perlin Noise algorithm.
	 */
	init: function() {
		this.permutations = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,
			69,142,8,99,37,240,21,10, 23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,
			11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,
			166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,
			54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,
			164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
			207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,
			153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,
			246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
			14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
			236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

		for(var i = 0; i < 256; i++){
			this.permutations[256 + i] = this.permutations[i];
		}
	},

	/**
	 * computes the fade curves for each x, y, z value.
	 * @param axis either x, y, or z
	 */
	fade: function(axis) {
		return axis * axis * axis * (axis * (axis * 6 - 15) + 10);
	},

	/**
	 * A method of curve fitting using linear polynomials. It is a
	 * simple form of interpolation.
	 *
	 * @param t coordinate on the plane (e.g., x_i, y_j, z_p)
	 * @param a coordinate on the plane (e.g., x_i, y_j, z_p)
	 * @param b coordinate on the plane (e.g., x_i, y_j, z_p)
	 */
	lerp: function(t, a, b){
		return a + t * (b - a);
	},

	/**
	 *  convert LO 4 bits of hashcode into 12 gradient directions.
	 * @param hash computed hashcode.
	 * @param x coordinate on the plane.
	 * @param y coordinate on the plane.
	 * @param z coordinate on the plane.
	 */
	grad: function(hash, x, y, z) {
		var h = hash & 15; // convert lo 4 bits of hashcode
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	},

	/**
	 * Noise is determined at point (x,y,z) by computing a pseudo-random gradient at  each of the
	 * eight nearest vertices on the integer cubic lattice and then doing splined interpolation.
	 * @param x coordinate on the plane.
	 * @param y coordinate on the plane.
	 * @param z coordinate on the plane.
	 */
	noise : function(x, y, z) {
		var floorX = Math.floor(x);
		var floorY = Math.floor(y);
		var floorZ = Math.floor(z);

		var p = this.permutations;

		var X = floorX & 255,
			Y = floorY & 255,
			Z = floorZ & 255;

		x -= floorX;
		y -= floorY;
		z -= floorZ;

		var xMinusOne = x - 1;
		var yMinusOne = y - 1;
		var zMinusOne = z - 1;

		var u = this.fade(x);
		var v = this.fade(y);
		var w = this.fade(z);

		// hash coordindates of the 8 cube of X, Y, Z.
		var A  = p[X] 	+ Y;
		var AA = p[A] 	+ Z;
		var AB = p[A+1] + Z;
		var B  = p[X+1] + Y;
		var BA = p[B]	+ Z;
		var BB = p[B+1]	+ Z;


		// add blended results from 8 corners of cube.
		return this.lerp(
			w,
			this.lerp(
				v,
				this.lerp(
					u,
					this.grad(p[AA], x, y, z),
					this.grad(p[BA], xMinusOne, y, z)
				),
				this.lerp(
					u,
					this.grad(p[AB], x, yMinusOne, z),
					this.grad(p[BB], xMinusOne, yMinusOne, z)
				)
			),
			this.lerp(
				v,
				this.lerp(
					u,
					this.grad(p[AA + 1], x, y, zMinusOne),
					this.grad(p[BA + 1], xMinusOne, y, z - 1)
				),
				this.lerp(
					u,
					this.grad(p[AB + 1], x, yMinusOne, zMinusOne),
					this.grad(p[BB + 1], xMinusOne, yMinusOne, zMinusOne)
				)
			)
		);

	},

	marble: function(x, y, z) {
		return Math.cos(x + this.noise(x, y, z));
	},

	crinkled: function(x, y, z, w) {
		return 5 * this.turbulence(x, y, z, 1, w) * this.marble(x, y, z);
	},

	blotchy: function(x, y, z) {
		return this.noise(
			this.stripes(x + 2 * this.turbulence(x, y, z, 1),
				1.6
			),
			this.crinkled(x, y, z),
			z
		);
	},

	unknown: function (x, y, z) {
		return this.bumps(x, this.grain(x, y, z), this.blotchy(x, y, z));
	},

	grain: function(x, y, z) {
		var g = this.noise(x, y, z) * 20;
		var t = 0.5 + g * Math.sin(1.6 * 2 * Math.PI * x);
		return g - t;
	},

	stripes: function(x, y, z) {
		var t = 0.5 + 0.5 * Math.sin((y*z) * 2 * Math.PI * x);
		return t * t - 0.5;
	},

	bumps: function(x, y, z) {
		var t    = 0.5;
		var bump = this.noise(x * 50, y * 50, z * 20);
		return bump < .5 ? 0 : t;
	},

	turbulence: function(x, y, z, f, w/*w image width in pixels*/) {
		var t = - 0.5;
		for(; f <= w/12; f *= 2) {
			t += Math.abs(this.noise(x, y, z) / f);
		}

		return t;
	}
};
/**
 * Loads the appropriate morphs and then apply them to some geometry.
 * @author Huascar A. Sanchez
 */

Morphs = {
	addMorph: function(renderer, morphs, scene, geometry, speed, duration, x, y, z){
		var material = new THREE.MeshLambertMaterial( { color: 0xffaa55, morphTargets: true, vertexColors: THREE.FaceColors } );
		var meshAnim = new THREE.MorphAnimMesh( geometry, material );

		meshAnim.speed 		= speed;
		meshAnim.duration 	= duration;
		meshAnim.time 		= 600 * Math.random();

		meshAnim.position.set( x, y, z );
		meshAnim.rotation.y = Math.PI/2;

		meshAnim.castShadow 	= true;
		meshAnim.receiveShadow 	= false;

		scene.add( meshAnim );

		morphs.push( meshAnim );

		renderer.initWebGLObjects( scene );
	},

	convertMorphColorsToFaceColors: function(geometry) {
		if ( geometry.morphColors && geometry.morphColors.length ) {

			var colorMap = geometry.morphColors[ 0 ];

			for ( var i = 0; i < colorMap.colors.length; i ++ ) {
				geometry.faces[ i ].color = colorMap.colors[ i ];
			}

		}

	}
};

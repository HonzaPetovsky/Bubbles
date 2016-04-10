Bubbles.ShaderLib = {

	spherePanorama: {

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	},

	basicPanoObject: {

		vertexShader: [

			"varying vec2 vUv;",
			"uniform vec3 scale;",
			"uniform int distorted;",

			"void main() {",
				"vUv = uv;",
				"float rotation = 0.0;",

				"if (distorted == 0){",
					"vec3 alignedPosition = vec3(position.x * scale.x, position.y * scale.y, position.z * scale.z);",

					"vec2 rotatedPosition;",
		            "rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;",
		            "rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;",

		            "vec4 finalPosition;",
		            "finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
		            "finalPosition.xy += rotatedPosition;",
		            "finalPosition = projectionMatrix * finalPosition;",

					"gl_Position = finalPosition;",
				"}",
				"else {",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"}",

					
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",
			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"texel.a = texel.a * opacity;",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	},

	lensflare: {

		vertexShader: [

			"varying vec2 vUv;",
			"uniform vec3 scale;",
			"uniform int distorted;",

			"void main() {",
				"vUv = uv;",
				"float rotation = 0.0;",

				"if (distorted == 0){",
					"vec3 alignedPosition = vec3(position.x * scale.x, position.y * scale.y, position.z * scale.z);",

					"vec2 rotatedPosition;",
		            "rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;",
		            "rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;",

		            "vec4 finalPosition;",
		            "finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );",
		            "finalPosition.xy += rotatedPosition;",
		            "finalPosition = projectionMatrix * finalPosition;",

					"gl_Position = finalPosition;",
				"}",
				"else {",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
				"}",

					
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",
			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"texel.a = texel.a * opacity;",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	}
	
}
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

	video: {

		vertexShader: [

			"varying vec2 uvColor;",
			"varying vec2 uvAlpha;",
			"uniform int mask;",

			"void main() {",
				"uvColor = uv;",
				"uvAlpha = uv;",

				"float rotation = 0.0;",

				"if (mask != 0){",
					"uvColor.y = uvColor.y * 0.5 + 0.5;",
					"uvAlpha.y = uvAlpha.y * 0.5;",
				"}",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform sampler2D texture;",
			"varying vec2 uvColor;",
			"varying vec2 uvAlpha;",
			"uniform int mask;",

			"void main() {",
				"vec4 texel = texture2D( texture, uvColor );",
				"vec4 texelAlpha = texture2D ( texture, uvAlpha );",

				"if (mask != 0){",
					"texel.a = (texelAlpha.r + texelAlpha.g + texelAlpha.b)/3.0;",
				"}",

				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	}

}
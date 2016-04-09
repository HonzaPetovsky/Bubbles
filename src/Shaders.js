Bubbles.ShaderLib = {

	"spherePanorama": {

		uniforms: {
			"texture": { type: "t", value: null },
		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",
				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"

		].join( "\n" ),

		fragmentShader: [

			"uniform float opacity;",
			"uniform sampler2D texture;",
			"varying vec2 vUv;",

			"void main() {",
				"vec4 texel = texture2D( texture, vUv );",
				"gl_FragColor = texel;",
			"}"

		].join( "\n" )	
	}
	
}
var effectDiv, canvas, gl, buffer, vertex_shader, fragment_shader, currentProgram,
vertex_position, parameters = { start_time: new Date().getTime(), time: 0, screenWidth: 0, screenHeight: 0 };

init();
loop();
// setInterval( loop, 1000 / 60 );

function init() {

  vertex_shader = document.getElementById('vs').textContent;
  fragment_shader = document.getElementById('fs').textContent;

  effectDiv = document.getElementById('effect');

  canvas = document.createElement( 'canvas' );
  effectDiv.appendChild( canvas );

  // Initialise WebGL
  try {
    gl = canvas.getContext( 'experimental-webgl' );
  } catch (error) {}

  if (!gl) {
    alert("WebGL not supported");
    throw "cannot create webgl context";
  }

  // Create Vertex buffer (2 triangles)
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0,
    -1.0,  1.0
  ]), gl.STATIC_DRAW);

  // Create Program
  currentProgram = createProgram( vertex_shader, fragment_shader );

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
}

function createProgram( vertex, fragment ) {
  var program = gl.createProgram();

  var vs = createShader(vertex, gl.VERTEX_SHADER);
  var fs = createShader('#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment, gl.FRAGMENT_SHADER);

  if ( vs == null || fs == null ) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert( "ERROR:\n" +
      "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
      "ERROR: " + gl.getError() + "\n\n" +
      "- Vertex Shader -\n" + vertex + "\n\n" +
      "- Fragment Shader -\n" + fragment);

    return null;
  }

  return program;
}

function createShader( src, type ) {
  var shader = gl.createShader(type);

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
    alert((type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function onWindowResize( event ) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  parameters.screenWidth = canvas.width;
  parameters.screenHeight = canvas.height;
  
  parameters.aspectX = canvas.width/canvas.height ;
  parameters.aspectY = 1.0 ;

  gl.viewport( 0, 0, canvas.width, canvas.height );
}

function loop() {
  if (!currentProgram) return;

  parameters.time = new Date().getTime() - parameters.start_time;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Load program into GPU
  gl.useProgram(currentProgram);

  // Set values to program variables
  gl.uniform1f(gl.getUniformLocation(currentProgram, 'time'), parameters.time / 1000);
  gl.uniform2f(gl.getUniformLocation(currentProgram, 'resolution'), parameters.screenWidth, parameters.screenHeight);
  gl.uniform2f(gl.getUniformLocation(currentProgram, 'aspect'), parameters.aspectX, parameters.aspectY);

  // Render geometry
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer( vertex_position, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vertex_position );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray( vertex_position );
}   
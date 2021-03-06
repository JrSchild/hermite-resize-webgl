function GLScale(options) {
  if (!(this instanceof GLScale)) {
    return new GLScale(options);
  }

  this.precompile(options);

  return this.scale.bind(this);
}

/**
 * Precompiling, canvas/kernel initialization
 */
GLScale.prototype.precompile = function (options) {
  this.canvas = document.createElement('canvas');

  this.canvas.width = options.width;
  this.canvas.height = options.height;

  var ctxOptions = {preserveDrawingBuffer: true};
  this.gl = this.canvas.getContext('webgl', ctxOptions) || this.canvas.getContext('experimental-webgl', ctxOptions);

  if (!this.gl) {
    throw new Error('Could not initialize webgl context');
  }

  // Setup GLSL program
  var vertex = GLScale.compileShader(this.gl, GLScale.Hermite.vertex, this.gl.VERTEX_SHADER);
  var fragment = GLScale.compileShader(this.gl, GLScale.Hermite.fragment, this.gl.FRAGMENT_SHADER);
  this.program = GLScale.createProgram(this.gl, vertex, fragment);
  this.gl.useProgram(this.program);

  // Create a texture.
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.gl.createTexture());

  // Set the parameters so we can render any size image.
  // If this stuff is not supported, draw the image to a canvas with POT dimensions.
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

  // lookup uniforms and set the resolution
  var resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
  this.gl.uniform2f(resolutionLocation, options.width, options.height);

  // Create a buffer for the position of the rectangle corners.
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
  var positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
  this.gl.enableVertexAttribArray(positionLocation);
  this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
};

GLScale.prototype.scale = function (image, cb) {

  // If image is string, load it and call this method again.
  if (typeof image === 'string') {
    return this.loadImage(image, function (err, image) {
      // Don't throw anything on err, console already logs 404.
      if (!err) return this.scale(image, cb);
    });
  }

  // Upload the image into the texture.
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

  var srcResolutionLocation = this.gl.getUniformLocation(this.program, 'u_srcResolution');
  this.gl.uniform2f(srcResolutionLocation, image.width, image.height);

  // Set a rectangle the same size as the image and draw it.
  this.setRectangle(0, 0, image.width, image.height);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

  // Not completely recommended, but can't find another way right now to know when it's finished.
  // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/#performance-differences
  this.gl.finish();

  // Enhance the canvas object with toBlob polyfill, if it doesn't exist.
  this.canvas.toBlob = GLScale.toBlob;

  if (cb) cb(this.canvas);

  return this;
};

GLScale.prototype.setRectangle = function (x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), this.gl.STATIC_DRAW);
};

/**
 * Load image from url.
 * Useful to have as static- and instance method.
 */
GLScale.loadImage = function (url, cb) {
  var image = new Image();
  image.onload = cb.bind(this, null, image);
  image.onerror = cb.bind(this);
  image.src = url;

  return this;
};
GLScale.prototype.loadImage = GLScale.loadImage;

/**
 * canvas.prototype.toBlob polyfill.
 * Does not change the prototype chain.
 */
GLScale.toBlob = (function toBlob() {
  var CanvasPrototype = window.HTMLCanvasElement.prototype;

  if (CanvasPrototype.toBlob) {
    return CanvasPrototype.toBlob;
  }

  return function(callback, type, quality) {
    var binStr = atob(this.toDataURL(type, quality).split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  };
})();

// Helper methods to compile the program.
GLScale.compileShader = function (gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  // Throw error when unable to compile.
  if (!(gl.getShaderParameter(shader, gl.COMPILE_STATUS))) {
    throw new Error('Could not compile shader: ' + gl.getShaderInfoLog(shader));
  }
 
  return shader;
};

GLScale.createProgram = function (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
 
  // Attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
 
  // Link the program.
  gl.linkProgram(program);
 
  // Throw error when unable to link.
  if (!(gl.getProgramParameter(program, gl.LINK_STATUS))) {
    throw new Error('Program failed to link: ' + gl.getProgramInfoLog (program));
  }
 
  return program;
};
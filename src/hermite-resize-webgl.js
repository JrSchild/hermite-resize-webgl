function GLScale() {
  if (!(this instanceof GLScale)) {
    return new GLScale();
  }

  // Precompiling, kernel initialization, etc...
  // For now do it in the actual scale method.

  return this.scale.bind(this);
}

GLScale.prototype.scale = function (options, cb) {
  this.canvas = document.createElement('canvas');

  this.loadImage(options.image, function (image) {
    if (!image) {
      throw new Error('Could not load image');
    }

    this.canvas.width = options.width;
    this.canvas.height = options.height;

    var ctxOptions = {preserveDrawingBuffer: true};
    this.gl = this.canvas.getContext('webgl', ctxOptions) || this.canvas.getContext('experimental-webgl', ctxOptions);

    if (!this.gl) {
      throw new Error('Could not initialize webgl context');
    }

    // setup GLSL program
    this.program = createProgramFromScripts(this.gl, ['2d-vertex-shader', '2d-fragment-shader']);
    this.gl.useProgram(this.program);

    // look up where the vertex data needs to go.
    var positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    var texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

    // provide texture coordinates for the rectangle.
    var texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0
    ]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(texCoordLocation);
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Create a texture.
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.gl.createTexture());

    // Set the parameters so we can render any size image.
    // If this stuff is not supported, draw the image to a canvas with POT dimensions.
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    // Upload the image into the texture.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

    // lookup uniforms and set the resolution
    var resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);

    // Create a buffer for the position of the rectangle corners.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set a rectangle the same size as the image.
    this.setRectangle(0, 0, image.width, image.height);

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    // Not completely recommended, but can't find another way right now to know when it's finished.
    // http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/#performance-differences
    this.gl.finish();

    cb(this.canvas);
  });

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

GLScale.prototype.loadImage = function (url, cb) {
  var image = new Image();
  image.onload = cb.bind(this, image);
  image.onerror = cb.bind(this, null);
  image.src = url;
};
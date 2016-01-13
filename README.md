## Hermite resize in webgl
A highly experimental project with the [hermite image-resize](https://github.com/viliusle/Hermite-resize) algorithm implemented in WebGL. Due to mediocre performance and quality of canvas-resizing and javascript-based resize algorithms I implemented the hermite algorithm in WebGL.

#### API
Include the `dist/hermite-resize-webgl.js` file and you are good to go.
```
// Pre-compile the program.
var glScale = GLScale({
  width: 400,
  height: 300
});

// Scale the input, can be string, image-elem or canvas.
glScale('/image.jpg', function(canvas) {
  // canvas is enhanced with toBlob polyfill if not present.
  canvas.toBlob(function(blob) {

  });
});
```

#### Performance
After pre-compiling and loading the image, GLScale is up to 890% faster than the javascript version. (Tested on a Macbook Pro Retina 2012)

![Performance Chart](/doc/img/performance.png)

#### Testing
`git clone` the project. Run `npm install` and `gulp` or `gulp server` to start a static file server.

#### TODO
- ~~Alpha channel support~~
- Unit testing (+Node.js)
- ~~Run static file server from within `gulp` instead of from index.js (which should be for module including).~~
- ~~Include toBlob polyfill~~
- ~~Support other input (image-, canvas-element)~~
- Research and implement other resize algorithms
- ~~Benchmark~~
- API: Only supply width or height
- The current implementation outputs slightly different results than the original javascript-based algorithm. Maybe this is due to precision/incorrectly reading exactly the right pixel data from the texture. In which case the GPU will do some interpolation itself.
- Allow the canvas (+program) to resize after compilation
- ~~Remove webgl-utils dependecy~~
- ~~Minify shaders~~
- ~~Inline the shaders~~
- ~~Make loadImage static~~
- ~~Precompiling shaders/program~~
- Support higher textures than in webgl max possible. Needs rewrite of pixelsToTexture function and scale method to split input up in multiple canvasses.
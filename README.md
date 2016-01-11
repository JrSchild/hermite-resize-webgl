## Hermite resize in webgl
A highly experimental project with the [hermite image-resize](https://github.com/viliusle/Hermite-resize) algorithm implemented in WebGL. Due to mediocre performance and quality of canvas-resizing and javascript-based resize algorithms I implemented the hermite algorithm in WebGL.

#### API
For now, make sure to include `hermite-resize-webgl.js` and `webgl-utils.js`. Also copy the vertex and fragment shaders to your HTML. These steps will be smoothed out in the future.
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

#### Testing
`git clone` the project. Run `npm install && bower install`. Use `node index.js` to start a static file server.

#### TODO
- ~~Alpha channel support~~
- Unit testing (+Node.js)
- ~~Include toBlob polyfill~~
- ~~Support other input (image-, canvas-element)~~
- Research and implement other resize algorithms
- Benchmark
- API: Only supply width or height
- The current implementation outputs slightly different results than the original javascript-based algorithm. Maybe this is due to precision/incorrectly reading exactly the right pixel data from the texture. In which case the GPU will do some interpolation itself.
- Remove webgl-utils dependecy
- Inline the shaders
- ~~Make loadImage static~~
- ~~Precompiling shaders/program~~
### Hermite resize in webgl
A highly experimental project with the hermite image-resize algorithm implemented in WebGL.

##### API
```
var glScale = GLScale(options);

glScale({
  image: '/image.jpg',
  width: 200,
  height: 100
}, function(canvas) {
  
});
```

##### Testing
`git clone` the project. Run `npm install && bower install`. Use `node index.js` to start a static file server.


##### TODO
- Alpha channel support
- Better unit testing (Node.js support)
- Add toBlob polyfill
- Research and implement other resize algorithms
- Benchmark
- API: Only supply width or height
- The current implementation outputs slightly different results than the original javascript-based algorithm. Maybe this is due to precision/incorrectly reading exactly the right pixel data. In which case the GPU will do some interpolation itself.
- Remove webgl-utils dependecy
- Inline shaders
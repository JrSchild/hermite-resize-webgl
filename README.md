lanczos3 lanczos5 lanczos8 hermite webgl-native canvas


http://stackoverflow.com/a/8365035

http://blog.codinghorror.com/better-image-resizing/
https://github.com/mortennobel/java-image-scaling
http://blog.nobel-joergensen.com/2008/12/20/downscaling-images-in-java/
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL


Tests/utilities
Place a texture as precise as possible.
Retrieve the exact color code of texture coordinate in pixels, not (-1, -1) (1, 1). Run unit tests for this to check if devices support precision.
Current fragment-coordinate to pixel-coordinate
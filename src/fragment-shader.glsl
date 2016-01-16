precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform vec2 u_srcResolution;

// Convert a location on the texture in pixels, to the location in coordinates
vec4 getTextureColor(vec2 loc) {
  return texture2D(u_image, loc / u_srcResolution);
}

void main() {
  // I guess ratio and ratioHalf are more precise when calculated within
  // the shader, rather than passed as uniform-value. Also these
  // should be defined in one place.
  vec2 ratio = u_srcResolution / u_resolution;
  vec2 ratioHalf = ceil(ratio / 2.0);

  // Location in pixels on target canvas.
  vec2 loc = gl_FragCoord.xy;

  // Normalize location from bottom-left to top-left.
  loc.y = u_resolution.y - loc.y;

  float weight = 0.0;
  float weights = 0.0;
  float weights_alpha = 0.0;
  vec3 gx_rgb = vec3(0.0);
  float gx_a = 0.0;
  float center_y = (loc.y + 0.5) * ratio.y;

  // Due to restrictions in for-loop we have to use awkward work-around.
  // http://www.atmind.nl/?p=623
  float yy = floor(loc.y * ratio.y);
  float yy_length = (loc.y + 1.0) * ratio.y;
  for (int yyy = 0; yyy < 5000; yyy++) {
    if (yy >= yy_length) { break; }

    float dy = abs(center_y - (yy + 0.5)) / ratioHalf.y;
    float center_x = (loc.x + 0.5) * ratio.x;
    float w0 = dy*dy;

    float xx = floor(loc.x * ratio.x);
    float xx_length = (loc.x + 1.0) * ratio.x;
    for (int xxx = 0; xxx < 5000; xxx++) {
      if (xx >= xx_length) { break; }

      float dx = abs(center_x - (xx + 0.5)) / ratioHalf.x;
      float w = sqrt(w0 + dx*dx);

      if (w >= -1.0 && w <= 1.0) {
        // Hermite filter
        weight = 2.0 * w*w*w - 3.0*w*w + 1.0;
        if (weight > 0.0) {
          vec4 pixel = getTextureColor(vec2(xx, yy)) * 255.0;

          // Alpha
          gx_a += weight * pixel.a;
          weights_alpha += weight;

          if (pixel.a < 255.0) {
            weight = weight * pixel.a / 250.0;
          }

          gx_rgb += weight * pixel.rgb;
          weights += weight;
        }
      }

      xx++;
    }

    yy++;
  }

  gx_rgb = (gx_rgb / weights) / 255.0;
  gx_a = (gx_a / weights_alpha) / 255.0;

  gl_FragColor = vec4(gx_rgb, gx_a);
}
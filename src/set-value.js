setValue(method, location, ...values) {
  this.gl[method].apply(this.gl[method], [this.gl.getUniformLocation(this.program), ...values]);
}

setValue('uniform2f', 'time', val1, val2);

// gl.uniform2f(gl.getUniformLocation(currentProgram, 'time'), val, val2);
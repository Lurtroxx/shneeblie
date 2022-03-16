import React, { useCallback, useRef, useState, useEffect } from "react";
import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import { Asset } from "expo-asset";
import {
  Text,
  TouchableOpacity,
  View,
  Button,
  StyleSheet,
  PanResponder,
} from "react-native";

const vertShader = `
  precision highp float;
  uniform vec2 u_rotation;
  attribute vec2 a_position;
  varying vec2 uv;
  void main () {

    vec2 rotatedPosition = vec2(
      a_position.x * u_rotation.y + a_position.y * u_rotation.x,
      a_position.y * u_rotation.y - a_position.x * u_rotation.x
    );

    uv = a_position;
    gl_Position = vec4(rotatedPosition, 0, 1);
  }
`;

const fragShader = `
  precision highp float;
  uniform sampler2D u_texture;
  varying vec2 uv;
  void main () {
    gl_FragColor = texture2D(u_texture, vec2(uv.y, uv.x));
  }
`;
export const TabTwoView = () => {
  const [animating, setAnimating] = useState(false);
  const contextRef = useRef<ExpoWebGLRenderingContext>();
  const textureRef = useRef<WebGLUniformLocation>();
  const rotationRef = useRef<WebGLUniformLocation>();
  const positionRef = useRef<WebGLUniformLocation>();
  const rotation = useRef(0);
  const position = useRef(0);

  // create a pan responder that allows us to move the image around
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.current += gesture.dx;
        rotation.current += gesture.dy;
      },
    })
  );

  // use pan responder to move the image
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.uniform2f(positionRef.current, position.current, 0);
      contextRef.current.uniform2f(rotationRef.current, 0, rotation.current);
    }
  }, [position.current, rotation.current]);

  const onGLContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    contextRef.current = gl;
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255])
    );
    textureRef.current = gl.getUniformLocation(
      contextRef.current.program,
      "u_texture"
    );
    rotationRef.current = gl.getUniformLocation(
      contextRef.current.program,
      "u_rotation"
    );
    positionRef.current = gl.getUniformLocation(
      contextRef.current.program,
      "u_position"
    );
    gl.uniform1i(textureRef.current, 0);
    gl.uniform2f(rotationRef.current, rotation.current, position.current);
    gl.uniform2f(positionRef.current, 0, 0);
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.uniform2f(
        rotationRef.current,
        rotation.current,
        position.current
      );
      contextRef.current.uniform2f(positionRef.current, 0, 0);
    }
  }, [animating]);

  const vertices = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
  ]);

  const onTestContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

      const vert = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
      gl.shaderSource(vert, vertShader);
      gl.compileShader(vert);

      const frag = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
      gl.shaderSource(frag, fragShader);
      gl.compileShader(frag);

      const program = gl.createProgram() as WebGLProgram;
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      const positionAttrib = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionAttrib);
      gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

      const asset = Asset.fromModule(require("../../../../assets/coin.png"));
      await asset.downloadAsync();

      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      // @ts-ignore
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        asset
      );

      const textureLocation = gl.getUniformLocation(program, "u_texture");
      const rotationLocation = gl.getUniformLocation(program, "u_rotation");

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniform1i(textureLocation, 0);
      gl.uniform2fv(rotationLocation, [Math.cos(0), Math.sin(0)]);

      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
      gl.flush();
      gl.endFrameEXP();

      // Store context and uniforms
      contextRef.current = gl;
      textureRef.current = textureLocation as WebGLUniformLocation;
      rotationRef.current = rotationLocation as WebGLUniformLocation;
    },
    []
  );

  // const onPinchGestureEvent = useCallback((event: any) => {
  //   const gl = contextRef.current;
  //   if (gl) {
  //     const rotation = gl.getUniform(rotationRef.current, "u_rotation");
  //     const newRotation = [
  //       rotation[0] * event.scale,
  //       rotation[1] * event.scale,
  //     ];
  //     gl.uniform2fv(rotationRef.current, newRotation);
  //     gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
  //     gl.flush();
  //     gl.endFrameEXP();
  //   }
  // }, []);

  const frameTimer = useRef<number>(0);
  const frameValue = useRef<number>(0);
  const frameHandle = useRef<number | null>();
  const frameTicker = useCallback((time) => {
    if (contextRef.current) {
      const gl = contextRef.current as ExpoWebGLRenderingContext;

      frameValue.current += Math.PI / 600; // 180 degrees in 10 seconds
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2fv(rotationRef.current as WebGLUniformLocation, [
        Math.cos(frameValue.current),
        Math.sin(frameValue.current),
      ]);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
      gl.flush();
      gl.endFrameEXP();
      frameTimer.current = time;
    }
    frameHandle.current = requestAnimationFrame(frameTicker);
  }, []);

  const handleToggleAnimation = useCallback(() => {
    setAnimating(!animating);
    if (!animating) {
      frameHandle.current = requestAnimationFrame(frameTicker);
    } else {
      cancelAnimationFrame(frameHandle.current as number);
      frameHandle.current = null;
    }
  }, [animating]);

  useEffect(() => {
    if (animating) {
      frameHandle.current = requestAnimationFrame(frameTicker);
    } else {
      cancelAnimationFrame(frameHandle.current as number);
      frameHandle.current = null;
    }
  }, [animating]);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleToggleAnimation}
          title={animating ? "Stop" : "Start"}
          color={animating ? "red" : "green"}
        />
      </View>
      <View style={styles.glContainer}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={async (gl) => {
            onTestContextCreate(gl);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "100%",
    padding: 20,
  },
  glContainer: {
    width: "100%",
    height: "100%",
  },
});

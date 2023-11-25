import React, {useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  SafeAreaView,
  Alert,
  Text,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const ScreenDrawing = () => {
  const [currentPoints, setCurrentPoints] = useState<any>([]);
  const [lines, setLines] = useState<any>([]);
  const path = useRef<any>(null);
  const ref = useRef<any>();
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        path.current = '';
      },
      onPanResponderMove: (e, gestureState) => {
        const newPoint = {
          x: gestureState.moveX,
          y: gestureState.moveY,
        };
        setCurrentPoints([...currentPoints, newPoint]);
        if (path.current === '') {
          path.current = `M${newPoint.x}, ${newPoint.y}`;
        } else {
          path.current += `L${newPoint.x}, ${newPoint.y}`;
        }
      },
      onPanResponderRelease: () => {
        setLines((lines: any) => [...lines, path.current]);
        setCurrentPoints([]);
        if (isCircle(path.current)) {
          ref.current.capture().then((uri: any) => {
            CameraRoll.save(uri, {type: 'photo', album: 'Album codes'});
            Alert.alert('Screenshot taken!');
          });
        }
      },
    }),
  ).current;
  // Function to check if the drawn path forms a circle
  const isCircle = (drawnPath: any) => {
    const boundingBox = getBoundingBox(drawnPath);
    const aspectRatio = boundingBox.width / boundingBox.height;
    const aspectRatioThreshold = 0.2;
    return (
      aspectRatio >= 1 - aspectRatioThreshold &&
      aspectRatio <= 1 + aspectRatioThreshold
    );
  };

  const getBoundingBox = (drawnPath: any) => {
    const coordinates = drawnPath
      .substring(1)
      .split('L')
      .map((point: any) => point.trim().split(',').map(Number));

    const xValues = coordinates.map(([x]: any) => x);
    const yValues = coordinates.map(([, y]: any) => y);

    return {
      x: Math.min(...xValues),
      y: Math.min(...yValues),
      width: Math.max(...xValues) - Math.min(...xValues),
      height: Math.max(...yValues) - Math.min(...yValues),
    };
  };
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <SafeAreaView />
      <ViewShot
        ref={ref}
        style={styles.shot}
        options={{
          fileName: 'ssCaputered',
          format: 'jpg',
          quality: 0.9,
        }}>
          <Text style ={styles.txt}>Draw something below...</Text>
        <Svg style={styles.svg}>
          {lines.map((line: any, index: any) => (
            <Path key={index} d={line} stroke="blue" strokeWidth="3" />
          ))}
        </Svg>
      </ViewShot>
    </View>
  );
};

export default ScreenDrawing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  shot :{
    flex: 1,
    width: '100%',
    height: '100%'
  },
  txt: {
    alignSelf: 'center'
  }
});

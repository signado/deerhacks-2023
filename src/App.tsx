import { useRef, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import { grey } from '@mui/material/colors';
import Webcam from 'react-webcam';
import * as fp from 'fingerpose';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';

import { drawHand } from './utilities';

const App = () => {
  const [detectMode, setDetectMode] = useState<'spell' | 'word'>('spell');
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('user');
  const [mirrored, setMirrored] = useState(true);
  // const [typed, setTyped] = useState<any>(null);
  const [detectedText, setDetectedText] = useState('');

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let webcamWidth, webcamHeight;

  if (window.innerWidth > window.innerHeight) {
    webcamWidth = window.innerWidth;
    webcamHeight = window.innerHeight;
  } else {
    webcamWidth = window.innerHeight;
    webcamHeight = window.innerWidth;
  }

  // Main function
  const runCoco = async () => {
    const net = await handpose.load();
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net: any) => {
    // Check data is available
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const hand = await net.estimateHands(video);

      const loveGesture = new fp.GestureDescription('I love you');
      loveGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl, 1.0);
      loveGesture.addCurl(fp.Finger.Index, fp.FingerCurl.NoCurl, 1.0);
      loveGesture.addCurl(fp.Finger.Pinky, fp.FingerCurl.NoCurl, 1.0);
      loveGesture.addCurl(fp.Finger.Ring, fp.FingerCurl.FullCurl, 0.5);
      loveGesture.addCurl(fp.Finger.Middle, fp.FingerCurl.FullCurl, 0.5);

      const GE = new fp.GestureEstimator([fp.Gestures.ThumbsUpGesture, loveGesture]);

      if (hand[0]) {
        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5);

        if (estimatedGestures.gestures.length > 0) {
          setDetectedText(estimatedGestures.gestures[0].name);
        }
      }

      const ctx = canvasRef.current?.getContext('2d');
      ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawHand(hand, ctx);
    }
  };

  useEffect(() => {
    runCoco();
  });

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          zIndex: 998,
        }}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <Webcam
        ref={webcamRef}
        muted
        videoConstraints={{
          width: webcamWidth,
          height: webcamHeight,
          facingMode: cameraMode,
        }}
        // mirrored={mirrored}
      />
      <div
        style={{
          backgroundColor: 'black',
          position: 'absolute',
          height: 40,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <p
          style={{
            color: 'white',
            position: 'absolute',
            bottom: 65,
            backgroundColor: 'black',
            padding: 10,
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          {detectedText}
        </p>
        <button
          onClick={() => setDetectMode('spell')}
          style={{
            borderRadius: 30,
            paddingLeft: 30,
            paddingRight: 30,
            borderColor: 'transparent',
            marginRight: 10,
            backgroundColor: detectMode === 'spell' ? 'white' : 'black',
            color: detectMode === 'spell' ? 'black' : 'white',
            fontSize: 14,
          }}
        >
          Spell
        </button>
        <button
          onClick={() => setDetectMode('word')}
          style={{
            borderRadius: 30,
            paddingLeft: 30,
            paddingRight: 30,
            borderColor: 'transparent',
            marginLeft: 10,
            backgroundColor: detectMode === 'word' ? 'white' : 'black',
            color: detectMode === 'word' ? 'black' : 'white',
            fontSize: 14,
          }}
        >
          Word
        </button>
      </div>
      <IconButton
        color="primary"
        aria-label="upload picture"
        component="label"
        style={{ position: 'absolute', bottom: 10, right: 15, zIndex: 9999 }}
        onClick={() => {
          if (cameraMode === 'user') {
            setCameraMode('environment');
            setTimeout(() => {
              setMirrored(false);
            }, 740);
          } else {
            setCameraMode('user');
            setTimeout(() => {
              setMirrored(true);
            }, 740);
          }
        }}
      >
        <CameraswitchIcon sx={{ color: grey[50] }} />
      </IconButton>
    </div>
  );
};

export default App;

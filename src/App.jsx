import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import ReactPlayer from "react-player";
import Button from "@mui/material/Button";
import Header from "./UIComponents/Header";
import {
  Box,
  Typography,
  Stack,
  Container,
  TextField
} from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import Footer from "./UIComponents/Footer";
import CopyToClipboardButton from "./UIComponents/CopyToClipboardButton";
import ShareMeetingInfo from "./UIComponents/ShareMeetInfo";

function App() {
  const [peerId, setPeerID] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [message, setMessage] = useState("");
  const [isVideoOn, setVideoOn] = useState(true);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isOnCall, setIsOnCall] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [pipMode, setPipMode] = useState(false);

  const ourConnection = useRef(null);
  const ourVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const videoPlayerRef = useRef(null);

  const toggleVideo = () => {
    if (ourVideoRef.current.srcObject) {
      const tracks = ourVideoRef.current.srcObject.getVideoTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
        setVideoOn(track.enabled);
      });
    }
  };

  const toggleAudio = () => {
    if (ourVideoRef.current.srcObject) {
      const tracks = ourVideoRef.current.srcObject.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = !track.enabled;
        setAudioOn(track.enabled);
      });
    }
  };

  const togglePlay = () => {
    const playStatus = isPlaying ? "Pause" : "Play";
    ourConnection.current.send(`Play ${playStatus}`);
    setIsPlaying(!isPlaying);
  };

  const endCall = () => {
    if (ourConnection.current) {
      ourConnection.current.send("End Call");
    }

    if (ourVideoRef.current?.srcObject) {
      ourVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (peerInstance.current) {
      peerInstance.current.destroy();
    }

    setIsOnCall(false);
    window.location.reload();
  };

  const handleYoutubeLink = () => {
    ourConnection.current.send(`Youtube-link ${youtubeLink}`);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      setPipMode(true);
    } else {
      setPipMode(false);
    }
  };

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerID(id);
    });

    peer.on("connection", (conn) => {
      ourConnection.current = conn;

      conn.on("data", (data) => {
        if (data.startsWith("Youtube-link")) {
          setYoutubeLink(data.split(" ")[1]);
        }

        if (data.startsWith("Play")) {
          const status = data.split(" ")[1];
          setIsPlaying(status === "Play");
        }

        if (data.startsWith("End")) {
          endCall();
        }
      });
    });

    peer.on("call", (call) => {
      setIsOnCall(true);

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          ourVideoRef.current.srcObject = stream;
          call.answer(stream);

          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });

          document.addEventListener("visibilitychange", handleVisibilityChange);
        });
    });

    peerInstance.current = peer;
  }, []);

  const callPeer = (remotePeerId) => {
    setIsOnCall(true);

    ourConnection.current = peerInstance.current.connect(remotePeerId);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        ourVideoRef.current.srcObject = stream;

        const call = peerInstance.current.call(remotePeerId, stream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });

    document.addEventListener("visibilitychange", handleVisibilityChange);
  };

  return (
    <>
      <Header />

      <main>

        {/* Title Section */}
        <Box textAlign="center" mt={4}>
          <Typography variant="h4">
            Friends Video Sharing System
          </Typography>
          <Typography variant="body1">
            Watch videos together with your friends in real time
          </Typography>
        </Box>

        {!isOnCall && (
          <Box sx={{ pt: 8, pb: 6 }}>
            <Container maxWidth="sm">
              <Typography variant="h5" align="center">
                Your Meeting ID: {peerId}
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                <TextField
                  size="small"
                  label="Receiver ID"
                  value={remotePeerId}
                  onChange={(e) => setRemotePeerId(e.target.value)}
                />

                <Button
                  variant="contained"
                  onClick={() => callPeer(remotePeerId)}
                >
                  Call
                </Button>
              </Stack>
            </Container>
          </Box>
        )}

        {isOnCall && (
          <>
            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
              <TextField
                size="small"
                label="YouTube URL"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
              />

              <Button variant="contained" onClick={handleYoutubeLink}>
                Send Video
              </Button>
            </Stack>

            {youtubeLink && (
              <Stack mt={3}>
                <ReactPlayer
                  ref={videoPlayerRef}
                  url={youtubeLink}
                  width="100%"
                  pip={pipMode}
                  controls
                  playing={isPlaying}
                />
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="center"
              spacing={2}
              mt={3}
            >
              <video ref={ourVideoRef} width="300" autoPlay muted />
              <video ref={remoteVideoRef} width="300" autoPlay />
            </Stack>

            <Stack
              direction="row"
              justifyContent="center"
              spacing={2}
              mt={3}
            >
              <Button variant="contained" onClick={toggleVideo}>
                {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </Button>

              <Button variant="contained" onClick={toggleAudio}>
                {isAudioOn ? <MicIcon /> : <MicOffIcon />}
              </Button>

              <Button variant="contained" onClick={endCall}>
                <CallEndIcon />
              </Button>
            </Stack>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default App;
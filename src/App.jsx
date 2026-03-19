import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import ReactPlayer from "react-player";
import {
  Box,
  Typography,
  Stack,
  Container,
  TextField,
  Button
} from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import Header from "./UIComponents/Header";
import Footer from "./UIComponents/Footer";

function App() {
  const [peerId, setPeerID] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isVideoOn, setVideoOn] = useState(true);
  const [isAudioOn, setAudioOn] = useState(true);
  const [isOnCall, setIsOnCall] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const ourVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const connectionRef = useRef(null);

  // 🔥 INIT PEER
  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerID(id);
    });

    // 📞 Incoming call
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
        });
    });

    peerInstance.current = peer;
  }, []);

  // 📞 Call someone
  const callPeer = (id) => {
    if (!id) return;

    setIsOnCall(true);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        ourVideoRef.current.srcObject = stream;

        const call = peerInstance.current.call(id, stream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
  };

  // 🎥 Toggle Video
  const toggleVideo = () => {
    const tracks = ourVideoRef.current?.srcObject?.getVideoTracks();
    tracks?.forEach((track) => {
      track.enabled = !track.enabled;
      setVideoOn(track.enabled);
    });
  };

  // 🎤 Toggle Audio
  const toggleAudio = () => {
    const tracks = ourVideoRef.current?.srcObject?.getAudioTracks();
    tracks?.forEach((track) => {
      track.enabled = !track.enabled;
      setAudioOn(track.enabled);
    });
  };

  // ❌ End Call
  const endCall = () => {
    ourVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    remoteVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());

    setIsOnCall(false);
    window.location.reload();
  };

  return (
    <>
      <Header />

      {/* HERO */}
      <Box
        sx={{
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "white",
          py: 8,
          textAlign: "center"
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Friends Video Sharing
        </Typography>
        <Typography>Watch videos together in real time</Typography>
      </Box>

      {/* HOME CARD */}
      {!isOnCall && (
        <Container maxWidth="sm" sx={{ mt: -6 }}>
          <Box
            sx={{
              background: "white",
              p: 4,
              borderRadius: 4,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              textAlign: "center"
            }}
          >
            <Typography color="black">Your Meeting ID</Typography>

            <Typography
              sx={{
                color: "#6366f1",
                mb: 2,
                fontWeight: 500
              }}
            >
              {peerId}
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Receiver ID"
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
              />


              <Button
                variant="contained"
                sx={{
                  background: "#6366f1",
                  "&:hover": { background: "#4f46e5" }
                }}
                onClick={() => callPeer(remotePeerId)}
              >
                Call
              </Button>
            </Stack>
          </Box>
        </Container>
      )}

      {/* CALL SCREEN */}
      {isOnCall && (
        <Container sx={{ mt: 4 }}>
          {/* YouTube */}
          <Stack direction="row" spacing={2}>
           <TextField
  fullWidth
  label="YouTube URL"
  value={youtubeLink}
  onChange={(e) => setYoutubeLink(e.target.value)}
  sx={{
    background: "white",
    borderRadius: "8px",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#cbd5e1", // light border
      },
      "&:hover fieldset": {
        borderColor: "#6366f1", // hover color
      },
      "&.Mui-focused fieldset": {
        borderColor: "#6366f1", // focus color
      },
    },
  }}
/>

            <Button variant="contained">
              Send
            </Button>
          </Stack>

          {/* Player */}
          {youtubeLink && (
            <Box mt={3}>
              <ReactPlayer
                url={youtubeLink}
                width="100%"
                controls
                playing={isPlaying}
              />
            </Box>
          )}

          {/* Videos */}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={3}
            mt={4}
          >
            <video ref={ourVideoRef} width="250" autoPlay muted />
            <video ref={remoteVideoRef} width="250" autoPlay />
          </Stack>

          {/* Controls */}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={3}
            mt={4}
          >
            <Button onClick={toggleVideo}>
              {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </Button>

            <Button onClick={toggleAudio}>
              {isAudioOn ? <MicIcon /> : <MicOffIcon />}
            </Button>

            <Button color="error" onClick={endCall}>
              <CallEndIcon />
            </Button>
          </Stack>
        </Container>
      )}

      <Footer />
    </>
  );
}

export default App;
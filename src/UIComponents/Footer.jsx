import React from "react";
import { Box, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        mt: 8,
        py: 5,
        textAlign: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white"
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        For You 💙
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
        Watch together. Stay connected.
      </Typography>

      <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
        © 2026 Gokulesh Kumar
      </Typography>
    </Box>
  );
}

export default Footer;
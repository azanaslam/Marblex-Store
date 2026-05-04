import { useEffect, useState } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { bannerImages } from "../config/constants";

export const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const move = (delta) => {
    setCurrent((prev) => (prev + delta + bannerImages.length) % bannerImages.length);
  };

  return (
    <Paper
      sx={{
        mb: 3,
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
        height: { xs: 190, sm: 300, md: 420 },
        background: "linear-gradient(120deg,#2d2d2d,#4a4a4a,#6a6a6a)",
        border: "1px solid #e6e6e6",
      }}
    >
      <Box component="img" src={bannerImages[current]} alt="Marblex banner" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(227,30,36,0.48), rgba(17,17,17,0.18))",
          color: "white",
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          Introducing Premium Car Mats
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 560 }}>
          Car mats, wall panels, flooring and direct WhatsApp ordering in one smooth experience.
        </Typography>
      </Box>
      <IconButton onClick={() => move(-1)} sx={{ position: "absolute", left: 10, top: "45%", color: "white" }}>
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton onClick={() => move(1)} sx={{ position: "absolute", right: 10, top: "45%", color: "white" }}>
        <KeyboardArrowRightIcon />
      </IconButton>
    </Paper>
  );
};

import { Box, Button, Container, IconButton, InputBase, Stack, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";

export const SiteFooter = () => {
  const infoLinks = [
    "About Us",
    "Downloads",
    "Contact Us",
    "Faq's",
    "Refund and Returns Policy",
    "Privacy Policy",
  ];

  return (
    <Box sx={{ borderTop: "1px solid #e8e8e8", bgcolor: "#f5f5f5", mt: 2 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.9fr 1.2fr" },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} mb={1.2}>
              Get in touch
            </Typography>
            <Stack spacing={1.2} color="text.secondary">
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlinedIcon fontSize="small" />
                <Typography variant="body2">2.6 Km · 40-Ferozpurroad, Lahore, Punjab, Pakistan</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <MailOutlineOutlinedIcon fontSize="small" />
                <Typography variant="body2">Sales@Themarflexgroup.Com</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalPhoneOutlinedIcon fontSize="small" />
                <Typography variant="body2">0348-111-66-11</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.4 }}>
              <IconButton component="a" href="#" target="_blank" rel="noreferrer" aria-label="Facebook" size="small">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton component="a" href="#" target="_blank" rel="noreferrer" aria-label="Instagram" size="small">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton component="a" href="#" target="_blank" rel="noreferrer" aria-label="Twitter / X" size="small">
                <XIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} mb={1.2}>
              Infomation
            </Typography>
            <Stack spacing={0.7}>
              {infoLinks.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary">
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} mb={1.2}>
              Newsletter Signup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.4, maxWidth: 360 }}>
              Subscribe to our newsletter and get 10% off your first purchase
            </Typography>
            <Stack
              direction="row"
              sx={{
                maxWidth: 380,
                bgcolor: "#fff",
                border: "1px solid #d8d8d8",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <InputBase sx={{ px: 2, py: 1, flex: 1, fontSize: 14 }} placeholder="Your email address" />
              <Button variant="contained" color="secondary" sx={{ borderRadius: 0, px: 3 }}>
                Subscribe
              </Button>
            </Stack>
          </Box>
        </Box>

        <Typography sx={{ mt: 3, pt: 1.5, borderTop: "1px solid #e1e1e1", textAlign: { xs: "left", md: "center" } }} variant="body2" color="text.secondary">
          Copyright © {new Date().getFullYear()} Marblex Store. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

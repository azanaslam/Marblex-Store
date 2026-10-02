import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import { authHeaders, http } from "../../api/http";
import { formatMoney, PORTAL_TEAL, pushToCart } from "./portalUtils";

export const PortalFavorites = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [openList, setOpenList] = useState(false);
  const [listName, setListName] = useState("");
  const [siteLabel, setSiteLabel] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    const [favRes, listRes] = await Promise.all([
      http.get("/portal/favorites", authHeaders(token)),
      http.get("/portal/lists", authHeaders(token)),
    ]);
    setFavorites(favRes.data || []);
    setLists(listRes.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const removeFav = async (productId) => {
    await http.delete(`/portal/favorites/${productId}`, authHeaders(token));
    await load();
  };

  const createList = async () => {
    try {
      await http.post("/portal/lists", { name: listName, siteLabel, items: [] }, authHeaders(token));
      setOpenList(false);
      setListName("");
      setSiteLabel("");
      await load();
      setToast({ open: true, severity: "success", message: "Project list created." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed" });
    }
  };

  const addFavsToList = async (listId) => {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;
    const items = [
      ...(list.items || []),
      ...favorites.map((f) => ({
        productId: f.productId?._id,
        name: f.productId?.name,
        quantity: 1,
        imageUrl: f.productId?.imageUrl || "",
        price: f.productId?.price || 0,
      })),
    ];
    await http.put(`/portal/lists/${listId}`, { items }, authHeaders(token));
    await load();
    setToast({ open: true, severity: "success", message: "Favorites added to list." });
  };

  const cartList = (list) => {
    pushToCart(
      (list.items || []).map((i) => ({
        productId: i.productId || i.name,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      }))
    );
    navigate("/cart");
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Favorites & project lists</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Save frequent SKUs and site material packages for faster reorders.
        </Typography>
      </Box>

      <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL }}>Favorite products</Typography>
      {favorites.length === 0 ? (
        <Alert severity="info">
          No favorites yet. Open any product and tap Save to add it here.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {favorites.map((f) => {
            const p = f.productId;
            if (!p) return null;
            return (
              <Grid item xs={12} sm={6} md={4} key={f._id}>
                <Card elevation={0} sx={{ border: "1px solid #dbe4ea", borderRadius: 3 }}>
                  {p.imageUrl ? (
                    <CardMedia component="img" height="140" image={p.imageUrl} alt={p.name} sx={{ objectFit: "cover" }} />
                  ) : null}
                  <CardContent>
                    <Typography sx={{ fontWeight: 800 }}>{p.name}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{formatMoney(p.price)}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<AddShoppingCartRoundedIcon />}
                        onClick={() => {
                          pushToCart([
                            {
                              productId: p._id,
                              name: p.name,
                              price: p.price,
                              quantity: 1,
                              imageUrl: p.imageUrl,
                            },
                          ]);
                          navigate("/cart");
                        }}
                      >
                        Add
                      </Button>
                      <IconButton color="error" onClick={() => removeFav(p._id)}>
                        <FavoriteRoundedIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL }}>Project lists</Typography>
        <Button startIcon={<PlaylistAddRoundedIcon />} variant="outlined" onClick={() => setOpenList(true)}>
          New list
        </Button>
      </Stack>

      {lists.length === 0 ? (
        <Alert severity="info">Create lists like “Waterproofing – Site A” for repeat packages.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {lists.map((list) => (
            <Paper key={list._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{list.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {list.siteLabel || "No site label"} · {(list.items || []).length} item(s)
                  </Typography>
                  {(list.items || []).slice(0, 4).map((i) => (
                    <Typography key={i._id || i.name} sx={{ fontSize: 13 }}>
                      · {i.name} ×{i.quantity}
                    </Typography>
                  ))}
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {favorites.length > 0 && (
                    <Button size="small" onClick={() => addFavsToList(list._id)}>
                      Pull favorites
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    disabled={!list.items?.length}
                    onClick={() => cartList(list)}
                  >
                    Add to cart
                  </Button>
                  <IconButton
                    color="error"
                    onClick={async () => {
                      await http.delete(`/portal/lists/${list._id}`, authHeaders(token));
                      await load();
                    }}
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={openList} onClose={() => setOpenList(false)} fullWidth maxWidth="xs">
        <DialogTitle>New project list</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField label="List name" value={listName} onChange={(e) => setListName(e.target.value)} fullWidth />
            <TextField
              label="Site label (optional)"
              value={siteLabel}
              onChange={(e) => setSiteLabel(e.target.value)}
              fullWidth
              placeholder="e.g. DHA Phase 6 roof"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenList(false)}>Cancel</Button>
          <Button variant="contained" disabled={!listName.trim()} onClick={createList}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};

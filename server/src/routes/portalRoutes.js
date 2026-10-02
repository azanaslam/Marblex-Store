const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const portal = require("../controllers/portalController");

const router = express.Router();

router.use(auth);

router.get("/overview", portal.getOverview);

router.get("/sites", portal.listDeliverySites);
router.post("/sites", portal.addDeliverySite);
router.put("/sites/:siteId", portal.updateDeliverySite);
router.delete("/sites/:siteId", portal.deleteDeliverySite);

router.get("/quotes", portal.listMyQuotes);
router.get("/quotes/:id", portal.getMyQuote);
router.post("/quotes", portal.createQuote);
router.post("/quotes/:id/accept", portal.acceptQuote);

router.get("/tickets", portal.listMyTickets);
router.get("/tickets/:id", portal.getMyTicket);
router.post("/tickets", portal.createTicket);
router.post("/tickets/:id/reply", portal.replyTicket);

router.get("/favorites", portal.listFavorites);
router.post("/favorites", portal.addFavorite);
router.delete("/favorites/:productId", portal.removeFavorite);

router.get("/lists", portal.listProjectLists);
router.post("/lists", portal.createProjectList);
router.put("/lists/:id", portal.updateProjectList);
router.delete("/lists/:id", portal.deleteProjectList);

router.get("/documents", portal.listDocuments);
router.post("/documents/request", portal.requestDocument);

router.get("/admin/quotes", adminOnly, portal.adminListQuotes);
router.patch("/admin/quotes/:id", adminOnly, portal.adminUpdateQuote);
router.get("/admin/tickets", adminOnly, portal.adminListTickets);
router.post("/admin/tickets/:id/reply", adminOnly, portal.adminReplyTicket);
router.get("/admin/documents", adminOnly, portal.adminListDocuments);
router.post("/admin/documents", adminOnly, portal.adminCreateDocument);
router.put("/admin/documents/:id", adminOnly, portal.adminUpdateDocument);
router.delete("/admin/documents/:id", adminOnly, portal.adminDeleteDocument);

module.exports = router;

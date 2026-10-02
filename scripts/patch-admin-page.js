const fs = require("fs");
const path = "client/src/pages/AdminPage.jsx";
let s = fs.readFileSync(path, "utf8");

const tab3OldStart = s.indexOf("            {/* ================= TAB 3: USER ACCESS CONTROL ================= */}");
const tab4Start = s.indexOf("            {/* ================= TAB 4: PRODUCTS STUDIO ================= */}");
if (tab3OldStart < 0 || tab4Start < 0) {
  console.error("tab3 markers fail", tab3OldStart, tab4Start);
  process.exit(1);
}

const tab3New = `            {/* ================= TAB 3: CUSTOMERS ================= */}
            {activeTab === 3 && (
              <TabWrapper3D tabKey={3}>
                <AdminCustomersTab
                  token={token}
                  users={usersData.users || []}
                  pendingAccessCount={pendingAccessCount}
                  showToast={showToast}
                  onToggleAccess={handleToggleUserAccess}
                  onToggleBlock={handleToggleBlockUser}
                  onReload={loadDashboardData}
                />
              </TabWrapper3D>
            )}

`;
s = s.slice(0, tab3OldStart) + tab3New + s.slice(tab4Start);

const tab8OldStart = s.indexOf("            {/* ================= TAB 8: PRODUCT REVIEWS ================= */}");
const tab9Start = s.indexOf("            {/* ================= TAB 9: INSTANT ORDER LOOKUP ================= */}");
if (tab8OldStart < 0 || tab9Start < 0) {
  console.error("tab8 markers fail", tab8OldStart, tab9Start);
  process.exit(1);
}

const tab8New = `            {/* ================= TAB 8: PARTNER SUBMISSIONS ================= */}
            {activeTab === 8 && (
              <TabWrapper3D tabKey={8}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Partner Product Submissions</h2>
                    <p className="text-xs text-[#565e69]">Subowner catalog submissions awaiting admin review / publish</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviewItems.map((item) => (
                      <TiltCard3D
                        key={item._id}
                        maxTilt={3}
                        scale={1.01}
                        className="rounded-2xl bg-white border border-[#e0e6ed] p-4 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1.5 gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5f7fa] text-[#565e69] font-subheading">
                              {item.status}
                            </span>
                            {item.hasAdminUnread ? (
                              <span className="text-[10px] font-black uppercase text-rose-600">Unread</span>
                            ) : null}
                          </div>
                          <h4 className="text-sm font-bold text-[#0a3d52] font-heading">{item.name || "Untitled product"}</h4>
                          <p className="text-xs text-[#565e69] mt-1 line-clamp-3">{item.description || item.comment || "No description"}</p>
                          <p className="text-xs font-bold text-[#0a3d52] mt-2">PKR {Number(item.price || 0).toLocaleString()} · Stock {item.stock ?? 0}</p>
                        </div>
                        <div className="pt-2 border-t border-[#e0e6ed] flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#565e69]">
                            By: <span className="text-[#0a3d52] font-bold">{item.submittedBy?.name || item.userId?.name || "Partner"}</span>
                          </span>
                          <Link to={\`/admin/review/\${item._id}\`} className="text-xs font-bold text-[#ff6b4a] hover:underline">
                            Open review
                          </Link>
                        </div>
                      </TiltCard3D>
                    ))}
                    {!reviewItems.length && (
                      <div className="col-span-full py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                        No partner submissions yet.
                      </div>
                    )}
                  </div>
                </div>
              </TabWrapper3D>
            )}

`;
s = s.slice(0, tab8OldStart) + tab8New + s.slice(tab9Start);

if (!s.includes("activeTab === 12")) {
  const smtpMarker = "            {/* ================= TAB 11: SMTP";
  const idx = s.indexOf(smtpMarker);
  if (idx < 0) {
    console.error("smtp marker missing");
    process.exit(1);
  }
  const extraTabs = `            {activeTab === 12 && (
              <TabWrapper3D tabKey={12}>
                <AdminPaymentQueueTab
                  token={token}
                  orders={orderLookup.all || []}
                  showToast={showToast}
                  onUpdated={loadDashboardData}
                  renderOrderCard={render3DOrderCard}
                />
              </TabWrapper3D>
            )}

            {activeTab === 13 && (
              <TabWrapper3D tabKey={13}>
                <AdminQuotesTab token={token} showToast={showToast} />
              </TabWrapper3D>
            )}

            {activeTab === 14 && (
              <TabWrapper3D tabKey={14}>
                <AdminTicketsTab token={token} showToast={showToast} />
              </TabWrapper3D>
            )}

            {activeTab === 15 && (
              <TabWrapper3D tabKey={15}>
                <AdminDocumentsTab token={token} showToast={showToast} />
              </TabWrapper3D>
            )}

`;
  s = s.slice(0, idx) + extraTabs + s.slice(idx);
}

if (!s.includes("product.category")) {
  const techLabel = '<label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Technical Description</label>';
  const techIdx = s.indexOf(techLabel);
  if (techIdx > 0) {
    const insertAt = s.lastIndexOf("<div>", techIdx);
    const fields = `                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Category</label>
                            <input
                              type="text"
                              value={product.category || "General"}
                              onChange={(e) => setProduct({ ...product, category: e.target.value })}
                              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#0a3d52] pb-2 cursor-pointer">
                              <input type="checkbox" checked={Boolean(product.featured)} onChange={(e) => setProduct({ ...product, featured: e.target.checked })} />
                              Featured
                            </label>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#0a3d52] pb-2 cursor-pointer">
                              <input type="checkbox" checked={product.active !== false} onChange={(e) => setProduct({ ...product, active: e.target.checked })} />
                              Active / Visible
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((idx) => (
                            <div key={idx}>
                              <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Extra image {idx + 1}</label>
                              <input
                                type="text"
                                value={(product.extraImages && product.extraImages[idx]) || ""}
                                onChange={(e) => {
                                  const extra = [...(product.extraImages || ["", "", ""])];
                                  extra[idx] = e.target.value;
                                  setProduct({ ...product, extraImages: extra });
                                }}
                                placeholder="Image URL"
                                className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                              />
                            </div>
                          ))}
                        </div>

`;
    s = s.slice(0, insertAt) + fields + s.slice(insertAt);
  }
}

fs.writeFileSync(path, s);
console.log("AdminPage patched OK");

const fs = require("fs");
const path = "client/src/pages/AdminPage.jsx";
let s = fs.readFileSync(path, "utf8");

if (!s.includes('AdminCommandCenter')) {
  s = s.replace(
    'import { AdminCustomersTab } from "../components/AdminCustomersTab";',
    'import { AdminCustomersTab } from "../components/AdminCustomersTab";\nimport { AdminCommandCenter } from "../components/AdminCommandCenter";'
  );
}

const start = s.indexOf("            {/* ================= TAB 0: COMMAND CENTER / OVERVIEW ================= */}");
const end = s.indexOf("            {/* ================= TAB 1: WEBSITE ORDERS ================= */}");
if (start < 0 || end < 0) {
  console.error("tab markers missing", start, end);
  process.exit(1);
}

const replacement = `            {/* ================= TAB 0: COMMAND CENTER / OVERVIEW ================= */}
            {activeTab === 0 && (
              <TabWrapper3D tabKey={0}>
                <AdminCommandCenter
                  overview={overview}
                  usersData={usersData}
                  products={products}
                  orders={orderLookup.all || []}
                  websiteShare={websiteShare}
                  whatsappShare={whatsappShare}
                  paidShare={paidShare}
                  paymentQueueCount={paymentQueueCount}
                  pendingAccessCount={pendingAccessCount}
                  visualBars={visualBars}
                  onNavigate={setActiveTab}
                />
              </TabWrapper3D>
            )}

`;

s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(path, s);
console.log("Command Center swapped to Figma-style layout");

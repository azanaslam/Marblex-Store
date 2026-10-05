import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const fieldClass =
  "w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] font-semibold text-[#0a3d52] outline-none focus:border-[#ffb39a] focus:bg-white";

export const AdminProductsTab = ({
  products = [],
  filteredProducts = [],
  product,
  setProduct,
  editingProductId,
  isSaving,
  productStudioTab,
  setProductStudioTab,
  productFilter,
  setProductFilter,
  productQuery,
  setProductQuery,
  editorSection,
  setEditorSection,
  topRef,
  onSave,
  onReset,
  onUpload,
  onEdit,
  onDelete,
  onOpenNew,
}) => {
  const stats = {
    total: products.length,
    active: products.filter((p) => p.active !== false).length,
    featured: products.filter((p) => p.featured).length,
    low: products.filter((p) => Number(p.stock || 0) < 5).length,
  };

  const filters = [
    { id: "all", label: "All", count: stats.total },
    { id: "active", label: "Active", count: stats.active },
    { id: "featured", label: "Featured", count: stats.featured },
    { id: "low", label: "Low stock", count: stats.low },
    { id: "hidden", label: "Hidden", count: products.filter((p) => p.active === false).length },
  ];

  return (
    <div ref={topRef} className="space-y-4 sm:space-y-5 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff6b4a] shadow-[0_0_0_4px_rgba(255,107,74,.2)]" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6b8190]">
              Catalog studio
            </span>
          </div>
          <h2 className="text-[22px] sm:text-xl md:text-2xl font-extrabold text-[#0a3d52] font-heading tracking-[-0.4px]">
            Products Catalog
          </h2>
          <p className="text-[12px] sm:text-xs text-[#6b8190] mt-1">
            Manage inventory, publish SKUs, and edit live storefront products
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNew}
          className="self-start sm:self-auto min-h-[42px] px-4 rounded-xl text-[13px] font-extrabold text-white bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_3px_0_#c63f1d]"
        >
          + Add product
        </button>
      </div>

      {/* Main tabs */}
      <div className="inline-flex w-full sm:w-auto gap-1 p-1 rounded-2xl bg-[#e8eef1] shadow-[inset_0_2px_5px_rgba(11,47,61,.12)]">
        {[
          { id: "inventory", label: "Inventory", hint: `${products.length}` },
          {
            id: "editor",
            label: editingProductId ? "Edit product" : "Add product",
            hint: editingProductId ? "editing" : "new",
          },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setProductStudioTab(t.id)}
            className={`flex-1 sm:flex-none min-h-[42px] px-4 rounded-xl text-[13px] font-extrabold transition ${
              productStudioTab === t.id
                ? "bg-white text-[#0a3d52] shadow-[0_2px_6px_rgba(11,47,61,.16)]"
                : "bg-transparent text-[#6b8190]"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-70">{t.hint}</span>
          </button>
        ))}
      </div>

      {productStudioTab === "inventory" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total", value: stats.total, tone: "text-[#0a3d52]" },
              { label: "Active", value: stats.active, tone: "text-emerald-700" },
              { label: "Featured", value: stats.featured, tone: "text-violet-700" },
              { label: "Low stock", value: stats.low, tone: "text-amber-700" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[#e2e8ec] bg-white px-3 py-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#94a3b8]">{s.label}</p>
                <p className={`text-lg font-black mt-0.5 tabular-nums ${s.tone}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="flex-1 flex items-center gap-2 rounded-xl border border-[#e2e8ec] bg-white px-3 py-2.5">
              <SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Search by name or category…"
                className="w-full bg-transparent outline-none text-[13px] font-semibold text-[#0a3d52]"
              />
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setProductFilter(f.id)}
                  className={`shrink-0 min-h-[38px] px-3 rounded-full text-[12px] font-extrabold border ${
                    productFilter === f.id
                      ? "bg-[#0a3d52] text-white border-[#0a3d52]"
                      : "bg-white text-[#6b8190] border-[#e2e8ec]"
                  }`}
                >
                  {f.label}
                  <span className="ml-1 opacity-80">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d5dee4] bg-white px-5 py-14 text-center">
              <p className="text-[15px] font-extrabold text-[#0a3d52]">No products found</p>
              <p className="text-xs text-[#6b8190] mt-1">Try another filter or add a new SKU.</p>
              <button
                type="button"
                onClick={onOpenNew}
                className="mt-4 min-h-[40px] px-4 rounded-xl text-[13px] font-extrabold text-white bg-[#ff6a45]"
              >
                Add product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl bg-white border border-[#e2e8ec] overflow-hidden flex flex-col shadow-[0_8px_20px_-16px_rgba(11,47,61,.28)]"
                >
                  <div className="relative aspect-[16/10] bg-[#eef2f5]">
                    <img
                      src={item.imageUrl || "/products/Banner1.jpeg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {item.featured ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#ff6b4a] text-white">
                          Featured
                        </span>
                      ) : null}
                      {item.active === false ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-900/85 text-white">
                          Hidden
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={`absolute top-2 right-2 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                        Number(item.stock || 0) < 5
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-white/95 text-[#0a3d52] border-white/80"
                      }`}
                    >
                      Stock {item.stock || 0}
                    </div>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                      {item.category || "General"}
                    </p>
                    <h4 className="text-[14px] font-extrabold text-[#0a3d52] leading-snug mt-0.5 line-clamp-2">
                      {item.name}
                    </h4>
                    <p className="text-[15px] font-black text-[#ff6b4a] mt-2 tabular-nums">
                      PKR {Number(item.price || 0).toLocaleString()}
                    </p>
                    <div className="mt-auto pt-3 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="min-h-[42px] rounded-xl bg-[#0a3d52] text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 shadow-[0_3px_0_#07202b]"
                      >
                        <EditOutlinedIcon sx={{ fontSize: 15 }} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item._id)}
                        className="min-h-[42px] min-w-[42px] rounded-xl bg-rose-50 text-rose-600 border border-rose-200 grid place-items-center"
                        aria-label="Delete product"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      ) : (
        <section className="rounded-2xl border border-[#e2e8ec] bg-white overflow-hidden shadow-[0_12px_28px_-18px_rgba(11,47,61,.28)]">
          <div className="px-3.5 sm:px-5 pt-4 pb-3 border-b border-[#eef2f5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-[15px] font-extrabold text-[#0a3d52]">
                {editingProductId ? "Edit product" : "Add new product"}
              </h3>
              <p className="text-[11px] text-[#6b8190] mt-0.5">
                {editingProductId ? "Update live catalog details" : "Publish a new SKU to the storefront"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setProductStudioTab("inventory");
                }}
                className="min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold text-[#6b8190] bg-[#f8fafc] border border-[#e2e8ec]"
              >
                Back to inventory
              </button>
              {editingProductId ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold text-[#0a3d52] bg-white border border-[#e2e8ec]"
                >
                  Clear / new
                </button>
              ) : null}
            </div>
          </div>

          {/* Editor sub-tabs */}
          <div className="px-3.5 sm:px-5 pt-3">
            <div className="inline-flex w-full sm:w-auto gap-1 p-1 rounded-xl bg-[#f1f5f9]">
              {[
                { id: "basics", label: "Basics" },
                { id: "media", label: "Media" },
                { id: "details", label: "Details" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setEditorSection(s.id)}
                  className={`flex-1 sm:flex-none min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold ${
                    editorSection === s.id ? "bg-white text-[#0a3d52] shadow-sm" : "text-[#6b8190]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_280px] gap-4">
            <div className="space-y-3">
              {editorSection === "basics" ? (
                <>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                      Product name
                    </span>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      placeholder="e.g. MARBLEX Rubber Water Stopper 150mm"
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="block">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                        Price (PKR)
                      </span>
                      <input
                        type="number"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                        Stock
                      </span>
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                      Category
                    </span>
                    <input
                      type="text"
                      value={product.category || "General"}
                      onChange={(e) => setProduct({ ...product, category: e.target.value })}
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl border border-[#e2e8ec] bg-[#f8fafc] text-[12px] font-extrabold text-[#0a3d52] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(product.featured)}
                        onChange={(e) => setProduct({ ...product, featured: e.target.checked })}
                        className="accent-[#ff6b4a]"
                      />
                      Featured
                    </label>
                    <label className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl border border-[#e2e8ec] bg-[#f8fafc] text-[12px] font-extrabold text-[#0a3d52] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.active !== false}
                        onChange={(e) => setProduct({ ...product, active: e.target.checked })}
                        className="accent-[#0a3d52]"
                      />
                      Visible
                    </label>
                  </div>
                </>
              ) : null}

              {editorSection === "media" ? (
                <>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                      Primary image URL
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={product.imageUrl}
                        onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                        placeholder="/products/Banner1.jpeg or URL"
                        className={`${fieldClass} flex-1`}
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 rounded-xl text-[12px] font-extrabold text-[#0a3d52] bg-white border border-[#e2e8ec] cursor-pointer shrink-0">
                        <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
                        Upload
                        <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
                      </label>
                    </div>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[0, 1, 2].map((idx) => (
                      <label key={idx} className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                          Extra image {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={(product.extraImages && product.extraImages[idx]) || ""}
                          onChange={(e) => {
                            const extra = [...(product.extraImages || ["", "", ""])];
                            extra[idx] = e.target.value;
                            setProduct({ ...product, extraImages: extra });
                          }}
                          placeholder="Image URL"
                          className={fieldClass}
                        />
                      </label>
                    ))}
                  </div>
                </>
              ) : null}

              {editorSection === "details" ? (
                <label className="block">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                    Technical description
                  </span>
                  <textarea
                    rows={8}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    placeholder="Industrial specs, usage, waterproofing standards…"
                    className={`${fieldClass} resize-y`}
                  />
                </label>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 min-h-[46px] rounded-xl text-[13px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_4px_0_#c63f1d] disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : editingProductId ? "Update product" : "Publish product"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditorSection(
                      editorSection === "basics" ? "media" : editorSection === "media" ? "details" : "basics"
                    )
                  }
                  className="min-h-[46px] px-4 rounded-xl text-[13px] font-extrabold text-[#0a3d52] bg-[#f8fafc] border border-[#e2e8ec]"
                >
                  {editorSection === "details" ? "Back to basics" : "Next section →"}
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#e2e8ec] bg-[#f8fafc] p-3.5 order-first lg:order-none">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94a3b8] mb-3">Live preview</p>
              <div className="rounded-2xl bg-white border border-[#e2e8ec] overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#eef2f5]">
                  <img
                    src={product.imageUrl || "/products/Banner1.jpeg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {product.featured ? (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#ff6b4a] text-white">
                        Featured
                      </span>
                    ) : null}
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-white ${
                        product.active === false ? "bg-slate-800" : "bg-emerald-600"
                      }`}
                    >
                      {product.active === false ? "Hidden" : "Live"}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
                    {product.category || "General"}
                  </p>
                  <h4 className="text-[13px] font-extrabold text-[#0a3d52] mt-0.5 line-clamp-2">
                    {product.name || "Product name"}
                  </h4>
                  <p className="text-[14px] font-black text-[#ff6b4a] mt-1.5 tabular-nums">
                    PKR {Number(product.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
};

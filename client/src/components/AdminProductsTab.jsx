import { useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";

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

  // Variant Helpers
  const addVariantRow = () => {
    const list = [...(product.variants || [])];
    list.push({
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      label: "",
      price: product.price || 0,
      stock: product.stock || 0,
    });
    setProduct({ ...product, variants: list });
  };

  const updateVariantRow = (idx, field, value) => {
    const list = [...(product.variants || [])];
    list[idx] = { ...list[idx], [field]: value };
    setProduct({ ...product, variants: list });
  };

  const removeVariantRow = (idx) => {
    const list = (product.variants || []).filter((_, i) => i !== idx);
    setProduct({ ...product, variants: list });
  };

  // Bulk Tier Helpers
  const addBulkTierRow = () => {
    const list = [...(product.bulkTiers || [])];
    list.push({
      minQty: 10,
      price: Math.max(0, (product.price || 100) - 100),
    });
    setProduct({ ...product, bulkTiers: list });
  };

  const updateBulkTierRow = (idx, field, value) => {
    const list = [...(product.bulkTiers || [])];
    list[idx] = { ...list[idx], [field]: Number(value) };
    setProduct({ ...product, bulkTiers: list });
  };

  const removeBulkTierRow = (idx) => {
    const list = (product.bulkTiers || []).filter((_, i) => i !== idx);
    setProduct({ ...product, bulkTiers: list });
  };

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
            Manage inventory, variants, wholesale bulk tiers, and storefront products
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
          {/* Inventory Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setProductFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    productFilter === f.id
                      ? "bg-[#0a3d52] text-white shadow-sm"
                      : "bg-white border border-[#e2e8ec] text-[#6b8190] hover:text-[#0a3d52]"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <div className="relative min-w-[220px]">
              <SearchIcon
                sx={{ fontSize: 18 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#e2e8ec] bg-white text-xs text-[#0a3d52] outline-none focus:border-[#ff6b4a]"
              />
            </div>
          </div>

          {/* Product Inventory Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const isLow = Number(p.stock || 0) < 5;
              const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
              const hasTiers = Array.isArray(p.bulkTiers) && p.bulkTiers.length > 0;

              return (
                <div
                  key={p._id}
                  className="rounded-2xl border border-[#e2e8ec] bg-white p-3.5 shadow-xs flex flex-col justify-between gap-3 hover:border-[#ffb39a] transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={p.imageUrl || "/products/Banner1.jpeg"}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "/products/Banner1.jpeg";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0a3d52] truncate mb-0.5">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{p.category || "General"}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-extrabold text-xs text-[#0a3d52]">
                          PKR {Number(p.price || 0).toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isLow
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          Stock: {p.stock || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges for variants & tiers */}
                  {(hasVariants || hasTiers) && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                      {hasVariants && (
                        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                          {p.variants.length} Variants
                        </span>
                      )}
                      {hasTiers && (
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          {p.bulkTiers.length} Bulk Tiers
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0a3d52] bg-slate-100 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p._id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Editor Mode */
        <div className="rounded-2xl border border-[#e2e8ec] bg-white shadow-sm overflow-hidden">
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
                className="min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold text-[#6b8190] bg-[#f8fafc] border border-[#e2e8ec] cursor-pointer"
              >
                Back to inventory
              </button>
              {editingProductId ? (
                <button
                  type="button"
                  onClick={onReset}
                  className="min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold text-[#0a3d52] bg-white border border-[#e2e8ec] cursor-pointer"
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
                { id: "variants", label: "Variants" },
                { id: "bulkTiers", label: "Bulk Tiers" },
                { id: "coverage", label: "Coverage & Tools" },
                { id: "media", label: "Media" },
                { id: "details", label: "Details" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setEditorSection(s.id)}
                  className={`flex-1 sm:flex-none min-h-[36px] px-3 rounded-lg text-[12px] font-extrabold cursor-pointer ${
                    editorSection === s.id ? "bg-white text-[#0a3d52] shadow-sm" : "text-[#6b8190]"
                  }`}
                >
                  {s.label}
                  {s.id === "variants" && (product.variants?.length || 0) > 0 && ` (${product.variants.length})`}
                  {s.id === "bulkTiers" && (product.bulkTiers?.length || 0) > 0 && ` (${product.bulkTiers.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_280px] gap-4">
            <div className="space-y-3">
              {/* SECTION: BASICS */}
              {editorSection === "basics" ? (
                <>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                      Product name *
                    </span>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => setProduct({ ...product, name: e.target.value })}
                      placeholder="e.g. MARBLEX Rubber Water Stopper 150mm"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 mb-1">
                      Product name (Urdu / اردو)
                    </span>
                    <input
                      type="text"
                      dir="rtl"
                      value={product.nameUr || ""}
                      onChange={(e) => setProduct({ ...product, nameUr: e.target.value })}
                      placeholder="مثال: ماربلیکس واٹر پروفنگ کیمیکل"
                      className={fieldClass}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="block">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                        Base Price (PKR) *
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
                        Base Stock *
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

              {/* SECTION: VARIANTS */}
              {editorSection === "variants" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0a3d52]">Product Variants</h4>
                      <p className="text-[11px] text-slate-500">
                        Add package sizes (e.g. 5kg, 20kg), dimensions, or specifications with custom price & stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="px-3 py-1.5 rounded-lg bg-[#0a3d52] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      Add Variant
                    </button>
                  </div>

                  {(!product.variants || product.variants.length === 0) ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No variants added. Base price and base stock will be used for this product.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {product.variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                        >
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Label (e.g. 20kg Bucket)</span>
                              <input
                                type="text"
                                value={v.label || ""}
                                placeholder="e.g. 20kg"
                                onChange={(e) => updateVariantRow(idx, "label", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">SKU</span>
                              <input
                                type="text"
                                value={v.sku || ""}
                                placeholder="SKU-20KG"
                                onChange={(e) => updateVariantRow(idx, "sku", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Price (PKR)</span>
                              <input
                                type="number"
                                value={v.price || 0}
                                onChange={(e) => updateVariantRow(idx, "price", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Stock</span>
                              <input
                                type="number"
                                value={v.stock || 0}
                                onChange={(e) => updateVariantRow(idx, "stock", Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariantRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer self-end sm:self-center"
                            title="Remove variant"
                          >
                            <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* SECTION: BULK TIERS */}
              {editorSection === "bulkTiers" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0a3d52]">Wholesale Bulk Pricing Tiers</h4>
                      <p className="text-[11px] text-slate-500">
                        Automatic quantity discounts (e.g. Buy 10+ units $\rightarrow$ Rs 4,800/unit).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addBulkTierRow}
                      className="px-3 py-1.5 rounded-lg bg-[#0a3d52] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      Add Tier
                    </button>
                  </div>

                  {(!product.bulkTiers || product.bulkTiers.length === 0) ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No bulk pricing tiers set. Standard unit price will apply at all quantities.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {product.bulkTiers.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Minimum Qty</span>
                              <input
                                type="number"
                                value={t.minQty || 0}
                                placeholder="10"
                                onChange={(e) => updateBulkTierRow(idx, "minQty", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Discounted Price / Unit (PKR)</span>
                              <input
                                type="number"
                                value={t.price || 0}
                                placeholder="4800"
                                onChange={(e) => updateBulkTierRow(idx, "price", e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-emerald-600"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBulkTierRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                            title="Remove tier"
                          >
                            <RemoveCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* SECTION: MEDIA */}
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

              {/* SECTION: COVERAGE & APPLICATIONS */}
              {editorSection === "coverage" ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0a3d52]">Coverage Calculator Settings</h4>
                    <p className="text-[11px] text-slate-500">
                      Configure consumption parameters used by the on-site calculator.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Coverage Unit</span>
                      <select
                        value={product.coverage?.unit || "sqft"}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            coverage: { ...(product.coverage || {}), unit: e.target.value },
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="sqft">Square Feet (sq ft)</option>
                        <option value="sqm">Square Metres (sq m)</option>
                        <option value="lm">Linear Metres (lm / waterstop)</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Consumption per Unit</span>
                      <input
                        type="number"
                        step="0.01"
                        value={product.coverage?.perUnit || 0.25}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            coverage: { ...(product.coverage || {}), perUnit: Number(e.target.value) },
                          })
                        }
                        className={fieldClass}
                        placeholder="e.g. 0.25 kg or litres"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Recommended Coats</span>
                      <input
                        type="number"
                        value={product.coverage?.coats || 2}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            coverage: { ...(product.coverage || {}), coats: Number(e.target.value) },
                          })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 mb-0.5">Default Wastage %</span>
                      <input
                        type="number"
                        value={product.coverage?.wastagePercent !== undefined ? product.coverage.wastagePercent : 10}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            coverage: { ...(product.coverage || {}), wastagePercent: Number(e.target.value) },
                          })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Commercial Pack Sizes (comma-separated numbers e.g. 5, 20)
                    </span>
                    <input
                      type="text"
                      value={Array.isArray(product.coverage?.packSizes) ? product.coverage.packSizes.join(", ") : "5, 20"}
                      onChange={(e) => {
                        const sizes = e.target.value
                          .split(",")
                          .map((s) => Number(s.trim()))
                          .filter((n) => !isNaN(n) && n > 0);
                        setProduct({
                          ...product,
                          coverage: { ...(product.coverage || {}), packSizes: sizes },
                        });
                      }}
                      className={fieldClass}
                      placeholder="e.g. 5, 20"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wide text-[#0a3d52] mb-1.5">
                      Suitable Project Applications (for Product Selector)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "roof", label: "Roof & Terrace" },
                        { id: "basement", label: "Basement / Retaining" },
                        { id: "water-tank", label: "Water Tank / Pool" },
                        { id: "bathroom", label: "Bathroom / Wet Area" },
                        { id: "floor", label: "Industrial Floor" },
                        { id: "joint", label: "Expansion Joints" },
                      ].map((app) => {
                        const currentApps = product.applications || [];
                        const isChecked = currentApps.includes(app.id);
                        return (
                          <label
                            key={app.id}
                            className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...currentApps, app.id]
                                  : currentApps.filter((x) => x !== app.id);
                                setProduct({ ...product, applications: next });
                              }}
                              className="accent-[#0a3d52]"
                            />
                            <span>{app.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* SECTION: DETAILS */}
              {editorSection === "details" ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#6b8190] mb-1">
                      Technical description (English)
                    </span>
                    <textarea
                      rows={6}
                      value={product.description}
                      onChange={(e) => setProduct({ ...product, description: e.target.value })}
                      placeholder="Industrial specs, usage, waterproofing standards…"
                      className={`${fieldClass} resize-y`}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 mb-1">
                      Technical description (Urdu / اردو)
                    </span>
                    <textarea
                      rows={6}
                      dir="rtl"
                      value={product.descriptionUr || ""}
                      onChange={(e) => setProduct({ ...product, descriptionUr: e.target.value })}
                      placeholder="استعمال کا طریقہ، صنعتی تفصیلات اور فوائد..."
                      className={`${fieldClass} resize-y`}
                    />
                  </label>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 min-h-[46px] rounded-xl text-[13px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_4px_0_#c63f1d] disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? "Saving…" : editingProductId ? "Update product" : "Publish product"}
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-[#e2e8ec] bg-[#f8fafc] p-3.5 order-first lg:order-none">
              <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-[#0a3d52] mb-2">
                Live Preview
              </h4>
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <img
                  src={product.imageUrl || "/products/Banner1.jpeg"}
                  alt={product.name || "Preview"}
                  className="w-full h-36 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.currentTarget.src = "/products/Banner1.jpeg";
                  }}
                />
                <h5 className="font-bold text-xs text-[#0a3d52] truncate">
                  {product.name || "Product Name"}
                </h5>
                <p className="text-[11px] text-slate-400">{product.category || "General"}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-extrabold text-xs text-[#0a3d52]">
                    PKR {Number(product.price || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Stock: {product.stock || 0}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};

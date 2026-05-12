import { memo, useState } from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const ProductCardComponent = ({ product, onAddToCart, onOpenProduct }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart({ ...product, quantity });
    setQuantity(1); // Reset after adding
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-rose-300">
      
      {/* Image Section */}
      <div className="relative h-[240px] overflow-hidden bg-slate-50 cursor-pointer" onClick={() => onOpenProduct?.(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-xl font-black text-sm shadow-lg shadow-slate-900/10 border border-slate-100">
          PKR {product.price.toLocaleString()}
        </div>
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5 sm:p-6 cursor-pointer" onClick={() => onOpenProduct?.(product)}>
        <h3 className="text-xl font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-slate-500 mb-6 flex-grow line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </p>
        
        {/* Add to Cart Controls */}
        <div className="mt-auto flex flex-col gap-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden w-[110px] shadow-sm">
              <button 
                onClick={handleDecrement}
                className="w-10 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
              >
                <RemoveIcon sx={{ fontSize: 16 }} />
              </button>
              <div className="flex-1 h-11 flex items-center justify-center font-bold text-slate-900 text-sm border-x border-slate-200 bg-white">
                {quantity}
              </div>
              <button 
                onClick={handleIncrement}
                className="w-10 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            {/* Add Button */}
            <button 
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-rose-600/30 active:scale-[0.98]"
            >
              <ShoppingCartOutlinedIcon fontSize="small" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);

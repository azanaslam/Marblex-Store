const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err && err.errors) {
      const fieldErrors = {};
      err.errors.forEach((e) => {
        const field = e.path.join(".") || "error";
        fieldErrors[field] = e.message;
      });
      return res.status(400).json({
        message: err.errors[0]?.message || "Validation failed",
        errors: fieldErrors,
      });
    }
    return res.status(400).json({ message: "Invalid request payload" });
  }
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  industryType: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z.string().trim().min(9, "Valid contact phone number is required"),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  areaSize: z.string().trim().optional(),
  deliveryDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  channel: z.enum(["website", "whatsapp"]).optional(),
  paymentMethod: z.enum(["cod", "stripe", "easypaisa", "jazzcash", "bank_transfer"]).optional(),
  transactionReference: z.string().trim().optional(),
  paymentScreenshotUrl: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        _id: z.string().optional(),
        name: z.string().trim().min(1, "Item name is required"),
        price: z.number().nonnegative().optional(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        imageUrl: z.string().optional(),
      })
    )
    .min(1, "Order must contain at least 1 item"),
});

const quoteSchema = z.object({
  contactName: z.string().trim().optional(),
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  siteAddress: z.string().trim().optional(),
  projectName: z.string().trim().optional(),
  company: z.string().trim().optional(),
  message: z.string().trim().optional(),
  items: z.array(z.any()).optional(),
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Valid email address is required"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(3, "Message must be at least 3 characters"),
});

const ticketSchema = z.object({
  subject: z.string().trim().min(2, "Subject is required"),
  body: z.string().trim().min(2, "Message is required"),
  category: z.string().trim().optional(),
  priority: z.enum(["normal", "high"]).optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  nameUr: z.string().trim().optional(),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  imageUrl: z.string().trim().optional(),
  extraImages: z.array(z.string()).optional(),
  description: z.string().trim().optional(),
  descriptionUr: z.string().trim().optional(),
  category: z.string().trim().optional(),
  categoryUr: z.string().trim().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  orderSchema,
  quoteSchema,
  contactSchema,
  ticketSchema,
  productSchema,
};


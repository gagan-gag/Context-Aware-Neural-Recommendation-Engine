# AVERO — Luxury H&M AI Recommendation Engine

<p align="center">
  <strong>Next.js 16 + React 19 + TailwindCSS v4 + Framer Motion + TypeScript</strong><br>
  Luxury fashion recommendation platform built exclusively for H&M product collections with zero image blinking and real-time neural matching.
</p>

---

## ⚡ How to Run

### 1. Navigate to the frontend directory
```bash
cd "d:\INTERNSHIP's\ZAALIMA\Context-Aware Neural Recommendation Engine\frontend\avero-next"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

> **Open in your browser:** **[http://localhost:3000](http://localhost:3000)**  
> **Direct to Recommendations:** **[http://localhost:3000/recommendations](http://localhost:3000/recommendations)**

---

## 🌟 Key Architecture & Fixes Implemented

### 1. 🛡️ Zero Image Blinking & Flashing (`OptimizedProductImage.tsx`)
- **Root Cause Eliminated:** Re-renders on hover or filter changes no longer reset image loading state or re-render skeleton overlays.
- **Session Cache:** Uses a module-level `LOADED_IMAGES_CACHE` Set so previously loaded images render immediately at 100% opacity with zero delay.
- **Smooth 300ms Fade-In:** Initial loads fade in smoothly without layout shift.
- **CSS Anti-Flash Rule:** Applied `img { animation: none !important; backface-visibility: hidden; }` in `globals.css`.
- **Config Stability:** Configured `images: { unoptimized: true }` in `next.config.ts` to eliminate server proxy reload loops.

### 2. 👗 Authentic H&M Product Data (`lib/mockData.ts`)
- Features 16 realistic H&M products from **H&M Studio**, **H&M Premium Selection**, **H&M Edition**, **H&M Trend**, and **H&M Basics**.
- High-definition fashion model editorial images.
- Full metadata including categories (tops, outerwear, dresses, bottoms, knitwear, footwear, accessories), material composition, care instructions, color palettes, and size ranges.
- Dual pricing in **INR (`₹`)** and **USD (`$`)**.

### 3. 🎯 Working Neural Recommendation Engine (`lib/recommendationEngine.ts`)
- `getRecommendations(userId, filters, topK = 16)`:
  - **Category Filter:** Real-time collection filtering.
  - **Price Range:** Smooth range slider filtering in Indian Rupees.
  - **Minimum Rating:** Radio filter for 4.0+, 4.5+, and top-rated items.
  - **Sorting:** AI Relevance (neural match score descending), Price: Low → High, Price: High → Low, and Rating.

### 4. 💎 Premium Luxury Product Cards (`PremiumProductCard.tsx`)
- Square aspect ratio with smooth hover overlay.
- Gold **AI Match Pill** (e.g., `98% Match`).
- Red **Discount Badge** (e.g., `-25%`).
- Interactive **Color Swatches** and **Size Pills**.
- Quick Actions on hover: **Buy Now**, **Wishlist Heart** (animated toggle with toast), and **Share Link**.

### 5. 📱 Elite Responsive Grid (`PremiumProductGrid.tsx`)
- 4 columns on desktop (>1024px), 3 columns on tablet (640-1024px), 2 columns on mobile (<640px).
- 24px grid gap with staggered entry animations.
- Dedicated 12-skeleton pulse loading state.
- Graceful empty state with *"Browse All Products"* reset button.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs Next.js Turbopack development server on `http://localhost:3000` |
| `npm run build` | Compiles optimized production bundle |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint analysis |
| `npx tsc --noEmit` | Runs full TypeScript validation (0 errors) |

---

## 🐳 Docker Deployment

```bash
docker build -t avero-hm-frontend .
docker run -p 3000:3000 avero-hm-frontend
```

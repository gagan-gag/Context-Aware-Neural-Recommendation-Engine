'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle, 
  Search, 
  Sparkles, 
  X, 
  CheckCircle2,
  RefreshCw,
  Database,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  List,
  Eye,
  SlidersHorizontal,
  Tag,
  DollarSign
} from 'lucide-react';
import { 
  fetchAllCatalogProducts, 
  createCustomProduct, 
  updateCustomProduct, 
  deleteCustomProduct, 
  ProductItem, 
  ProductCreatePayload 
} from '@/lib/api';

const DEPARTMENTS = ['Women', 'Men', 'Kids', 'Shoes', 'Collections'] as const;

const DEPARTMENT_SUBCATEGORIES: Record<string, string[]> = {
  'Women': ['Dresses & Skirts', 'Tops & Shirts', 'Trousers & Jeans', 'Knitwear', 'Outerwear'],
  'Men': ['Tops & Shirts', 'Trousers & Jeans', 'Outerwear', 'Knitwear'],
  'Kids': ['Tops & Shirts', 'Trousers & Jeans', 'Dresses & Skirts'],
  'Shoes': ['Footwear'],
  'Collections': ['Seasonal Collections', 'Bags & Accessories'],
};

// Quick isolated studio packshots for 1-click selection during editing/adding
const PRESET_PACKSHOTS = [
  { label: 'Red Chiffon Maxi', url: '/catalog/0751471001.jpg', dept: 'Women' },
  { label: 'Burgundy Satin Dress', url: '/catalog/0865857002.jpg', dept: 'Women' },
  { label: 'Beige Rib Jumper', url: '/catalog/0583845001.jpg', dept: 'Women' },
  { label: 'Black Tailored Blazer', url: '/catalog/0730713001.jpg', dept: 'Women' },
  { label: 'White Oxford Shirt', url: '/catalog/0685687001.jpg', dept: 'Men' },
  { label: 'Varsity Bomber Jacket', url: '/catalog/0918522002.jpg', dept: 'Men' },
  { label: 'Straight Denim Jeans', url: '/catalog/0834478001.jpg', dept: 'Men' },
  { label: 'Slim Fit Denim', url: '/catalog/0800487001.jpg', dept: 'Men' },
  { label: 'Grey Cotton Hoodie', url: '/catalog/0741547001.jpg', dept: 'Men' },
  { label: 'Kids Organic Romper', url: '/catalog/0761234001.jpg', dept: 'Kids' },
  { label: 'Kids Striped Polo', url: '/catalog/0761234002.jpg', dept: 'Kids' },
  { label: 'Kids Denim Overalls', url: '/catalog/0761234003.jpg', dept: 'Kids' },
];

export function ProductManagementPanel() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [activeDepartment, setActiveDepartment] = useState<string>('Women');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields for Add/Edit
  const [formData, setFormData] = useState<ProductCreatePayload>({
    article_id: '',
    product_name: '',
    category: 'Dresses',
    department: 'Women',
    subcategory: 'Dresses & Skirts',
    price_inr: 2999,
    image_url: '/catalog/0751471001.jpg',
    description: '',
    color: 'Red',
  });
  const [idError, setIdError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchAllCatalogProducts();
      setProducts(res.products);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Department counts
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DEPARTMENTS.forEach((d) => {
      counts[d] = products.filter(
        (p) => ((p as any).department || 'Women').toLowerCase() === d.toLowerCase()
      ).length;
    });
    return counts;
  }, [products]);

  // Filtered & Sorted products based on department, subcategory, search & sorting
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Normalize department
      const prodDept = (p as any).department || 'Women';
      const matchDept = prodDept.toLowerCase() === activeDepartment.toLowerCase();

      // Subcategory match
      const prodSub = (p as any).subcategory || p.category;
      const matchSub = selectedSubcategory === 'all' || prodSub === selectedSubcategory;

      // Search match
      const matchSearch =
        !searchQuery ||
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.article_id.includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.color && p.color.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchDept && matchSub && matchSearch;
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price_inr - b.price_inr);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price_inr - a.price_inr);
    }

    return list;
  }, [products, activeDepartment, selectedSubcategory, searchQuery, sortBy]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const defaultImage = PRESET_PACKSHOTS.find((p) => p.dept === activeDepartment)?.url || '/catalog/0751471001.jpg';
    setFormData({
      article_id: `0999${randomSuffix}01`,
      product_name: '',
      category: activeDepartment === 'Shoes' ? 'Footwear' : 'Dresses',
      department: activeDepartment,
      subcategory: DEPARTMENT_SUBCATEGORIES[activeDepartment]?.[0] || 'Tops & Shirts',
      price_inr: 2999,
      image_url: defaultImage,
      description: 'Handcrafted luxury garment with tailored seams and high neural compatibility.',
      color: 'Black',
    });
    setIdError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      article_id: prod.article_id,
      product_name: prod.product_name,
      category: prod.category,
      department: (prod as any).department || activeDepartment,
      subcategory: (prod as any).subcategory || DEPARTMENT_SUBCATEGORIES[activeDepartment]?.[0] || 'Tops & Shirts',
      price_inr: prod.price_inr,
      image_url: prod.image_url,
      description: prod.description || '',
      color: prod.color || 'Black',
    });
    setIdError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdError(null);

    if (!formData.article_id.trim()) {
      setIdError('Article ID is required.');
      return;
    }

    if (!editingProduct) {
      const exists = products.some((p) => p.article_id === formData.article_id.trim());
      if (exists) {
        setIdError(`Article ID ${formData.article_id} already exists in the catalog.`);
        return;
      }
    }

    try {
      if (editingProduct) {
        await updateCustomProduct(editingProduct.article_id, formData);
        setFeedbackMsg({ type: 'success', text: `Product ${formData.article_id} updated successfully.` });
      } else {
        await createCustomProduct(formData);
        setFeedbackMsg({ type: 'success', text: `Product ${formData.article_id} ingested into CAN pool.` });
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setIdError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm(`Are you sure you want to delete custom product ${articleId}?`)) {
      return;
    }
    try {
      await deleteCustomProduct(articleId);
      setFeedbackMsg({ type: 'success', text: `Product ${articleId} removed.` });
      await loadProducts();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Failed to delete product.' });
    }
  };

  useEffect(() => {
    if (!feedbackMsg) return;
    const t = setTimeout(() => setFeedbackMsg(null), 4000);
    return () => clearTimeout(t);
  }, [feedbackMsg]);

  const availableSubcategories = DEPARTMENT_SUBCATEGORIES[activeDepartment] || [];

  return (
    <div className="bg-white border border-[#E8E8E4] rounded-2xl overflow-hidden shadow-xs">
      {/* Top Header & Metrics Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E8E8E4] flex flex-wrap items-center justify-between gap-4 bg-[#FBFBFA]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#171717] tracking-tight flex items-center gap-2">
              Catalog Management &amp; Candidate Ingestion Studio
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase font-semibold">
                Neural Pool
              </span>
            </h3>
            <p className="text-xs text-[#737370]">
              Real-time garment catalog mutation with instant embedding re-scoring
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View switcher: Grid vs Table */}
          <div className="flex bg-[#F0F0ED] p-1 rounded-xl border border-[#E5E5E0] text-xs">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewLayout === 'grid' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737370] hover:text-[#171717]'
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium text-[11px]">Gallery</span>
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                viewLayout === 'table' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#737370] hover:text-[#171717]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium text-[11px]">Table</span>
            </button>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="p-2 text-[#737370] hover:text-[#171717] hover:bg-[#F0F0ED] rounded-xl border border-[#E5E5E0] transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`mx-5 mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-[#8E8E88] hover:text-[#171717]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Department Tabs with Badge Counts */}
      <div className="px-5 pt-3 border-b border-[#E8E8E4] bg-[#FAF9F6] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {DEPARTMENTS.map((dept) => {
          const count = deptCounts[dept] || 0;
          const isActive = activeDepartment === dept;
          return (
            <button
              key={dept}
              onClick={() => {
                setActiveDepartment(dept);
                setSelectedSubcategory('all');
              }}
              className={`pb-3 px-3.5 text-xs font-semibold tracking-tight transition-all relative whitespace-nowrap flex items-center gap-2 ${
                isActive ? 'text-[#171717]' : 'text-[#737370] hover:text-[#171717]'
              }`}
            >
              <span>{dept}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-[#171717] text-white' : 'bg-[#EAEAE6] text-[#737370]'
                }`}
              >
                {count}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-3.5 bg-white border-b border-[#E8E8E4] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Subcategories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[#8E8E88] text-[11px] font-semibold uppercase mr-1">Section:</span>
          {['all', ...availableSubcategories].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedSubcategory === sub
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-[#FAF9F6] text-[#555] hover:text-[#111] border border-[#E0E0DB]'
              }`}
            >
              {sub === 'all' ? 'All Items' : sub}
            </button>
          ))}
        </div>

        {/* Sort & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] focus:outline-none"
          >
            <option value="relevance">Sort: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8E8E88]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DCDCD6] rounded-xl text-xs text-[#171717] placeholder-[#8E8E88] focus:outline-none focus:border-[#171717]"
            />
          </div>
        </div>
      </div>

      {/* Main View Area: Gallery Grid View or Table View */}
      {viewLayout === 'grid' ? (
        <div className="p-5 sm:p-6 bg-[#FAFAF8]">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-[#8E8E88] text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 text-[#C0C0B8]" />
              <p>No products found matching your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.article_id}
                  className="group bg-white rounded-xl border border-[#E8E8E4] overflow-hidden hover:border-[#B8B8B0] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Image Container with 3:4 aspect ratio */}
                  <div className="relative w-full aspect-[3/4] bg-[#F5F5F2] overflow-hidden">
                    <Image
                      src={prod.image_url || '/placeholder-garment.svg'}
                      alt={prod.product_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {/* Floating Match Pill */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
                      {(((prod as any).score || 0.92) * 100).toFixed(0)}% CAN
                    </div>

                    {/* Quick Edit Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-2 rounded-lg bg-white text-[#171717] hover:bg-neutral-100 shadow-md transition-transform hover:scale-110"
                        title="Edit Garment"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {prod.article_id.startsWith('0999') && (
                        <button
                          onClick={() => handleDelete(prod.article_id)}
                          className="p-2 rounded-lg bg-white text-rose-600 hover:bg-rose-50 shadow-md transition-transform hover:scale-110"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Garment Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#8E8E88] block truncate">
                        #{prod.article_id}
                      </span>
                      <h4 className="text-xs font-bold text-[#171717] leading-snug truncate mt-0.5" title={prod.product_name}>
                        {prod.product_name}
                      </h4>
                      <p className="text-[11px] text-[#737370] mt-0.5">
                        {prod.color || 'Classic'} • {prod.category}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#F0F0EC] flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#171717]">
                        ₹{prod.price_inr.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Table Layout */
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF9F6] text-[#737370] sticky top-0 border-b border-[#E8E8E4] z-10">
              <tr>
                <th className="p-3.5">Product Image</th>
                <th className="p-3.5">Article ID</th>
                <th className="p-3.5">Garment Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price (INR)</th>
                <th className="p-3.5">Origin / Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0ED] text-[#444441]">
              {filteredProducts.map((prod) => (
                <tr key={prod.article_id} className="hover:bg-[#F9F9F7] transition-colors">
                  <td className="p-3.5">
                    <div className="relative w-10 h-[54px] rounded-md overflow-hidden bg-[#F5F5F3] border border-[#E0E0DB]">
                      <Image
                        src={prod.image_url || '/placeholder-garment.svg'}
                        alt={prod.product_name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[#737370]">{prod.article_id}</td>
                  <td className="p-3.5 font-bold text-[#171717] max-w-xs truncate">
                    {prod.product_name}
                    {prod.color && <span className="text-[#8E8E88] font-normal block text-[11px]">{prod.color}</span>}
                  </td>
                  <td className="p-3.5 text-[#555]">{(prod as any).department || 'Women'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E0E0DB] text-[#444] text-[11px]">
                      {prod.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-[#171717]">
                    ₹{prod.price_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    {prod.article_id.startsWith('0999') ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        Custom Ingested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#737370] bg-[#F0F0ED] px-2 py-0.5 rounded-full text-[10px]">
                        H&amp;M Verified
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-[#737370] hover:text-[#171717] hover:bg-[#F0F0ED] rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {prod.article_id.startsWith('0999') && (
                        <button
                          onClick={() => handleDelete(prod.article_id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Custom Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal Studio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E4] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E8E4] flex items-center justify-between bg-[#FBFBFA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#171717]">
                    {editingProduct ? 'Edit Catalog Candidate' : 'Ingest New Garment Candidate'}
                  </h4>
                  <p className="text-[11px] text-[#737370]">
                    Updates propagate immediately to Two-Tower candidate scoring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8E8E88] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0F0ED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {idError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{idError}</span>
                </div>
              )}

              {/* Grid 2-col: ID & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Article ID (10 digits)
                  </label>
                  <input
                    type="text"
                    disabled={!!editingProduct}
                    value={formData.article_id}
                    onChange={(e) => setFormData({ ...formData, article_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] font-mono disabled:opacity-50 focus:outline-none focus:border-[#171717]"
                    placeholder="e.g. 0999123001"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setFormData({
                        ...formData,
                        department: newDept,
                        subcategory: DEPARTMENT_SUBCATEGORIES[newDept]?.[0] || 'Tops & Shirts',
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Title */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Garment Title
                </label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g. Tailored Wool Blend Blazer"
                  className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  required
                />
              </div>

              {/* Price & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    min="199"
                    max="99999"
                    value={formData.price_inr}
                    onChange={(e) => setFormData({ ...formData, price_inr: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] font-mono focus:outline-none focus:border-[#171717]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717] block mb-1">
                    Primary Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Black"
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              {/* 1-Click Studio Packshot Presets */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Studio Packshot Presets (Isolated Garments · Pure White Studio)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {PRESET_PACKSHOTS.map((preset) => {
                    const isSelected = formData.image_url === preset.url;
                    return (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => setFormData({ ...formData, image_url: preset.url })}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                          isSelected ? 'border-[#171717] ring-2 ring-[#171717]/20 shadow-xs' : 'border-[#E0E0DB] hover:border-[#171717]'
                        }`}
                        title={preset.label}
                      >
                        <Image src={preset.url} alt={preset.label} fill className="object-cover" sizes="60px" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[#171717] text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL Field */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Or Custom Image URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/catalog/... or https://..."
                    className="flex-1 px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] font-mono focus:outline-none focus:border-[#171717]"
                    required
                  />
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-[#F5F5F3] border border-[#DCDCD6] flex-shrink-0">
                    <Image
                      src={formData.image_url || '/placeholder-garment.svg'}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                </div>
              </div>

              {/* Description / Neural Rationale */}
              <div>
                <label className="text-xs font-semibold text-[#171717] block mb-1">
                  Garment Attributes / Neural Rationale
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Breathable organic cotton weave with relaxed silhouette..."
                  className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#DCDCD6] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8E4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#737370] hover:text-[#171717] text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Ingest Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

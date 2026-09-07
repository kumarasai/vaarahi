import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import api from '../../services/api';

export default function ProductMgmt() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form modal triggers
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [stock, setStock] = useState(5);
  const [sku, setSku] = useState('');
  const [fabric, setFabric] = useState('Silk');
  const [weave, setWeave] = useState('Banarasi');
  const [occasion, setOccasion] = useState('Bridal');
  const [colorName, setColorName] = useState('Deep Crimson');
  const [colorHex, setColorHex] = useState('#800020');
  const [imageUrl, setImageUrl] = useState('');
  const [zariType, setZariType] = useState('Pure Zari');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleEditClick = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setDiscountPercent(prod.discountPercent);
    setStock(prod.stock);
    setSku(prod.sku);
    setFabric(prod.fabric);
    setWeave(prod.weave);
    setOccasion(prod.occasion);
    setColorName(prod.color.name);
    setColorHex(prod.color.hex);
    setImageUrl(prod.images?.[0]?.secure_url || '');
    setZariType(prod.zariType || 'None');
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice(2000);
    setDiscountPercent(0);
    setStock(10);
    setSku(`SAR-${Math.floor(1000 + Math.random() * 9000)}`);
    setFabric('Silk');
    setWeave('Banarasi');
    setOccasion('Bridal');
    setColorName('Emerald Green');
    setColorHex('#046307');
    setImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400');
    setZariType('Pure Zari');
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: Number(price),
      discountPercent: Number(discountPercent),
      stock: Number(stock),
      sku,
      fabric,
      weave,
      occasion,
      zariType,
      color: { name: colorName, hex: colorHex },
      images: [{ secure_url: imageUrl, public_id: `img_${Date.now()}` }]
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? this cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Error deleting product.');
    }
  };

  const toggleProductActive = async (prod) => {
    try {
      await api.put(`/admin/products/${prod._id}`, { isActive: !prod.isActive });
      fetchProducts();
    } catch (err) {
      alert('Error changing product status.');
    }
  };

  return (
    <div className="space-y-8 pt-4">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold/10 pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">
            SAREE PRODUCTS MANAGEMENT
          </h1>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 block">
            Add new lookbook items or modify weave stock levels
          </span>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-gold text-teal-dark font-bold text-xs uppercase tracking-widest px-6 py-3 rounded flex items-center space-x-1 hover:bg-gold-dark font-bold transition shadow"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* Saree List Grid */}
      {loading ? (
        <div className="h-64 bg-teal-dark rounded animate-pulse" />
      ) : (
        <div className="silk-card rounded-lg border border-gold/15 p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gold/10 text-gray-400 uppercase tracking-widest pb-3">
                  <th className="py-3">Photo</th>
                  <th className="py-3">Name</th>
                  <th className="py-3">SKU</th>
                  <th className="py-3">Fabric/Weave</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Stock Qty</th>
                  <th className="py-3">Visibility</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-gray-300">
                {products.map(prod => (
                  <tr key={prod._id} className="hover:bg-gold/5 transition-colors">
                    <td className="py-3">
                      <img 
                        src={prod.images?.[0]?.secure_url} 
                        alt="Saree preview" 
                        className="h-12 w-9 object-cover rounded bg-teal-dark/50" 
                      />
                    </td>
                    <td className="py-3 font-semibold text-white">{prod.name}</td>
                    <td className="py-3 font-mono">{prod.sku}</td>
                    <td className="py-3">
                      <span className="block">{prod.fabric}</span>
                      <span className="text-[10px] text-gold uppercase block mt-0.5">{prod.weave}</span>
                    </td>
                    <td className="py-3 font-bold text-gold">₹{prod.price}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.stock <= 3 ? 'bg-red-950/20 text-red-400 border border-red-500/30' : 'text-gray-300'
                      }`}>
                        {prod.stock} Items
                      </span>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => toggleProductActive(prod)}
                        className={`flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                          prod.isActive 
                            ? 'bg-green-950 text-green-400 border-green-500/30' 
                            : 'bg-gray-900 text-gray-400 border-gray-600/30'
                        }`}
                      >
                        {prod.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{prod.isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => handleEditClick(prod)}
                          className="p-1 text-gold hover:text-white transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod._id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-teal-dark/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2124] border-2 border-gold rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gold hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-lg font-bold text-gold uppercase tracking-widest mb-6">
              {editingId ? 'Edit Saree Design' : 'Create New Saree Design'}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Saree Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-gray-400 block mb-1">Weaver Commentary Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Fabric Type</label>
                  <input
                    type="text"
                    required
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Weave Style</label>
                  <input
                    type="text"
                    required
                    value={weave}
                    onChange={(e) => setWeave(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Occasion</label>
                  <input
                    type="text"
                    required
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Zari Authenticity</label>
                  <select
                    value={zariType}
                    onChange={(e) => setZariType(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-gold rounded p-2 focus:outline-none"
                  >
                    <option value="Pure Zari">Pure Zari</option>
                    <option value="Tested Zari">Tested Zari</option>
                    <option value="Metallic Zari">Metallic Zari</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Color Shade Name</label>
                  <input
                    type="text"
                    required
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Color Hex Code</label>
                  <input
                    type="text"
                    required
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 block mb-1">Image URL</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-teal-dark border border-gold/20 text-white rounded p-2 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gold text-teal-dark font-bold uppercase tracking-widest py-3.5 rounded transition shadow border border-gold flex items-center justify-center space-x-1 mt-6"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{editingId ? 'Save Custom Weave' : 'Launch Saree Design'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

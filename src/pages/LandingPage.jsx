import React, { useState, useEffect } from 'react';
import ItemCard from '../components/ItemCard';
import { Search, Sparkles, Filter, ChevronDown, ChevronUp, BellRing, PackageCheck, HelpCircle } from 'lucide-react';

export default function LandingPage({ setActivePage, onSelectItem, onClaimItem }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchMetadata();
    executeSearch();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, zoneRes] = await Promise.all([
        fetch('/api/items/categories'),
        fetch('/api/items/zones')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (zoneRes.ok) setZones(await zoneRes.json());
    } catch (e) {}
  };

  const executeSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (type !== 'all') params.append('type', type);
    if (selectedCat) params.append('category_id', selectedCat);
    if (selectedZone) params.append('zone_id', selectedZone);
    if (colorFilter) params.append('color', colorFilter);
    if (brandFilter) params.append('brand', brandFilter);

    try {
      const res = await fetch(`/api/items/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setType('all');
    setSelectedCat('');
    setSelectedZone('');
    setColorFilter('');
    setBrandFilter('');
    setTimeout(() => executeSearch(), 50);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I claim a lost item that appears in the found inventory?',
      a: 'Click "Claim Property" on any item card. You will be asked to enter your Student/Staff ID reference number, detailed proof description (such as serial numbers, invoice receipt, purchase history, or distinctive markings), and an optional proof document upload. An Officer will review your submission.'
    },
    {
      q: 'Why are Storage Locker IDs and visual markers hidden on found items?',
      a: 'To prevent fraudulent claims, precise physical locker storage IDs and reference visual markers are restricted to verified Lost & Found Officers. Claimants must prove ownership independently.'
    },
    {
      q: 'What happens after an Officer approves my claim?',
      a: 'You will receive an automated in-app notification. You can then visit the Central Library Lost & Found office (Room 102) with your physical campus ID card to pick up your property.'
    },
    {
      q: 'How does the automated item matching work?',
      a: 'Our background matching engine automatically scans open lost item reports against found inventory, calculating a weighted score across title similarity, category, color, brand, location, and date proximity.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Announcements Ticker Banner */}
      <div className="glass-card" style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)'
      }}>
        <BellRing size={20} color="#2563eb" />
        <div style={{ fontSize: '0.875rem', color: '#1e40af', flex: 1, fontWeight: 500 }}>
          <strong>Campus Announcement:</strong> High-value electronics recovered near Science & Innovation Lab. Please submit claims with valid proof of purchase or serial numbers.
        </div>
      </div>

      {/* Hero Banner & Global Search */}
      <div className="glass-panel" style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
        border: '1px solid #dbeafe',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#dbeafe',
            color: '#1e40af',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '999px',
            marginBottom: '1rem',
            letterSpacing: '0.5px'
          }}>
            <Sparkles size={14} color="#2563eb" /> Official Institutional Lost & Found Platform
          </span>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a', lineHeight: '1.2' }}>
            Report, Search & Recover Campus Property Fast
          </h1>
          <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '2.25rem', fontWeight: 400 }}>
            Transparent chain of custody and automated multi-factor item matching across university grounds.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={executeSearch} style={{
            display: 'flex',
            gap: '0.5rem',
            background: '#ffffff',
            padding: '0.65rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #2563eb',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.75rem', color: '#2563eb' }}>
              <Search size={22} />
            </div>
            <input 
              type="text"
              className="form-control"
              placeholder="Search found inventory (e.g., MacBook, Fossil Wallet, Sony Headphones, TI-84 Calculator)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: '#0f172a', fontSize: '1rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              Search Inventory
            </button>
          </form>

          {/* Hero Quick Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setActivePage('student-dashboard')}>
              Report a Lost Item
            </button>
            <button className="btn btn-secondary" onClick={() => setActivePage('student-dashboard')}>
              Report a Found Item
            </button>
          </div>
        </div>
      </div>

      {/* Composable Inventory Filter Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
            <Filter size={20} color="#2563eb" /> Composable Inventory Filters
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* Item Type */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item Type</label>
            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
              <option value="all">All Items (Lost & Found)</option>
              <option value="found">Found Inventory Only</option>
              <option value="lost">Lost Reports Only</option>
            </select>
          </div>

          {/* Category */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Campus Zone */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Campus Zone / Location</label>
            <select className="form-control" value={selectedZone} onChange={e => setSelectedZone(e.target.value)}>
              <option value="">All Campus Zones</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.building_code})</option>)}
            </select>
          </div>

          {/* Color Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Primary Color</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Space Gray, Black, Brown" 
              value={colorFilter} 
              onChange={e => setColorFilter(e.target.value)} 
            />
          </div>

          {/* Brand Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Brand</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Apple, Fossil, Sony" 
              value={brandFilter} 
              onChange={e => setBrandFilter(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button className="btn btn-primary btn-sm" onClick={executeSearch}>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Public Active Campus Inventory Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackageCheck size={24} color="#2563eb" /> Active Campus Inventory ({items.length} Items)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              Live catalog with high-resolution photos. Physical storage locker numbers hidden from public view.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            Searching database...
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', background: '#ffffff' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 600 }}>No items match your filter criteria.</p>
            <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
              Clear Search Filters
            </button>
          </div>
        ) : (
          <div className="grid-cards">
            {items.map(item => (
              <ItemCard 
                key={`${item.item_type}-${item.id}`} 
                item={item} 
                onViewDetails={onSelectItem} 
                onClaim={onClaimItem} 
              />
            ))}
          </div>
        )}
      </div>

      {/* How Campus Recovery Works Section */}
      <div className="glass-panel" style={{ padding: '3rem 2rem', background: '#ffffff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem', color: '#0f172a' }}>
          How Campus Property Recovery Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800, fontSize: '1.25rem' }}>
              1
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Report Lost or Found</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Students or staff report lost property or turn in found items with photos, category, and location details.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800, fontSize: '1.25rem' }}>
              2
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Automated Matching</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Intelligent correlation engine scans title similarity, brand, color, campus zone, and date proximity.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800, fontSize: '1.25rem' }}>
              3
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Claim & Officer Review</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Submit claim with ID card reference and proof of ownership. Officers verify evidence before approval.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '1.75rem 1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontWeight: 800, fontSize: '1.25rem' }}>
              4
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Secure Physical Return</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Once approved, pick up your property from Central Library Room 102 with logged chain of custody.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="glass-panel" id="faq-section" style={{ padding: '3rem 2rem', background: '#ffffff' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <HelpCircle size={24} color="#2563eb" /> Frequently Asked Questions (FAQ)
        </h2>
        <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="glass-card"
              style={{ cursor: 'pointer', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0' }}
              onClick={() => toggleFaq(index)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp size={20} color="#2563eb" /> : <ChevronDown size={20} color="#64748b" />}
              </div>
              {openFaq === index && (
                <p style={{ marginTop: '0.85rem', fontSize: '0.875rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', lineHeight: '1.6' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

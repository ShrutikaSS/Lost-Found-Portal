import React, { useState } from 'react';
import { 
  Search, AlertCircle, CheckCircle2, MapPin, Calendar, Tag, ShieldCheck, 
  FileText, ArrowRight, HelpCircle, Phone, Mail, Clock, Send, ChevronDown, ChevronUp,
  Package, ExternalLink, Filter, Info, Sparkles
} from 'lucide-react';

export default function LandingPage({ setCurrentView }) {
  // State for quick search & tab toggle (Lost vs Found)
  const [activeTab, setActiveTab] = useState('found'); // 'lost' | 'found'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // State for details / claim modal
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [claimSubmittedAlert, setClaimSubmittedAlert] = useState(false);

  // State for FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Sample mock lost and found catalog data (Ready for backend API response)
  const sampleItems = [
    {
      id: 'item-101',
      title: 'Apple MacBook Pro 14" M2 (Space Gray)',
      category: 'Electronics',
      type: 'found',
      location: 'Central Library - 2nd Floor Quiet Zone',
      date: '2026-07-20',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      description: 'Found on desk 24 with a dark gray sleeve case. Turned into campus security post.'
    },
    {
      id: 'item-102',
      title: 'Student ID Card & Dorm Keycard (S. Sharma)',
      category: 'IDs & Cards',
      type: 'found',
      location: 'Student Activity Center Cafe',
      date: '2026-07-21',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      description: 'Campus Student ID belonging to Computer Science dept. Found near order counter.'
    },
    {
      id: 'item-103',
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      category: 'Electronics',
      type: 'lost',
      location: 'Auditorium Hall B',
      date: '2026-07-19',
      status: 'Searching',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      description: 'Black headphones left during morning guest lecture. Small scratch on right ear cup.'
    },
    {
      id: 'item-104',
      title: 'Leather Wallet with Driving License',
      category: 'Accessories',
      type: 'found',
      location: 'Engineering Block - North Lawn',
      date: '2026-07-18',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      description: 'Brown leather bi-fold wallet containing cash and ID cards. Handed to Officer Office.'
    },
    {
      id: 'item-105',
      title: 'TI-84 Plus CE Graphing Calculator',
      category: 'Books & Supplies',
      type: 'found',
      location: 'Science Lab 304',
      date: '2026-07-17',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      description: 'Blue calculator with name label partially peeled on reverse side.'
    },
    {
      id: 'item-106',
      title: 'Hydrate Flask Water Bottle (Olive Green)',
      category: 'Accessories',
      type: 'lost',
      location: 'Sports Complex Gymnasium',
      date: '2026-07-21',
      status: 'Searching',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      description: 'Insulated stainless steel bottle with stickers from hackathon.'
    }
  ];

  const categories = ['All', 'Electronics', 'IDs & Cards', 'Accessories', 'Books & Supplies'];

  // Announcements Data
  const announcements = [
    {
      id: 'ann-1',
      date: 'July 20, 2026',
      title: 'End of Semester Unclaimed Items Donation Drive',
      description: 'Items found prior to May 2026 that remain unclaimed will be cataloged for donation to local community centers on August 5th. Please check all records before then.'
    },
    {
      id: 'ann-2',
      date: 'July 15, 2026',
      title: 'New Automated Claim Verification Feature Live',
      description: 'Students can now upload proof of purchase or serial numbers directly when submitting a claim for faster officer approval.'
    },
    {
      id: 'ann-3',
      date: 'July 10, 2026',
      title: 'Lost & Found Officer Counter Extended Hours',
      description: 'The main Lost & Found office in Student Union Center #102 will remain open until 6:00 PM on weekdays during examination week.'
    }
  ];

  // FAQ Data
  const faqs = [
    {
      q: 'How do I submit a claim for a found item on TrackNfind?',
      a: 'Browse the "Found Items" catalog, click "Claim Item" on your item, fill in verification details (such as distinct marks, serial number, or photo proof), and submit. A Lost & Found Officer will review your request within 24 hours.'
    },
    {
      q: 'What should I do if I find someone else lost property?',
      a: 'You can immediately turn in found items to the nearest Security Post or the Lost & Found Central Office. Registered users can also report a found item online to generate an instant record.'
    },
    {
      q: 'How long are found items stored by TrackNfind?',
      a: 'Standard items are retained for 90 days. High-value electronics and official government IDs are held for 180 days before being handled in accordance with institutional disposal guidelines.'
    },
    {
      q: 'Can non-students or guests report lost belongings?',
      a: 'Yes! Visitors and guest researchers can submit reports by creating a User account or contacting security directly via phone or email.'
    }
  ];

  // Filter items based on active tab, search, and category
  const filteredItems = sampleItems.filter(item => {
    const matchesTab = item.type === activeTab;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesQuery;
  });

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    setClaimSubmittedAlert(true);
    setTimeout(() => {
      setClaimSubmittedAlert(false);
      setSelectedItemModal(null);
    }, 2500);
  };

  return (
    <div className="landing-page">
      {/* HERO BANNER SECTION */}
      <section className="hero-section">
        <div className="hero-backdrop-glow"></div>
        <div className="container hero-grid">
          <div>
            <div className="hero-badge-pill">
              <Sparkles size={16} /> Track It. Find It. Get It Back.
            </div>
            <h1 className="hero-title">
              <span className="highlight">Track</span> Your Lost Items with Confidence
            </h1>
            <p className="hero-subtitle">
              TrackNfind is a smart Lost & Found Portal that helps students report lost belongings, search found items, and reconnect with their valuables quickly and securely. The platform provides role-based authentication for Students, Lost & Found Officers, and System Administrators, ensuring a safe and transparent recovery process.
            </p>
            <div className="hero-cta-group">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => setCurrentView('register')}
              >
                Create Account <ArrowRight size={18} />
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => setCurrentView('login')}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Quick Search Card in Hero */}
          <div className="hero-search-card">
            <div className="hero-search-tabs">
              <button 
                className={`tab-btn ${activeTab === 'found' ? 'active-found' : ''}`}
                onClick={() => setActiveTab('found')}
              >
                <CheckCircle2 size={16} /> Search Found Items
              </button>
              <button 
                className={`tab-btn ${activeTab === 'lost' ? 'active-lost' : ''}`}
                onClick={() => setActiveTab('lost')}
              >
                <AlertCircle size={16} /> Search Reported Lost
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div className="input-wrapper">
                <span className="input-icon-left"><Search size={18} /></span>
                <input 
                  type="text" 
                  className="form-input input-with-icon-left" 
                  placeholder={`Search TrackNfind ${activeTab === 'found' ? 'found catalog' : 'lost reports'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Showing {filteredItems.length} records</span>
              <a 
                href="#search-catalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('search-catalog-section').scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ fontWeight: 600 }}
              >
                View Full Catalog &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE PORTAL WORKFLOW SECTION */}
      <section className="section section-alt" id="about-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simplified Process</span>
            <h2 className="section-title">How TrackNfind Works</h2>
            <p className="section-desc">
              Our streamlined workflow helps students, officers, and administrators manage lost property safely and efficiently.
            </p>
          </div>

          <div className="about-grid">
            <div className="workflow-card">
              <span className="workflow-step-num">01</span>
              <div className="workflow-icon-box">
                <FileText size={28} />
              </div>
              <h3>1. Submit Report</h3>
              <p>Log lost or found items with location tags, photos, and distinctive attributes.</p>
            </div>

            <div className="workflow-card">
              <span className="workflow-step-num">02</span>
              <div className="workflow-icon-box" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                <Search size={28} />
              </div>
              <h3>2. Smart Catalog Match</h3>
              <p>Automated index cross-references reported items with newly turned-in inventory.</p>
            </div>

            <div className="workflow-card">
              <span className="workflow-step-num">03</span>
              <div className="workflow-icon-box" style={{ background: 'var(--accent-teal-light)', color: '#0f766e' }}>
                <ShieldCheck size={28} />
              </div>
              <h3>3. Officer Verification</h3>
              <p>Lost & Found Officers review ownership claims to ensure secure return.</p>
            </div>

            <div className="workflow-card">
              <span className="workflow-step-num">04</span>
              <div className="workflow-icon-box" style={{ background: 'var(--accent-amber-light)', color: '#b45309' }}>
                <Package size={28} />
              </div>
              <h3>4. Safe Retrieval</h3>
              <p>Collect your verified item directly from the central security desk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH CATALOG & RECENTLY FOUND ITEMS */}
      <section className="section" id="search-catalog-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Live Inventory</span>
            <h2 className="section-title">Recent Lost & Found Catalog</h2>
            <p className="section-desc">
              Browse recently logged items in TrackNfind. Filter by status, category, or search keywords.
            </p>
          </div>

          {/* Interactive Filter Bar */}
          <div className="items-filter-bar">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Filter size={18} style={{ color: 'var(--text-muted)' }} />
              <div className="category-pills">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn btn-sm ${activeTab === 'found' ? 'btn-emerald' : 'btn-secondary'}`}
                onClick={() => setActiveTab('found')}
              >
                Found Items ({sampleItems.filter(i => i.type === 'found').length})
              </button>
              <button 
                className={`btn btn-sm ${activeTab === 'lost' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('lost')}
              >
                Lost Reports ({sampleItems.filter(i => i.type === 'lost').length})
              </button>
            </div>
          </div>

          {/* Item Cards Grid */}
          <div className="items-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-image-wrapper">
                  <img src={item.image} alt={item.title} className="item-image" />
                  <div className="item-type-badge">
                    <span className={`badge ${item.type === 'found' ? 'badge-found' : 'badge-lost'}`}>
                      {item.type === 'found' ? 'Found Item' : 'Lost Report'}
                    </span>
                  </div>
                  <span className="item-category-tag">{item.category}</span>
                </div>

                <div className="item-card-body">
                  <h3 className="item-card-title">{item.title}</h3>
                  <div className="item-meta-info">
                    <div className="item-meta-item">
                      <MapPin size={14} /> <span>{item.location}</span>
                    </div>
                    <div className="item-meta-item">
                      <Calendar size={14} /> <span>{item.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                    {item.description}
                  </p>

                  <div className="item-card-footer">
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Status: <strong style={{ color: 'var(--text-main)' }}>{item.status}</strong>
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedItemModal(item)}
                    >
                      {item.type === 'found' ? 'Claim Item' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: 'var(--radius-lg)' }}>
              <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No items match your criteria</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try clearing your search query or selecting another category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ANNOUNCEMENTS SECTION */}
      <section className="section section-alt" id="announcements-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Platform Notices</span>
            <h2 className="section-title">Latest Announcements</h2>
            <p className="section-desc">
              Important updates regarding lost property retention policies and office schedules.
            </p>
          </div>

          <div className="announcements-grid">
            {announcements.map(ann => (
              <div key={ann.id} className="announcement-card">
                <div className="announcement-date">
                  <Calendar size={14} /> {ann.date}
                </div>
                <h3 className="announcement-title">{ann.title}</h3>
                <p className="announcement-desc">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELP & FAQ SECTION */}
      <section className="section" id="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Support Center</span>
            <h2 className="section-title">Help & Frequently Asked Questions</h2>
            <p className="section-desc">
              Find quick answers to common questions about lost item verification and TrackNfind portal usage.
            </p>
          </div>

          <div className="faq-container">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="faq-item">
                  <button 
                    className="faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT & SUPPORT SECTION */}
      <section className="section section-alt" id="contact-section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div>
              <span className="section-tag">Reach Out</span>
              <h2 className="section-title">Contact Support</h2>
              <p className="section-desc" style={{ marginBottom: '1.5rem' }}>
                Need urgent assistance or have questions regarding high-value item claims on TrackNfind?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Office Location</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Student Union Building, Room 102, Main Campus</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Helpline</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>+1 (555) 019-2834 / Ext. 402</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Email Support</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>support@tracknfind.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Query Box */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Send Direct Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent to TrackNfind Support Desk!'); }}>
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <input type="email" className="form-input" placeholder="user@domain.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" placeholder="Inquiry about item..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows="3" placeholder="Describe your query..." required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  <Send size={16} /> Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-bar">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <img 
                  src="/tracknfind-logo.png" 
                  alt="TrackNfind Logo" 
                  style={{ height: '48px', width: 'auto', objectFit: 'contain', background: 'white', padding: '4px', borderRadius: '8px' }} 
                />
                <div>
                  <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>TrackNfind</h3>
                  <span style={{ color: 'var(--accent-teal)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>TRACK IT. FIND IT. GET IT BACK.</span>
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                TrackNfind is a smart Lost & Found Portal helping users report lost items, search found logs, and recover belongings safely.
              </p>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#about-section">About TrackNfind</a></li>
                <li><a href="#search-catalog-section">Search Catalog</a></li>
                <li><a href="#announcements-section">Notices</a></li>
                <li><a href="#faq-section">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>User Access</h4>
              <ul className="footer-links">
                <li><a href="#login" onClick={(e) => { e.preventDefault(); setCurrentView('login'); }}>Student Login</a></li>
                <li><a href="#login" onClick={(e) => { e.preventDefault(); setCurrentView('login'); }}>Officer Login</a></li>
                <li><a href="#login" onClick={(e) => { e.preventDefault(); setCurrentView('login'); }}>Admin Portal</a></li>
                <li><a href="#register" onClick={(e) => { e.preventDefault(); setCurrentView('register'); }}>Create Account</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Policies</h4>
              <ul className="footer-links">
                <li><a href="#privacy">Privacy Statement</a></li>
                <li><a href="#terms">Terms of Ownership Verification</a></li>
                <li><a href="#policy">Property Retention Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} TrackNfind. All rights reserved.</span>
            <span>Track It. Find It. Get It Back.</span>
          </div>
        </div>
      </footer>

      {/* ITEM CLAIM / DETAIL MODAL */}
      {selectedItemModal && (
        <div className="modal-backdrop" onClick={() => setSelectedItemModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItemModal.type === 'found' ? 'Submit Claim Request' : 'Item Details'}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedItemModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {claimSubmittedAlert && (
                <div className="alert-banner alert-banner-success">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Claim Submitted Successfully!</strong>
                    <p style={{ fontSize: '0.85rem' }}>An officer will review your proof of ownership on TrackNfind and contact you via email.</p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <img 
                  src={selectedItemModal.image} 
                  alt={selectedItemModal.title} 
                  style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} 
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedItemModal.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: {selectedItemModal.location}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Logged Date: {selectedItemModal.date}</p>
                  <span className={`badge ${selectedItemModal.type === 'found' ? 'badge-found' : 'badge-lost'}`} style={{ marginTop: '0.4rem' }}>
                    {selectedItemModal.status}
                  </span>
                </div>
              </div>

              {selectedItemModal.type === 'found' ? (
                <form onSubmit={handleClaimSubmit}>
                  <div className="form-group">
                    <label className="form-label">Proof of Ownership / Unique Marks</label>
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      placeholder="Describe unique identifier (e.g. wallpaper picture, serial number, internal sticker)..." 
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone Number</label>
                    <input type="tel" className="form-input" placeholder="+1 (555) 000-0000" required />
                  </div>
                  <button type="submit" className="btn btn-emerald btn-full">
                    <ShieldCheck size={18} /> Submit Claim to Officer Desk
                  </button>
                </form>
              ) : (
                <div>
                  <p style={{ fontSize: '0.92rem', marginBottom: '1rem' }}>
                    This item was reported lost on TrackNfind. If you have found this item, please hand it over to Campus Security Office #102.
                  </p>
                  <button className="btn btn-secondary btn-full" onClick={() => setSelectedItemModal(null)}>
                    Close Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

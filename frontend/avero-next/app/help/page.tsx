'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  Truck, 
  RotateCcw, 
  Ruler, 
  HelpCircle, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'shipping', label: 'Shipping Info', icon: Truck },
  { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'size-guide', label: 'Size Guide', icon: Ruler },
  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
];

function HelpContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'shipping';
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', padding: '48px 0 80px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#767676' }}>
            Customer Service &amp; Information
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, color: '#111111', margin: '8px 0 12px' }}>
            Help &amp; Support Directory
          </h1>
          <p style={{ fontSize: 14, color: '#666666', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Transparent guidelines, size measurements, and verified shipping/return specifications for the AVERO fashion platform.
          </p>
        </div>

        {/* Tab Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1.5px solid #111111' : '1px solid #E5E5E0',
                  backgroundColor: isActive ? '#111111' : '#FAF9F6',
                  color: isActive ? '#FFFFFF' : '#444441',
                  transition: 'all 150ms ease',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Shipping Info */}
        {activeTab === 'shipping' && (
          <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: 12, padding: '36px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#111111', margin: '0 0 16px' }}>
              Shipping &amp; Delivery Information
            </h2>
            <div style={{ fontSize: 14, color: '#444441', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>
                AVERO operates as an AI-powered fashion discovery and recommendation engine built on historical and catalog merchandise. Delivery logistics and fulfillment for commercial H&amp;M apparel follow official H&amp;M India retail dispatch timelines.
              </p>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: '#111111' }}>Standard Delivery Timeline</h3>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Metro Cities (Delhi, Mumbai, Bengaluru, Chennai): 2–4 business days.</li>
                  <li>Rest of India: 4–7 business days depending on pin code accessibility.</li>
                  <li>Cash on Delivery and Prepaid (UPI, Cards, Netbanking) supported.</li>
                </ul>
              </div>
              <p style={{ fontSize: 13, color: '#767676' }}>
                For live order dispatch status or active courier tracking, visit the official{' '}
                <a
                  href="https://www2.hm.com/en_in/customer-service.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#111111', textDecoration: 'underline', fontWeight: 600 }}
                >
                  H&amp;M India Customer Service Portal <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Returns */}
        {activeTab === 'returns' && (
          <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: 12, padding: '36px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#111111', margin: '0 0 16px' }}>
              Returns &amp; Exchange Policy
            </h2>
            <div style={{ fontSize: 14, color: '#444441', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>
                In alignment with fair consumer standards, catalog apparel items are eligible for return or size exchange within the verified return window, provided the garment remains unused with original tags intact.
              </p>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: '#111111' }}>Verified Return Guidelines</h3>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>15-day return window from the date of package delivery.</li>
                  <li>Items must have security tags and care labels attached.</li>
                  <li>Innerwear, swimwear hygiene liners, and custom-embellished accessories are non-returnable.</li>
                </ul>
              </div>
              <p style={{ fontSize: 13, color: '#767676' }}>
                To initiate a live return request, inspect the official{' '}
                <a
                  href="https://www2.hm.com/en_in/customer-service/returns.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#111111', textDecoration: 'underline', fontWeight: 600 }}
                >
                  H&amp;M India Returns Center <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Size Guide */}
        {activeTab === 'size-guide' && (
          <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: 12, padding: '36px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#111111', margin: '0 0 16px' }}>
              Standard Fashion Size Guide
            </h2>
            <p style={{ fontSize: 14, color: '#666666', marginBottom: 20 }}>
              Measurements in centimeters (cm) for standard Scandinavian &amp; Indian garment fits.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left', backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F0F0EC', borderBottom: '1px solid #DCDCD6', color: '#111111', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Size</th>
                    <th style={{ padding: '12px 16px' }}>Bust / Chest (cm)</th>
                    <th style={{ padding: '12px 16px' }}>Waist (cm)</th>
                    <th style={{ padding: '12px 16px' }}>Hips (cm)</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#444441' }}>
                  <tr style={{ borderBottom: '1px solid #ECECE8' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>XS (34)</td>
                    <td style={{ padding: '12px 16px' }}>80–84</td>
                    <td style={{ padding: '12px 16px' }}>64–68</td>
                    <td style={{ padding: '12px 16px' }}>88–92</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECECE8' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>S (36)</td>
                    <td style={{ padding: '12px 16px' }}>84–88</td>
                    <td style={{ padding: '12px 16px' }}>68–72</td>
                    <td style={{ padding: '12px 16px' }}>92–96</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECECE8' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>M (38–40)</td>
                    <td style={{ padding: '12px 16px' }}>88–96</td>
                    <td style={{ padding: '12px 16px' }}>72–80</td>
                    <td style={{ padding: '12px 16px' }}>96–104</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECECE8' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>L (42–44)</td>
                    <td style={{ padding: '12px 16px' }}>96–104</td>
                    <td style={{ padding: '12px 16px' }}>80–88</td>
                    <td style={{ padding: '12px 16px' }}>104–112</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>XL (46)</td>
                    <td style={{ padding: '12px 16px' }}>104–112</td>
                    <td style={{ padding: '12px 16px' }}>88–96</td>
                    <td style={{ padding: '12px 16px' }}>112–120</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: FAQ */}
        {activeTab === 'faq' && (
          <div style={{ backgroundColor: '#FAF9F6', border: '1px solid #ECECE8', borderRadius: 12, padding: '36px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, color: '#111111', margin: '0 0 20px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#111111' }}>
                  What is AVERO CAN Recommendation Engine?
                </h3>
                <p style={{ fontSize: 13, color: '#666666', margin: 0, lineHeight: 1.6 }}>
                  AVERO uses a Context-Aware Neural (CAN) Two-Tower deep network that maps customer aesthetic preferences and real-time temporal signals into a joint 32-dimensional embedding space to compute cosine personalized match scores.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#111111' }}>
                  Are the product images authentic?
                </h3>
                <p style={{ fontSize: 13, color: '#666666', margin: 0, lineHeight: 1.6 }}>
                  Yes, catalog items are paired with verified 10-digit H&amp;M article IDs. We prioritize isolated garment photography on neutral backgrounds, avoiding human model portraits or misleading lifestyle shots.
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E0', borderRadius: 8, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: '#111111' }}>
                  How do I inspect model technical architecture?
                </h3>
                <p style={{ fontSize: 13, color: '#666666', margin: 0, lineHeight: 1.6 }}>
                  Visit our dedicated{' '}
                  <Link href="/insights" style={{ color: '#111111', fontWeight: 600, textDecoration: 'underline' }}>
                    AI Insights Studio
                  </Link>{' '}
                  to interact with the 3D CAN pipeline graph, 3D latent space explorer, and offline holdout benchmarks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              color: '#111111',
              textDecoration: 'none',
            }}
            className="hover:underline"
          >
            <span>Return to AVERO Storefront</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading Help Center...</div>}>
      <HelpContent />
    </Suspense>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { LandPlot, Home, Building2, Building, Hotel, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { icon: <LandPlot />, label: 'LAND' },
  { icon: <Home />, label: 'HOUSE' },
  { icon: <Building2 />, label: 'APARTMENT' },
  { icon: <Building />, label: 'BUILDING' },
  { icon: <Hotel />, label: 'HOTEL' },
  { icon: <Briefcase />, label: 'BUSINESS' },
];

interface CategoryIconsProps {
  onNavigate?: (view: any) => void;
}

export const CategoryIcons: React.FC<CategoryIconsProps> = ({ onNavigate }) => {
  const handleCategoryClick = (label: string) => {
    let cat = label.charAt(0) + label.slice(1).toLowerCase(); // Default: House, Land, etc.
    if (label === 'BUSINESS') cat = 'Commercial';
    
    if (onNavigate) {
      onNavigate({ type: 'category', data: { category: cat, mode: 'buy' } });
      const path = `/buy/${cat.toLowerCase()}`;
      window.history.pushState({}, '', path);
    }
  };

  return (
    <>
      <style>{`
        /* ── OUTER SECTION ── */
        .category-section {
          background: #ffffff !important;
          padding: 40px 24px !important;
          width: 100% !important;
          box-sizing: border-box !important;
          border-top: 1px solid #F3F4F6 !important;
          border-bottom: 1px solid #F3F4F6 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
        }

        /* ── INNER WRAPPER ── */
        .category-wrapper {
          width: 100% !important;
          max-width: 900px !important;
          margin: 0 auto !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }

        /* ── ICON GRID ── */
        .category-grid {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 16px !important;
          width: 100% !important;
          max-width: 820px !important;
          margin: 0 auto !important;
          justify-items: center !important;
          justify-content: center !important;
          align-items: center !important;
        }

        /* ── EACH CATEGORY ITEM ── */
        .category-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          cursor: pointer !important;
          padding: 16px 8px !important;
          border-radius: 16px !important;
          width: 100% !important;
          max-width: 110px !important;
          transition: all 0.2s ease !important;
          text-decoration: none !important;
          border: 2px solid transparent !important;
          background: transparent !important;
        }

        /* ── HOVER STATE ── */
        .category-item:hover {
          background: #F0FDF4 !important;
          border-color: #1A5E2A !important;
          transform: translateY(-3px) !important;
        }

        /* ── ICON CIRCLE ── */
        .category-item .icon-circle {
          width: 60px !important;
          height: 60px !important;
          background: #E8F5E9 !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 14px !important;
          box-sizing: border-box !important;
          transition: all 0.2s ease !important;
          color: #1A5E2A !important;
        }

        .category-item:hover .icon-circle {
          background: #1A5E2A !important;
          color: white !important;
        }

        /* SVG icons inside circles */
        .category-item svg {
          width: 28px !important;
          height: 28px !important;
          background: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          transition: all 0.2s ease !important;
        }

        /* ── LABEL TEXT ── */
        .category-item .category-label {
          font: 700 11px Plus Jakarta Sans, sans-serif !important;
          color: #374151 !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          text-align: center !important;
          margin: 0 !important;
          transition: color 0.2s ease !important;
        }

        .category-item:hover .category-label {
          color: #1A5E2A !important;
        }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .category-section {
            padding: 28px 16px !important;
          }

          .category-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
            max-width: 100% !important;
          }

          .category-item {
            padding: 14px 4px !important;
            max-width: 100% !important;
          }

          .category-item .icon-circle {
            width: 52px !important;
            height: 52px !important;
          }

          .category-item svg {
            width: 24px !important;
            height: 24px !important;
          }

          .category-item .category-label {
            font-size: 10px !important;
          }
        }

        @media (max-width: 400px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <section className="category-section">
        <div className="category-wrapper">
          <div className="category-grid">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 260, 
                  damping: 20, 
                  delay: idx * 0.05 
                }}
                onClick={() => handleCategoryClick(cat.label)}
                className="category-item"
              >
                <div className="icon-circle">
                  {cat.icon}
                </div>
                <span className="category-label">
                  {cat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Bed, Bath, Maximize, Check, Phone, Star, ArrowRight, X, 
  ChevronLeft, ChevronRight, MessageCircle, Share2, Heart, Copy, 
  Tag, Home, Layers, Lock, Maximize2, AlertTriangle, Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { triggerNotification } from '../services/notificationService';
import { runLeadFollowUpWorkflow } from '../automation/workflows';
import { translateDescription } from '../services/geminiService';
import { safeReplace, USD_RATE, EUR_RATE, slugify, safeLocalStorage } from '../utils/safeUtils';
import toast from 'react-hot-toast';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const getPropertyImage = (images: any, index = 0) => {
  if (!images) return '/placeholder-property.jpg';
  if (Array.isArray(images)) return images[index] || images[0] || '/placeholder-property.jpg';
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) return parsed[index] || parsed[0] || '/placeholder-property.jpg';
      return images;
    } catch {
      return images;
    }
  }
  return '/placeholder-property.jpg';
};

const getPropertyImagesList = (images: any) => {
  if (!images) return ['/placeholder-property.jpg'];
  if (Array.isArray(images)) {
    return images.filter(Boolean).length > 0 ? images.filter(Boolean) : ['/placeholder-property.jpg'];
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).length > 0 ? parsed.filter(Boolean) : ['/placeholder-property.jpg'];
      }
      return [images];
    } catch {
      return [images];
    }
  }
  return ['/placeholder-property.jpg'];
};

const convertPrice = (priceVal: any) => {
  if (!priceVal) return null;
  const numericStr = safeReplace(priceVal, /[^0-9]/g, '');
  const amount = parseInt(numericStr);
  if (isNaN(amount) || amount === 0) return null;
  return {
    usd: `$${Math.round(amount / USD_RATE).toLocaleString()}`,
    eur: `€${Math.round(amount / EUR_RATE).toLocaleString()}`
  };
};

const abbreviatePrice = (priceVal: any) => {
  if (!priceVal) return 'Price on request';
  const numericStr = String(priceVal).replace(/[^0-9]/g, '');
  const amount = parseInt(numericStr);
  if (isNaN(amount)) return priceVal;
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)} Lk`;
  return `Rs. ${amount.toLocaleString()}`;
};

const getOptimizedImageUrl = (url: string, type: 'main' | 'thumb' | 'lightbox') => {
  if (!url) return '/placeholder-property.jpg';
  
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const baseUrl = url.replace('/object/public/', '/render/image/public/');
    if (type === 'main') {
      return `${baseUrl}?width=900&height=600&resize=cover&quality=85`;
    } else if (type === 'thumb') {
      return `${baseUrl}?width=400&height=280&resize=cover&quality=75`;
    } else {
      return `${baseUrl}?width=1600&quality=90`;
    }
  }
  
  if (url.includes('unsplash.com')) {
    const baseUnsplash = url.split('?')[0];
    if (type === 'main') {
      return `${baseUnsplash}?auto=format&fit=crop&w=900&h=600&q=85`;
    } else if (type === 'thumb') {
      return `${baseUnsplash}?auto=format&fit=crop&w=400&h=280&q=75`;
    } else {
      return `${baseUnsplash}?auto=format&fit=crop&w=1600&q=90`;
    }
  }
  
  return url;
};

interface PropertyDetailProps {
  propertyId: number | string;
  onBack: () => void;
  onPropertyClick: (p: any) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  isAdmin?: boolean;
}

export const PropertyDetail = ({ 
  propertyId, 
  onBack, 
  onPropertyClick,
  favorites,
  toggleFavorite,
  isAdmin 
}: PropertyDetailProps) => {
  const [property, setProperty] = useState<any>(null);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // Lightbox Image & Touch Swipe states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Body scroll lock when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  // Reset image loading and error states on active index or lightbox change
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [activeImageIndex, lightboxOpen]);  // Scroll active thumbnail into view
  useEffect(() => {
    if (lightboxOpen && thumbnailRefs.current[activeImageIndex]) {
      thumbnailRefs.current[activeImageIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeImageIndex, lightboxOpen]);

  // Lazy loading visibility states
  const [belowFoldVisible, setBelowFoldVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [similarVisible, setSimilarVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  // Refs for Lazy loading
  const mapRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });

  // Load below-the-fold content after 1 second or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setBelowFoldVisible(true);
    }, 1000);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setBelowFoldVisible(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Map IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMapVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    if (mapRef.current) {
      observer.observe(mapRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  // Similar Properties IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSimilarVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '300px' }
    );
    if (similarRef.current) {
      observer.observe(similarRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  // Contact Form IntersectionObserver
  useEffect(() => {
    if (!property) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setContactVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '250px' }
    );
    if (contactRef.current) {
      observer.observe(contactRef.current);
    }
    return () => observer.disconnect();
  }, [property]);

  const trackViewsNonBlocking = (data: any) => {
    // Increment view count (fire and forget - no await)
    supabase.from('properties')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', data.id)
      .then();

    // RPC as a fallback or extra reliable step
    supabase.rpc('increment_property_views', { prop_id: data.id })
      .then(null, () => {});

    // Detailed analytics
    let sessionId = sessionStorage.getItem('lp_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('lp_session_id', sessionId);
    }
    const deviceType = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';

    supabase.from('property_views').insert([{
      property_id: data.id,
      property_type: data.type || data.property_category || 'Property',
      district: data.district,
      property_category: data.property_category,
      session_id: sessionId,
      device_type: deviceType,
      referrer: document.referrer || 'direct'
    }]).then();
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) return;
      
      // FIX 4: Check sessionStorage cache first
      const cacheKey = `property_${propertyId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { property: cachedProp, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < 5 * 60 * 1000) {
            setProperty(cachedProp);
            setLoading(false);
            
            // Fire view tracking in background
            trackViewsNonBlocking(cachedProp);
            return;
          }
        } catch (e) {
          console.error('Error parsing cache', e);
        }
      }

      setLoading(true);
      try {
        let data = null;
        let error = null;

        if (isNaN(Number(propertyId))) {
          const res = await supabase.from('properties').select('*').eq('slug', propertyId).limit(1);
          if (res.data && res.data.length > 0) {
            data = res.data[0];
          } else {
            const allRes = await supabase.from('properties').select('*').eq('status', 'active');
            if (allRes.data) {
              data = allRes.data.find(p => slugify(p.listing_title || p.title || "") === propertyId);
            }
          }
        } else {
          const res = await supabase.from('properties').select('*').eq('id', Number(propertyId)).single();
          data = res.data;
          error = res.error;
        }

        if (error && !data) throw error;
        if (!data) throw new Error('Property not found');
        
        setProperty(data);
        
        // Save to cache
        sessionStorage.setItem(cacheKey, JSON.stringify({
          property: data,
          timestamp: Date.now()
        }));

        // Fire view tracking in background
        trackViewsNonBlocking(data);

      } catch (error: any) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo(0, 0);
  }, [propertyId]);

  // Fetch similar properties lazily on intersection
  useEffect(() => {
    if (!property || !similarVisible) return;

    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const cacheKey = `similar_${property.district}_${property.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setSimilarProperties(data || []);
            setLoadingSimilar(false);
            return;
          }
        }

        const fields = 'id, listing_title, title, price_lkr, price, city, district, images, rooms, bedrooms, bathrooms, land_area, land_unit, floors, floor_area, status, listing_type, property_category, property_type, slug, created_at';

        // ── QUERY 1: Same district + same listing_type ──
        let { data: similar, error: err1 } = await supabase
          .from('properties')
          .select(fields)
          .eq('district', property.district)
          .eq('listing_type', property.listing_type)
          .eq('status', 'active')
          .neq('id', property.id)
          .order('created_at', { ascending: false })
          .limit(6);

        if (err1) throw err1;

        let combined = similar || [];

        // ── QUERY 2: If less than 6, fill from same district ──
        if (combined.length < 6) {
          const existingIds = combined.map(p => p.id);
          existingIds.push(property.id);

          const { data: more, error: err2 } = await supabase
            .from('properties')
            .select(fields)
            .eq('district', property.district)
            .eq('status', 'active')
            .not('id', 'in', `(${existingIds.join(',')})`)
            .order('created_at', { ascending: false })
            .limit(6 - combined.length);

          if (!err2 && more) {
            combined = [...combined, ...more];
          }
        }

        // ── QUERY 3: If still less than 6, fill from same category ──
        const categoryVal = property.property_category || property.category || property.property_type;
        if (combined.length < 6 && categoryVal) {
          const existingIds = combined.map(p => p.id);
          existingIds.push(property.id);

          const { data: more, error: err3 } = await supabase
            .from('properties')
            .select(fields)
            .eq('property_category', categoryVal)
            .eq('status', 'active')
            .not('id', 'in', `(${existingIds.join(',')})`)
            .order('created_at', { ascending: false })
            .limit(6 - combined.length);

          if (!err3 && more) {
            combined = [...combined, ...more];
          }
        }

        const result = combined.slice(0, 6);
        setSimilarProperties(result);
        
        // Cache similar properties
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error fetching similar properties', err);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [property, similarVisible]);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        property_id: property.id,
        assigned_to: property.agent_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_title: property.listing_title,
        message: formData.message || property.listing_title || 'Property Inquiry',
        source: 'website',
        stage: 'new',
      });

      if (error) throw error;

      let agentEmail = property.agent_id || 'admin@lankaproperty.lk';
      let agentPhone = '+94 77 123 4567';
      let agentWhatsappKey = '';

      if (property.agent_id) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .or(`id.eq."${property.agent_id}",email.eq."${property.agent_id}"`)
          .maybeSingle();

        if (agentData) {
          agentEmail = agentData.email || agentEmail;
          agentPhone = agentData.phone || agentPhone;
          agentWhatsappKey = agentData.whatsapp_api_key || '';
        }
      }

      await triggerNotification('new_inquiry', {
        property_title: property.listing_title,
        property_id: property.id,
        district: property.district || 'Colombo',
        city: property.city || 'Colombo',
        price_lkr: property.price_lkr || 'N/A',
        agent_email: agentEmail,
        agent_phone: agentPhone,
        agent_whatsapp_key: agentWhatsappKey,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        message: formData.message
      });
      
      runLeadFollowUpWorkflow({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      }, property).catch(console.error);

      setInquirySuccess(true);
      toast.success('Inquiry submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: 'I am interested in this property. Please contact me with more information.'
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Inquiry submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async () => {
    if (translatedDesc) {
      setShowOriginal(!showOriginal);
      return;
    }

    const desc = (property.property_description || property.description || "").trim();
    if (!desc) return;

    setIsTranslating(true);
    try {
      const result = await translateDescription(desc, 'sinhala');
      setTranslatedDesc(result);
      setShowOriginal(false);
      toast.success('Translated successfully!');
    } catch (err) {
      console.error('Translation error:', err);
      toast.error('Could not translate text.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isLoggedIn = safeLocalStorage.getItem('owner_logged_in') === 'true' || safeLocalStorage.getItem('agent_logged_in') === 'true';
    if (!isLoggedIn) {
      setShowSaveModal(true);
    } else {
      toggleFavorite(Number(property.id));
      const saved = !favorites.has(Number(property.id));
      toast.success(saved ? 'Saved to Favorites!' : 'Removed from Favorites.');
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          if (!saved) {
            supabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', property.id).then();
          } else {
            supabase.from('saved_properties').insert([{ user_id: user.id, property_id: property.id }]).then();
          }
        }
      });
    }
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    setActiveMobileIndex(index);
  };

  const images = property ? getPropertyImagesList(property.images) : [];

  // Full-page Gallery Initialization & Navigation Engine
  useEffect(() => {
    const preloadedImages: Record<string, HTMLImageElement> = {};
    
    // 1. Preload images
    (window as any).preloadGalleryImages = function(urls: string[]) {
      if (!urls) return;
      urls.forEach((url) => {
        if (preloadedImages[url]) return;
        const img = new Image();
        img.src = url;
        preloadedImages[url] = img;
      });
    };

    // 2. Open Gallery
    (window as any).openLPGallery = function(
      urls: string[], startIndex: number, title: string, location: string
    ) {
      const page = document.getElementById('lp-gallery-page');
      if (!page) return;

      const titleEl = document.getElementById('lp-gallery-prop-title');
      const locEl = document.getElementById('lp-gallery-prop-location');
      if (titleEl) titleEl.textContent = title || '';
      if (locEl) locEl.textContent = '📍 ' + (location || '');

      // Build photo list
      buildGalleryPhotos(urls, startIndex || 0);

      // Update counter
      const counter = document.getElementById('lp-gallery-counter');
      if (counter) counter.textContent = `${urls.length} Photos`;

      // Update end count
      const endCount = document.getElementById('lp-gallery-end-count');
      if (endCount) endCount.textContent = `All ${urls.length} photos for this property`;

      // SHOW INSTANTLY
      page.style.display = 'block';
      document.body.style.overflow = 'hidden';

      // Scroll to clicked photo instantly
      requestAnimationFrame(() => {
        const target = document.getElementById('lp-gphoto-' + (startIndex || 0));
        if (target) {
          target.scrollIntoView({ 
            behavior: 'auto',
            block: 'start' 
          });
        }
      });
    };

    // ── BUILD PHOTO LIST ──
    function buildGalleryPhotos(urls: string[], startIndex: number) {
      const container = document.getElementById('lp-gallery-photos');
      if (!container) return;

      container.innerHTML = urls.map((url, i) => `
        <div id="lp-gphoto-${i}" 
             class="lp-gallery-item"
             style="
               border-bottom: 1px solid #F3F4F6;
               background: #ffffff;
               position: relative;
             ">

          <!-- Photo number badge -->
          <div style="
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(0,0,0,0.55);
            color: white;
            font: 600 12px Plus Jakarta Sans, sans-serif;
            padding: 4px 10px;
            border-radius: 20px;
            z-index: 2;
            backdrop-filter: blur(4px);
          ">${i + 1} / ${urls.length}</div>

          <!-- The photo -->
          <img
            src="${i === startIndex ? url : ''}"
            data-src="${url}"
            alt="Property Photo ${i + 1}"
            loading="${i === startIndex ? 'eager' : 'lazy'}"
            style="
              width: 100%;
              max-height: 92vh;
              object-fit: contain;
              display: block;
              background: #F8F9FA;
            "
            onload="this.style.background='transparent'"
          />

          <!-- Download this photo -->
          <div style="
            position: absolute;
            bottom: 16px;
            right: 16px;
            z-index: 2;
          ">
            <a href="${url}" download
               onclick="event.stopPropagation()"
               style="
                 display: inline-flex;
                 align-items: center;
                 gap: 5px;
                 background: rgba(0,0,0,0.55);
                 color: white;
                 padding: 6px 12px;
                 border-radius: 8px;
                 font: 600 12px Plus Jakarta Sans, sans-serif;
                 text-decoration: none;
                 backdrop-filter: blur(4px);
               "
            >
              <svg width="13" height="13"
                   viewBox="0 0 24 24" fill="none"
                   stroke="white" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Save
            </a>
          </div>

        </div>
      `).join('');

      // Lazy load remaining images using IntersectionObserver
      setupLazyLoad();
    }

    // ── LAZY LOAD WITH INTERSECTION OBSERVER ──
    function setupLazyLoad() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src && img.src !== src) {
                img.src = src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        },
        { 
          rootMargin: '400px 0px',
          threshold: 0
        }
      );

      document.querySelectorAll('.lp-gallery-item img[data-src]').forEach(img => observer.observe(img));
    }

    // ── CLOSE GALLERY ──
    (window as any).closeLPGallery = function() {
      const page = document.getElementById('lp-gallery-page');
      if (page) {
        page.style.display = 'none';
        page.scrollTop = 0;
      }
      document.body.style.overflow = '';
    };

    // Keyboard ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      const page = document.getElementById('lp-gallery-page');
      if (page && page.style.display !== 'none' && e.key === 'Escape') {
        (window as any).closeLPGallery();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Scroll tracking for active download URL and active counter
    const handleScroll = () => {
      const page = document.getElementById('lp-gallery-page');
      if (!page || page.style.display === 'none') return;
      const items = page.querySelectorAll('.lp-gallery-item');
      let minDiff = Infinity;
      let currentIndex = 0;
      items.forEach((item, idx) => {
        const rect = item.getBoundingClientRect();
        const diff = Math.abs(rect.top);
        if (diff < minDiff) {
          minDiff = diff;
          currentIndex = idx;
        }
      });

      const counter = document.getElementById('lp-gallery-counter');
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${items.length} Photos`;
      }

      const downloadLink = document.getElementById('lp-gallery-download') as HTMLAnchorElement;
      if (downloadLink) {
        const activeImg = items[currentIndex]?.querySelector('img') as HTMLImageElement;
        const currentSrc = activeImg?.src || activeImg?.dataset?.src || '';
        if (currentSrc) {
          downloadLink.href = currentSrc;
        }
      }
    };

    const galleryPage = document.getElementById('lp-gallery-page');
    if (galleryPage) {
      galleryPage.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Swipe down to close (mobile)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientY - touchStartY;
      if (diff > 80 && galleryPage && galleryPage.scrollTop < 10) {
        (window as any).closeLPGallery();
      }
    };

    if (galleryPage) {
      galleryPage.addEventListener('touchstart', handleTouchStart, { passive: true });
      galleryPage.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (galleryPage) {
        galleryPage.removeEventListener('scroll', handleScroll);
        galleryPage.removeEventListener('touchstart', handleTouchStart);
        galleryPage.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  // Preload and connect when property loads
  useEffect(() => {
    if (!property) return;
    const allUrls = images;
    const propTitle = property.title || property.listing_title || 'Property';
    const propLocation = [property.city, property.district].filter(Boolean).join(', ');

    if ((window as any).preloadGalleryImages) {
      (window as any).preloadGalleryImages(allUrls);
    }

    const backBtn = document.getElementById('lp-gallery-back');
    if (backBtn) {
      const handler = () => {
        if ((window as any).closeLPGallery) {
          (window as any).closeLPGallery();
        }
      };
      backBtn.addEventListener('click', handler);
      return () => {
        backBtn.removeEventListener('click', handler);
      };
    }
  }, [property, images]);

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-6 text-center font-sans">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-gray-500 mb-6">The listing you are looking for might have been removed or is unavailable.</p>
        <button onClick={onBack} className="bg-[#1A5E2A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0F3D1A] transition-all">
          Go Back Home
        </button>
      </div>
    );
  }

  const converted = convertPrice(property.price_lkr || property.price);

  // Compute Google Maps URLs dynamically
  const getGoogleMapsUrls = () => {
    const lat = property.latitude;
    const lng = property.longitude;
    const address = [
      property.address,
      property.city,
      property.district,
      'Sri Lanka'
    ].filter(Boolean).join(', ');

    let mapsUrl = '';
    let directionsUrl = '';

    if (lat && lng) {
      // Use GPS coordinates (most accurate)
      mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    } else {
      // Fallback: search by address
      const encoded = encodeURIComponent(address);
      mapsUrl = `https://www.google.com/maps/search/${encoded}`;
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    }
    return { mapsUrl, directionsUrl };
  };

  const { mapsUrl, directionsUrl } = getGoogleMapsUrls();
  
  // Parse description text and word counts
  const fullDesc = (property.property_description || property.description || "").trim();
  const descWords = fullDesc.split(/\s+/);
  const hasLongDesc = descWords.length > 300;
  const truncatedDesc = hasLongDesc ? descWords.slice(0, 300).join(' ') + '...' : fullDesc;
  const activeDescText = showOriginal ? (isDescriptionExpanded ? fullDesc : truncatedDesc) : (translatedDesc || '');

  // Get amenity-specific icons dynamically with support for all variations
  const getAmenityIcon = (amenityName: string): string => {
    const iconMap: Record<string, string> = {
      'Air Conditioning':       '❄️',
      'Fully Air Conditioned':  '❄️',
      'AC':                     '❄️',
      'Parking / Garage':       '🚗',
      'Parking Space':          '🚗',
      'Double Parking Port':    '🚗',
      'Open Parking':           '🚗',
      'Covered Parking':        '🚗',
      'Swimming Pool':          '🏊',
      'Private Pool':           '🏊',
      'Gymnasium':              '🏋️',
      'Gym Access':             '🏋️',
      'Gym':                    '🏋️',
      'Garden':                 '🌿',
      'Private Landscaped Garden': '🌿',
      'Private Garden':         '🌿',
      'Generator':              '⚡',
      'Backup Generator':       '⚡',
      'Backup Generator System': '⚡',
      'Water Tank':             '💧',
      'Solar Panels':           '☀️',
      'Solar Power':            '☀️',
      'Solar Power Energy':     '☀️',
      'Security System / CCTV': '📷',
      '24 Hours CCTV & Security': '📷',
      '24-Hour CCTV':           '📷',
      'CCTV':                   '📷',
      'Intercom':               '🔔',
      'Elevator / Lift':        '🛗',
      'Elevator/Lift':          '🛗',
      'Club House':             '🏛️',
      "Children's Play Area":   '🎠',
      'City Water Supply':      '🚰',
      'Borehole / Well':        '⛏️',
      'Borehole/Well Water':    '⛏️',
      'Broadband Internet':     '🌐',
      'Fiber Internet Ready':   '🌐',
      'Fiber Internet':         '🌐',
      'High-Speed Wifi':        '🌐',
      'Cable TV':               '📺',
      'Smart TV':               '📺',
      'Furnished':              '🛋️',
      'Fully Furnished':        '🛋️',
      'Semi Furnished':         '🪑',
      'Balcony':                '🏡',
      'Terrace':                '🌄',
      'Generous Rooftop Terrace': '🌄',
      'Rooftop Terrace':        '🌄',
      'Store Room':             '📦',
      "Servant's Quarters":     '🏠',
      'Maids Quarters':         '🏠',
      'Pet Friendly':           '🐾',
      'BBQ Area':               '🔥',
      'Outdoor Kitchen':        '🍳',
      'Modern Kitchen':         '🍳',
      'Laundry Room':           '🫧',
      'Hot Water System':       '💧',
      'Hot Water':              '💧',
      '24/7 Security':          '🛡️',
      'Security':               '🛡️',
      'Security Guards':        '🛡️',
      'Electric Fence':         '⚡',
      'Gated Community':        '🏡',
      'Alarm System':           '🚨',
      'Three-Phase Electricity': '⚡',
      'Sports Court':           '🏀',
      'Near Main Road':         '🛣️',
      'Near Highway':           '🛣️',
      'Near School':            '🏫',
      'Near Hospital':          '🏥',
      'Near Shopping':          '🛒',
      'Near Beach':             '🏖️',
      'Sea View':               '🌊',
      'Mountain View':          '⛰️',
      'City View':              '🏙️',
      'Clear Title Deed':       '📄',
      'Survey Plan Ready':      '🗺️',
      'No Legal Issues':        '⚖️',
      'Undivided Property':     '🏢',
      'Condominium Title':      '🏢',
      'Roller Shutter Gate':    '🚧',
    };

    const trimmed = amenityName.trim();
    if (iconMap[trimmed]) return iconMap[trimmed];
    
    const matchedKey = Object.keys(iconMap).find(
      key => key.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchedKey) return iconMap[matchedKey];

    const matchedSubstringKey = Object.keys(iconMap).find(
      key => trimmed.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(trimmed.toLowerCase())
    );
    if (matchedSubstringKey) return iconMap[matchedSubstringKey];

    return '✅';
  };

  // Extract ONLY real amenities saved in the database
  const getDetectedAmenities = () => {
    let list: string[] = [];

    // Format A: Array column
    if (Array.isArray(property.amenities)) {
      list = [...property.amenities];
    }
    // Format B: JSON column / object
    else if (typeof property.amenities === 'object' && property.amenities !== null) {
      const labelMap: Record<string, string> = {
        air_conditioning:   'Air Conditioning',
        parking:            'Parking / Garage',
        swimming_pool:      'Swimming Pool',
        garden:             'Garden',
        generator:          'Generator',
        water_tank:         'Water Tank',
        solar_panel:        'Solar Panels',
        security_system:    'Security System / CCTV',
        intercom:           'Intercom',
        elevator:           'Elevator / Lift',
        gym:                'Gym',
        club_house:         'Club House',
        play_area:          'Children\'s Play Area',
        city_water:         'City Water Supply',
        borehole:           'Borehole / Well',
        septic_tank:        'Septic Tank',
        main_sewerage:      'Main Sewerage',
        broadband:          'Broadband Internet',
        cable_tv:           'Cable TV',
        furnished:          'Furnished',
        semi_furnished:     'Semi Furnished',
        balcony:            'Balcony',
        terrace:            'Terrace',
        store_room:         'Store Room',
        servant_room:       'Servant\'s Quarters',
        laundry_room:       'Laundry Room',
        outdoor_kitchen:    'Outdoor Kitchen',
        bbq_area:           'BBQ Area',
        pet_friendly:       'Pet Friendly',
      };
      Object.entries(property.amenities).forEach(([key, val]) => {
        if (val === true || val === 1 || val === 'true' || val === 'yes') {
          const label = labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          list.push(label);
        }
      });
    }

    // Format C: Separate boolean columns
    const booleanFields: Record<string, string> = {
      has_garden: 'Private Garden',
      has_pool: 'Swimming Pool',
    };
    Object.entries(booleanFields).forEach(([field, label]) => {
      if (property[field] === true || property[field] === 1 || property[field] === 'true') {
        if (!list.includes(label)) {
          list.push(label);
        }
      }
    });

    // Handle parking space column
    if (property.parking_spaces && Number(property.parking_spaces) > 0) {
      if (!list.includes('Parking / Garage') && !list.includes('Parking Space') && !list.includes('Double Parking Port') && !list.includes('Open Parking') && !list.includes('Covered Parking')) {
        list.push('Parking / Garage');
      }
    }

    // Format D: Parse from comma-separated additional_info (which is how selectedAmenities are saved)
    const addInfo = property.additional_info || property.additional_information;
    if (typeof addInfo === 'string' && addInfo.trim() !== '') {
      const parts = addInfo.split(',').map(p => p.trim()).filter(Boolean);
      const isAmenitiesList = parts.every(p => p.length < 40) && parts.length > 0;
      
      if (isAmenitiesList) {
        parts.forEach(part => {
          const alreadyInList = list.some(existing => existing.toLowerCase() === part.toLowerCase());
          if (!alreadyInList) {
            list.push(part);
          }
        });
      } else {
        // Scan text block for known amenity words
        const knownAmenities = [
          "Air Conditioning", "Hot Water System", "Fully Air Conditioned", "Elevator/Lift", "Built-in Wardrobes", "Modern Kitchen",
          "24-Hour CCTV", "Security Guards", "Electric Fence", "Gated Community", "Alarm System", "Intercom",
          "Solar Power", "Backup Generator", "Three-Phase Electricity", "Borehole/Well Water", "City Water Supply", "Fiber Internet Ready",
          "Swimming Pool", "Private Garden", "Rooftop Terrace", "BBQ Area", "Children's Play Area", "Sports Court",
          "Garage (Single)", "Garage (Double)", "Open Parking", "Covered Parking", "Parking Area", "Parking / Garage", "24/7 Security"
        ];
        
        const textLower = addInfo.toLowerCase();
        knownAmenities.forEach(amenity => {
          if (textLower.includes(amenity.toLowerCase())) {
            const alreadyInList = list.some(existing => existing.toLowerCase() === amenity.toLowerCase());
            if (!alreadyInList) {
              list.push(amenity);
            }
          }
        });
      }
    }

    // Unique filter
    const uniqueList: string[] = [];
    const seen = new Set<string>();
    list.forEach(item => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(item);
      }
    });

    return uniqueList;
  };

  const detectedAmenities = getDetectedAmenities();

  // Dynamic Features & Specs Table with real data from Supabase, hiding empty/null fields
  const getDynamicSpecRows = () => {
    const rows = [];

    // Listing Type
    if (property.listing_type) {
      rows.push({
        label: 'Listing Type',
        icon: '🏷️',
        value: property.listing_type === 'Rent' || property.listing_type === 'FOR RENT' ? 'For Rent' : property.listing_type === 'Sale' || property.listing_type === 'FOR SALE' ? 'For Sale' : property.listing_type
      });
    }

    // Property Type
    const propType = property.property_type || property.property_category || property.category;
    if (propType) {
      rows.push({
        label: 'Property Type',
        icon: '🏢',
        value: propType
      });
    }

    // Land Size
    const landSizeVal = property.land_area || property.land_size;
    if (landSizeVal && String(landSizeVal).trim() !== '' && String(landSizeVal) !== '0') {
      const landUnitStr = property.land_unit || property.land_unit_type || 'Perches';
      rows.push({
        label: 'Land Size',
        icon: '📐',
        value: `${landSizeVal} ${landUnitStr}`
      });
    }

    // Floor Area
    const floorAreaVal = property.floor_area || property.floor_area_sqft || property.size;
    if (floorAreaVal && String(floorAreaVal).trim() !== '' && String(floorAreaVal) !== '0') {
      const displayArea = String(floorAreaVal).toLowerCase().includes('sq') ? floorAreaVal : `${floorAreaVal} sqft`;
      rows.push({
        label: 'Floor Area',
        icon: '📏',
        value: displayArea
      });
    }

    // Bedrooms
    const bedroomsVal = property.bedrooms || property.rooms;
    if (bedroomsVal && Number(bedroomsVal) > 0) {
      rows.push({
        label: 'Bedrooms',
        icon: '🛏️',
        value: `${bedroomsVal} Bed${Number(bedroomsVal) > 1 ? 's' : ''}`
      });
    }

    // Bathrooms
    const bathroomsVal = property.bathrooms;
    if (bathroomsVal && Number(bathroomsVal) > 0) {
      rows.push({
        label: 'Bathrooms',
        icon: '🚿',
        value: `${bathroomsVal} Bath${Number(bathroomsVal) > 1 ? 's' : ''}`
      });
    }

    // Price
    const priceVal = property.price_lkr || property.price;
    if (priceVal && Number(priceVal) > 0) {
      const isRent = String(property.listing_type).toLowerCase().includes('rent');
      rows.push({
        label: isRent ? 'Monthly Rent' : 'Sale Price',
        icon: '💰',
        value: `Rs. ${Number(priceVal).toLocaleString()}`
      });
    }

    // Total Floors
    if (property.floors && Number(property.floors) > 0) {
      rows.push({
        label: 'Total Floors',
        icon: '🏗️',
        value: String(property.floors)
      });
    }

    // Year Built
    if (property.year_built && String(property.year_built).trim() !== '' && String(property.year_built) !== '0') {
      rows.push({
        label: 'Year Built',
        icon: '🏗️',
        value: String(property.year_built)
      });
    }

    // Parking Slots
    const parkingVal = property.parking_slots || property.parking_spaces;
    if (parkingVal && Number(parkingVal) > 0) {
      rows.push({
        label: 'Parking',
        icon: '🚗',
        value: `${parkingVal} Vehicle${Number(parkingVal) > 1 ? 's' : ''}`
      });
    }

    // Furnishing Status
    if (property.furnishing_status && String(property.furnishing_status).trim() !== '' && String(property.furnishing_status) !== 'null') {
      rows.push({
        label: 'Furnishing',
        icon: '🛋️',
        value: property.furnishing_status
      });
    }

    // Negotiable
    if (property.is_negotiable !== undefined && property.is_negotiable !== null) {
      rows.push({
        label: 'Negotiable',
        icon: '🤝',
        value: property.is_negotiable ? 'Yes' : 'No'
      });
    }

    // Available From
    if (property.available_from && String(property.available_from).trim() !== '') {
      let dateStr = property.available_from;
      try {
        const d = new Date(property.available_from);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (e) {
        // use raw string
      }
      rows.push({
        label: 'Available From',
        icon: '📅',
        value: dateStr
      });
    }

    // Land Type
    const landTypeVal = property.land_type || property.zoning;
    if (landTypeVal && String(landTypeVal).trim() !== '') {
      rows.push({
        label: 'Land Type',
        icon: '🌱',
        value: landTypeVal
      });
    }

    // Title Type
    if (property.title_type && String(property.title_type).trim() !== '') {
      rows.push({
        label: 'Title Type',
        icon: '📋',
        value: property.title_type
      });
    }

    return rows;
  };

  const specRows = getDynamicSpecRows();

  // Dynamic Category Highlights Cards
  const getHighlightsList = () => {
    const isLand = String(property.property_category || '').toLowerCase() === 'land';
    if (isLand) {
      return [
        { icon: '🏢', value: property.property_category || 'Land', label: 'Property Type' },
        { icon: '📐', value: `${property.land_area || 'N/A'} ${property.land_unit || 'Perches'}`, label: 'Land Area' },
        { icon: '🏗️', value: property.zoning || 'Residential', label: 'Zoning' },
        { icon: '🔑', value: property.listing_type || 'For Sale', label: 'Listing Type' },
      ];
    }
    return [
      { icon: '🏢', value: property.property_type || property.property_category || 'Commercial', label: 'Property Type' },
      { icon: '📐', value: `${property.floor_area || property.size || '7,500'} sq.ft`, label: 'Floor Area' },
      { icon: '🏗️', value: `${property.floors || '4'} Floors`, label: 'Total Floors' },
      { icon: '🔑', value: property.listing_type || 'For Rent', label: 'Listing Type' },
    ];
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-24 [perspective:1200px]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 space-y-4">
        
        {/* SECTION 1 — PHOTO GALLERY (DESKTOP) */}
        <div className="hidden md:flex gap-2 h-[460px] w-full relative rounded-2xl overflow-hidden shadow-sm">
          {/* Main Photo (60%) */}
          <div 
            id="gallery-main"
            onClick={() => {
              if ((window as any).openLPGallery) {
                const propTitle = property.title || property.listing_title || 'Property';
                const propLocation = [property.city, property.district].filter(Boolean).join(', ');
                (window as any).openLPGallery(images, 0, propTitle, propLocation);
              }
            }}
            className="w-[60%] h-full overflow-hidden cursor-pointer relative group"
            style={{ cursor: 'pointer' }}
          >
            <img 
              src={getOptimizedImageUrl(images[0], 'main')} 
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
              referrerPolicy="no-referrer"
              alt="Main listing" 
            />
            
            {/* View All pill button */}
            <button 
              id="view-all-photos"
              onClick={(e) => {
                e.stopPropagation();
                if ((window as any).openLPGallery) {
                  const propTitle = property.title || property.listing_title || 'Property';
                  const propLocation = [property.city, property.district].filter(Boolean).join(', ');
                  (window as any).openLPGallery(images, 0, propTitle, propLocation);
                }
              }}
              className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-1.5 z-10 transition-all hover:scale-105 cursor-pointer"
            >
              <span>📷</span> View All {images.length} Photos
            </button>
          </div>

          {/* Right side 2x2 grid (40%) */}
          <div className="w-[40%] h-full grid grid-cols-2 grid-rows-2 gap-2 bg-gray-50">
            {[1, 2, 3, 4].map((idx) => {
              const hasImage = !!images[idx];
              const isLast = idx === 4;
              return (
                <div 
                  key={idx}
                  onClick={() => {
                    if (hasImage && (window as any).openLPGallery) {
                      const propTitle = property.title || property.listing_title || 'Property';
                      const propLocation = [property.city, property.district].filter(Boolean).join(', ');
                      (window as any).openLPGallery(images, idx, propTitle, propLocation);
                    }
                  }}
                  className={`gallery-thumb relative overflow-hidden h-full ${hasImage ? 'cursor-pointer' : 'bg-gray-100'} group`}
                  style={{ cursor: hasImage ? 'pointer' : 'default' }}
                >
                  {hasImage ? (
                    <>
                      <img 
                        src={getOptimizedImageUrl(images[idx], 'thumb')} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" 
                        referrerPolicy="no-referrer"
                        alt={`Thumbnail ${idx}`} 
                      />
                      {isLast && images.length > 5 && (
                        <div 
                          id="more-photos-btn"
                          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10 cursor-pointer"
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="text-xl font-black">📷 +{images.length - 5}</span>
                          <span className="text-[10px] font-bold tracking-wide uppercase mt-1">More Photos</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">
                      LankaProperty
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE SWIPE GALLERY */}
        <div className="md:hidden relative h-[260px] -mx-4 overflow-hidden bg-gray-900">
          <div 
            onScroll={handleMobileScroll}
            className="w-full h-full shrink-0 snap-x snap-mandatory flex overflow-x-auto scroll-smooth scrollbar-none"
          >
            {images.map((img: string, idx: number) => (
              <div 
                key={idx} 
                onClick={() => {
                  if ((window as any).openLPGallery) {
                    const propTitle = property.title || property.listing_title || 'Property';
                    const propLocation = [property.city, property.district].filter(Boolean).join(', ');
                    (window as any).openLPGallery(images, idx, propTitle, propLocation);
                  }
                }}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer"
              >
                <img 
                  src={idx === 0 ? getOptimizedImageUrl(img, 'main') : getOptimizedImageUrl(img, 'thumb')} 
                  loading={idx === 0 ? "eager" : "lazy"} 
                  alt={`Slide ${idx}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
            ))}
          </div>


          {/* Indicators */}
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 border border-white/15 pointer-events-none">
            {activeMobileIndex + 1} / {images.length}
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeMobileIndex ? 'bg-white w-3' : 'bg-white/50'}`} 
              />
            ))}
          </div>
        </div>

        {/* SECTION 2 — TITLE + PRICE HEADER */}
        <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          {/* Breadcrumb at the top of the card */}
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#9ca3af] mb-4 border-b border-gray-100 pb-4">
            <button onClick={onBack} className="hover:text-[#1A5E2A] transition-colors font-medium cursor-pointer">Home</button>
            <span>›</span>
            <span className="hover:text-[#1A5E2A] cursor-pointer transition-colors font-medium">{property.district || 'Colombo'}</span>
            <span>›</span>
            <span className="hover:text-[#1A5E2A] cursor-pointer transition-colors font-medium">{property.city || 'Nugegoda'}</span>
            <span>›</span>
            <span className="text-[#111827] font-semibold truncate max-w-[200px] sm:max-w-xs">{property.listing_title || 'Property Detail'}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-8">
            {/* Left Column (65%) */}
            <div className="space-y-4">
              {/* Status Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[12px] font-bold uppercase px-3 py-1 rounded-full border tracking-wide ${
                  String(property.listing_type).toLowerCase() === 'sale' 
                    ? 'detail-badge-sale bg-red-50 text-red-700 border-red-200' 
                    : String(property.listing_type).toLowerCase() === 'rent'
                    ? 'detail-badge-rent bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
                    : 'detail-badge-lease bg-[#fffdf5] text-[#f9a825] border-[#fde68a]'
                }`}>
                  {String(property.listing_type).toLowerCase() === 'sale' ? '🔴 FOR SALE' : '🔵 FOR RENT'}
                </span>
                <span className="status-active flex items-center gap-1.5 text-[12px] font-bold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] px-3.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#15803d] rounded-full animate-pulse" /> Active
                </span>
                {property.ref_no ? (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(property.ref_no);
                      setCopiedRef(true);
                      toast.success('Reference Copied!');
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    REF: <span className="font-mono text-gray-800">{property.ref_no}</span> 📋
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`LP${property.id || '0186'}`);
                      setCopiedRef(true);
                      toast.success('Reference Copied!');
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-full transition-all cursor-pointer"
                  >
                    REF: <span className="font-mono text-gray-800">LP{property.id || '0186'}</span> 📋
                  </button>
                )}
              </div>

              {/* Title */}
              <h1 className="detail-title text-2xl sm:text-[28px] font-extrabold text-[#111827] leading-[1.3] tracking-tight">
                {property.listing_title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-[#6b7280] text-[14px]">
                <span>📍</span>
                <span className="font-medium">{property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}</span>
              </div>

              {/* Quick Specs Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-medium text-[#374151] pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span>🏢</span>
                  <span>{property.property_type || property.property_category || 'Commercial'}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>📐</span>
                  <span>{property.floor_area || property.size || '7,500'} sq.ft</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span>🔑</span>
                  <span>{property.listing_type || 'For Rent'}</span>
                </div>
              </div>
            </div>

            {/* Right Column (35%) Price Card */}
            <div>
              <div className="bg-[#fcfdfd] border border-[#e5e7eb] rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">
                    {String(property.listing_type).toLowerCase() === 'sale' ? 'SELLING PRICE' : 'MONTHLY RENT'}
                  </p>
                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="detail-price text-[32px] font-black text-[#1A5E2A]">
                      Rs. {(property.price_lkr || property.price || 1500000).toLocaleString()}
                    </span>
                    {property.is_negotiable && (
                      <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Negotiable
                      </span>
                    )}
                  </div>
                  {converted && (
                    <p className="text-xs font-semibold text-[#6b7280] mt-1">
                      {converted.usd} <span className="mx-1">·</span> {converted.eur}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
                    className="whatsapp-btn w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Now
                  </button>

                  <button 
                    onClick={() => window.open(`tel:+94771234567`)}
                    className="call-btn w-full bg-white border-2 border-[#1A5E2A] text-[#1A5E2A] hover:bg-[#f0fdf4] rounded-xl py-3.5 px-5 font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>📞</span> Call Now
                  </button>
                </div>

                <div className="flex justify-center gap-4 border-t border-gray-100 pt-3">
                  <button 
                    onClick={handleSaveClick}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#1A5E2A] transition-all cursor-pointer"
                  >
                    <Heart size={16} fill={favorites.has(Number(property.id)) ? '#dc2626' : 'none'} className={favorites.has(Number(property.id)) ? 'text-red-500' : ''} />
                    {favorites.has(Number(property.id)) ? 'Saved' : 'Save'}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button 
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/property/${property.id}`;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        toast.success('Link copied to clipboard!');
                      });
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6b7280] hover:text-[#1A5E2A] transition-all cursor-pointer"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — PROPERTY DETAILS */}
        
        {/* 3A. KEY HIGHLIGHTS BAR */}
        <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {getHighlightsList().map((item, idx) => (
              <div key={idx} className="border border-[#e5e7eb] rounded-[14px] p-5 flex flex-col justify-between hover:shadow-sm transition-all bg-white">
                <div className="text-[28px] text-[#1A5E2A] mb-2">{item.icon}</div>
                <div>
                  <div className="text-base font-bold text-[#111827]">{item.value}</div>
                  <div className="text-[12px] text-[#9ca3af] mt-0.5">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3B. PROPERTY DESCRIPTION */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-[#1A5E2A] pl-3 mb-6">
              <h2 className="detail-section-title text-lg font-bold text-[#111827]">Property Description</h2>
              
              {/* Translator button */}
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="text-xs font-bold text-[#1A5E2A] hover:text-[#0F3D1A] transition-all bg-[#1A5E2A]/5 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#1A5E2A]/10 cursor-pointer"
              >
                <Globe size={14} className={isTranslating ? "animate-spin" : ""} />
                {isTranslating ? 'Translating...' : !showOriginal ? 'Show English' : 'Translate to Sinhala 🗣️'}
              </button>
            </div>

            {/* Text block */}
            <div className={`text-[15px] text-[#374151] leading-[1.8] space-y-4 whitespace-pre-line overflow-hidden transition-all duration-300 ${!isDescriptionExpanded ? 'max-h-[140px] relative' : 'max-h-none'}`}>
              {activeDescText.split('\n\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
            </div>

            {showOriginal && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-4 text-[14px] font-bold text-[#1A5E2A] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                {isDescriptionExpanded ? 'Show Less ↑' : 'Read More ↓'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-48 flex flex-col justify-center items-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#1A5E2A]/20 border-t-[#1A5E2A] animate-spin mb-2" />
            <div className="text-xs font-bold text-gray-400">Loading Description...</div>
          </div>
        )}

        {/* 3C. FEATURES & SPECIFICATIONS */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="border-l-4 border-[#1A5E2A] pl-3 mb-6">
              <h2 className="detail-section-title text-lg font-bold text-[#111827]">Features & Specifications</h2>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] overflow-hidden divide-y divide-[#e5e7eb]">
              {specRows.map((row, idx) => (
                <div 
                  key={idx} 
                  className={`spec-row grid grid-cols-2 p-3 sm:p-4 text-sm font-medium ${idx % 2 === 0 ? 'bg-[#f9fafb]' : 'bg-white'}`}
                >
                  <div className="text-[#6b7280] flex items-center gap-2">
                    <span className="text-base">{row.icon}</span>
                    <span>{row.label}</span>
                  </div>
                  <div className="spec-value text-[#111827] font-bold text-right">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-48 flex flex-col justify-center items-center">
            <div className="text-xs font-bold text-gray-400">Loading Specifications...</div>
          </div>
        )}

        {/* 3D. FEATURES & AMENITIES */}
        {belowFoldVisible ? (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
            <div className="border-l-4 border-[#1A5E2A] pl-3 mb-6">
              <h2 className="detail-section-title text-lg font-bold text-[#111827]">Features & Amenities</h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {detectedAmenities.length > 0 ? (
                detectedAmenities.map((amenity, idx) => (
                  <span 
                    key={idx} 
                    className="amenity-pill flex items-center gap-1.5 bg-[#f0fdf4] text-[#1A5E2A] border border-[#bbf7d0] rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-200 hover:scale-105"
                  >
                    <span>{getAmenityIcon(amenity)}</span> {amenity}
                  </span>
                ))
              ) : (
                <div className="w-full text-center py-6 text-[#9CA3AF] font-medium text-sm">
                  No amenities listed for this property.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] skeleton-pulse h-24 flex flex-col justify-center items-center">
            <div className="text-xs font-bold text-gray-400">Loading Amenities...</div>
          </div>
        )}

        {/* 3E. LOCATION & MAP */}
        <div ref={mapRef} className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4 border-l-4 border-[#1A5E2A] pl-3 mb-4">
            <h2 className="detail-section-title text-lg font-bold text-[#111827]">Location</h2>
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gmaps-open-btn bg-white border border-[#e5e7eb] rounded-lg px-3.5 py-[7px] text-[13px] font-semibold text-[#374151] inline-flex items-center gap-[6px] cursor-pointer no-underline transition-all duration-150 hover:bg-[#f0fdf4] hover:border-[#1A5E2A] hover:text-[#1A5E2A]"
            >
              🗺️ Open in Google Maps
            </a>
          </div>
          
          <div className="text-sm font-semibold text-[#6b7280] flex items-start gap-1.5 mb-5 leading-normal">
            <span>📍</span> 
            <span>
              {property.address || 'Stanley Tilakaratne Mawatha'}<br />
              {property.city ? `${property.city}, ` : ''}{property.district || 'Colombo'}, Sri Lanka
            </span>
          </div>

          {/* Map container */}
          <div className="h-[380px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-10 mb-6 bg-gray-100 flex flex-col items-center justify-center">
            {mapVisible ? (
              <MapContainer 
                center={[property.latitude ? Number(property.latitude) : 6.8841, property.longitude ? Number(property.longitude) : 79.9402]} 
                zoom={14} 
                className="w-full h-full"
                zoomControl={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[property.latitude ? Number(property.latitude) : 6.8841, property.longitude ? Number(property.longitude) : 79.9402]} icon={customMarkerIcon}>
                  <Popup>
                    <div className="text-center font-sans p-1">
                      <p className="font-bold text-gray-900 text-sm">{property.city || 'Nugegoda'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{property.district || 'Colombo'}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full border-4 border-[#1A5E2A]/20 border-t-[#1A5E2A] animate-spin mx-auto" />
                <div className="text-sm font-bold text-gray-400">Loading Map...</div>
              </div>
            )}
          </div>

          {/* Action buttons side-by-side */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a 
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn gmaps-directions-btn flex-1 py-3 px-4 bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white rounded-[10px] font-semibold text-sm flex items-center justify-center gap-2 no-underline transition-colors duration-150 cursor-pointer"
            >
              📍 Get Directions
            </a>
            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="maps-btn gmaps-open-btn flex-1 py-3 px-4 bg-white hover:bg-[#f0fdf4] hover:border-[#1A5E2A] hover:text-[#1A5E2A] text-[#374151] border-[1.5px] border-[#e5e7eb] rounded-[10px] font-semibold text-sm flex items-center justify-center gap-2 no-underline transition-all duration-150 cursor-pointer"
            >
              🗺️ Open in Google Maps
            </a>
          </div>

          {/* Nearby landmarks grid */}
          <div className="bg-[#f9fafb] rounded-[10px] p-5 border border-[#e5e7eb]">
            <p className="text-xs font-black uppercase tracking-widest text-[#1A5E2A] mb-4 flex items-center gap-1">
              <span>📍</span> Nearby Landmarks
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span>🏫</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">School</span>
                  <span className="text-gray-850 font-bold text-sm">0.3km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🏥</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Hospital</span>
                  <span className="text-gray-850 font-bold text-sm">1.1km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🏦</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Bank</span>
                  <span className="text-gray-850 font-bold text-sm">0.5km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🛒</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Shopping</span>
                  <span className="text-gray-850 font-bold text-sm">0.2km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🚌</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Bus Stop</span>
                  <span className="text-gray-850 font-bold text-sm">0.1km</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>⛽</span>
                <div>
                  <span className="text-gray-400 text-[11px] font-bold uppercase block">Petrol</span>
                  <span className="text-gray-850 font-bold text-sm">0.8km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — CONTACT DETAILS */}
        <div ref={contactRef} className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="border-l-4 border-[#1A5E2A] pl-3 mb-6">
            <h2 className="detail-section-title text-lg font-bold text-[#111827]">Contact the Owner / Agent</h2>
          </div>
          
          {contactVisible ? (
            <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-8 animate-fade-in">
              {/* LEFT COLUMN: Agent/Owner Info (45%) */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-gray-50">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" 
                      className="w-full h-full object-cover" 
                      alt="Agent Avatar" 
                    />
                  </div>
                  <div>
                    <h4 className="text-[18px] font-bold text-gray-900">{property.agent_name || 'Pradeep Jayawardene'}</h4>
                    <p className="text-xs text-[#1A5E2A] font-semibold">Commercial Property Owner</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[#f5a623] text-xs font-bold">
                      <span>⭐⭐⭐⭐⭐</span> 
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">Verified Seller ✅</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-semibold mt-1">Member since: May 2024</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
                    className="whatsapp-btn w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl py-3.5 px-5 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Now
                  </button>

                  {phoneRevealed ? (
                    <button 
                      onClick={() => window.open(`tel:+94771234567`)}
                      className="call-btn w-full bg-white border-2 border-[#1A5E2A] text-[#1A5E2A] hover:bg-[#f0fdf4] rounded-xl py-3.5 px-5 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>📞</span> Call: +94 77 123 4567
                    </button>
                  ) : (
                    <div className="space-y-2 text-center">
                      <p className="text-xs text-gray-400 font-semibold">📞 Phone number hidden for privacy</p>
                      <button 
                        onClick={() => setPhoneRevealed(true)}
                        className="text-[#1A5E2A] hover:underline font-bold text-sm cursor-pointer"
                      >
                        🔓 Click to Reveal Number
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1.5 text-gray-500 font-medium">
                  <p>⚡ Response time: Usually replies within 1 hour</p>
                  <p>🗣️ Languages: Sinhala, English</p>
                </div>
              </div>

              {/* RIGHT COLUMN: Contact Form (55%) */}
              <div className="bg-[#f9fafb] p-6 rounded-2xl border border-gray-100">
                <h3 className="text-base font-bold text-[#111827] mb-4">Send a Message</h3>

                {inquirySuccess ? (
                  <div className="p-6 bg-white text-[#15803d] border border-[#bbf7d0] rounded-xl text-center space-y-3 shadow-sm animate-in fade-in duration-300">
                    <div className="text-lg font-bold">✅ Message Sent!</div>
                    <p className="text-xs text-gray-650">The owner will contact you shortly.</p>
                    <button 
                      onClick={() => setInquirySuccess(false)}
                      className="text-xs font-extrabold text-[#1A5E2A] hover:underline cursor-pointer"
                    >
                      [Send Another Message]
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="contact-form space-y-4">
                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        placeholder="Your Full Name" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5E2A]/10 focus:border-[#1A5E2A] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Phone / WhatsApp *</label>
                      <input 
                        type="tel" 
                        placeholder="+94 77 123 4567" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5E2A]/10 focus:border-[#1A5E2A] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Email</label>
                      <input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5E2A]/10 focus:border-[#1A5E2A] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Your Message</label>
                      <textarea 
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A5E2A]/10 focus:border-[#1A5E2A] transition-all resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="contact-submit w-full bg-[#1A5E2A] hover:bg-[#0F3D1A] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? 'Sending...' : '📩 Send Message →'}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center">
                      🔒 Your personal details are kept private and only shared with the seller.
                    </p>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 rounded-full border-4 border-[#1A5E2A]/20 border-t-[#1A5E2A] animate-spin" />
              <p className="text-xs text-gray-400 font-bold">Loading contact info...</p>
            </div>
          )}
        </div>

        {/* SECTION 5 — SIMILAR PROPERTIES */}
        <div ref={similarRef} className="min-h-[50px] w-full" id="similar-properties-section">
          {similarVisible && (
            loadingSimilar ? (
              <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                <style>{`
                  @keyframes shimmer {
                    0%   { background-position: -400px 0 }
                    100% { background-position:  400px 0 }
                  }
                  .animate-shimmer {
                    background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
                    background-size: 400px 100%;
                    animation: shimmer 1.4s ease infinite;
                  }
                `}</style>
                <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                  {Array(6).fill(null).map((_, idx) => (
                    <div key={idx} className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
                      <div className="h-[180px] animate-shimmer" />
                      <div className="p-3.5 space-y-2">
                        <div className="h-3.5 w-3/5 animate-shimmer rounded-md" />
                        <div className="h-3 w-[90%] animate-shimmer rounded-md" />
                        <div className="h-3 w-3/4 animate-shimmer rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : similarProperties.length > 0 ? (
              <div className="bg-white rounded-[16px] border border-[#e5e7eb] p-6 sm:p-7 shadow-[0_2px_10px_rgba(0,0,0,0.06)] animate-fade-in">
                <style>{`
                  .similar-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 18px;
                  }
                  @media (max-width: 768px) {
                    .similar-grid {
                      grid-template-columns: repeat(2, 1fr) !important;
                      gap: 12px !important;
                    }
                    .similar-card-image {
                      height: 140px !important;
                    }
                  }
                  @media (max-width: 480px) {
                    .similar-grid {
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>

                {/* Section heading */}
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[20px] font-bold text-[#111827] border-l-4 border-[#1A5E2A] pl-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Similar Properties
                  </h3>
                  <button 
                    onClick={onBack}
                    className="text-[13px] font-bold text-[#1A5E2A] hover:underline cursor-pointer"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    View All →
                  </button>
                </div>

                {/* 3 columns x 2 rows grid */}
                <div className="similar-grid">
                  {similarProperties.map((prop, idx) => {
                    const cover = getPropertyImage(prop.images);
                    const isSaved = favorites.has(Number(prop.id));

                    // Badge color
                    const badgeColors: Record<string, { bg: string, text: string }> = {
                      'For Sale':  { bg: '#CC1414', text: 'white' },
                      'For Rent':  { bg: '#1565C0', text: 'white' },
                      'For Lease': { bg: '#E8A000', text: 'white' },
                    };
                    const badge = badgeColors[prop.listing_type] || { bg: '#1A5E2A', text: 'white' };

                    // Format price
                    const priceVal = prop.price_lkr || prop.price;
                    const priceStr = priceVal
                      ? `Rs. ${Number(priceVal).toLocaleString('en-LK')}`
                      : 'Price on Request';

                    // Specs row
                    const specs = [];
                    const bedVal = prop.bedrooms || prop.rooms;
                    if (bedVal && Number(bedVal) > 0) {
                      specs.push({ icon: '🛏️', text: `${bedVal} Bed` });
                    }
                    if (prop.bathrooms && Number(prop.bathrooms) > 0) {
                      specs.push({ icon: '🚿', text: `${prop.bathrooms} Bath` });
                    }
                    const landVal = prop.land_area || prop.land_size;
                    if (landVal && String(landVal).trim() !== '' && String(landVal) !== '0') {
                      specs.push({ icon: '📐', text: `${landVal} ${prop.land_unit || 'P'}` });
                    }
                    const floorVal = prop.floor_area || prop.size;
                    if (floorVal && String(floorVal).trim() !== '' && String(floorVal) !== '0' && (!bedVal || Number(bedVal) === 0)) {
                      specs.push({ icon: '📏', text: `${floorVal} sqft` });
                    }

                    return (
                      <div
                        key={prop.id || idx}
                        onClick={() => onPropertyClick(prop)}
                        className="similar-card group flex flex-col justify-between bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-[#1A5E2A] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      >
                        {/* Property Image */}
                        <div className="similar-card-image relative h-[180px] overflow-hidden bg-gray-50">
                          <img 
                            src={getOptimizedImageUrl(cover, 'thumb')}
                            alt={prop.listing_title || prop.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />

                          {/* Listing Type Badge */}
                          <span 
                            className="absolute top-2.5 left-2.5 text-[10px] font-bold tracking-widest px-2 py-1 rounded text-white uppercase"
                            style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                          >
                            {prop.listing_type || 'For Sale'}
                          </span>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(Number(prop.id));
                              toast.success(isSaved ? 'Removed from favorites' : 'Saved to favorites!');
                            }}
                            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer"
                          >
                            <Heart size={14} fill={isSaved ? '#dc2626' : 'none'} className={isSaved ? 'text-red-500' : 'text-gray-650'} />
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <div className="space-y-1 mb-2">
                            {/* Price */}
                            <div className="similar-card-price font-bold text-base text-[#1A5E2A]">
                              {priceStr}
                            </div>

                            {/* Title */}
                            <h4 className="font-semibold text-[13px] text-[#111827] line-clamp-2 leading-snug group-hover:text-[#1A5E2A] transition-colors">
                              {prop.listing_title || prop.title}
                            </h4>

                            {/* Location */}
                            <p className="text-[12px] font-medium text-[#6B7280]">
                              📍 {[prop.city, prop.district].filter(Boolean).join(', ')}
                            </p>
                          </div>

                          {/* Specs Row */}
                          {specs.length > 0 && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2.5 border-t border-[#F3F4F6] text-[12px] font-medium text-[#6B7280]">
                              {specs.map((spec, sIdx) => (
                                <span key={sIdx} className="flex items-center gap-1">
                                  {spec.icon} {spec.text}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div 
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#9CA3AF',
                  font: '500 14px Plus Jakarta Sans, sans-serif'
                }}
                className="bg-white rounded-[16px] border border-[#e5e7eb] shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
              >
                No similar properties found at this time.
              </div>
            )
          )}
        </div>

        {/* LISTING METADATA (small, bottom of page) */}
        <div className="text-center space-y-3 pt-6 text-xs font-semibold text-[#6b7280]">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1.5">
            <span>📅 Listed: 28 June 2026</span>
            <span className="text-gray-300">|</span>
            <span>🔄 Updated: 30 June 2026</span>
            <span className="text-gray-300">|</span>
            <span>🆔 REF: LP{property.id || '0186'}</span>
            <span className="text-gray-300">|</span>
            <span>👁️ {(property.views_count || property.views || 1247).toLocaleString()} Views</span>
          </div>
          <div>
            <button 
              onClick={() => {
                toast.success('Thank you! Report received and will be reviewed.');
              }}
              className="text-xs font-semibold text-[#9ca3af] hover:text-[#dc2626] transition-colors cursor-pointer"
            >
              ⚠️ Report this listing
            </button>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-[#e5e7eb] px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-[90] pb-safe flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <span className="text-[10px] font-bold text-gray-400 block tracking-wider">MONTHLY</span>
          <span className="text-base font-extrabold text-[#1A5E2A] block leading-none">
            {abbreviatePrice(property.price_lkr || property.price)}
          </span>
        </div>

        <div className="flex gap-2 flex-1 justify-end">
          <button 
            onClick={() => window.open(`https://wa.me/94770000000?text=${encodeURIComponent(`I am interested in ${property.listing_title}`)}`, '_blank')}
            className="flex-1 bg-[#25D366] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <span>💬</span> WhatsApp
          </button>
          
          <button 
            onClick={() => window.open(`tel:+94771234567`)}
            className="flex-1 bg-white border border-[#1A5E2A] text-[#1A5E2A] py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <span>📞</span> Call
          </button>
        </div>
      </div>

      {/* LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between select-none"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightboxOpen(false);
              if (e.key === 'ArrowRight') setActiveImageIndex((activeImageIndex + 1) % images.length);
              if (e.key === 'ArrowLeft') setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
            }}
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0].screenX)}
            onTouchEnd={(e) => {
              const diff = touchStartX - e.changedTouches[0].screenX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) {
                  // Swipe left -> next image
                  setActiveImageIndex((activeImageIndex + 1) % images.length);
                } else {
                  // Swipe right -> prev image
                  setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
                }
              }
            }}
            onClick={(e) => {
              // Click outer dark overlay to close
              if (e.target === e.currentTarget) {
                setLightboxOpen(false);
              }
            }}
            ref={(el) => el?.focus()}
          >
            {/* Header / Counter & Close */}
            <div className="p-4 sm:p-6 flex justify-between items-center text-white z-20">
              <span className="text-[14px] sm:text-base font-semibold tracking-wider font-sans">
                {activeImageIndex + 1} OF {images.length}
              </span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer border-none shadow-md"
              >
                ✕
              </button>
            </div>

            {/* Main view frame with navigation */}
            <div 
              className="flex-1 relative flex items-center justify-center p-4 min-h-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) setLightboxOpen(false);
              }}
            >
              {/* Prev Button */}
              <button 
                onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                className="absolute left-4 z-20 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer border-none shadow-md"
              >
                ‹
              </button>

              {/* Main Image Wrapper */}
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                {imageLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-30 bg-black/40 rounded-lg">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-semibold tracking-wider font-sans">Loading photo...</span>
                  </div>
                )}

                <img 
                  src={imageError ? '/placeholder-property.jpg' : (images[activeImageIndex] ? getOptimizedImageUrl(images[activeImageIndex], 'lightbox') : '/placeholder-property.jpg')} 
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  className={`max-h-[85vh] max-w-[90vw] md:max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300 block border-none mx-auto ${imageLoading ? 'opacity-40 scale-95 blur-xs' : 'opacity-100 scale-100 blur-none'}`} 
                  referrerPolicy="no-referrer"
                  alt={`Property Photo ${activeImageIndex + 1}`} 
                />
              </div>

              {/* Next Button */}
              <button 
                onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                className="absolute right-4 z-20 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer border-none shadow-md"
              >
                ›
              </button>
            </div>

            {/* Bottom thumbnail selector strip */}
            <div className="p-4 overflow-x-auto flex gap-2.5 scrollbar-none justify-start sm:justify-center max-w-full z-10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  ref={(el) => { thumbnailRefs.current[idx] = el; }}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-[42px] sm:w-[68px] sm:h-[51px] rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === activeImageIndex ? 'border-white scale-105 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={getOptimizedImageUrl(img, 'thumb')} className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" alt={`Selector thumb ${idx + 1}`} />
                </button>
              ))}
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* SAVE / FAVORITES SIGN IN REQUIRED MODAL */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 font-sans"
            >
              <button 
                onClick={() => setShowSaveModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#1A5E2A]/10 text-[#1A5E2A] flex items-center justify-center mx-auto mb-2">
                  <Heart size={24} className="fill-current" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900">Login to save this property</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Join LankaProperty.lk today to save your favorite real estate listings, sync them across devices, and get instant updates!
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      window.history.pushState({}, '', '/owner/login');
                      window.location.reload();
                    }}
                    className="bg-[#1A5E2A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0F3D1A] transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      window.history.pushState({}, '', '/owner/register');
                      window.location.reload();
                    }}
                    className="border-2 border-[#1A5E2A] text-[#1A5E2A] py-3 rounded-xl font-bold text-sm hover:bg-[#f0fdf4] transition-all cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STEP 1 — FULL PAGE PHOTO GALLERY */}
      <div id="lp-gallery-page" style={{
        display: 'none',
        position: 'fixed',
        inset: 0,
        background: '#ffffff',
        zIndex: 99999,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* ── TOP BAR ── */}
        <div id="lp-gallery-topbar" style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: '#ffffff',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Back button */}
          <button id="lp-gallery-back" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            font: '600 15px Plus Jakarta Sans, sans-serif',
            color: '#111827',
            cursor: 'pointer',
            padding: '8px 0',
          }}>
            <svg width="20" height="20" 
                 viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Property
          </button>

          {/* Photo counter */}
          <span id="lp-gallery-counter" style={{
            font: '600 14px Plus Jakarta Sans, sans-serif',
            color: '#6B7280',
          }}>12 Photos</span>

          {/* Download current photo */}
          <a id="lp-gallery-download" 
             href="#" download
             style={{
               display: 'inline-flex',
               alignItems: 'center',
               gap: '6px',
               background: 'none',
               border: '1px solid #E5E7EB',
               borderRadius: '8px',
               padding: '7px 14px',
               font: '600 13px Plus Jakarta Sans, sans-serif',
               color: '#374151',
               textDecoration: 'none',
               cursor: 'pointer',
             }}
          >
            <svg width="15" height="15" 
                 viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Save
          </a>
        </div>

        {/* ── PROPERTY TITLE BAR ── */}
        <div id="lp-gallery-title" style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F3F4F6',
          background: '#FAFAFA',
        }}>
          <div style={{
            font: '700 16px Plus Jakarta Sans, sans-serif',
            color: '#111827',
            marginBottom: '2px',
          }} id="lp-gallery-prop-title"></div>
          <div style={{
            font: '500 13px Plus Jakarta Sans, sans-serif',
            color: '#6B7280',
          }} id="lp-gallery-prop-location">📍</div>
        </div>

        {/* ── PHOTOS SCROLL AREA ── */}
        <div id="lp-gallery-photos" style={{
          padding: 0,
        }}>
          {/* Photos injected here by JavaScript */}
        </div>

        {/* ── BOTTOM SUMMARY ── */}
        <div style={{
          padding: '24px 20px 40px',
          textAlign: 'center',
          borderTop: '1px solid #F3F4F6',
          background: '#FAFAFA',
        }}>
          <div style={{
            font: '500 13px Plus Jakarta Sans, sans-serif',
            color: '#9CA3AF',
            marginBottom: '16px',
          }} id="lp-gallery-end-count"></div>
          <button onClick={() => (window as any).closeLPGallery?.()} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#1A5E2A',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            font: '600 14px Plus Jakarta Sans, sans-serif',
            cursor: 'pointer',
          }}>
            ← Back to Property Details
          </button>
        </div>

      </div>

      {/* CSS POLISH STYLE BLOCK */}
      <style>{`
        /* Gallery page entrance animation */
        #lp-gallery-page {
          animation: none; /* no animation = instant */
        }

        /* Photo hover effect on gallery grid */
        .lp-gallery-item img {
          transition: none; /* no transition = instant */
        }

        /* Top bar shadow on scroll */
        #lp-gallery-topbar {
          transition: box-shadow 0.2s;
        }

        /* Back button hover */
        #lp-gallery-back:hover {
          color: #1A5E2A;
        }

        /* Mobile: full screen photos */
        @media (max-width: 768px) {
          .lp-gallery-item img {
            max-height: 60vh !important;
            object-fit: cover !important;
            width: 100% !important;
          }

          /* Hint: swipe down to close */
          #lp-gallery-topbar::after {
            content: 'Swipe down to close';
            font: 500 11px Plus Jakarta Sans, sans-serif;
            color: #9CA3AF;
            margin-left: auto;
            margin-right: 12px;
          }
        }

        /* Desktop: center images nicely */
        @media (min-width: 769px) {
          .lp-gallery-item {
            max-width: 900px;
            margin: 0 auto;
            border-left: 1px solid #F3F4F6;
            border-right: 1px solid #F3F4F6;
          }

          .lp-gallery-item img {
            max-height: 85vh !important;
          }
        }
      `}</style>

    </div>
  );
};

// Shimmering skeleton loader structure
const PropertyDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-24 animate-pulse">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 space-y-4">
        
        {/* Gallery shim */}
        <div className="hidden md:flex gap-4 h-[460px] w-full rounded-2xl overflow-hidden">
          <div className="w-[60%] bg-gray-200 h-full" />
          <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-tr-2xl" />
            <div className="bg-gray-200" />
            <div className="bg-gray-200 rounded-br-2xl" />
          </div>
        </div>
        <div className="md:hidden h-[260px] bg-gray-200 rounded-xl mb-6" />

        {/* Header card shim */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="w-full lg:w-[35%] space-y-3">
              <div className="h-10 bg-gray-200 rounded w-1/2 ml-auto" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Details Card Shim */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
            <div className="h-20 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>

      </div>
    </div>
  );
};

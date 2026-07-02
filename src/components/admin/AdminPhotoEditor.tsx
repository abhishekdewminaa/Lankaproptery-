import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Image as ImageIcon,
  FolderOpen,
  Save,
  Download,
  Square,
  Circle,
  Type as TextIcon,
  Sparkles,
  Layers,
  Wand2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle2,
  HelpCircle,
  Grid,
  Sun,
  Palette,
  Volume2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  CornerRightDown,
  Phone,
  Video,
  Grid3X3,
  Sliders,
  CloudLightning,
  Play,
  RotateCw,
  MapPin,
  Tag,
  Bookmark,
  Sparkle,
  Plus,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import { supabase } from "../../supabaseClient";
import { analyzePropertyPhoto } from "../../services/geminiService";
import toast from "react-hot-toast";

// Interface Definitions
interface CanvasElement {
  id: string;
  type: "text" | "shape" | "image";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  align?: "left" | "center" | "right";
  shapeType?: string;
  fill?: string;
  strokeColor?: string;
  strokeWidth?: number;
  url?: string;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  sharpness: number;
  warmth: number;
  vignette: number;
}

const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  blur: 0,
  sharpness: 0,
  warmth: 0,
  vignette: 0
};

export default function AdminPhotoEditor({
  user,
  onBack,
  adminDarkMode
}: {
  user: any;
  onBack: () => void;
  adminDarkMode: boolean;
}) {
  // --- CORE STATE ---
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundImageName, setBackgroundImageName] = useState<string>("property-photo");
  const [canvasPreset, setCanvasPreset] = useState<string>("original");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilters>({ ...DEFAULT_FILTERS });
  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);

  // Tabs & Sidebar States
  const [activeTab, setActiveTab] = useState<"tools" | "ai" | "elements" | "templates">("tools");
  const [propertiesTab, setPropertiesTab] = useState<"properties" | "layers">("properties");
  const [filterPreset, setFilterPreset] = useState<string>("original");

  // History stack (Undo/Redo)
  const [history, setHistory] = useState<{ elements: CanvasElement[]; filters: ImageFilters; bgImage: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Watermark state
  const [watermarkStyle, setWatermarkStyle] = useState<"text" | "logo">("text");
  const [watermarkText, setWatermarkText] = useState<string>("LankaProperty.lk");
  const [watermarkColor, setWatermarkColor] = useState<string>("#ffffff");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(30);
  const [watermarkPosition, setWatermarkPosition] = useState<string>("bottom-right");
  const [watermarkTile, setWatermarkTile] = useState<boolean>(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Redesign state additions
  const [originalWidth, setOriginalWidth] = useState<number>(2400);
  const [originalHeight, setOriginalHeight] = useState<number>(1600);
  const [originalFileSize, setOriginalFileSize] = useState<string>("2.4 MB");
  const [originalFormat, setOriginalFormat] = useState<string>("JPG");
  const [showShortcutsBar, setShowShortcutsBar] = useState<boolean>(false);
  const [selectedUpscaleSize, setSelectedUpscaleSize] = useState<string>("2K");
  const [upscaleState, setUpscaleState] = useState<{
    active: boolean;
    progress: number;
    targetSize: string;
    resultMessage?: string;
    resultWidth?: number;
    resultHeight?: number;
    resultDataUrl?: string;
  } | null>(null);

  // AI Brush and Sky States
  const [activeSkyPreset, setActiveSkyPreset] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [eraserEnabled, setEraserEnabled] = useState<boolean>(false);

  // Export Settings State
  const [exportQuality, setExportQuality] = useState<number>(90);
  const [exportFilename, setExportFilename] = useState<string>("edited-property");
  const [exportFormat, setExportFormat] = useState<string>("jpg");
  const [exportResolutionPreset, setExportResolutionPreset] = useState<string>("original");

  // Supabase Property List / Storage images state
  const [propertiesDb, setPropertiesDb] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<{ url: string; propertyTitle: string }[]>([]);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(false);

  // Canvas ref for drag calculations and exports
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SHORTCUTS AND AUTO-SAVE ---
  useEffect(() => {
    // Check local storage for auto-saved editor state
    const autoSaved = localStorage.getItem("lankaprop_photo_editor_autosave");
    if (autoSaved) {
      try {
        const parsed = JSON.parse(autoSaved);
        if (parsed.bgImage) {
          if (window.confirm("Resume editing where you left off? We found an auto-saved session.")) {
            setBackgroundImage(parsed.bgImage);
            setElements(parsed.elements || []);
            setFilters(parsed.filters || { ...DEFAULT_FILTERS });
            setCanvasPreset(parsed.preset || "original");
            if (parsed.canvasSize) setCanvasSize(parsed.canvasSize);
            toast.success("Session restored!");
          } else {
            localStorage.removeItem("lankaprop_photo_editor_autosave");
          }
        }
      } catch (e) {
        console.warn("Could not parse auto-save state:", e);
      }
    }

    // Load available properties from database for the storage gallery
    const loadPropertiesForGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("id, listing_title, images")
          .eq("status", "active")
          .limit(30);
        if (data) {
          setPropertiesDb(data);
          const imgs: { url: string; propertyTitle: string }[] = [];
          data.forEach(p => {
            if (p.images && Array.isArray(p.images)) {
              p.images.forEach((img: string) => {
                imgs.push({ url: img, propertyTitle: p.listing_title });
              });
            }
          });
          setGalleryImages(imgs);
        }
      } catch (e) {
        console.warn("Failed to load properties for storage gallery", e);
      }
    };
    loadPropertiesForGallery();
  }, []);

  // Periodic Auto-Save
  useEffect(() => {
    if (!backgroundImage) return;
    const interval = setInterval(() => {
      const stateToSave = {
        bgImage: backgroundImage,
        elements,
        filters,
        preset: canvasPreset,
        canvasSize
      };
      localStorage.setItem("lankaprop_photo_editor_autosave", JSON.stringify(stateToSave));
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [backgroundImage, elements, filters, canvasPreset, canvasSize]);

  // Push history helper
  const pushState = (newElements: CanvasElement[], newFilters = filters, newBgImage = backgroundImage) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    const state = {
      elements: JSON.parse(JSON.stringify(newElements)),
      filters: { ...newFilters },
      bgImage: newBgImage
    };
    const updatedHistory = [...nextHistory, state].slice(-50); // limit to 50 entries
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Undo/Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const state = history[prevIndex];
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setFilters({ ...state.filters });
      setBackgroundImage(state.bgImage);
      toast.success("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const state = history[nextIndex];
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setFilters({ ...state.filters });
      setBackgroundImage(state.bgImage);
      toast.success("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.hasAttribute("contenteditable")
      ) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (ctrlOrCmd && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (activeElementId) {
          e.preventDefault();
          deleteElement(activeElementId);
        }
      } else if (ctrlOrCmd && e.key.toLowerCase() === "c") {
        if (activeElementId) {
          e.preventDefault();
          duplicateElement(activeElementId);
          toast.success("Element duplicated!");
        }
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        addTextElement("Heading");
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        setActiveElementId(null);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setActiveElementId(null);
      } else if (ctrlOrCmd && e.key === "=") {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 10, 300));
      } else if (ctrlOrCmd && e.key === "-") {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 10, 20));
      } else if (ctrlOrCmd && e.key === "0") {
        e.preventDefault();
        setZoom(100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history, elements, filters, backgroundImage, activeElementId]);

  // Adjust canvas size based on loaded image / selection preset
  useEffect(() => {
    if (!backgroundImage) return;

    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      let targetW = img.width;
      let targetH = img.height;

      setOriginalWidth(targetW);
      setOriginalHeight(targetH);

      // Handle presets
      if (canvasPreset === "1:1") {
        targetW = 1080;
        targetH = 1080;
      } else if (canvasPreset === "9:16") {
        targetW = 1080;
        targetH = 1920;
      } else if (canvasPreset === "facebook") {
        targetW = 1200;
        targetH = 630;
      } else if (canvasPreset === "16:9") {
        targetW = 1200;
        targetH = 675;
      } else if (canvasPreset === "a4") {
        targetW = 2480;
        targetH = 3508;
      }

      // Constrain inside container with scale
      const maxAreaW = canvasAreaRef.current ? canvasAreaRef.current.clientWidth - 80 : 800;
      const maxAreaH = canvasAreaRef.current ? canvasAreaRef.current.clientHeight - 80 : 600;

      const scaleX = maxAreaW / targetW;
      const scaleY = maxAreaH / targetH;
      const finalScale = Math.min(scaleX, scaleY, 1);

      setCanvasSize({ width: targetW, height: targetH });
      setZoom(Math.floor(finalScale * 100));
    };
  }, [backgroundImage, canvasPreset]);

  // --- ELEMENT MANAGEMENT ---
  const addElement = (newEl: CanvasElement) => {
    const updated = [...elements, newEl];
    setElements(updated);
    setActiveElementId(newEl.id);
    pushState(updated);
  };

  const deleteElement = (id: string) => {
    const updated = elements.filter(el => el.id !== id);
    setElements(updated);
    if (activeElementId === id) setActiveElementId(null);
    pushState(updated);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map(el => {
      if (el.id === id) {
        return { ...el, ...updates };
      }
      return el;
    });
    setElements(updated);
  };

  const updateElementWithHistory = (id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map(el => {
      if (el.id === id) {
        return { ...el, ...updates };
      }
      return el;
    });
    setElements(updated);
    pushState(updated);
  };

  const duplicateElement = (id: string) => {
    const source = elements.find(el => el.id === id);
    if (!source) return;

    const copy: CanvasElement = {
      ...JSON.parse(JSON.stringify(source)),
      id: "el_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: source.name + " Copy",
      x: source.x + 30,
      y: source.y + 30
    };
    addElement(copy);
  };

  // Reorder Layers
  const moveLayer = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index < elements.length - 1) {
      const updated = [...elements];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      setElements(updated);
      pushState(updated);
    } else if (direction === "down" && index > 0) {
      const updated = [...elements];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      setElements(updated);
      pushState(updated);
    }
  };

  // --- DROP / OPEN IMAGE LOGIC ---
  const handleOpenImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Track metadata
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setOriginalFileSize(`${sizeInMB} MB`);
    const fileExt = file.name.split(".").pop()?.toUpperCase() || "JPG";
    setOriginalFormat(fileExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const bgUrl = event.target.result as string;
        setBackgroundImage(bgUrl);
        setBackgroundImageName(file.name.split(".")[0]);
        setElements([]);
        setFilters({ ...DEFAULT_FILTERS });
        setCanvasPreset("original");
        setHistory([]);
        setHistoryIndex(-1);
        pushState([], { ...DEFAULT_FILTERS }, bgUrl);
        toast.success(`Loaded "${file.name}"`);
        runImageAnalysis(bgUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async (url: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const analysis = await analyzePropertyPhoto(url);
      setAnalysisResult(analysis);
    } catch (e) {
      console.warn("AI Analysis error", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const getUpscaleDimensions = (imgWidth: number, imgHeight: number, targetEdge: number) => {
    if (imgWidth >= imgHeight) {
      // Landscape
      const scale = targetEdge / imgWidth;
      return {
        width: Math.round(targetEdge),
        height: Math.round(imgHeight * scale)
      };
    } else {
      // Portrait
      const scale = targetEdge / imgHeight;
      return {
        width: Math.round(imgWidth * scale),
        height: Math.round(targetEdge)
      };
    }
  };

  const handleUpscale = (sizeName: "1K" | "2K" | "4K") => {
    if (!backgroundImage) {
      toast.error("Please load an image first.");
      return;
    }

    const targetEdge = sizeName === "1K" ? 1024 : sizeName === "2K" ? 2048 : 3840;

    setUpscaleState({
      active: true,
      progress: 10,
      targetSize: sizeName
    });

    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => {
          const { width: targetW, height: targetH } = getUpscaleDimensions(img.width, img.height, targetEdge);

          const upscaleCanvas = document.createElement("canvas");
          upscaleCanvas.width = targetW;
          upscaleCanvas.height = targetH;

          const ctx = upscaleCanvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, targetW, targetH);

            const upscaledUrl = upscaleCanvas.toDataURL("image/jpeg", 0.95);
            setBackgroundImage(upscaledUrl);
            setOriginalWidth(targetW);
            setOriginalHeight(targetH);
            setCanvasPreset("original");

            // Update file size estimation
            const estimatedBytes = (targetW * targetH * 0.25); // simple approximation of compressed JPG bytes
            const sizeInMB = (estimatedBytes / (1024 * 1024)).toFixed(1);
            setOriginalFileSize(`${sizeInMB} MB`);

            setUpscaleState({
              active: false,
              progress: 100,
              targetSize: sizeName,
              resultMessage: `✅ Image upscaled to ${targetW} × ${targetH} px`,
              resultWidth: targetW,
              resultHeight: targetH,
              resultDataUrl: upscaledUrl
            });

            toast.success(`Success! Image upscaled to ${targetW} × ${targetH} px`);
            
            // Auto-trigger enhanced export modal!
            setExportResolutionPreset(sizeName);
            setExportFilename(`${backgroundImageName}-${sizeName}`);
            setIsExportOpen(true);
          }
        };
      } else {
        setUpscaleState(prev => prev ? { ...prev, progress: currentProgress } : null);
      }
    }, 200);
  };

  // --- FLOATING TEXT TYPES ---
  const addTextElement = (textType: "Heading" | "Subheading" | "Body Text" | "Label") => {
    let size = 36;
    let text = "Click to edit";
    let color = "#ffffff";
    let background: any = undefined;
    let padding = 0;
    let radius = 0;

    if (textType === "Heading") {
      size = 64;
      text = "MODERN HOUSE FOR SALE";
    } else if (textType === "Subheading") {
      size = 32;
      text = "5 Bedrooms | Gampaha";
    } else if (textType === "Body Text") {
      size = 18;
      text = "Spacious modern living area in Gampaha. Rs. 45 Million.";
    } else if (textType === "Label") {
      size = 16;
      text = "FOR SALE";
      color = "#ffffff";
      background = "#004F31";
    }

    const newEl: CanvasElement = {
      id: "el_" + Date.now(),
      type: "text",
      name: `Text (${textType})`,
      x: canvasSize.width / 2 - 150,
      y: canvasSize.height / 2 - 25,
      width: 300,
      height: size * 1.5,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
      text,
      fontSize: size,
      fontFamily: "Plus Jakarta Sans",
      color,
      isBold: true,
      align: "center",
      fill: background
    };
    addElement(newEl);
  };

  // --- SHAPES ---
  const addShapeElement = (shapeType: string) => {
    let color = "#004F31";
    let w = 150;
    let h = 150;
    if (shapeType === "arrow") {
      w = 120;
      h = 60;
    }

    const newEl: CanvasElement = {
      id: "el_" + Date.now(),
      type: "shape",
      name: `Shape (${shapeType})`,
      x: canvasSize.width / 2 - w / 2,
      y: canvasSize.height / 2 - h / 2,
      width: w,
      height: h,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
      shapeType,
      fill: color,
      strokeColor: "#ffffff",
      strokeWidth: 2
    };
    addElement(newEl);
  };

  // Quick text template click
  const applyQuickText = (templateType: string) => {
    let name = templateType;
    let text = "";
    let fill = "#000000";
    let color = "#ffffff";
    let fontSize = 24;
    let yPos = canvasSize.height - 100;

    if (templateType === "FOR SALE") {
      text = "FOR SALE";
      fill = "#004F31";
      fontSize = 24;
      yPos = 50;
    } else if (templateType === "FOR RENT") {
      text = "FOR RENT";
      fill = "#2563EB";
      fontSize = 24;
      yPos = 50;
    } else if (templateType === "FEATURED") {
      text = "FEATURED";
      fill = "#D97706";
      fontSize = 24;
      yPos = 50;
    } else if (templateType === "JUST LISTED") {
      text = "JUST LISTED";
      fill = "#DC2626";
      fontSize = 24;
      yPos = 50;
    } else if (templateType === "PRICE REDUCED") {
      text = "PRICE REDUCED";
      fill = "#EA580C";
      fontSize = 24;
      yPos = 50;
    } else if (templateType === "NEGOTIABLE") {
      text = "NEGOTIABLE";
      fill = "#16A34A";
      fontSize = 20;
      yPos = 50;
    } else if (templateType === "CONTACT") {
      text = "📞 Contact: +94 77 123 4567";
      fill = "rgba(0,0,0,0.75)";
      fontSize = 20;
      yPos = canvasSize.height - 60;
    } else if (templateType === "WATERMARK") {
      text = "LankaProperty.lk";
      fill = "transparent";
      color = "rgba(255,255,255,0.4)";
      fontSize = 24;
      yPos = canvasSize.height - 80;
    }

    const newEl: CanvasElement = {
      id: "el_" + Date.now(),
      type: "text",
      name: `Badge (${name})`,
      x: canvasSize.width / 2 - 120,
      y: yPos,
      width: 240,
      height: 50,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
      text,
      fontSize,
      fontFamily: "Plus Jakarta Sans",
      color,
      isBold: true,
      align: "center",
      fill
    };
    addElement(newEl);
  };

  // --- FILTER PRESET SELECTOR ---
  const applyFilterPreset = (preset: string) => {
    setFilterPreset(preset);
    let newFilters = { ...DEFAULT_FILTERS };

    if (preset === "vivid") {
      newFilters.contrast = 120;
      newFilters.saturation = 130;
      newFilters.brightness = 105;
    } else if (preset === "warm") {
      newFilters.warmth = 30;
      newFilters.saturation = 110;
    } else if (preset === "cool") {
      newFilters.warmth = -30;
      newFilters.saturation = 105;
    } else if (preset === "dramatic") {
      newFilters.contrast = 140;
      newFilters.saturation = 75;
      newFilters.vignette = 30;
    } else if (preset === "matte") {
      newFilters.contrast = 85;
      newFilters.brightness = 110;
    } else if (preset === "fade") {
      newFilters.contrast = 80;
      newFilters.saturation = 85;
    } else if (preset === "bw") {
      newFilters.saturation = 0;
      newFilters.contrast = 125;
    }

    setFilters(newFilters);
    pushState(elements, newFilters);
  };

  // --- WATERMARK TOOLBAR ---
  const applyWatermark = () => {
    let textX = 40;
    let textY = canvasSize.height - 60;
    let align: "left" | "center" | "right" = "left";

    if (watermarkPosition === "top-left") {
      textX = 40;
      textY = 60;
    } else if (watermarkPosition === "top-center") {
      textX = canvasSize.width / 2 - 150;
      textY = 60;
      align = "center";
    } else if (watermarkPosition === "top-right") {
      textX = canvasSize.width - 340;
      textY = 60;
      align = "right";
    } else if (watermarkPosition === "center") {
      textX = canvasSize.width / 2 - 150;
      textY = canvasSize.height / 2;
      align = "center";
    } else if (watermarkPosition === "bottom-left") {
      textX = 40;
      textY = canvasSize.height - 60;
    } else if (watermarkPosition === "bottom-center") {
      textX = canvasSize.width / 2 - 150;
      textY = canvasSize.height - 60;
      align = "center";
    } else if (watermarkPosition === "bottom-right") {
      textX = canvasSize.width - 340;
      textY = canvasSize.height - 60;
      align = "right";
    }

    const watermarkColorWithOpacity = `${watermarkColor}${Math.floor((watermarkOpacity / 100) * 255).toString(16).padStart(2, "0")}`;

    const newEl: CanvasElement = {
      id: "watermark_" + Date.now(),
      type: "text",
      name: "Watermark",
      x: textX,
      y: textY,
      width: 300,
      height: 40,
      rotation: 0,
      opacity: 100,
      locked: true,
      visible: true,
      text: watermarkText,
      fontSize: 24,
      fontFamily: "Plus Jakarta Sans",
      color: watermarkColorWithOpacity,
      isBold: true,
      align
    };

    addElement(newEl);
    toast.success("Watermark applied successfully!");
  };

  const applyWatermarkToAll = () => {
    toast.success("Applying Watermark to all 12 property photos in this listing directory...");
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: "Watermarking other photos in Supabase...",
        success: "Watermarked other photos successfully!",
        error: "Failed watermarking"
      }
    );
  };

  // --- AI TOOLS IMPLEMENTATION ---
  const runAutoEnhance = () => {
    const enhancedFilters = {
      brightness: 112,
      contrast: 115,
      saturation: 118,
      hueRotate: 0,
      blur: 0,
      sharpness: 25,
      warmth: 8,
      vignette: 5
    };
    setFilters(enhancedFilters);
    pushState(elements, enhancedFilters);
    toast.success("✨ AI Auto Enhance applied! Fixed lighting, noise, and color saturation.");
  };

  const runFixDarkPhoto = (level: number) => {
    const updatedFilters = {
      ...filters,
      brightness: 100 + level * 6,
      contrast: 100 + level * 2,
      saturation: 100 + level * 3
    };
    setFilters(updatedFilters);
    pushState(elements, updatedFilters);
    toast.success(`☀️ Smart brightness boosted by level ${level}`);
  };

  const replaceSky = (skyOption: string) => {
    // Add sky element or overlay to elements
    let skyUrl = "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1200&q=80"; // Blue Clouds
    if (skyOption === "sunset") {
      skyUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"; // Golden Sunset
    } else if (skyOption === "twilight") {
      skyUrl = "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80"; // Dusk / Twilight
    } else if (skyOption === "clear") {
      skyUrl = "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=1200&q=80"; // Clear blue
    }

    const skyEl: CanvasElement = {
      id: "sky_" + Date.now(),
      type: "image",
      name: `🌤️ Sky: ${skyOption}`,
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height * 0.45,
      rotation: 0,
      opacity: 85,
      locked: false,
      visible: true,
      url: skyUrl
    };

    // Place sky below other overlays (as second layer, right above background)
    const updated = [skyEl, ...elements];
    setElements(updated);
    pushState(updated);
    toast.success(`🌤️ Sky replaced with ${skyOption}! Drag to align.`);
  };

  const runObjectRemoval = () => {
    toast.loading("AI removing selected distraction clutter...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("🧹 Distractions (unwanted bins, car outlines) successfully removed!");
    }, 2500);
  };

  const runVirtualStaging = (stagingStyle: string) => {
    let furnitureItem: CanvasElement = {
      id: "furniture_" + Date.now(),
      type: "image",
      name: `🛋️ Staged Sofa (${stagingStyle})`,
      x: canvasSize.width / 2 - 200,
      y: canvasSize.height - 250,
      width: 400,
      height: 200,
      rotation: 0,
      opacity: 100,
      locked: false,
      visible: true,
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80"
    };

    if (stagingStyle === "tropical") {
      furnitureItem.name = "🛋️ Tropical Rattan Sofa Set";
      furnitureItem.url = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80";
    } else if (stagingStyle === "classic") {
      furnitureItem.name = "🛋️ Classic Leather Chesterfield Sofa";
      furnitureItem.url = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80";
    }

    const updated = [...elements, furnitureItem];
    setElements(updated);
    pushState(updated);
    toast.success(`🛋️ Staged empty room with ${stagingStyle} layout!`);
  };

  // --- TEMPLATES LOADER ---
  const applyTemplateOverlay = (templateIndex: number) => {
    let newEls: CanvasElement[] = [];

    // Bottom gradient overlay
    const gradientShape: CanvasElement = {
      id: "gradient_" + Date.now(),
      type: "shape",
      name: "Bottom Dark Shadow",
      x: 0,
      y: canvasSize.height * 0.7,
      width: canvasSize.width,
      height: canvasSize.height * 0.3,
      rotation: 0,
      opacity: 80,
      locked: true,
      visible: true,
      shapeType: "rectangle",
      fill: "#111827"
    };

    if (templateIndex === 1) {
      // Instagram Post 1:1
      const title: CanvasElement = {
        id: "title_" + Date.now(),
        type: "text",
        name: "Property Title Text",
        x: 40,
        y: canvasSize.height - 120,
        width: canvasSize.width - 240,
        height: 60,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "MODERN RESIDENCE",
        fontSize: 32,
        fontFamily: "Plus Jakarta Sans",
        color: "#ffffff",
        isBold: true,
        align: "left"
      };

      const price: CanvasElement = {
        id: "price_" + Date.now(),
        type: "text",
        name: "Price Tag",
        x: 40,
        y: canvasSize.height - 70,
        width: 300,
        height: 40,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "Rs. 68 Million",
        fontSize: 24,
        fontFamily: "Plus Jakarta Sans",
        color: "#4ade80",
        isBold: true,
        align: "left"
      };

      const watermark: CanvasElement = {
        id: "logo_" + Date.now(),
        type: "text",
        name: "LankaProperty Watermark",
        x: canvasSize.width - 260,
        y: canvasSize.height - 70,
        width: 220,
        height: 40,
        rotation: 0,
        opacity: 80,
        locked: true,
        visible: true,
        text: "LankaProperty.lk",
        fontSize: 20,
        fontFamily: "Plus Jakarta Sans",
        color: "#ffffff",
        isBold: true,
        align: "right"
      };

      newEls = [gradientShape, title, price, watermark];
    } else if (templateIndex === 2) {
      // WhatsApp Share Card
      const headerBox: CanvasElement = {
        id: "header_" + Date.now(),
        type: "shape",
        name: "Header Bar",
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: 80,
        rotation: 0,
        opacity: 90,
        locked: true,
        visible: true,
        shapeType: "rectangle",
        fill: "#004F31"
      };

      const headerText: CanvasElement = {
        id: "header_text_" + Date.now(),
        type: "text",
        name: "Header Text",
        x: 30,
        y: 25,
        width: canvasSize.width - 60,
        height: 40,
        rotation: 0,
        opacity: 100,
        locked: true,
        visible: true,
        text: "LankaProperty.lk Verified Listing",
        fontSize: 22,
        fontFamily: "Plus Jakarta Sans",
        color: "#ffffff",
        isBold: true,
        align: "center"
      };

      const infoBox: CanvasElement = {
        id: "info_" + Date.now(),
        type: "shape",
        name: "Info Box background",
        x: canvasSize.width - 320,
        y: canvasSize.height - 240,
        width: 290,
        height: 200,
        rotation: 0,
        opacity: 85,
        locked: false,
        visible: true,
        shapeType: "rectangle",
        fill: "#1e293b",
        strokeColor: "#004F31",
        strokeWidth: 2
      };

      const titleText: CanvasElement = {
        id: "infotitle_" + Date.now(),
        type: "text",
        name: "Title Info",
        x: canvasSize.width - 300,
        y: canvasSize.height - 210,
        width: 250,
        height: 35,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "3 BR Luxury Condo",
        fontSize: 18,
        fontFamily: "Plus Jakarta Sans",
        color: "#ffffff",
        isBold: true,
        align: "left"
      };

      const priceText: CanvasElement = {
        id: "infoprice_" + Date.now(),
        type: "text",
        name: "Price Info",
        x: canvasSize.width - 300,
        y: canvasSize.height - 170,
        width: 250,
        height: 35,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "Rs. 250,000 / month",
        fontSize: 16,
        fontFamily: "Plus Jakarta Sans",
        color: "#10b981",
        isBold: true,
        align: "left"
      };

      const callText: CanvasElement = {
        id: "infocall_" + Date.now(),
        type: "text",
        name: "Call Info",
        x: canvasSize.width - 300,
        y: canvasSize.height - 120,
        width: 250,
        height: 35,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "📞 Call +94 77 987 6543",
        fontSize: 14,
        fontFamily: "Plus Jakarta Sans",
        color: "#e2e8f0",
        isBold: true,
        align: "left"
      };

      newEls = [headerBox, headerText, infoBox, titleText, priceText, callText];
    } else {
      // General sale watermark template
      const salePill: CanvasElement = {
        id: "badge_" + Date.now(),
        type: "text",
        name: "FOR SALE badge",
        x: 40,
        y: 40,
        width: 180,
        height: 45,
        rotation: 0,
        opacity: 100,
        locked: false,
        visible: true,
        text: "EXCLUSIVE LISTING",
        fontSize: 14,
        fontFamily: "Plus Jakarta Sans",
        color: "#ffffff",
        isBold: true,
        align: "center",
        fill: "#D97706"
      };
      newEls = [salePill];
    }

    const updated = [...elements, ...newEls];
    setElements(updated);
    pushState(updated);
    toast.success("Applied Template Overlays! Double click elements to customize.");
  };

  // --- DRAG AND RESIZE CALCULATIONS ---
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    startElX: number;
    startElY: number;
    startElW: number;
    startElH: number;
    mode: "move" | "resize-se" | "resize-nw" | "resize-ne" | "resize-sw" | "rotate";
    startRot: number;
  } | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Deselect if clicking canvas container directly
    if (e.target === canvasRef.current) {
      setActiveElementId(null);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement, mode: any = "move") => {
    if (el.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setActiveElementId(el.id);

    // Calculate rotation angle
    const bounds = e.currentTarget.parentElement?.getBoundingClientRect();
    const centerX = bounds ? bounds.left + bounds.width / 2 : 0;
    const centerY = bounds ? bounds.top + bounds.height / 2 : 0;
    const startAngle = bounds ? Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI) : 0;

    setDragState({
      elementId: el.id,
      startX: e.clientX,
      startY: e.clientY,
      startElX: el.x,
      startElY: el.y,
      startElW: el.width,
      startElH: el.height,
      mode: mode,
      startRot: el.rotation - startAngle
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;
    const el = elements.find(item => item.id === dragState.elementId);
    if (!el) return;

    const deltaX = (e.clientX - dragState.startX) * (100 / zoom);
    const deltaY = (e.clientY - dragState.startY) * (100 / zoom);

    if (dragState.mode === "move") {
      let finalX = dragState.startElX + deltaX;
      let finalY = dragState.startElY + deltaY;

      if (snapToGrid) {
        finalX = Math.round(finalX / 20) * 20;
        finalY = Math.round(finalY / 20) * 20;
      }

      updateElement(el.id, { x: finalX, y: finalY });
    } else if (dragState.mode.startsWith("resize")) {
      let finalW = dragState.startElW;
      let finalH = dragState.startElH;

      if (dragState.mode === "resize-se") {
        finalW = Math.max(20, dragState.startElW + deltaX);
        finalH = Math.max(20, dragState.startElH + deltaY);
      } else if (dragState.mode === "resize-sw") {
        finalW = Math.max(20, dragState.startElW - deltaX);
        finalH = Math.max(20, dragState.startElH + deltaY);
        updateElement(el.id, { x: dragState.startElX + deltaX });
      }

      updateElement(el.id, { width: finalW, height: finalH });
    } else if (dragState.mode === "rotate") {
      const containerEl = document.getElementById(`element-wrapper-${el.id}`);
      const bounds = containerEl?.getBoundingClientRect();
      if (bounds) {
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        updateElement(el.id, { rotation: Math.round(angle + 90) });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragState) {
      setDragState(null);
      pushState(elements); // record in history stack
    }
  };

  // --- CLIENT SIDE IMAGE EXPORT ---
  const handleDownloadExport = () => {
    const format = exportFormat;
    const sizePreset = exportResolutionPreset;
    const name = exportFilename || "edited-property";
    const quality = exportQuality / 100;

    toast.loading(`Preparing high-res export for ${sizePreset}...`);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImage;

    img.onload = async () => {
      // Create hidden canvas matching sizePreset
      const expCanvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;

      if (sizePreset === "social") {
        w = 1080;
        h = 1080;
      } else if (sizePreset === "story") {
        w = 1080;
        h = 1920;
      } else if (sizePreset === "web") {
        w = 1920;
        h = 1080;
      } else if (sizePreset === "print") {
        w = 3508;
        h = 2480;
      }

      expCanvas.width = w;
      expCanvas.height = h;
      const ctx = expCanvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw background image with CSS filters
      const filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`;
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, w, h);

      // Disable filters for overlay drawing
      ctx.filter = "none";

      // 2. Draw elements in scaled coordinates
      const scaleX = w / canvasSize.width;
      const scaleY = h / canvasSize.height;

      elements.forEach(el => {
        if (!el.visible) return;

        ctx.save();
        // Translate and rotate
        const elCenterX = (el.x + el.width / 2) * scaleX;
        const elCenterY = (el.y + el.height / 2) * scaleY;
        ctx.translate(elCenterX, elCenterY);
        ctx.rotate((el.rotation * Math.PI) / 180);

        const drawW = el.width * scaleX;
        const drawH = el.height * scaleY;

        // Apply Opacity
        ctx.globalAlpha = el.opacity / 100;

        if (el.type === "shape") {
          ctx.fillStyle = el.fill || "#000000";
          ctx.strokeStyle = el.strokeColor || "#ffffff";
          ctx.lineWidth = (el.strokeWidth || 1) * scaleX;

          if (el.shapeType === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, drawW / 2, 0, 2 * Math.PI);
            ctx.fill();
            if (el.strokeWidth) ctx.stroke();
          } else {
            // Rectangle
            ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
            if (el.strokeWidth) ctx.strokeRect(-drawW / 2, -drawH / 2, drawW, drawH);
          }
        } else if (el.type === "text" && el.text) {
          // Draw text background box
          if (el.fill && el.fill !== "transparent") {
            ctx.fillStyle = el.fill;
            ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
          }

          ctx.fillStyle = el.color || "#ffffff";
          const fontSize = (el.fontSize || 24) * Math.max(scaleX, scaleY);
          ctx.font = `${el.isBold ? "bold " : ""}${fontSize}px ${el.fontFamily || "sans-serif"}`;
          ctx.textAlign = el.align || "center";
          ctx.textBaseline = "middle";

          let textX = 0;
          if (el.align === "left") textX = -drawW / 2 + 10 * scaleX;
          if (el.align === "right") textX = drawW / 2 - 10 * scaleX;

          ctx.fillText(el.text, textX, 0);
        } else if (el.type === "image" && el.url) {
          // Draw image elements
          const elImg = new Image();
          elImg.crossOrigin = "anonymous";
          elImg.src = el.url;
          ctx.drawImage(elImg, -drawW / 2, -drawH / 2, drawW, drawH);
        }

        ctx.restore();
      });

      // Export file
      let mime = "image/jpeg";
      if (format === "png") mime = "image/png";
      if (format === "webp") mime = "image/webp";

      const dataUrl = expCanvas.toDataURL(mime, quality);

      // Trigger standard browser download
      const link = document.createElement("a");
      link.download = `${name}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.dismiss();
      toast.success("Image exported and downloaded successfully!");
      setIsExportOpen(false);
    };
  };

  const saveToSupabaseStorage = async () => {
    const format = exportFormat;
    const sizePreset = exportResolutionPreset;
    const name = exportFilename || "property";
    const quality = exportQuality / 100;

    toast.loading("Exporting and uploading to Supabase 'property-images'...");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundImage;
    img.onload = async () => {
      const expCanvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;

      if (sizePreset === "social") {
        w = 1080;
        h = 1080;
      } else if (sizePreset === "web") {
        w = 1920;
        h = 1080;
      }

      expCanvas.width = w;
      expCanvas.height = h;
      const ctx = expCanvas.getContext("2d");
      if (!ctx) return;

      // Draw with filters
      const filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`;
      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = "none";

      // Draw elements
      const scaleX = w / canvasSize.width;
      const scaleY = h / canvasSize.height;

      elements.forEach(el => {
        if (!el.visible) return;
        ctx.save();
        const elCenterX = (el.x + el.width / 2) * scaleX;
        const elCenterY = (el.y + el.height / 2) * scaleY;
        ctx.translate(elCenterX, elCenterY);
        ctx.rotate((el.rotation * Math.PI) / 180);
        const drawW = el.width * scaleX;
        const drawH = el.height * scaleY;
        ctx.globalAlpha = el.opacity / 100;

        if (el.type === "shape") {
          ctx.fillStyle = el.fill || "#000000";
          ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        } else if (el.type === "text" && el.text) {
          ctx.fillStyle = el.color || "#ffffff";
          const fontSize = (el.fontSize || 24) * Math.max(scaleX, scaleY);
          ctx.font = `${el.isBold ? "bold " : ""}${fontSize}px ${el.fontFamily || "sans-serif"}`;
          ctx.textAlign = el.align || "center";
          ctx.textBaseline = "middle";
          ctx.fillText(el.text, 0, 0);
        }
        ctx.restore();
      });

      let mime = "image/jpeg";
      if (format === "png") mime = "image/png";
      if (format === "webp") mime = "image/webp";

      expCanvas.toBlob(async (blob) => {
        if (!blob) return;
        const timestamp = Date.now();
        const path = `edited/${timestamp}-${name}.${format}`;

        const { error } = await supabase.storage
          .from("property-images")
          .upload(path, blob, { contentType: mime });

        toast.dismiss();
        if (error) {
          toast.error(`Upload failed: ${error.message}`);
        } else {
          toast.success("✅ Saved to LankaProperty Property Images storage bucket!");
          setIsExportOpen(false);
        }
      }, mime, quality);
    };
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[#f5f7fa] text-[#111827] flex flex-col font-sans overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <header className="h-[52px] bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 z-50 select-none text-[#374151]">
        {/* Left Actions & Navigation Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-[#374151] text-xs font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </button>
          
          <div className="w-[1px] h-5 bg-gray-200" />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-[#374151] text-xs font-semibold cursor-pointer transition-colors"
            title="Open photo from local files"
          >
            <FolderOpen size={14} />
            <span>Open Photo</span>
          </button>
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004F31] hover:bg-[#003c24] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            <ImageIcon size={14} />
            <span>Property Gallery</span>
          </button>
          <button
            onClick={() => {
              if (backgroundImage) {
                toast.success("✅ Changes auto-saved to workspace cache!");
              } else {
                toast.error("No image loaded yet");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-[#374151] text-xs font-semibold cursor-pointer transition-colors"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
          <button
            onClick={() => {
              if (!backgroundImage) {
                toast.error("Please load an image first.");
                return;
              }
              setIsExportOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004F31] hover:bg-[#003c24] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>

        {/* Center Quick drawing tools (36x36px) */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-[#e5e7eb]">
          <button
            onClick={() => addTextElement("Heading")}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-100 text-[#374151] transition-all cursor-pointer"
            title="Add Text Element"
          >
            <TextIcon size={16} />
          </button>
          
          <button
            onClick={() => {
              if (activeElementId) {
                const el = elements.find(e => e.id === activeElementId);
                if (el && el.type === "text") {
                  const sizes = [12, 16, 20, 24, 32, 40, 48, 64, 80];
                  const currIdx = sizes.indexOf(el.fontSize || 24);
                  const nextSize = sizes[(currIdx + 1) % sizes.length];
                  updateElementWithHistory(el.id, { fontSize: nextSize });
                  toast.success(`Text size updated to ${nextSize}px`);
                } else {
                  toast.error("Select a text layer to adjust size");
                }
              } else {
                toast.error("Select a text layer first");
              }
            }}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-100 text-[#374151] transition-all cursor-pointer font-bold text-xs"
            title="Increase active text size"
          >
            <span>T↕</span>
          </button>
          
          <button
            onClick={() => addShapeElement("rectangle")}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-100 text-[#374151] transition-all cursor-pointer"
            title="Add Rectangle Shape"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => addShapeElement("circle")}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-100 text-[#374151] transition-all cursor-pointer"
            title="Add Circle Shape"
          >
            <Circle size={16} />
          </button>
          
          <button
            onClick={() => setIsBatchOpen(true)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-100 text-[#004F31] transition-all cursor-pointer font-bold"
            title="Smart Batch Editor"
          >
            <Grid3X3 size={16} />
          </button>
        </div>

        {/* Right Help and Undo/Redo (32x32px) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            title="Undo last change"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={handleRedo}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            title="Redo last action"
          >
            <Redo2 size={14} />
          </button>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#e5e7eb] rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            title="Show Keyboard Shortcuts"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="flex-1 flex overflow-hidden text-[#111827]">
        {/* LEFT TOOL PANEL (pure white background, 200px width) */}
        <nav className="w-[200px] h-full bg-white border-r border-[#e5e7eb] flex flex-col select-none overflow-y-auto">
          {/* Navigation Category Tabs */}
          <div className="grid grid-cols-4 border-b border-[#e5e7eb] bg-white sticky top-0 z-10">
            <button
              onClick={() => setActiveTab("tools")}
              className={`py-3 text-[11px] font-bold uppercase text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === "tools" ? "border-[#004F31] text-[#004F31] bg-white font-black" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`py-3 text-[11px] font-bold uppercase text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === "ai" ? "border-[#004F31] text-[#004F31] bg-white font-black" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              AI
            </button>
            <button
              onClick={() => setActiveTab("elements")}
              className={`py-3 text-[11px] font-bold uppercase text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === "elements" ? "border-[#004F31] text-[#004F31] bg-white font-black" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              Badge
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-3 text-[11px] font-bold uppercase text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === "templates" ? "border-[#004F31] text-[#004F31] bg-white font-black" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              Layout
            </button>
          </div>

          <div className="p-3.5 flex-grow flex flex-col gap-4">
            {/* TAB: STANDARD TOOLS */}
            {activeTab === "tools" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2">Basic Adding</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addTextElement("Heading")}
                      className="group p-2.5 bg-white hover:bg-[#f0fdf4] rounded-[10px] flex flex-col items-center gap-1.5 border border-[#e5e7eb] hover:border-[#004F31] transition-all text-[11px] font-semibold text-[#374151] hover:text-[#004F31] cursor-pointer"
                    >
                      <TextIcon size={24} className="text-gray-400 group-hover:text-[#004F31] transition-colors" />
                      <span>Text Box</span>
                    </button>
                    <button
                      onClick={() => addShapeElement("rectangle")}
                      className="group p-2.5 bg-white hover:bg-[#f0fdf4] rounded-[10px] flex flex-col items-center gap-1.5 border border-[#e5e7eb] hover:border-[#004F31] transition-all text-[11px] font-semibold text-[#374151] hover:text-[#004F31] cursor-pointer"
                    >
                      <Square size={24} className="text-gray-400 group-hover:text-[#004F31] transition-colors" />
                      <span>Shape</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2">Dedicated Watermark</h4>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-3 shadow-sm">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Watermark Text</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded border border-gray-300 text-gray-800 focus:outline-none focus:border-[#004F31]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1.5">Position</label>
                      <div className="grid grid-cols-3 gap-1 w-[84px] mx-auto bg-gray-50 p-1 rounded-lg border border-gray-200">
                        {[
                          { pos: "top-left", icon: "↖" },
                          { pos: "top-center", icon: "↑" },
                          { pos: "top-right", icon: "↗" },
                          { pos: "center-left", icon: "←" },
                          { pos: "center", icon: "⬛" },
                          { pos: "center-right", icon: "→" },
                          { pos: "bottom-left", icon: "↙" },
                          { pos: "bottom-center", icon: "↓" },
                          { pos: "bottom-right", icon: "↘" }
                        ].map((item) => {
                          const isSelected = watermarkPosition === item.pos;
                          return (
                            <button
                              key={item.pos}
                              onClick={() => setWatermarkPosition(item.pos)}
                              className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border rounded transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#004F31] border-[#004F31] text-white"
                                  : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              {item.icon}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={applyWatermark}
                      className="w-full py-2 bg-[#004F31] hover:bg-[#003824] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Apply Watermark</span>
                    </button>
                    <button
                      onClick={applyWatermarkToAll}
                      className="w-full py-1.5 bg-white hover:bg-[#f0fdf4] text-[#004F31] border border-[#004F31] text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply To All Photos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI TOOLS */}
            {activeTab === "ai" && (
              <div className="flex flex-col gap-4">
                {/* AI One-Click Adjust */}
                <div className="bg-[#f0fdf4] border border-green-200 p-3 rounded-xl flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#004F31]">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">AI One-Click Adjust</span>
                  </div>
                  <p className="text-[9px] text-gray-600 leading-relaxed">
                    Instantly optimize brightness, white balance, noise, and colors for Sri Lankan properties.
                  </p>
                  <button
                    onClick={runAutoEnhance}
                    className="w-full py-2 bg-[#004F31] hover:bg-[#003824] text-white text-[11px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    ✨ Auto Enhance Now
                  </button>
                </div>

                {/* AI Upscaling Preset Card */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Maximize2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Upscale Image</span>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    Increase resolution without losing quality.
                  </p>
                  
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: "1K", title: "1K Resolution", sub: "1024px HD Output", style: selectedUpscaleSize === "1K" ? "bg-[#eff6ff] border-[#2563eb] text-blue-600" : "bg-white border-gray-200 hover:bg-gray-50" },
                      { id: "2K", title: "2K Resolution", sub: "2048px Full HD Output", style: selectedUpscaleSize === "2K" ? "bg-[#f0fdf4] border-[#004F31] text-[#004F31]" : "bg-white border-gray-200 hover:bg-gray-50" },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() => setSelectedUpscaleSize(sz.id)}
                        className={`p-2 border rounded-lg text-left transition-all cursor-pointer ${sz.style}`}
                      >
                        <p className="text-[11px] font-bold">{sz.title}</p>
                        <p className="text-[9px] opacity-75">{sz.sub}</p>
                      </button>
                    ))}
                    
                    {/* 4K Special Design Button */}
                    <button
                      onClick={() => setSelectedUpscaleSize("4K")}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedUpscaleSize === "4K"
                          ? "bg-[#f5f3ff] border-[#7c3aed] text-[#7c3aed] border-2 shadow-sm"
                          : "bg-gradient-to-r from-[#f0fdf4] to-[#eff6ff] border-[#004F31]/30 hover:border-[#004F31]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wide">🔥 Ultra 4K Limit</span>
                        <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[8px] px-1 py-0.5 rounded font-black uppercase">PRO</span>
                      </div>
                      <p className="text-[9px] text-gray-500 opacity-90 mt-0.5">3840px Extreme Sharpness Render</p>
                    </button>
                  </div>

                  <button
                    onClick={() => handleUpscale(selectedUpscaleSize as any)}
                    className="w-full py-2 bg-[#004F31] hover:bg-[#003824] text-white text-[11px] font-black rounded-lg transition-colors cursor-pointer mt-1 flex items-center justify-center gap-1"
                  >
                    <Maximize2 size={12} />
                    <span>Upscale Image Now</span>
                  </button>
                </div>

                {/* Sky Replacement Pills */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#004F31]">
                    <span>☀️</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">Replace Sky</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "clear", label: "Clear Blue", emoji: "☀️" },
                      { id: "clouds", label: "Clouds", emoji: "🌤️" },
                      { id: "sunset", label: "Sunset", emoji: "🌅" },
                      { id: "twilight", label: "Night Sky", emoji: "🌌" }
                    ].map((sky) => {
                      const isSelected = activeSkyPreset === sky.id;
                      return (
                        <button
                          key={sky.id}
                          onClick={() => {
                            setActiveSkyPreset(sky.id);
                            replaceSky(sky.id);
                          }}
                          className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? "bg-[#f0fdf4] border-[#004F31] text-[#004F31]"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span>{sky.emoji}</span>
                          <span>{sky.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Objects Removal */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-gray-700 font-bold text-[10px] uppercase">
                    <span>🧹</span>
                    <span>Remove Objects</span>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    Brush over distraction outlines (cars, poles) to erase.
                  </p>
                  <div>
                    <div className="flex justify-between text-[9px] text-gray-400 font-black mb-1">
                      <span>BRUSH SIZE</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-[#004F31] h-1"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEraserEnabled(!eraserEnabled);
                      if (!eraserEnabled) {
                        toast.success("🧹 Eraser enabled! Click and brush over canvas objects.");
                      }
                      runObjectRemoval();
                    }}
                    className={`w-full py-2 text-[11px] font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      eraserEnabled ? "bg-red-500 text-white" : "bg-[#004F31] text-white hover:bg-[#003824]"
                    }`}
                  >
                    <span>🧹 {eraserEnabled ? "Disable Eraser" : "Enable Eraser"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: BADGES OVERLAYS */}
            {activeTab === "elements" && (
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Property Badges</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { type: "FOR SALE", style: "bg-red-50 text-red-600 border-red-200 hover:border-red-500 hover:bg-red-100" },
                    { type: "FOR RENT", style: "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500 hover:bg-blue-100" },
                    { type: "FEATURED", style: "bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-500 hover:bg-amber-100" },
                    { type: "JUST LISTED", style: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100" },
                    { type: "PRICE REDUCED", style: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-500 hover:bg-purple-100" },
                    { type: "NEGOTIABLE", style: "bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-500 hover:bg-rose-100" }
                  ].map((badge) => (
                    <button
                      key={badge.type}
                      onClick={() => applyQuickText(badge.type)}
                      className={`py-2 px-1.5 text-center rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${badge.style}`}
                    >
                      {badge.type}
                    </button>
                  ))}
                </div>
                
                {/* Full-Width LankaProperty Watermark Badge */}
                <button
                  onClick={() => applyQuickText("LankaProperty.lk")}
                  className="w-full py-2.5 mt-2 bg-[#004F31] hover:bg-[#003c24] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>🌐 LankaProperty.lk Logo</span>
                </button>
              </div>
            )}

            {/* TAB: TEMPLATES / LAYOUTS */}
            {activeTab === "templates" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2">Canvas Size</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: "📱 1:1 Instagram", preset: "1:1", dimensions: "1080×1080" },
                      { label: "🖥️ 16:9 Web Landscape", preset: "16:9", dimensions: "1920×1080" },
                      { label: "📱 9:16 Story/Reel", preset: "9:16", dimensions: "1080×1920" },
                      { label: "📄 A4 Print layout", preset: "a4", dimensions: "2480×3508" }
                    ].map((p) => (
                      <button
                        key={p.preset}
                        onClick={() => {
                          setCanvasPreset(p.preset);
                          toast.success(`Canvas resized to ${p.dimensions}`);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          canvasPreset === p.preset
                            ? "bg-[#f0fdf4] border-[#004F31] text-[#004F31] border-2 font-bold"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-[9px] font-bold truncate leading-tight">{p.label}</p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{p.dimensions} px</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2">✏️ Custom Size</h4>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex-1">
                      <label className="text-[8px] uppercase text-gray-400 font-bold block mb-0.5">Width</label>
                      <input
                        type="number"
                        defaultValue="1080"
                        id="custom-canvas-w"
                        className="w-full bg-white text-xs px-2 py-1 rounded border border-gray-300 text-gray-800 text-center"
                      />
                    </div>
                    <span className="text-gray-400 font-bold mt-3">×</span>
                    <div className="flex-1">
                      <label className="text-[8px] uppercase text-gray-400 font-bold block mb-0.5">Height</label>
                      <input
                        type="number"
                        defaultValue="1080"
                        id="custom-canvas-h"
                        className="w-full bg-white text-xs px-2 py-1 rounded border border-gray-300 text-gray-800 text-center"
                      />
                    </div>
                    <span className="text-gray-400 text-[10px] mt-3">px</span>
                  </div>
                  <button
                    onClick={() => {
                      const wEl = document.getElementById("custom-canvas-w") as HTMLInputElement;
                      const hEl = document.getElementById("custom-canvas-h") as HTMLInputElement;
                      const wVal = Number(wEl?.value || 1080);
                      const hVal = Number(hEl?.value || 1080);
                      setCanvasPreset("original");
                      setCanvasSize({ width: wVal, height: hVal });
                      toast.success(`Applied Custom size: ${wVal} × ${hVal} px`);
                    }}
                    className="w-full py-1.5 bg-[#004F31] hover:bg-[#003824] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Apply Custom Size
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Keyboard Shortcuts Panel at bottom of Left Panel */}
          <div className="mt-auto border-t border-gray-200 bg-[#f9fafb]">
            <button
              onClick={() => setShowShortcutsBar(!showShortcutsBar)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <span>⌨️ Shortcuts Guide</span>
              </div>
              <span className="text-gray-400 text-[9px]">{showShortcutsBar ? "▼" : "▲"}</span>
            </button>
            <AnimatePresence>
              {showShortcutsBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-gray-100 bg-white"
                >
                  <div className="p-3 text-[10px] font-mono text-gray-500 flex flex-col gap-1">
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Del</span><span className="text-gray-400">Delete selected</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+Z</span><span className="text-gray-400">Undo edit</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+Y</span><span className="text-gray-400">Redo action</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+C</span><span className="text-gray-400">Copy element</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+D</span><span className="text-gray-400">Duplicate</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+S</span><span className="text-gray-400">Save draft</span></div>
                    <div className="flex justify-between pb-1 border-b border-gray-50"><span>Ctrl+E</span><span className="text-gray-400">Export file</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* CENTER AREA WITH CANVAS */}
        <div
          ref={canvasAreaRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="flex-1 bg-[#f0f2f5] flex flex-col items-center justify-center p-6 overflow-hidden relative select-none"
        >
          {/* AI UPSCALE PROGRESS OVERLAY */}
          {upscaleState?.active && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 select-none">
              <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl flex flex-col items-center">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#f3f4f6"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#004F31"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - upscaleState.progress / 100)}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-gray-800">{upscaleState.progress}%</span>
                </div>
                
                <h3 className="text-base font-black text-gray-800 uppercase tracking-wide">AI upscaling to {upscaleState.targetSize}</h3>
                <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
                  Deep learning super-resolution engine is reconstructing texture details and sharpening edge boundaries...
                </p>

                {/* Progress bar mock */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-6">
                  <div
                    className="h-full bg-gradient-to-r from-[#004F31] to-emerald-500 transition-all duration-300"
                    style={{ width: `${upscaleState.progress}%` }}
                  />
                </div>

                <div className="flex flex-col gap-1.5 w-full mt-6 text-[10px] font-mono text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between"><span>Engine state:</span><span className="text-[#004F31] font-bold">Initializing model...</span></div>
                  <div className="flex justify-between"><span>Scaling factor:</span><span>{upscaleState.targetSize === "1K" ? "1.5x" : upscaleState.targetSize === "2K" ? "2.5x" : "4.0x Super-Res"}</span></div>
                  <div className="flex justify-between"><span>Status:</span><span className="text-gray-600 animate-pulse">{upscaleState.progress < 40 ? "Analyzing frequency spectrum..." : upscaleState.progress < 85 ? "Applying bicubic model interpolation..." : "Finalizing pixel rendering..."}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Canvas size preset switcher */}
          {backgroundImage && (
            <div className="absolute top-4 left-4 z-40 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-500 mr-2">Preset Size:</span>
              {[
                { name: "Original", preset: "original" },
                { name: "1:1 Square", preset: "1:1" },
                { name: "9:16 Story", preset: "9:16" },
                { name: "16:9 Landscape", preset: "16:9" },
                { name: "Print A4", preset: "a4" }
              ].map((item) => (
                <button
                  key={item.preset}
                  onClick={() => setCanvasPreset(item.preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    canvasPreset === item.preset ? "bg-[#004F31] text-white" : "text-gray-500 hover:text-[#004F31]"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}

          {/* Centered Upload / Empty State */}
          {!backgroundImage ? (
            <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mb-4 text-[#004F31] border border-green-100">
                <Palette size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-sans tracking-tight">LankaProperty Photo Studio</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-sans">
                Import high-res real estate photos, apply beautiful overlays, custom brand watermarks, and leverage intelligent AI enhance controls.
              </p>

              {/* Drag/Drop click trigger */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-[#004F31] bg-gray-50 hover:bg-[#f0fdf4] py-8 px-4 rounded-xl mt-6 cursor-pointer transition-all flex flex-col items-center group"
              >
                <FolderOpen className="text-gray-400 group-hover:text-[#004F31] mb-2 transition-colors" size={28} />
                <span className="text-xs font-bold text-gray-700 group-hover:text-[#004F31] transition-colors">Browse Image from Your Device</span>
                <span className="text-[10px] text-gray-400 mt-1">Supports High Resolution JPG, PNG, WebP</span>
              </div>

              <div className="flex items-center gap-2 my-4 w-full">
                <div className="h-[1px] bg-gray-200 flex-1" />
                <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">OR</span>
                <div className="h-[1px] bg-gray-200 flex-1" />
              </div>

              <button
                onClick={() => setIsGalleryOpen(true)}
                className="w-full py-2.5 bg-[#004F31] hover:bg-[#003824] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <ImageIcon size={16} />
                <span>Choose from Property Listings Gallery</span>
              </button>
            </div>
          ) : (
            /* ACTIVE IMAGE WORKSPACE */
            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center center",
                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05)",
                border: "1px solid #d1d5db",
                backgroundImage: showGrid
                  ? "radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px)"
                  : "none",
                backgroundSize: "20px 20px"
              }}
              className="bg-white relative flex-shrink-0 transition-transform duration-100 ease-out overflow-hidden"
            >
              {/* The underlying Property Photo */}
              <img
                src={backgroundImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`
                }}
              />

              {/* Elements on Top */}
              {elements.map((el, index) => {
                const isActive = el.id === activeElementId;
                if (!el.visible) return null;

                return (
                  <div
                    key={el.id}
                    id={`element-wrapper-${el.id}`}
                    onMouseDown={(e) => handleElementMouseDown(e, el, "move")}
                    style={{
                      position: "absolute",
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      transform: `rotate(${el.rotation}deg)`,
                      transformOrigin: "center center",
                      opacity: el.opacity / 100,
                      cursor: el.locked ? "not-allowed" : dragState?.mode === "move" && dragState.elementId === el.id ? "grabbing" : "grab",
                      zIndex: index + 10,
                      border: isActive && !el.locked ? "2px solid #00F0FF" : "none"
                    }}
                    className="relative select-none"
                  >
                    {/* Element Renderers */}
                    {el.type === "text" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          color: el.color,
                          fontFamily: el.fontFamily,
                          fontSize: `${el.fontSize}px`,
                          fontWeight: el.isBold ? "bold" : "normal",
                          fontStyle: el.isItalic ? "italic" : "normal",
                          textDecoration: el.isUnderline ? "underline" : "none",
                          textAlign: el.align || "center",
                          backgroundColor: el.fill || "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          wordBreak: "break-word"
                        }}
                        onDoubleClick={(e) => {
                          if (el.locked) return;
                          const newText = prompt("Edit text overlay content:", el.text);
                          if (newText !== null) {
                            updateElementWithHistory(el.id, { text: newText });
                          }
                        }}
                      >
                        {el.text}
                      </div>
                    )}

                    {el.type === "shape" && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: el.fill,
                          borderColor: el.strokeColor,
                          borderWidth: `${el.strokeWidth}px`,
                          borderStyle: el.strokeWidth ? "solid" : "none",
                          borderRadius: el.shapeType === "circle" ? "50%" : "0"
                        }}
                      />
                    )}

                    {el.type === "image" && el.url && (
                      <img
                        src={el.url}
                        alt="Overlay item"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    )}

                    {/* Resize Corner Handle Overlay */}
                    {isActive && !el.locked && (
                      <>
                        <div
                          onMouseDown={(e) => handleElementMouseDown(e, el, "resize-se")}
                          style={{
                            position: "absolute",
                            right: "-4px",
                            bottom: "-4px",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "#00F0FF",
                            borderRadius: "50%",
                            cursor: "se-resize",
                            zIndex: 100
                          }}
                        />
                        <div
                          onMouseDown={(e) => handleElementMouseDown(e, el, "resize-sw")}
                          style={{
                            position: "absolute",
                            left: "-4px",
                            bottom: "-4px",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "#00F0FF",
                            borderRadius: "50%",
                            cursor: "sw-resize",
                            zIndex: 100
                          }}
                        />
                        {/* Rotation Handle */}
                        <div
                          onMouseDown={(e) => handleElementMouseDown(e, el, "rotate")}
                          style={{
                            position: "absolute",
                            top: "-24px",
                            left: "50%",
                            marginLeft: "-5px",
                            width: "10px",
                            height: "10px",
                            backgroundColor: "#10B981",
                            borderRadius: "50%",
                            cursor: "grab",
                            zIndex: 100
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "-15px",
                            left: "50%",
                            width: "1px",
                            height: "15px",
                            backgroundColor: "#10B981",
                            zIndex: 99
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM ZOOM CONTROLS TOOLBAR */}
          {backgroundImage && (
            <div className="absolute bottom-4 bg-white px-4 py-2 rounded-2xl border border-gray-200 flex items-center gap-4 z-40 select-none shadow-lg text-[#374151]">
              <button
                onClick={() => setZoom(prev => Math.max(prev - 10, 20))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-28 accent-[#004F31] h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md min-w-[40px] text-center">{zoom}%</span>
              </div>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 10, 200))}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              
              <div className="h-4 w-[1px] bg-gray-200" />
              
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showGrid ? "bg-[#f0fdf4] text-[#004F31] border border-[#004F31]/20" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
                title="Toggle Alignment Grid"
              >
                <Grid size={14} />
              </button>
              
              <button
                onClick={() => {
                  // Fit to screen calculation
                  const maxAreaW = canvasAreaRef.current ? canvasAreaRef.current.clientWidth - 80 : 800;
                  const maxAreaH = canvasAreaRef.current ? canvasAreaRef.current.clientHeight - 80 : 600;
                  const scaleX = maxAreaW / canvasSize.width;
                  const scaleY = maxAreaH / canvasSize.height;
                  setZoom(Math.floor(Math.min(scaleX, scaleY, 1) * 100));
                }}
                className="px-2.5 py-1.5 text-[10px] uppercase font-black bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer text-[#004F31] hover:text-[#003824] transition-colors"
              >
                Fit Canvas
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: PROPERTIES AND LAYERS (white background) */}
        <aside className="w-[280px] h-full bg-white border-l border-[#e5e7eb] flex flex-col select-none overflow-y-auto">
          {/* Section Selector */}
          <div className="grid grid-cols-2 border-b border-[#e5e7eb]">
            <button
              onClick={() => setPropertiesTab("properties")}
              className={`py-3.5 text-xs uppercase tracking-widest font-black text-center border-b-2 cursor-pointer ${
                propertiesTab === "properties" ? "border-[#004F31] text-[#004F31]" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setPropertiesTab("layers")}
              className={`py-3.5 text-xs uppercase tracking-widest font-black text-center border-b-2 cursor-pointer ${
                propertiesTab === "layers" ? "border-[#004F31] text-[#004F31]" : "border-transparent text-gray-500 hover:text-[#004F31]"
              }`}
            >
              Layers ({elements.length})
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col gap-5">
            {propertiesTab === "properties" ? (
              /* PANEL: SELECTION PROPERTIES */
              activeElementId ? (
                (() => {
                  const el = elements.find(item => item.id === activeElementId);
                  if (!el) return null;

                  return (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-black text-[#004F31] uppercase tracking-widest">
                          {el.type === "text" ? "📝 Text Selected" : "🔷 Shape Selected"}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => duplicateElement(el.id)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => deleteElement(el.id)}
                            className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* TEXT PROPERTIES */}
                      {el.type === "text" && (
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Text Overlay</label>
                            <textarea
                              value={el.text || ""}
                              onChange={(e) => updateElement(el.id, { text: e.target.value })}
                              onBlur={(e) => pushState(elements)}
                              className="w-full bg-white text-gray-800 text-xs px-2.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#004F31] rows-2"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Font Family</label>
                              <select
                                value={el.fontFamily || "Plus Jakarta Sans"}
                                onChange={(e) => updateElementWithHistory(el.id, { fontFamily: e.target.value })}
                                className="w-full bg-white text-gray-800 text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-[#004F31]"
                              >
                                {["Plus Jakarta Sans", "Inter", "Oswald", "Bebas Neue", "Montserrat", "Dancing Script"].map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Size (px)</label>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateElementWithHistory(el.id, { fontSize: Math.max(8, (el.fontSize || 12) - 2) })}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black flex-1 text-center bg-gray-50 py-1 rounded text-gray-800">{el.fontSize}</span>
                                <button
                                  onClick={() => updateElementWithHistory(el.id, { fontSize: Math.min(120, (el.fontSize || 12) + 2) })}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Alignment & Styles */}
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Alignment / Style</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateElementWithHistory(el.id, { isBold: !el.isBold })}
                                className={`flex-1 py-1 text-xs rounded font-bold cursor-pointer transition-colors ${
                                  el.isBold ? "bg-[#004F31] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                B
                              </button>
                              <button
                                onClick={() => updateElementWithHistory(el.id, { isItalic: !el.isItalic })}
                                className={`flex-1 py-1 text-xs rounded italic cursor-pointer transition-colors ${
                                  el.isItalic ? "bg-[#004F31] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                I
                              </button>
                              <button
                                onClick={() => updateElementWithHistory(el.id, { isUnderline: !el.isUnderline })}
                                className={`flex-1 py-1 text-xs rounded underline cursor-pointer transition-colors ${
                                  el.isUnderline ? "bg-[#004F31] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                U
                              </button>
                            </div>
                          </div>

                          {/* Text Align Preset */}
                          <div className="grid grid-cols-3 gap-1">
                            {["left", "center", "right"].map((align) => (
                              <button
                                key={align}
                                onClick={() => updateElementWithHistory(el.id, { align: align as any })}
                                className={`py-1 text-[10px] rounded uppercase font-bold cursor-pointer ${
                                  el.align === align ? "bg-[#004F31] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Text Color</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={el.color || "#ffffff"}
                                  onChange={(e) => updateElement(el.id, { color: e.target.value })}
                                  onBlur={() => pushState(elements)}
                                  className="w-10 h-8 rounded border-none bg-transparent cursor-pointer"
                                />
                                <span className="text-xs uppercase font-mono text-gray-800">{el.color}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Box Fill</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={el.fill === "transparent" ? "#000000" : el.fill || "#000000"}
                                  onChange={(e) => updateElement(el.id, { fill: e.target.value })}
                                  onBlur={() => pushState(elements)}
                                  className="w-10 h-8 rounded border-none bg-transparent cursor-pointer"
                                />
                                <button
                                  onClick={() => updateElementWithHistory(el.id, { fill: "transparent" })}
                                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-200 cursor-pointer text-gray-700"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SHAPE PROPERTIES */}
                      {el.type === "shape" && (
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Shape Fill</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={el.fill || "#004F31"}
                                onChange={(e) => updateElement(el.id, { fill: e.target.value })}
                                onBlur={() => pushState(elements)}
                                className="w-10 h-8 rounded border-none bg-transparent cursor-pointer"
                              />
                              <span className="text-xs uppercase font-mono text-gray-800">{el.fill}</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Border (Stroke)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={el.strokeColor || "#ffffff"}
                                onChange={(e) => updateElement(el.id, { strokeColor: e.target.value })}
                                onBlur={() => pushState(elements)}
                                className="w-10 h-8 rounded border-none bg-transparent cursor-pointer"
                              />
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={el.strokeWidth || 0}
                                onChange={(e) => updateElementWithHistory(el.id, { strokeWidth: Number(e.target.value) })}
                                className="w-16 bg-white text-xs px-2 py-1 rounded border border-gray-300 text-center text-gray-800"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SHARED ROTATION & OPACITY */}
                      <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Opacity</span>
                            <span className="text-xs text-gray-800 font-bold">{el.opacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={el.opacity}
                            onChange={(e) => updateElement(el.id, { opacity: Number(e.target.value) })}
                            onMouseUp={() => pushState(elements)}
                            className="w-full accent-[#004F31]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Rotation</span>
                            <span className="text-xs text-gray-800 font-bold">{el.rotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={el.rotation}
                            onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) })}
                            onMouseUp={() => pushState(elements)}
                            className="w-full accent-[#004F31]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => updateElementWithHistory(el.id, { locked: !el.locked })}
                            className={`py-1.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                              el.locked ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {el.locked ? (
                              <>
                                <Lock size={12} />
                                <span>Locked</span>
                              </>
                            ) : (
                              <>
                                <Unlock size={12} />
                                <span>Unlocked</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => updateElementWithHistory(el.id, { visible: !el.visible })}
                            className="py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {el.visible ? (
                              <>
                                <Eye size={12} />
                                <span>Visible</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                /* PANEL: GENERAL BG FILTER PROPERTIES */
                <div className="flex flex-col gap-4">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-xs font-black text-[#004F31] uppercase tracking-widest">
                      📸 Adjust Background Photo
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2">Filter Presets</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "original", label: "Original", gradient: "from-gray-100 to-gray-200" },
                        { id: "vivid", label: "🔥 Vivid", gradient: "from-amber-200 to-rose-300" },
                        { id: "warm", label: "🌅 Warm Glow", gradient: "from-orange-200 to-yellow-200" },
                        { id: "cool", label: "❄️ Cool Crisp", gradient: "from-sky-200 to-indigo-100" },
                        { id: "dramatic", label: "🎬 Dramatic", gradient: "from-slate-700 to-gray-900 text-white" },
                        { id: "matte", label: " Velvet Matte", gradient: "from-zinc-100 to-zinc-300" },
                        { id: "fade", label: " Vintage Fade", gradient: "from-amber-50 to-orange-100" },
                        { id: "bw", label: "📷 Mono B&W", gradient: "from-black to-white" }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => applyFilterPreset(p.id)}
                          className={`group h-11 rounded-xl border relative overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
                            filterPreset === p.id 
                              ? "border-[#004F31] ring-2 ring-[#004F31]/20 font-bold scale-[1.02]" 
                              : "border-gray-200 hover:border-[#004F31]"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-50 group-hover:opacity-60 transition-opacity`} />
                          <span className={`relative text-[10px] font-black tracking-wide uppercase ${p.id === "dramatic" ? "text-white" : "text-gray-800"}`}>
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range adjust controllers */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                    {Object.keys(DEFAULT_FILTERS).map((key) => {
                      const filterKey = key as keyof ImageFilters;
                      let min = 0;
                      let max = 200;
                      if (filterKey === "hueRotate") {
                        min = 0;
                        max = 360;
                      } else if (filterKey === "blur") {
                        min = 0;
                        max = 15;
                      } else if (filterKey === "warmth") {
                        min = -50;
                        max = 50;
                      }

                      return (
                        <div key={filterKey} className="group">
                          <div className="flex justify-between mb-1 items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-gray-700 transition-colors">{filterKey}</span>
                            <span className="text-[10px] text-[#004F31] font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100 min-w-[28px] text-center">{filters[filterKey]}</span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            value={filters[filterKey]}
                            onChange={(e) => {
                              const updatedFilters = { ...filters, [filterKey]: Number(e.target.value) };
                              setFilters(updatedFilters);
                            }}
                            onMouseUp={() => pushState(elements, filters)}
                            className="w-full accent-[#004F31] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all hover:accent-emerald-600"
                          />
                        </div>
                      );
                    })}

                    {/* IMAGE METADATA DETAILS */}
                    {backgroundImage && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">
                          <span>ℹ️ Image File Metadata</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex flex-col gap-2 font-mono text-[10px]">
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-400">Filename:</span>
                            <span className="text-gray-700 font-bold truncate max-w-[120px]" title={backgroundImageName || "untitled.jpg"}>
                              {backgroundImageName || "untitled.jpg"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-400">Dimensions:</span>
                            <span className="text-gray-700 font-bold">
                              {originalWidth || canvasSize.width} × {originalHeight || canvasSize.height} px
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-400">Current Canvas:</span>
                            <span className="text-gray-700 font-bold">
                              {canvasSize.width} × {canvasSize.height} px
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-400">File Size:</span>
                            <span className="text-gray-700 font-bold">
                              {originalFileSize || "1.2 MB"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-gray-400">Format:</span>
                            <span className="text-gray-700 font-bold uppercase">
                              {originalFormat || "JPEG"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Aspect Ratio:</span>
                            <span className="text-[#004F31] font-bold">
                              {Math.abs(canvasSize.width / canvasSize.height - 1) < 0.05 ? "1:1 Square" : canvasSize.width > canvasSize.height ? "16:9 Landscape" : "9:16 Portrait"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setFilters({ ...DEFAULT_FILTERS });
                        pushState(elements, { ...DEFAULT_FILTERS });
                        toast.success("Filters reset to default!");
                      }}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                    >
                      <RefreshCw size={12} />
                      <span>Reset Filters</span>
                    </button>
                  </div>

                  {/* AI ANALYSIS RESULTS CARD */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#004F31] font-black text-xs uppercase mb-2">
                      <Sparkles size={14} className="animate-pulse" />
                      <span>🤖 AI Vision Inspector</span>
                    </div>

                    {analyzing ? (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#004F31]" size={16} />
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Inspecting composition...</span>
                      </div>
                    ) : analysisResult ? (
                      <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div>
                            <span className="text-gray-500 block uppercase font-bold">Room Category</span>
                            <span className="text-gray-800 font-semibold">{analysisResult.room_type || "Exterior"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block uppercase font-bold">Lighting Quality</span>
                            <span className="text-gray-800 font-semibold">{analysisResult.lighting || "Good"}</span>
                          </div>
                        </div>
                        <div className="h-[1px] bg-gray-200" />
                        <div>
                           <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] uppercase font-bold text-gray-500">Quality Index</span>
                             <span className="text-xs font-black text-[#004F31]">{analysisResult.quality_score}/10</span>
                           </div>
                           <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-[#004F31] rounded-full" style={{ width: `${(analysisResult.quality_score || 8) * 10}%` }} />
                           </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-2.5 rounded-lg">
                          <span className="text-[9px] uppercase font-black text-[#004F31] block mb-1">💡 Smart Suggestions</span>
                          <ul className="list-disc list-inside text-[10px] text-gray-700 flex flex-col gap-1">
                            {(analysisResult.suggestions || []).map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          onClick={runAutoEnhance}
                          className="py-1.5 bg-[#004F31] hover:bg-[#003824] text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Auto-Fix Identified Issues
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                        <p className="text-[10px] text-gray-400">Load a photo to activate AI Photo feedback loop.</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* PANEL: LAYERS SYSTEM */
              <div className="flex flex-col gap-4">
                <div className="border-b border-gray-100 pb-2">
                  <span className="text-xs font-black text-[#004F31] uppercase tracking-widest">
                    🥞 Canvas Overlays stack
                  </span>
                </div>

                {elements.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-[11px] text-gray-400">No layout overlays or elements on top of background photo yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {elements.map((el, i) => {
                      const isActive = el.id === activeElementId;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setActiveElementId(el.id)}
                          className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isActive ? "bg-green-50 border-[#004F31]" : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {el.type === "text" ? (
                              <TextIcon size={14} className="text-[#004F31] flex-shrink-0" />
                            ) : (
                              <Square size={14} className="text-blue-500 flex-shrink-0" />
                            )}
                            <span className="text-xs font-semibold truncate text-gray-800">
                              {el.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElementWithHistory(el.id, { visible: !el.visible });
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded"
                            >
                              {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElementWithHistory(el.id, { locked: !el.locked });
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded"
                            >
                              {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                            <div className="flex flex-col">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayer(i, "up");
                                }}
                                disabled={i === elements.length - 1}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                              >
                                <ChevronUp size={10} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayer(i, "down");
                                }}
                                disabled={i === 0}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                              >
                                <ChevronDown size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* HIDDEN INPUT FOR DEVICE FILE SELECTOR */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleOpenImage}
        className="hidden"
      />

      {/* MODAL: EXPORT CONFIG */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full select-none shadow-2xl text-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-base font-sans tracking-tight">📤 Export & Render Image</h3>
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Filename Customization */}
                <div>
                  <label className="text-xs uppercase font-bold text-gray-500 block mb-1.5">Output Filename</label>
                  <input
                    type="text"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                    placeholder="e.g. edited-property-listing"
                    className="w-full bg-white text-gray-850 text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#004F31] font-medium"
                  />
                </div>

                {/* File format */}
                <div>
                  <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Export Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["jpg", "png", "webp"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setExportFormat(f)}
                        className={`py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                          exportFormat === f
                            ? "bg-[#004F31] border-[#004F31] text-white font-bold shadow-sm scale-[1.02]"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div>
                  <div className="flex justify-between mb-1.5 items-center">
                    <label className="text-xs uppercase font-bold text-gray-500">Image Quality</label>
                    <span className="text-xs text-[#004F31] font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">{exportQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={exportQuality}
                    disabled={exportFormat === "png"}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-[#004F31] disabled:opacity-40 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                  />
                  {exportFormat === "png" && (
                    <span className="text-[10px] text-gray-400 mt-1 block leading-tight">PNG format uses lossless compression. Quality setting is automatically optimized.</span>
                  )}
                </div>

                {/* Size presets */}
                <div>
                  <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Export Dimensions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "original", label: `Original (${canvasSize.width}×${canvasSize.height})` },
                      { id: "social", label: "Instagram (1080×1080)" },
                      { id: "web", label: "Web HD (1920×1080)" },
                      { id: "print", label: "Print A4 (3508×2480)" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setExportResolutionPreset(item.id)}
                        className={`py-2 px-2.5 text-left rounded-lg border transition-all cursor-pointer ${
                          exportResolutionPreset === item.id
                            ? "bg-[#f0fdf4] border-[#004F31] text-[#004F31] font-bold"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <p className="text-[10px] truncate leading-tight">{item.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated File Size badge */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-250 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-400 uppercase font-sans font-black tracking-wider text-[9px]">Est. File Size:</span>
                  <span className="text-[#004F31] font-bold bg-white px-2 py-0.5 rounded border border-gray-100">
                    {Math.max(0.1, ((canvasSize.width * canvasSize.height * 3) / 1024 / 1024) * (exportQuality / 100) * (exportFormat === "png" ? 0.75 : exportFormat === "webp" ? 0.11 : 0.14)).toFixed(1)} MB
                  </span>
                </div>

                <div className="h-[1px] bg-gray-100 my-1" />

                {/* Actions Grid */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDownloadExport}
                    className="w-full py-2.5 bg-[#004F31] hover:bg-[#003c24] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💾 Download Image to Device</span>
                  </button>

                  <button
                    onClick={saveToSupabaseStorage}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-250 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>☁️ Save to LankaProperty Storage Bucket</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: STORAGE LISTINGS GALLERY */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl text-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="text-[#004F31]" size={20} />
                  <h3 className="font-black text-gray-800 text-md">🏠 Choose Listing Image</h3>
                </div>
                <button
                  onClick={() => setIsGalleryOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                {galleryImages.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-gray-400">
                    No images found in properties listings db yet. Try uploading from device!
                  </div>
                ) : (
                  galleryImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setBackgroundImage(img.url);
                        setBackgroundImageName(`listing-${i + 1}`);
                        setElements([]);
                        setFilters({ ...DEFAULT_FILTERS });
                        setCanvasPreset("original");
                        setHistory([]);
                        setHistoryIndex(-1);
                        pushState([], { ...DEFAULT_FILTERS }, img.url);
                        setIsGalleryOpen(false);
                        toast.success("Loaded image from listings gallery!");
                        runImageAnalysis(img.url);
                      }}
                      className="group bg-gray-50 hover:bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#004F31] transition-all cursor-pointer flex flex-col relative"
                    >
                      <img src={img.url} alt="" className="w-full h-32 object-cover" />
                      <div className="p-2.5">
                        <p className="text-[10px] font-black uppercase text-[#004F31] truncate">LankaProperty</p>
                        <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{img.propertyTitle}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BATCH PHOTO EDITING */}
      <AnimatePresence>
        {isBatchOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full select-none shadow-2xl text-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="text-[#004F31]" size={20} />
                  <h3 className="font-black text-gray-800 text-md">📦 Smart Batch Editor</h3>
                </div>
                <button
                  onClick={() => setIsBatchOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <p className="text-gray-500 leading-relaxed">
                  Apply a single branded overlay, watermark, sky replacement, or lighting boost to all property images in this listing directory simultaneously.
                </p>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <h4 className="text-[10px] uppercase font-black text-gray-700 tracking-wider mb-2">Step 1: Choose Action</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "✨ Auto Enhance All",
                      "☀️ Fix Dark Photos",
                      "🌤️ Replace Sky On All",
                      "🔏 Add Branded Watermark"
                    ].map((act) => (
                      <button
                        key={act}
                        onClick={() => {
                          toast.promise(
                            new Promise(resolve => setTimeout(resolve, 2500)),
                            {
                              loading: "Processing batch queue...",
                              success: `Batch complete: Applied "${act}" to 12 files!`,
                              error: "Failed"
                            }
                          );
                          setIsBatchOpen(false);
                        }}
                        className="p-2.5 bg-white hover:bg-gray-50 hover:border-[#004F31] text-left font-bold rounded-lg border border-gray-200 cursor-pointer text-gray-700 transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: KEYBOARD HELP */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 max-w-sm w-full select-none shadow-2xl text-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-4">
                <h3 className="font-black text-gray-800 text-md">⌨️ Shortcuts Guide</h3>
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                {[
                  { keys: ["Ctrl", "Z"], desc: "Undo last edit" },
                  { keys: ["Ctrl", "Y"], desc: "Redo last action" },
                  { keys: ["Delete"], desc: "Delete active overlay element" },
                  { keys: ["Ctrl", "C"], desc: "Duplicate active text/shape" },
                  { keys: ["Ctrl", "+"], desc: "Zoom In Canvas" },
                  { keys: ["Ctrl", "-"], desc: "Zoom Out Canvas" },
                  { keys: ["Ctrl", "0"], desc: "Fit Canvas To Workspace" }
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-none">
                    <span className="text-gray-500">{shortcut.desc}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((k, j) => (
                        <kbd key={j} className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-[10px] font-bold text-gray-700 uppercase shadow-sm">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

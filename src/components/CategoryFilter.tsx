import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  FileImage,
  Code2,
  Shield,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';

export type CategoryId = 'all' | 'media' | 'developer' | 'security';

export interface CategoryItem {
  id: CategoryId;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  categories: { id: 'media' | 'developer' | 'security'; label: string; count: number }[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  totalToolsCount: number;
}

const CATEGORY_ICONS: Record<CategoryId, React.ComponentType<{ className?: string }>> = {
  all: Layers,
  media: FileImage,
  developer: Code2,
  security: Shield,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalToolsCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isWrapped, setIsWrapped] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mc_cat_view');
      // Default to wrap on desktop if saved or auto (desktop sidebar fits 2x2 grid best)
      return saved === 'wrap';
    }
    return false;
  });

  // Drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Check scroll position to toggle chevron buttons and edge fades
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || isWrapped) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, [isWrapped]);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [checkScroll, isWrapped]);

  // Handle native wheel event to allow horizontal scrolling on desktop mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isWrapped) return;

    const onWheel = (e: WheelEvent) => {
      // If horizontal overflow exists
      if (el.scrollWidth <= el.clientWidth) return;

      // Translate vertical wheel delta to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isWrapped, checkScroll]);

  // Toggle wrap / carousel view
  const toggleWrap = () => {
    setIsWrapped((prev) => {
      const next = !prev;
      localStorage.setItem('mc_cat_view', next ? 'wrap' : 'carousel');
      return next;
    });
  };

  // Scroll buttons
  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const distance = 160;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 200);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isWrapped) return;
    const el = containerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isWrapped) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Pill click helper
  const handlePillClick = (id: CategoryId, e: React.MouseEvent<HTMLButtonElement>) => {
    if (hasMovedRef.current) {
      // It was a drag gesture, prevent selection
      hasMovedRef.current = false;
      return;
    }
    onSelectCategory(id);

    // Auto-scroll selected button into view if in carousel mode
    if (!isWrapped) {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setTimeout(checkScroll, 250);
    }
  };

  const allItems: { id: CategoryId; label: string; count: number }[] = [
    { id: 'all', label: 'All Tools', count: totalToolsCount },
    ...categories,
  ];

  return (
    <div className="w-full">
      {/* Category Header with Title & View Mode Toggle */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <ListFilter className="w-3.5 h-3.5 text-neutral-500" />
          <span>Filter by Category</span>
        </div>
        <button
          onClick={toggleWrap}
          type="button"
          title={isWrapped ? 'Switch to compact scrollable bar' : 'Expand all categories (grid view)'}
          className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-2 py-0.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
        >
          <LayoutGrid className="w-3 h-3" />
          <span>{isWrapped ? 'Compact' : 'Show All'}</span>
        </button>
      </div>

      {/* Main Filter Container */}
      <div className="relative group/filter rounded-xl bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800/80 p-1">
        {/* Left Scroll Chevron & Gradient Fade (Carousel mode only) */}
        {!isWrapped && (
          <div
            className={`absolute left-0 top-0 bottom-0 z-10 flex items-center pl-0.5 pr-3 rounded-l-xl bg-gradient-to-r from-neutral-200/95 via-neutral-200/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80 transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={() => handleScroll('left')}
              type="button"
              aria-label="Scroll categories left"
              className="w-6 h-6 rounded-lg bg-white/90 dark:bg-neutral-800/90 shadow-xs border border-neutral-300/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Categories List: Either 2-Column Grid/Wrap OR Horizontal Scroll Carousel */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`text-xs font-medium ${
            isWrapped
              ? 'grid grid-cols-2 gap-1.5'
              : 'flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing scroll-smooth'
          }`}
        >
          {allItems.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = CATEGORY_ICONS[cat.id];

            return (
              <button
                key={cat.id}
                onClick={(e) => handlePillClick(cat.id, e)}
                type="button"
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all ${
                  isWrapped ? 'w-full' : 'shrink-0'
                } ${
                  isSelected
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-medium border border-neutral-300/40 dark:border-neutral-700/50'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-neutral-950 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`} />
                  <span className="truncate">{cat.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-700/90 text-neutral-900 dark:text-neutral-100 font-semibold'
                      : 'bg-neutral-300/50 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron & Gradient Fade (Carousel mode only) */}
        {!isWrapped && (
          <div
            className={`absolute right-0 top-0 bottom-0 z-10 flex items-center pr-0.5 pl-3 rounded-r-xl bg-gradient-to-l from-neutral-200/95 via-neutral-200/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80 transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={() => handleScroll('right')}
              type="button"
              aria-label="Scroll categories right"
              className="w-6 h-6 rounded-lg bg-white/90 dark:bg-neutral-800/90 shadow-xs border border-neutral-300/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

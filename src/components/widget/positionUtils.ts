// Enhanced positionUtils.ts with better media sizing support

interface Position {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

interface SafeArea {
  top: number;    // percentage (0-100)
  right: number;  // percentage (0-100)
  bottom: number; // percentage (0-100)
  left: number;   // percentage (0-100)
}

interface MediaDimensions {
  width: number;  // viewport width percentage
  height: number; // viewport height percentage
}

// Media size categories matching the component
const MEDIA_SIZES = {
  small: { width: 20, height: 15 },
  medium: { width: 30, height: 22.5 },
  large: { width: 40, height: 30 },
  xlarge: { width: 50, height: 37.5 }
};

let positionPool: Position[] = [];
let currentPoolIndex = 0;

// Updated safe area to account for the new centering system
const defaultSafeArea: SafeArea = {
  top: 10,     // 10% from top (more space for centered elements)
  right: 10,   // 10% from right
  bottom: 15,  // 15% from bottom (more space for UI elements)
  left: 10     // 10% from left
};

// Function to get size category based on size value
const getSizeCategory = (size: number): keyof typeof MEDIA_SIZES => {
  if (size <= 25) return 'small';
  if (size <= 50) return 'medium';
  if (size <= 75) return 'large';
  return 'xlarge';
};

// Function to get media dimensions for collision detection
const getMediaDimensions = (size: number): MediaDimensions => {
  const category = getSizeCategory(size);
  return MEDIA_SIZES[category];
};

// Convert viewport units to percentage for position calculations
const vwToPercent = (vw: number): number => {
  // Approximate conversion - in practice, this varies by screen size
  // For positioning purposes, we'll use a rough estimate
  return Math.min(vw * 0.8, 50); // Cap at 50% to prevent overlap issues
};

const randomPosition = (): Position => {
  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 100);
  return { x, y };
};

const randomSafePosition = (
  safeArea: SafeArea = defaultSafeArea,
  mediaSize: number = 50
): Position => {
  const dimensions = getMediaDimensions(mediaSize);
  
  // Calculate safe zone accounting for media dimensions and centering
  const elementWidthPercent = vwToPercent(dimensions.width);
  const elementHeightPercent = (dimensions.height * 100) / 100; // vh to percent approximation
  
  const safeWidth = 100 - safeArea.left - safeArea.right;
  const safeHeight = 100 - safeArea.top - safeArea.bottom;
  
  if (safeWidth <= 0 || safeHeight <= 0) {
    return { x: 50, y: 50 }; // Center if no safe space
  }
  
  // Since elements are centered on their position, we can use the full safe area
  const x = safeArea.left + Math.floor(Math.random() * safeWidth);
  const y = safeArea.top + Math.floor(Math.random() * safeHeight);
  
  return { x, y };
};

// Enhanced collision detection accounting for different media sizes
const isPositionTooClose = (
  pos1: Position, 
  pos2: Position, 
  size1: number = 50, 
  size2: number = 50,
  minDistancePercent: number = 15
): boolean => {
  const dims1 = getMediaDimensions(size1);
  const dims2 = getMediaDimensions(size2);
  
  // Calculate the minimum distance needed based on both element sizes
  const avgWidth = (vwToPercent(dims1.width) + vwToPercent(dims2.width)) / 2;
  const avgHeight = (dims1.height + dims2.height) / 2 * 0.8; // Approximate vh to percent
  
  const minDistance = Math.max(minDistancePercent, Math.max(avgWidth, avgHeight) + 5);
  
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < minDistance;
};

// Enhanced position generation with size awareness
const generateNonOverlappingPosition = (
  existingPositions: Array<{ position: Position; size: number }> = [],
  mediaSize: number = 50,
  safeArea: SafeArea = defaultSafeArea,
  maxAttempts: number = 15
): Position => {
  let attempts = 0;
  let position: Position;
  
  do {
    position = randomSafePosition(safeArea, mediaSize);
    attempts++;
  } while (
    attempts < maxAttempts &&
    existingPositions.some(existing => 
      isPositionTooClose(position, existing.position, mediaSize, existing.size)
    )
  );
  
  return position;
};

// Generate positions with size variety
const pregeneratePositions = (
  count: number = 100,
  safeArea: SafeArea = defaultSafeArea
): Position[] => {
  const positions: Position[] = [];
  const sizesUsed: number[] = [];
  
  for (let i = 0; i < count; i++) {
    // Vary the sizes to create more realistic collision detection
    const mediaSize = 25 + Math.random() * 50; // Random size between 25-75
    const existingWithSizes = positions.map((pos, index) => ({
      position: pos,
      size: sizesUsed[index] || 50
    }));
    
    const position = generateNonOverlappingPosition(
      existingWithSizes,
      mediaSize,
      safeArea
    );
    
    positions.push(position);
    sizesUsed.push(mediaSize);
  }
  
  return positions;
};

// Initialize position pool
const initializePositionPool = (
  count: number = 100,
  safeArea: SafeArea = defaultSafeArea
): void => {
  positionPool = pregeneratePositions(count, safeArea);
  currentPoolIndex = 0;
  console.log(`Initialized enhanced position pool with ${positionPool.length} positions`);
};

// Get next position from pool
const getRandomPosition = (): Position => {
  if (positionPool.length === 0) {
    console.warn('Position pool not initialized, using basic safe position');
    return randomSafePosition();
  }
  
  const position = positionPool[currentPoolIndex];
  currentPoolIndex = (currentPoolIndex + 1) % positionPool.length;
  
  return { ...position };
};

// Shuffle positions for variety
const shufflePositions = (): void => {
  for (let i = positionPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positionPool[i], positionPool[j]] = [positionPool[j], positionPool[i]];
  }
  currentPoolIndex = 0;
  console.log('Position pool shuffled');
};

// Update pool (useful for window resize)
const updatePositionPool = (
  safeArea: SafeArea = defaultSafeArea
): void => {
  const currentCount = positionPool.length || 100;
  initializePositionPool(currentCount, safeArea);
  shufflePositions();
};

// Get a position specifically for a media item size
const getPositionForSize = (mediaSize: number): Position => {
  // For now, use the regular pool but this could be enhanced
  // to have size-specific pools
  return getRandomPosition();
};

// Validate position against container bounds
const validatePosition = (
  position: Position, 
  mediaSize: number, 
  containerWidth: number, 
  containerHeight: number
): Position => {
  const dimensions = getMediaDimensions(mediaSize);
  
  // Convert vw to pixels for validation
  const elementWidth = (dimensions.width / 100) * containerWidth;
  const elementHeight = (dimensions.height / 100) * containerHeight;
  
  // Ensure element stays within bounds (accounting for centering)
  const halfWidth = elementWidth / 2;
  const halfHeight = elementHeight / 2;
  
  const minX = (halfWidth / containerWidth) * 100;
  const maxX = 100 - minX;
  const minY = (halfHeight / containerHeight) * 100;
  const maxY = 100 - minY;
  
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y))
  };
};

// Get pool statistics
const getPoolStats = () => ({
  totalPositions: positionPool.length,
  currentIndex: currentPoolIndex,
  remainingInCycle: positionPool.length - currentPoolIndex,
  safeArea: defaultSafeArea,
  mediaSizes: MEDIA_SIZES,
  supportedSizes: Object.keys(MEDIA_SIZES)
});

// Utility functions for coordinate conversion
const positionToPixels = (
  position: Position, 
  containerWidth: number, 
  containerHeight: number
) => ({
  x: (position.x / 100) * containerWidth,
  y: (position.y / 100) * containerHeight
});

const pixelsToPosition = (
  x: number, 
  y: number, 
  containerWidth: number, 
  containerHeight: number
): Position => ({
  x: (x / containerWidth) * 100,
  y: (y / containerHeight) * 100
});

// Get optimal grid positions for multiple items
const getGridPositions = (
  itemCount: number, 
  containerWidth: number, 
  containerHeight: number
): Position[] => {
  const positions: Position[] = [];
  
  // Calculate optimal grid layout
  const cols = Math.ceil(Math.sqrt(itemCount));
  const rows = Math.ceil(itemCount / cols);
  
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;
  
  for (let i = 0; i < itemCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    const x = (col * cellWidth) + (cellWidth / 2);
    const y = (row * cellHeight) + (cellHeight / 2);
    
    positions.push({ x, y });
  }
  
  return positions;
};

export {
  // Core functions
  randomPosition,
  randomSafePosition,
  generateNonOverlappingPosition,
  pregeneratePositions,
  initializePositionPool,
  getRandomPosition,
  shufflePositions,
  updatePositionPool,
  
  // Enhanced functions
  getPositionForSize,
  validatePosition,
  getGridPositions,
  getSizeCategory,
  getMediaDimensions,
  
  // Utility functions
  getPoolStats,
  positionToPixels,
  pixelsToPosition,
  
  // Configuration
  defaultSafeArea,
  MEDIA_SIZES,
  
  // Types
  type Position,
  type SafeArea,
  type MediaDimensions
};
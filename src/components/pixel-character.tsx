
'use client';

import { cn } from '@/lib/utils';

interface PixelCharacterProps {
  pose?: 'idle' | 'casting' | 'attack';
  isHit?: boolean;
  isAttacking?: boolean;
  isFlipped?: boolean;
}

export default function PixelCharacter({
  pose = 'idle',
  isHit = false,
  isAttacking = false,
  isFlipped = false,
}: PixelCharacterProps) {
  const pixelSize = '6px'; // Controls the size of each "pixel"

  const characterStyles: React.CSSProperties = {
    width: `calc(10 * ${pixelSize})`,
    height: `calc(16 * ${pixelSize})`,
    position: 'relative',
    transform: isFlipped ? 'scaleX(-1)' : 'none',
  };

  const lungeStyle: React.CSSProperties = {
    '--lunge-distance': isFlipped ? '-20px' : '20px',
  } as React.CSSProperties;

  const createPixel = (top: number, left: number, color: string, width = 1, height = 1) => (
    <div
      style={{
        position: 'absolute',
        top: `calc(${top} * ${pixelSize})`,
        left: `calc(${left} * ${pixelSize})`,
        width: `calc(${width} * ${pixelSize})`,
        height: `calc(${height} * ${pixelSize})`,
        backgroundColor: color,
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.1)', // Grid effect
      }}
    />
  );

  return (
    <div
      className={cn(
        'transition-transform duration-200',
        isHit && 'animate-shake',
        isAttacking && 'animate-attack'
      )}
      style={lungeStyle}
    >
      <div style={characterStyles}>
        {/* Head */}
        {createPixel(0, 3, '#f2d5ab', 4, 1)}
        {createPixel(1, 2, '#f2d5ab', 6, 3)}
        {createPixel(4, 3, '#f2d5ab', 4, 1)}

        {/* Body */}
        {createPixel(5, 2, '#6b4f3b', 6, 5)}
        {createPixel(10, 3, '#6b4f3b', 4, 1)}

        {/* Left Arm (viewer's left) */}
        {createPixel(5, 1, '#a07a5f')}
        {createPixel(6, 0, '#a07a5f', 2, 3)}

        {/* Right Arm (viewer's right) */}
        {pose === 'casting' ? (
          <>
            {createPixel(5, 8, '#a07a5f', 2, 1)}
            {createPixel(4, 9, '#a07a5f', 2, 1)}
          </>
        ) : (
          <>
            {createPixel(5, 8, '#a07a5f')}
            {createPixel(6, 8, '#a07a5f', 2, 3)}
          </>
        )}

        {/* Legs */}
        {createPixel(11, 2, '#4a382b', 2, 5)}
        {createPixel(11, 6, '#4a382b', 2, 5)}
      </div>
    </div>
  );
}

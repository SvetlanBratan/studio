
'use client';

import { cn } from '@/lib/utils';
import type { Shield } from '@/types/duel';

interface PixelCharacterProps {
  pose?: 'idle' | 'casting' | 'attack';
  isHit?: boolean;
  isAttacking?: boolean;
  isFlipped?: boolean;
  shield?: Shield;
}

const ELEMENT_COLORS: Record<string, string> = {
    'Огонь': 'rgba(255, 100, 80, 0.5)',
    'Вода': 'rgba(80, 150, 255, 0.5)',
    'Лёд': 'rgba(180, 220, 255, 0.5)',
    'Земля': 'rgba(160, 120, 90, 0.5)',
    'Воздух': 'rgba(200, 255, 255, 0.5)',
    'Молния': 'rgba(255, 255, 100, 0.5)',
    'Свет': 'rgba(255, 250, 200, 0.5)',
    'Тьма': 'rgba(100, 80, 150, 0.5)',
    'Жизнь': 'rgba(100, 255, 100, 0.5)',
    'Смерть': 'rgba(150, 150, 150, 0.5)',
    'Растения': 'rgba(100, 200, 100, 0.5)',
    'Лава': 'rgba(255, 140, 0, 0.5)',
    'Звук': 'rgba(255, 150, 200, 0.5)',
    'Кровь': 'rgba(200, 50, 50, 0.5)',
    'Эфир': 'rgba(200, 150, 255, 0.5)',
    'Иллюзии': 'rgba(220, 180, 255, 0.5)',
    'Исцеление': 'rgba(150, 255, 150, 0.5)',
    'Божественная': 'rgba(255, 220, 150, 0.5)',
};
const PHYSICAL_SHIELD_COLOR = 'rgba(200, 200, 200, 0.5)';


export default function PixelCharacter({
  pose = 'idle',
  isHit = false,
  isAttacking = false,
  isFlipped = false,
  shield,
}: PixelCharacterProps) {
  const pixelSize = '6px'; // Controls the size of each "pixel"

  const characterStyles: React.CSSProperties = {
    width: `calc(10 * ${pixelSize})`,
    height: `calc(16 * ${pixelSize})`,
    position: 'relative',
    transform: isFlipped ? 'scaleX(-1)' : 'none',
  };
  
  const shieldStyles: React.CSSProperties = {
    position: 'absolute',
    width: `calc(14 * ${pixelSize})`,
    height: `calc(18 * ${pixelSize})`,
    top: `calc(-2 * ${pixelSize})`,
    left: `calc(-2 * ${pixelSize})`,
    borderRadius: '50% 50% 0 0',
    backgroundColor: shield?.element ? ELEMENT_COLORS[shield.element] : PHYSICAL_SHIELD_COLOR,
    opacity: shield && shield.hp > 0 ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  }

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
  
  const renderPose = () => {
    let rightArm, leftArm;
    switch (pose) {
      case 'attack':
        leftArm = (
            <>
                {createPixel(6, 0, '#a07a5f', 1, 3)}
                {createPixel(5, 1, '#a07a5f', 1, 1)}
            </>
        );
        rightArm = (
            <>
                {createPixel(6, 8, '#f2d5ab', 3, 1)}
            </>
        );
        break;
      case 'casting':
        leftArm = (
          <>
            {createPixel(6, -1, '#a07a5f', 3, 1)}
            {createPixel(7, 0, '#f2d5ab', 1, 1)}
          </>
        );
        rightArm = (
          <>
            {createPixel(6, 8, '#a07a5f', 3, 1)}
            {createPixel(7, 9, '#f2d5ab', 1, 1)}
          </>
        );
        break;
      case 'idle':
      default:
        leftArm = (
          <>
            {createPixel(5, 1, '#a07a5f')}
            {createPixel(6, 0, '#a07a5f', 2, 3)}
          </>
        );
        rightArm = (
          <>
            {createPixel(5, 8, '#a07a5f')}
            {createPixel(6, 8, '#a07a5f', 2, 3)}
          </>
        );
        break;
    }
    
    return (
        <>
            {/* Head */}
            {createPixel(0, 3, '#f2d5ab', 4, 1)}
            {createPixel(1, 2, '#f2d5ab', 6, 3)}
            {createPixel(2, 4, '#222', 1, 1)} 
            {createPixel(2, 6, '#222', 1, 1)} 
            {createPixel(4, 3, '#f2d5ab', 4, 1)}

            {/* Body */}
            {createPixel(5, 2, '#6b4f3b', 6, 5)}
            {createPixel(10, 3, '#6b4f3b', 4, 1)}

            {leftArm}
            {rightArm}

            {/* Legs */}
            {createPixel(11, 2, '#4a382b', 2, 5)}
            {createPixel(11, 6, '#4a382b', 2, 5)}
        </>
    )
  }

  return (
    <div
      className={cn(
        'transition-transform duration-200 relative',
        isHit && 'animate-shake',
        isAttacking && 'animate-attack'
      )}
      style={lungeStyle}
    >
      <div style={characterStyles}>
        {renderPose()}
        <div style={shieldStyles} />
      </div>
    </div>
  );
}

    
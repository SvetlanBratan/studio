

'use client';

import { cn } from '@/lib/utils';
import type { Shield, WeaponType, AnimationState } from '@/types/duel';

interface PixelCharacterProps {
  pose?: AnimationState;
  weapon?: WeaponType;
  isFlipped?: boolean;
  shield?: Shield;
  isActive?: boolean;
  spellElement?: string;
  penalties?: string[];
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
  weapon = 'Кулаки',
  isFlipped = false,
  shield,
  isActive = false,
  spellElement,
  penalties = [],
}: PixelCharacterProps) {
  const pixelSize = '6px'; // Controls the size of each "pixel"

  const characterStyles: React.CSSProperties = {
    width: `calc(10 * ${pixelSize})`,
    height: `calc(16 * ${pixelSize})`,
    position: 'relative',
    transform: isFlipped ? 'scaleX(-1)' : 'none',
    filter: isActive ? 'drop-shadow(0 0 8px hsl(var(--accent)))' : 'none',
    transition: 'filter 0.3s ease-in-out',
  };
  
  const shieldStyles: React.CSSProperties = {
    position: 'absolute',
    width: `calc(14 * ${pixelSize})`,
    height: `calc(18 * ${pixelSize})`,
    top: `calc(-2 * ${pixelSize})`,
    left: `calc(-2 * ${pixelSize})`,
    borderRadius: '50%',
    backgroundColor: shield?.element ? ELEMENT_COLORS[shield.element] : PHYSICAL_SHIELD_COLOR,
    opacity: shield && shield.hp > 0 ? 0.6 : 0,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: 'none',
  }

  const isAttacking = pose === 'attack';
  const isCasting = pose === 'casting';

  const lungeStyle: React.CSSProperties = {
    '--lunge-distance': isFlipped ? '-20px' : '20px',
  } as React.CSSProperties;
  
  const createPixel = (top: number, left: number, color: string, width = 1, height = 1, extraClasses = '') => (
    <div
      className={extraClasses}
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
  
  const renderWeapon = () => {
    switch (weapon) {
      case 'Меч': return <> {createPixel(3, 11, '#c0c0c0', 1, 6)} {createPixel(2, 11, '#c0c0c0')} {createPixel(9, 10, '#8B4513', 3, 1)} </>;
      case 'Топор': return <> {createPixel(3, 11, '#c0c0c0', 2, 1)} {createPixel(4, 11, '#c0c0c0', 3, 2)} {createPixel(3, 10, '#8B4513', 1, 6)} </>;
      case 'Копье': return <> {createPixel(1, 10.5, '#c0c0c0', 1, 2)} {createPixel(3, 10.5, '#8B4513', 1, 8)} </>;
      case 'Кинжал':
      case 'Сюрикены': return <> {createPixel(5, 11, '#c0c0c0', 1, 3)} {createPixel(8, 10, '#8B4513', 3, 1)} </>;
      case 'Лук': return <> {createPixel(5, 7, '#8B4513', 1, 7)} {createPixel(4, 8, '#8B4513', 1, 1)} {createPixel(12, 8, '#8B4513', 1, 1)} {createPixel(6, 9, '#8B4513', 2, 1)} {createPixel(10, 9, '#8B4513', 2, 1)} </>;
      default: return null;
    }
  }

  const renderFace = () => {
      const eyeColor = '#222';
      let leftEye, rightEye;

      if (pose === 'hit') {
          leftEye = <>{createPixel(2, 3.5, eyeColor, 0.5, 0.5)}{createPixel(2.5, 3, eyeColor, 0.5, 0.5)}{createPixel(2, 3, eyeColor, 0.5, 0.5)}{createPixel(2.5, 3.5, eyeColor, 0.5, 0.5)}</>;
          rightEye = <>{createPixel(2, 6.5, eyeColor, 0.5, 0.5)}{createPixel(2.5, 6, eyeColor, 0.5, 0.5)}{createPixel(2, 6, eyeColor, 0.5, 0.5)}{createPixel(2.5, 6.5, eyeColor, 0.5, 0.5)}</>;
      } else if (pose === 'rest') {
          leftEye = createPixel(2.5, 3, eyeColor, 1, 0.5);
          rightEye = createPixel(2.5, 6, eyeColor, 1, 0.5);
      } else {
          leftEye = createPixel(2, 3, eyeColor, 1, 1);
          rightEye = createPixel(2, 6, eyeColor, 1, 1);
      }
      
      let mouth = null;
      if (pose === 'heal') {
          mouth = <>{createPixel(3.5, 4, eyeColor, 2, 0.5)}{createPixel(3, 3.5, eyeColor, 0.5, 0.5)}{createPixel(3, 5.5, eyeColor, 0.5, 0.5)}</>
      } else if (pose !== 'rest' && pose !== 'hit') {
          mouth = createPixel(3.5, 4, eyeColor, 2, 0.5);
      }
      
      return <>{leftEye}{rightEye}{mouth}</>
  }

  const renderStatusEffects = () => {
    const isBurning = penalties.some(p => p.startsWith('Горение'));
    const isPoisoned = penalties.some(p => p.startsWith('Отравление'));

    return (
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {isBurning && (
                <>
                    {createPixel(0, 0, '#FF4500', 1, 1, 'animate-flicker')}
                    {createPixel(1, -1, '#FFA500', 1, 1, 'animate-flicker [animation-delay:-0.2s]')}
                    {createPixel(0, 2, '#FF4500', 1, 1, 'animate-flicker [animation-delay:-0.4s]')}
                </>
            )}
            {isPoisoned && (
                 <>
                    {createPixel(0, 0, '#32CD32', 1, 1, 'animate-flicker')}
                    {createPixel(1, -1, '#98FB98', 1, 1, 'animate-flicker [animation-delay:-0.3s]')}
                    {createPixel(0, 2, '#32CD32', 1, 1, 'animate-flicker [animation-delay:-0.6s]')}
                </>
            )}
        </div>
    )
  }
  
  const renderSpellProjectile = () => {
    if (pose !== 'casting' || !spellElement) return null;
    const color = ELEMENT_COLORS[spellElement] || PHYSICAL_SHIELD_COLOR;

    const projectileWrapperStyle: React.CSSProperties = {
      position: 'absolute',
      top: `calc(6 * ${pixelSize})`,
      left: `calc(10 * ${pixelSize})`,
      width: `calc(20 * ${pixelSize})`,
      animation: 'fly-right 1s ease-out forwards',
    }

    return (
      <div style={projectileWrapperStyle}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Orb */}
            {createPixel(0,0, color, 2, 2)}
            {createPixel(-1,1, color, 1, 1)}
            {createPixel(2,1, color, 1, 1)}
        </div>
      </div>
    );
  }

  const renderPose = () => {
    let rightArm, leftArm;
    switch (pose) {
      case 'attack':
        leftArm = <>{createPixel(6, 0, '#a07a5f', 1, 3)}{createPixel(5, 1, '#a07a5f', 1, 1)}</>;
        rightArm = <>{createPixel(6, 8, '#f2d5ab', 3, 1)}{renderWeapon()}</>;
        break;
      case 'casting':
        leftArm = <>{createPixel(6, -1, '#a07a5f', 3, 1)}{createPixel(7, 0, '#f2d5ab', 1, 1)}</>;
        rightArm = <>{createPixel(6, 8, '#a07a5f', 3, 1)}{createPixel(7, 9, '#f2d5ab', 1, 1)}</>;
        break;
      case 'heal':
      case 'rest':
      case 'hit':
      case 'idle':
      default:
        leftArm = <>{createPixel(5, 1, '#a07a5f')}{createPixel(6, 0, '#a07a5f', 2, 3)}</>;
        rightArm = <>{createPixel(5, 8, '#a07a5f')}{createPixel(6, 8, '#a07a5f', 2, 3)}</>;
        break;
    }
    
    return (
        <>
            {/* Hat */}
            {createPixel(-3, 3, '#4a2f58', 4, 1)}
            {createPixel(-2, 2, '#4a2f58', 6, 1)}
            {createPixel(-1, 4, '#4a2f58', 2, 1)}

            {/* Head */}
            {createPixel(0, 3, '#f2d5ab', 4, 1)}
            {createPixel(1, 2, '#f2d5ab', 6, 3)}
            {renderFace()}
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
        pose === 'hit' && 'animate-shake',
        isAttacking && 'animate-attack'
      )}
      style={lungeStyle}
    >
      <div style={characterStyles}>
        {renderPose()}
        <div style={shieldStyles} />
        {renderSpellProjectile()}
        {renderStatusEffects()}
      </div>
    </div>
  );
}



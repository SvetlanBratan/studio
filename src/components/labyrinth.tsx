
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initialPlayerStats } from '@/lib/rules';
import type { CharacterStats } from '@/types/duel';
import PixelCharacter from './pixel-character';
import { createRoot } from 'react-dom/client';

interface Enemy {
    x: number;
    y: number;
    id: string;
    type: 'orc' | 'goblin';
}

const CELL_SIZE = 32;
const MAP_WIDTH = 25;
const MAP_HEIGHT = 19;

const mapData = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],
    [1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export default function Labyrinth() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerRef = useRef<{ x: number; y: number }>({ x: 1, y: 1 });
    const enemiesRef = useRef<Enemy[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [score, setScore] = useState(0);

    const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const tempContainer = document.createElement('div');
        const root = createRoot(tempContainer);
        root.render(<PixelCharacter />);

        setTimeout(() => {
            const svgString = new XMLSerializer().serializeToString(tempContainer.querySelector('div') as Node);
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgString);
        }, 100);
    }, []);
    
     const drawEnemies = useCallback((ctx: CanvasRenderingContext2D) => {
        enemiesRef.current.forEach(enemy => {
            const enemyX = enemy.x * CELL_SIZE;
            const enemyY = enemy.y * CELL_SIZE;
            ctx.fillStyle = enemy.type === 'orc' ? '#8B4513' : '#006400';
            ctx.fillRect(enemyX + 8, enemyY + 8, 16, 16);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(enemyX + 10, enemyY + 10, 4, 4);
            ctx.fillRect(enemyX + 18, enemyY + 10, 4, 4);
        });
    }, []);

    const drawMap = useCallback((ctx: CanvasRenderingContext2D) => {
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const cellX = x * CELL_SIZE;
                const cellY = y * CELL_SIZE;
                if (mapData[y][x] === 1) {
                    ctx.fillStyle = '#2d5016';
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = '#4a7c23';
                    ctx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else {
                    ctx.fillStyle = '#3e7b27';
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = '#4a8c2a';
                    ctx.fillRect(cellX + 1, cellY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }
            }
        }
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(ctx);
        drawEnemies(ctx);
        
        // Use a placeholder for player drawing for now
        ctx.fillStyle = '#4169E1'; // Player color
        ctx.fillRect(playerRef.current.x * CELL_SIZE + 8, playerRef.current.y * CELL_SIZE + 8, 16, 16);

    }, [drawMap, drawEnemies]);

    useEffect(() => {
        const savedState = sessionStorage.getItem('labyrinthState');
        if (savedState) {
            const { playerPos, enemies, score: savedScore } = JSON.parse(savedState);
            playerRef.current = playerPos;
            enemiesRef.current = enemies;
            setScore(savedScore);
        } else {
            generateEnemies();
        }

        const defeatedEnemyId = searchParams.get('defeated');
        if (defeatedEnemyId) {
            enemiesRef.current = enemiesRef.current.filter(e => e.id !== defeatedEnemyId);
            setScore(prev => prev + 100);
            saveState();
             // Clean up URL
            router.replace('/locations/labyrinth', { scroll: false });
        }
        
        draw();

    }, [searchParams, draw, router]);


    const saveState = useCallback(() => {
        const state = {
            playerPos: playerRef.current,
            enemies: enemiesRef.current,
            score: score,
        };
        sessionStorage.setItem('labyrinthState', JSON.stringify(state));
    }, [score]);


    const generateEnemies = useCallback(() => {
        const newEnemies: Enemy[] = [];
        const enemyCount = 8;
        for (let i = 0; i < enemyCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
                y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
            } while (mapData[y][x] !== 0 || (x === 1 && y === 1) || newEnemies.some(e => e.x === x && e.y === y));
            
            newEnemies.push({
                x, y,
                id: `enemy_${x}_${y}`,
                type: Math.random() > 0.5 ? 'orc' : 'goblin'
            });
        }
        enemiesRef.current = newEnemies;
        saveState();
    }, [saveState]);

    const movePlayer = useCallback((dx: number, dy: number) => {
        const newX = playerRef.current.x + dx;
        const newY = playerRef.current.y + dy;

        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT && mapData[newY][newX] !== 1) {
            playerRef.current.x = newX;
            playerRef.current.y = newY;

            const enemy = enemiesRef.current.find(e => e.x === newX && e.y === newY);
            if (enemy) {
                saveState();
                router.push(`/duels/monster?from=labyrinth&enemyId=${enemy.id}`);
            } else {
                 draw();
            }
        }
    }, [router, saveState, draw]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key.toLowerCase()) {
                case 'w': case 'arrowup': movePlayer(0, -1); break;
                case 's': case 'arrowdown': movePlayer(0, 1); break;
                case 'a': case 'arrowleft': movePlayer(-1, 0); break;
                case 'd': case 'arrowright': movePlayer(1, 0); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer]);

    useEffect(() => {
        const gameLoop = () => {
            draw();
            requestAnimationFrame(gameLoop);
        };
        const frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [draw]);

    return (
        <div className="text-center">
            <canvas ref={canvasRef} width={MAP_WIDTH * CELL_SIZE} height={MAP_HEIGHT * CELL_SIZE} className="bg-[#27ae60] border-4 border-border" />
            <div className="mt-4 text-lg">
                <p>Очки: {score}</p>
                <p>Управление: WASD или стрелки</p>
            </div>
        </div>
    );
}

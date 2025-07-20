
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initialPlayerStats } from '@/lib/rules';
import type { CharacterStats } from '@/types/duel';
import PixelCharacter from './pixel-character';
import CharacterSetupModal from './character-setup-modal';

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
    const playerPosRef = useRef<{ x: number; y: number }>({ x: 1, y: 1 });
    const enemiesRef = useRef<Enemy[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [score, setScore] = useState(0);
    const [character, setCharacter] = useState<CharacterStats | null>(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    
    const saveState = useCallback(() => {
        if (!character) return;
        const state = {
            playerPos: playerPosRef.current,
            enemies: enemiesRef.current,
            score: score,
            character: character,
        };
        sessionStorage.setItem('labyrinthState', JSON.stringify(state));
        sessionStorage.setItem('labyrinthCharacter', JSON.stringify(character));
    }, [score, character]);

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
    
    const drawPlayer = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!character) return;
        // Simplified pixel character drawing for the map
        const playerX = playerPosRef.current.x * CELL_SIZE;
        const playerY = player.y * CELL_SIZE;
        const pixel = 2; // scale factor

        const drawRect = (color: string, rectX: number, rectY: number, w: number, h: number) => {
            ctx.fillStyle = color;
            ctx.fillRect(playerX + rectX * pixel, playerY + rectY * pixel, w * pixel, h * pixel);
        };
        drawRect('#444', 2, 0, 6, 1);
        drawRect('#444', 3, -1, 4, 1);
        drawRect('#f2d5ab', 2, 1, 6, 3);
        drawRect('#222', 3, 2, 1, 1);
        drawRect('#666', 6, 2, 1, 1);
        drawRect('#6b4f3b', 2, 4, 6, 5);
        drawRect('#4a382b', 3, 9, 4, 1);
        drawRect('#4a382b', 2, 10, 2, 4);
        drawRect('#4a382b', 6, 10, 2, 4);
    }, [character]);


    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(ctx);
        drawEnemies(ctx);
        if (isSetupComplete) {
            drawPlayer(ctx);
        }

    }, [drawMap, drawEnemies, drawPlayer, isSetupComplete]);
    
    
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
    }, []);

    useEffect(() => {
        const defeatedEnemyId = searchParams.get('defeated');
        const savedState = sessionStorage.getItem('labyrinthState');

        let shouldGenerateNewEnemies = false;

        if (savedState) {
            const { playerPos, enemies, score: savedScore, character: savedChar } = JSON.parse(savedState);
            playerPosRef.current = playerPos;
            enemiesRef.current = enemies;
            setScore(savedScore);
            setCharacter(savedChar);
            setIsSetupComplete(true);

            if (defeatedEnemyId) {
                enemiesRef.current = enemiesRef.current.filter(e => e.id !== defeatedEnemyId);
                setScore(prev => prev + 100);
                if (enemiesRef.current.length === 0) {
                    shouldGenerateNewEnemies = true;
                }
                router.replace('/locations/labyrinth', { scroll: false });
            }
        } else {
            setCharacter(initialPlayerStats('labyrinth-player', 'Искатель приключений'));
        }
        if (shouldGenerateNewEnemies) {
            generateEnemies();
        }
    }, [searchParams, router, generateEnemies]);
    
    useEffect(() => {
        if(isSetupComplete) {
           saveState();
        }
    }, [score, isSetupComplete, saveState]);


    useEffect(() => {
        if (isSetupComplete) {
            draw();
        }
    }, [isSetupComplete, draw]);


    const movePlayer = useCallback((dx: number, dy: number) => {
        const newX = playerPosRef.current.x + dx;
        const newY = playerPosRef.current.y + dy;

        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT && mapData[newY][newX] !== 1) {
            playerPosRef.current.x = newX;
            playerPosRef.current.y = newY;

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
        if (!isSetupComplete) return;

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
    }, [isSetupComplete, movePlayer]);

    useEffect(() => {
        if (!isSetupComplete) return;

        const gameLoop = () => {
            draw();
            requestAnimationFrame(gameLoop);
        };
        const frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [draw, isSetupComplete]);
    
    const handleCharacterSave = (char: CharacterStats) => {
        setCharacter(char);
        setIsSetupComplete(true);
        if (enemiesRef.current.length === 0) {
            generateEnemies();
        }
    };
    
    if (!character) {
        return <div>Загрузка...</div>;
    }
    
    if (!isSetupComplete) {
        return <CharacterSetupModal character={character} onSave={handleCharacterSave} onCancel={() => router.push('/locations')} />;
    }

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

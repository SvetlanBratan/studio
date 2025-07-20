
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initialPlayerStats } from '@/lib/rules';
import type { CharacterStats } from '@/types/duel';
import CharacterSetupModal from './character-setup-modal';
import { DoorOpen } from 'lucide-react';

interface Enemy {
    x: number;
    y: number;
    id: string;
    type: 'orc' | 'goblin';
    isChasing: boolean;
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
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const EXIT_POS = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 };

export default function Labyrinth() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerPosRef = useRef<{ x: number; y: number }>({ x: 1, y: 1 });
    const enemiesRef = useRef<Enemy[]>([]);
    const lastMoveTimeRef = useRef<number>(0);
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
            ctx.fillStyle = enemy.isChasing ? '#FF4500' : '#FF0000';
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
                } else if (mapData[y][x] === 3) { // Exit
                    ctx.fillStyle = '#3e7b27';
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = '#a88a53'; // gold-ish door
                    ctx.fillRect(cellX + 4, cellY + 4, CELL_SIZE - 8, CELL_SIZE - 8);
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(cellX + 12, cellY + 14, 8, 4);
                }
                else {
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
        const playerX = playerPosRef.current.x * CELL_SIZE;
        const playerY = playerPosRef.current.y * CELL_SIZE;
        const pixel = 2;

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
                id: `enemy_${x}_${y}_${Date.now()}`,
                type: Math.random() > 0.5 ? 'orc' : 'goblin',
                isChasing: false,
            });
        }
        enemiesRef.current = newEnemies;
    }, []);

    const moveEnemies = useCallback(() => {
        enemiesRef.current.forEach(enemy => {
            const playerPos = playerPosRef.current;
            const distanceToPlayer = Math.abs(enemy.x - playerPos.x) + Math.abs(enemy.y - playerPos.y);

            enemy.isChasing = distanceToPlayer <= 5;
            
            let dx = 0;
            let dy = 0;
            
            if (enemy.isChasing) {
                if (enemy.x < playerPos.x) dx = 1;
                else if (enemy.x > playerPos.x) dx = -1;
                else if (enemy.y < playerPos.y) dy = 1;
                else if (enemy.y > playerPos.y) dy = -1;
            } else {
                if (Math.random() < 0.25) { // 25% chance to move randomly
                   const directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
                   const randDir = directions[Math.floor(Math.random() * 4)];
                   dx = randDir.x;
                   dy = randDir.y;
                }
            }

            const newX = enemy.x + dx;
            const newY = enemy.y + dy;
            
            const isWall = mapData[newY] && mapData[newY][newX] === 1;
            const isOccupied = enemiesRef.current.some(e => e !== enemy && e.x === newX && e.y === newY);
            
            if (!isWall && !isOccupied) {
                enemy.x = newX;
                enemy.y = newY;
            }

            if (enemy.x === playerPos.x && enemy.y === playerPos.y) {
                 saveState();
                 router.push(`/duels/monster?from=labyrinth&enemyId=${enemy.id}`);
            }
        });
        draw();
    }, [router, saveState, draw]);

    useEffect(() => {
        const defeatedEnemyId = searchParams.get('defeated');
        const savedStateJson = sessionStorage.getItem('labyrinthState');

        let shouldGenerateNewEnemies = false;

        if (savedStateJson) {
            const savedState = JSON.parse(savedStateJson);
            playerPosRef.current = savedState.playerPos;
            enemiesRef.current = savedState.enemies;
            setScore(savedState.score);
            setCharacter(savedState.character);
            setIsSetupComplete(true);

            if (defeatedEnemyId) {
                const updatedEnemies = enemiesRef.current.filter(e => e.id !== defeatedEnemyId);
                const enemyWasDefeated = updatedEnemies.length < enemiesRef.current.length;

                if (enemyWasDefeated) {
                    const newScore = savedState.score + 100;
                    enemiesRef.current = updatedEnemies;
                    setScore(newScore);

                    if (enemiesRef.current.length === 0) {
                        alert('Вы зачистили лабиринт! Появляются новые враги.');
                        shouldGenerateNewEnemies = true;
                    }
                }
                router.replace('/locations/labyrinth', { scroll: false });
            }
        } else {
            setCharacter(initialPlayerStats('labyrinth-player', 'Искатель приключений'));
        }
        if (shouldGenerateNewEnemies) {
            generateEnemies();
        }
    }, []); // Run only on mount
    
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

        if (newX === EXIT_POS.x && newY === EXIT_POS.y) {
            alert('Поздравляем! Вы нашли выход из лабиринта.');
            sessionStorage.removeItem('labyrinthState');
            sessionStorage.removeItem('labyrinthCharacter');
            router.push('/duels');
            return;
        }


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

        const gameLoop = (timestamp: number) => {
            if(timestamp - lastMoveTimeRef.current > 1000) {
                moveEnemies();
                lastMoveTimeRef.current = timestamp;
            }
            requestAnimationFrame(gameLoop);
        };
        const frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [isSetupComplete, moveEnemies]);
    
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
        return <CharacterSetupModal character={character} onSave={handleCharacterSave} onCancel={() => router.push('/duels')} />;
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

    
// src/components/DottedBackground.tsx
"use client"
import React, { useRef, useEffect } from 'react'

interface DottedBackgroundProps {
    /** 
     * If you want to override dot color, spacing, etc., you can pass a config object.
     * Otherwise it will use the defaults below.
     */
    dotColor?: string
    spacing?: number
    repelRadius?: number
    repelStrength?: number
    returnSpeed?: number
}

export default function DottedBackground({
    dotColor = '#444',
    spacing = 20,
    repelRadius = 60,
    repelStrength = 0.15,
    returnSpeed = 0.05,
}: DottedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        let animationFrameId: number

        let width = 0
        let height = 0
        let dots: Dot[] = []
        let mouseX = -9999
        let mouseY = -9999

        interface Dot {
            x0: number
            y0: number
            x: number
            y: number
            vx: number
            vy: number
        }

        function resizeCanvas() {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            canvas.style.width = width + 'px'
            canvas.style.height = height + 'px'
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            initDots()
        }

        function initDots() {
            dots = []
            const xCount = Math.ceil(width / spacing)
            const yCount = Math.ceil(height / spacing)

            for (let i = 0; i <= xCount; i++) {
                for (let j = 0; j <= yCount; j++) {
                    const x0 = i * spacing
                    const y0 = j * spacing
                    dots.push({ x0, y0, x: x0, y: y0, vx: 0, vy: 0 })
                }
            }
        }

        function onMouseMove(e: MouseEvent) {
            const rect = canvas.getBoundingClientRect()
            mouseX = e.clientX - rect.left
            mouseY = e.clientY - rect.top
        }

        function onMouseLeave() {
            mouseX = -9999
            mouseY = -9999
        }

        function animate() {
            ctx.clearRect(0, 0, width, height)
            for (const dot of dots) {
                const dx = dot.x - mouseX
                const dy = dot.y - mouseY
                const dist = Math.hypot(dx, dy)

                if (dist < repelRadius) {
                    const angle = Math.atan2(dy, dx)
                    const force = (1 - dist / repelRadius) * repelStrength
                    dot.vx += Math.cos(angle) * force * spacing
                    dot.vy += Math.sin(angle) * force * spacing
                }

                dot.x += dot.vx
                dot.y += dot.vy

                const returnDx = dot.x0 - dot.x
                const returnDy = dot.y0 - dot.y
                dot.vx += returnDx * returnSpeed
                dot.vy += returnDy * returnSpeed

                dot.vx *= 0.9
                dot.vy *= 0.9

                ctx.beginPath()
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2) // dotRadius = 2px
                ctx.fillStyle = dotColor
                ctx.fill()
            }

            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resizeCanvas)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseleave', onMouseLeave)

        resizeCanvas()
        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseleave', onMouseLeave)
            cancelAnimationFrame(animationFrameId)
        }
    }, [dotColor, spacing, repelRadius, repelStrength, returnSpeed])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
                pointerEvents: 'none',
            }}
        />
    )
}

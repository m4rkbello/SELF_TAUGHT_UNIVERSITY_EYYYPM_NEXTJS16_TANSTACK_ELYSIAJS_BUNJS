import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis"
import { nanoid } from "nanoid"

export const proxy = async (req: NextRequest) =>{
    //OVERVIEW: CHECK IF USER IS ALLOWED TO JOIN ROOM

    const pathname = req.nextUrl.pathname

    const roomMatch = pathname.match(/^\/room\/([^/]+)$/)

    if(!roomMatch) return NextResponse.redirect(new URL("/", req.url))

    const roomId = roomMatch[1]

    const meta = await redis.hgetall<{connected:string[]; createdAt: number}>(`meta:${roomId}`)

    if(!meta){
        return NextResponse.redirect(new URL("/?error=room-not-found", req.url))
    }
    
    // Check if user already has a token (already in room)
    const existingToken = req.cookies.get("x-auth-token")?.value
    const isAlreadyConnected = existingToken && meta.connected?.includes(existingToken)
    
    // If not already connected, check room capacity
    if (!isAlreadyConnected) {
        const connectedCount = meta.connected?.length || 0
        
        if (connectedCount >= 2) {
            return NextResponse.redirect(new URL("/?error=room-full", req.url))
        }
    }

    const response = NextResponse.next()

    // Only generate new token if user doesn't have one
    const token = existingToken || nanoid()

    // Add token to Redis connected array if it's a new connection
    if (!isAlreadyConnected) {
        const updatedConnected = [...(meta.connected || []), token]
        await redis.hset(`meta:${roomId}`, {
            connected: updatedConnected
        })
    }

    response.cookies.set("x-auth-token", token,
    {
        path:"/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    })

    return response

}

export const config = {
    matcher: "/room/:path*",
}
import { Elysia, t } from 'elysia'

const rooms = new Elysia({prefix: "/room"}).post("/create",()=>{
    console.log("CREATE A NEW ROOM!")
})

const App = new Elysia({ prefix: '/api' }).use(rooms)



export const GET = App.fetch 
export const POST = App.fetch 


export type App = typeof App 
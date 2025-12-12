import { Elysia, t } from 'elysia'

const App = new Elysia({ prefix: '/api' }).get('/user', ({name: "MARK BELLO"}))


export type App = typeof App 

export const GET = App.fetch 
export const POST = App.fetch 
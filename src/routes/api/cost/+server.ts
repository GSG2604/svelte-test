import { prisma } from "$lib/prisma";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
    const result = await prisma.cost.findMany({})
    return new Response(JSON.stringify(result), {status: 200})
}

export const POST: RequestHandler = async ({ request }) => {
    return new Response('Done', {status: 200})
}
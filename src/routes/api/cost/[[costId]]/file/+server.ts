import type { RequestHandler } from "@sveltejs/kit";
import { readFile } from "node:fs/promises";
import { getCost } from "$lib/actions/actions";

export const GET: RequestHandler = async({ params }) => {
    if (!params.costId) {
        return new Response(JSON.stringify({message: 'Not Found'}), {status: 404})
    }
    const cost = await getCost({id: params.costId})

    if (!(cost && cost.file )) {
        return new Response(JSON.stringify({message: 'Not Found'}), {status: 404})
    }
    try {
        const file = await readFile(`uploads/${cost.file}`);
        return new Response(file)
    } catch {
        return new Response(JSON.stringify({message: 'Not Found'}), {status: 404})
    }
    
}
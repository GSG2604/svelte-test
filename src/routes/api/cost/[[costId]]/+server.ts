import { listCosts, createCost, updateCost, deleteCost } from "$lib/actions/actions";
import { actionResult } from "sveltekit-superforms/server";
import { superValidate } from "sveltekit-superforms/server";
import type { RequestHandler } from "@sveltejs/kit";
import { costSchema } from "$lib/zod-validation";
import { writeFileSync } from 'fs';

export const GET: RequestHandler = async () => {
    const result = await listCosts();
    return new Response(JSON.stringify(result), {status: 200})
}

export const POST: RequestHandler = async ({ request, params }) => {
    const formData = await request.formData()
    const form = await superValidate(formData, costSchema);
    console.log(form, formData)
    if(!form.valid){
        return actionResult('failure', {form}, {status: 400})
    }
    if(params.costId){
        await updateCost({id: params.costId, category: form.data.category, amount: form.data.amount, date: form.data.date, file: form.data.file || ""});
    }else {
        await createCost({category: form.data.category, amount: form.data.amount, date: form.data.date, file: form.data.file});
    }

    const file = formData.get('fileData');
    if (file instanceof File) {
        writeFileSync(`uploads/${file.name}`, Buffer.from(await file.arrayBuffer()))
        console.log('file read')
    }

    return actionResult('success', {form}, {status: 200})
}

export const DELETE: RequestHandler =async ({params}) => {
    try {
        await deleteCost({ id: params.costId || '' });
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(error);
        return new Response('Deletion failed', { status: 400 });
    }
}
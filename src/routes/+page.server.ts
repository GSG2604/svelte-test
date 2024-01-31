import type { PageServerLoad } from "./$types";
import { superValidate } from 'sveltekit-superforms/server';
import { costSchema } from "$lib/zod-validation";

export const load: PageServerLoad = async() => {
    const form = await superValidate(costSchema);
    return {form: form}
}
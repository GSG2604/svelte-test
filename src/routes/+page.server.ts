import type { PageServerLoad } from "./$types";
import { superValidate } from 'sveltekit-superforms/server';
import { costSchema } from "$lib/zod-validation";
import { fail } from "@sveltejs/kit";
import { createCost, updateCost } from "$lib/actions/actions";


export const load: PageServerLoad = async() => {
    const form = await superValidate(costSchema);
    return {form: form}
}

export const actions = {
    default: async ({ request }:{request:any}) => {
      const form = await superValidate(request, costSchema);
      console.log(form)
      if (!form.valid) {
        console.log('validation fail')
        return fail(400, { form });
      }
      if (!form.data.id) {
        await createCost({ category: form.data.category, amount: form.data.amount, date: form.data.date, file: form.data.file })
        form.valid = true
      } else {
        updateCost({
          id: form.data?.id || '',
          category: form.data.category,
          amount: form.data?.amount,
          date: form.data?.date,
          file: form.data.file
        })
        form.valid = true
      }
    }
}
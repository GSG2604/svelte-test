import { z } from 'zod';

export const costSchema = z.object({
    id: z.string().optional(),
    category: z.string().min(1),
    amount: z.number().step(0.01).min(0),
    date: z.coerce.date(),
    file: z.string().optional(),
})
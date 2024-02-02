import prisma from "$lib/prisma";

type createCostType = { category: string, amount: number, date: Date, file?: string }
type editCostType = createCostType & { id: string }

export const createCost = async ({ category, amount, date, file }: createCostType) => {
    const cost = await prisma.cost.create({
        data: {
            category: category,
            amount: amount,
            date: date,
            file: file
        }
    });
    return cost
}

export const updateCost = async ({ id, category, amount, date, file }: editCostType) => {
    const cost = await prisma.cost.update({ where: { id: id }, data: { category: category, amount: amount, date: date, file: file }})
    return cost
}

export const deleteCost = async({id}: {id: string}) => {
    await prisma.cost.delete({where: {id: id}})
}

export const listCosts = async() => {
    const list = await prisma.cost.findMany({orderBy:{date: 'desc'}})
    return list
}

export const getCost = async({id}: {id: string}) => {
    return await prisma.cost.findUnique({where: {id: id}})
}
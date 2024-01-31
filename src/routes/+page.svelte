<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { superForm, dateProxy } from 'sveltekit-superforms/client';
    import { costSchema } from '$lib/zod-validation';

    let costs = [];
    export let data: PageData;

    const { form, errors, constraints, enhance } = superForm(data.form, {
        validators: costSchema,
    });

    const proxy = dateProxy(form, 'date')

    onMount(async() => {
        const request = await fetch('/api/cost')
        costs = await request.json()
    })
    
</script>

    {$form.date}

    {#if costs.length}
        Parapupi
    {:else}
        No hay Costs para mostrar
    {/if}

    <form use:enhance  method="post">
        <input hidden name="id" bind:value={$form.id}>
        <input hidden name="file" bind:value={$form.file}>
        <input name="categry" bind:value={$form.category} {...$constraints.category}>
        {$errors.category}
        <input name="amount" bind:value={$form.amount} {...$constraints.amount}>
        {$errors.amount}
        <input name="date" type="date" bind:value={$proxy} {...$constraints.date}>
        {$errors.date}
        <button type="submit">Send</button>
    </form>
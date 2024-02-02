<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { superForm, dateProxy, numberProxy } from 'sveltekit-superforms/client';
	import { costSchema } from '$lib/zod-validation';

	import {
		Timeline,
		TimelineItem,
		Card,
		Label,
		Input,
		Fileupload,
		Button,
		Toggle,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableSearch,
		TableHeadCell,
		ImagePlaceholder,

		Modal

	} from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import { CalendarWeekSolid } from 'flowbite-svelte-icons';

	let costs: string | any[] = [];
	export let data: PageData;
	let showRecent = true;

	const { form, errors, constraints, enhance } = superForm(data.form, {
		validators: costSchema,
	});

	const proxy = dateProxy(form, 'date');
	const number = numberProxy(form, 'amount');

	onMount(async () => {
		const request = await fetch('/api/cost');
		costs = await request.json();
	});
	const changeFile = (event: Event) => {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement && inputElement.files) {
            console.log('file changed');
            $form.file = inputElement.files[0].name;
        }
    };
	let searchTerm = '';
	let openRow: any;
	let details: any;
	$: filteredItems = costs.filter(
		(cost: { category: string }) =>
			cost.category.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	const toggleRow = (opened: number) => {
		openRow = openRow === opened ? null : opened;
	};
</script>

<div class="flex flex-col w-full h-[100vh] bg-white-900 justify-evenly items-center">
	<Toggle
		checked={showRecent}
		size="large"
		on:change={() => {
			showRecent = !showRecent;
		}}
		color="red">{showRecent ? 'Recent activity' : 'Activity list'}</Toggle
	>
	<Card class="flex flex-row min-w-[80vw] max-w-[80vw] max-h-[80vh] justify-between" padding="sm">
		<form
			class="w-auto h-auto"
			use:enhance
			method="post"
			action="/api/cost"
			enctype="multipart/form-data"
		>
			<input hidden name="id" bind:value={$form.id} />
			<input hidden name="file" bind:value={$form.file} />
			<div class="flex flex-col h-full justify-between items-center">
				<div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
					<div class="sm:col-span-2">
						<Label for="category" class="mb-2">Category</Label>
						<Input
							type="text"
							id="category"
							name="category"
							placeholder="Type category"
							required
							bind:value={$form.category}
							{...$constraints.category}
						/>
						{#if $errors.category}<span class="text-red-600">{$errors.category}</span>{/if}
					</div>
					<div class="sm:col-span-2">
						<Label for="amount" class="mb-2">Amount</Label>
						<Input
							type="number"
							id="amount"
							name="amount"
							placeholder="Type amount"
							required
							bind:value={$number}
							{...$constraints.amount}
						>
							<div slot="left">$</div>
						</Input>
						{#if $errors.amount}<span class="text-red-600">{$errors.amount}</span>{/if}
					</div>
					<div class="sm:col-span-2">
						<Label for="date" class="mb-2">Date</Label>
						<Input
							type="date"
							id="date"
							name="date"
							required
							bind:value={$proxy}
							{...$constraints.date}
						/>
						{#if $errors.date}<span class="text-red-600">{$errors.date}</span>{/if}
					</div>
					<div class="sm:col-span-2">
						<Label for="file" class="mb-2">File: {$form.file || "No file upload"}</Label>
						<Fileupload name="fileData" on:change={changeFile} />
					</div>
				</div>
				<Button class="w-1/2" type="submit" size="md" color="red">Send</Button>
			</div>
		</form>

			{#if showRecent}
				<Timeline order="vertical" class=" w-auto overflow-y-scroll">
					{#if costs.length}
						{#each costs as cost}
							<TimelineItem title={cost.category}>
								<svelte:fragment slot="icon">
									<div class="flex items-center min-w-80">
										<div
											class="flex z-10 justify-center items-center bg-primary-200 rounded-full ring-0 ring-white dark:bg-primary-900 sm:ring-8 dark:ring-gray-900 shrink-0"
										>
											<CalendarWeekSolid class="w-5 h-3 text-primary-600 dark:text-primary-400" />
											{new Date(cost.date).toLocaleDateString('en-us', {
												weekday: 'long',
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</div>
										<div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700" />
									</div>
								</svelte:fragment>
								<p class="text-base font-normal text-gray-500 dark:text-gray-400">
									Amount: ${cost.amount}
								</p>
							</TimelineItem>
						{/each}
					{:else}
						No hay Costs para mostrar
					{/if}
				</Timeline>
			{:else}
				<TableSearch
					placeholder="Filter by category"
					color="red"
					hoverable={true}
					bind:inputValue={searchTerm}
				>
					<Table hoverable={true} class="min-h-full w-auto" shadow={false}>
						<TableHead>
							<TableHeadCell class="text-center">Date</TableHeadCell>
							<TableHeadCell class="text-center">Category</TableHeadCell>
							<TableHeadCell class="text-center">Amount</TableHeadCell>
							<TableHeadCell class="text-center">
								<span class="sr-only">Edit</span>
							</TableHeadCell>
						</TableHead>
						<TableBody class="divide-y min-h-full w-full shadow-none">
							{#if costs.length}
								{#each filteredItems as cost, opened}
									<TableBodyRow on:click={() => toggleRow(opened)}>
										<TableBodyCell class="text-center">
											{new Date(cost.date).toLocaleDateString('en-us', {
												weekday: 'long',
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{cost.category}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											$ {cost.amount}
										</TableBodyCell>
									</TableBodyRow>
									{#if openRow === opened}
										<TableBodyRow on:dblclick={() => (details = cost)}>
											<TableBodyCell colspan="4" class="p-0">
												<div class="px-2 py-3" transition:slide={{ duration: 300, axis: 'y' }}>
													{#if cost.file}
														Download: <a download="{cost.file}" href="/api/cost/{cost.id}/file" class="text-blue-500">{cost.file}</a>
													{:else}
														No hay archivos
													{/if}
													<ImagePlaceholder />
												</div>
											</TableBodyCell>
										</TableBodyRow>
									{/if}
								{/each}
							{:else}
								NADA
							{/if}
						</TableBody>
					</Table>
					<Modal title={details?.name} open={!!details} autoclose outsideclose>
						<ImagePlaceholder />
					</Modal>
				</TableSearch>
			{/if}
	</Card>
</div>

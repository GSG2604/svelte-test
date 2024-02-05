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
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableSearch,
		TableHeadCell,
		Alert,
		Spinner
	} from 'flowbite-svelte';

	import { TrashBinSolid, FileEditSolid, CalendarWeekSolid } from 'flowbite-svelte-icons';
	import { slide } from 'svelte/transition';

	let costs: string | any[] = [];
	export let data: PageData;

	let actionURL = "/api/cost";
	let editing = false

	const { form, errors, constraints, enhance, delayed } = superForm(data.form, {
		validators: costSchema,
		onUpdated: async(formData) => {
			if (formData.form.valid) {
				clearForm();
				const request = await fetch('/api/cost');
				costs = await request.json();
				editing = false;
				notify()
			}
		}
	});

	let proxy = new Date(Date.now()).toISOString().slice(0, 10);
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
	let showAlert = false;
	//@ts-expect-error [costs: string] doesn't cause errors here
	$: filteredItems = costs.filter(
		(cost: { category: string }) =>
			cost.category.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
	);

	const toggleRow = (opened: number) => {
		openRow = openRow === opened ? null : opened;
	};
	const handleDelete = async(id: string) => {
		clearForm();
		await fetch(`/api/cost/${id}`, {method: 'DELETE'})
		.then(async() => {
			const request = await fetch('/api/cost');
			costs = await request.json();
			notify()
		})
	}
	const handleEdit = (cost: any) => {
		editing = true;
		actionURL = `/api/cost/${cost.id}`;
		$form.category = cost.category;
		$form.amount = cost.amount;
		proxy = new Date(cost.date).toISOString().slice(0, 10);
		$form.date = cost.date
		$form.file = cost.file;
	}
	const handleCloseEdit = () => {
		editing = false;
		clearForm();
	}
	const notify = () => {
		showAlert = true;
		setTimeout(() => showAlert = false, 3000)
	}
	const formatDate = (date: Date | string) => {
		if (!date) {
			return undefined
		}
		return new Date(date).toLocaleDateString('en-us', {
			weekday: 'long',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	}

	const clearForm = () => {
		let file = document.getElementById('fileData');
		//@ts-expect-error expected file input element
		file.value = null
		$form.amount = 0;
		$form.category = '';
		$form.file = undefined;
		actionURL = "/api/cost";
	}
</script>

<div class="flex flex-row w-full h-[100vh] bg-white-900 justify-evenly items-center">
	
	<Card size="lg" padding="sm" class="h-[80vh]">
		<form
			class="w-auto h-full"
			use:enhance
			method="post"
			action={actionURL}
			enctype="multipart/form-data"
		>
			<input hidden name="id" bind:value={$form.id} />
			<input hidden name="file" bind:value={$form.file} />
			<div class="flex flex-col min-h-full justify-between items-center">
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
						<Label for="date" class="mb-2">Date: {formatDate(proxy) || 'No date selected'}</Label>
						<Input
							type="date"
							id="date"
							name="date"
							required
							bind:value={proxy}
							{...$constraints.date}
							on:change={() => {$form.date = new Date(proxy)}}
							
						/>
						{#if $errors.date}<span class="text-red-600">{$errors.date}</span>{/if}
					</div>
					<div class="sm:col-span-2">
						<Label for="file" class="mb-2 flex flex-row justify-between min-w-[80%]">
							{#if $form.file}
								File: {$form.file}
								<TrashBinSolid class="text-red-500" 
								on:click={() => {
									$form.file = undefined;
									let file = document.getElementById('fileData');
									//@ts-expect-error expected file input element
									file.value = null
								}}/>
							{:else}
								File: No file uploaded
							{/if}
						</Label>
						<Fileupload name="fileData" id='fileData' on:change={changeFile} />
					</div>
				</div>
				<div class="flex flex-row min-w-[80%] justify-evenly">
					<Button class="w-1/2" type="submit" size="md" color="red">
					{#if $delayed}
						<Spinner size='5' color='white'/>
					{:else}
						Send
					{/if}
					</Button>
					{#if editing}
					<Button outline class="w-[25%]" color="red" on:click={handleCloseEdit}>Cancel</Button>
					{/if}
				</div>
			</div>
		</form>
	</Card>

		<Card size="lg" padding="none" class="w-full max-h-[80vh] md:w-auto">
			<TableSearch
				placeholder="Filter by category"
				color="red"
				hoverable={true}
				bind:inputValue={searchTerm}
			>
				<Table hoverable={true} class="max-h-[80vh] w-auto" shadow={false}>
					<TableHead>
						<TableHeadCell class="text-center">Date</TableHeadCell>
						<TableHeadCell class="text-center">Category</TableHeadCell>
						<TableHeadCell class="text-center">Amount</TableHeadCell>
						<TableHeadCell class="text-center"></TableHeadCell>
					</TableHead>

					<TableBody class="divide-y min-h-full w-full shadow-none">
						{#if costs.length}
							{#each filteredItems as cost, opened}
								<TableBodyRow on:click={() => toggleRow(opened)}>
									<TableBodyCell class="text-center">
										{formatDate(cost.date)}
									</TableBodyCell>
									<TableBodyCell class="text-center">
										{cost.category}
									</TableBodyCell>
									<TableBodyCell class="text-center">
										$ {cost.amount}
									</TableBodyCell>
									<TableBodyCell class="flex w-32 justify-between">
										<FileEditSolid class="text-gray-400" on:click={async() => {toggleRow(opened); handleEdit(cost)}}/>
										<TrashBinSolid class="text-red-500" on:click={async() => {toggleRow(opened); handleDelete(cost.id)}}/>
									</TableBodyCell>
								</TableBodyRow>
								{#if openRow === opened}
									<TableBodyRow>
										<TableBodyCell colspan="4" class="p-0 text-center">
											<div class="px-2 py-3" transition:slide={{ duration: 300, axis: 'y' }}>
												{#if cost.file}
													<div class="flex justify-evenly">
														File: {cost.file}
														<Button color='blue'>
															<a download="{cost.file}" href="/api/cost/{cost.id}/file">Download</a>
														</Button>
													</div>	
												{:else}
														No hay archivos
												{/if}
											</div>
										</TableBodyCell>
									</TableBodyRow>
								{/if}
							{/each}
						{:else}
							<TableBodyRow>
								<TableBodyCell colspan='4' class='text-center'>
									No hay Costs para mostrar
								</TableBodyCell>
							</TableBodyRow>
						{/if}
					</TableBody>
				</Table>
			</TableSearch>
		</Card>
	<Timeline order="vertical" class="max-h-[100vh]" >
					{#if costs.length}
						{#each (costs.slice(0, 4)) as cost}
							<TimelineItem title={cost.category} date={formatDate(cost.date)}>
								<svelte:fragment slot="icon">
									<div class="flex items-center min-w-40">
										<div class="flex z-10 justify-center items-center bg-primary-200 rounded-full ring-0 ring-white dark:bg-primary-900 sm:ring-8 dark:ring-gray-900 shrink-0">
											<CalendarWeekSolid class="w-5 h-3 text-primary-600 dark:text-primary-400" />
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
</div>


{#if showAlert}
	<Alert color="green" class='fixed top-0 right-5'>
		<span class="font-medium">Success!</span>
	</Alert>
{/if}
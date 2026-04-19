<script>
	import { onMount, onDestroy } from 'svelte';
	import { isNotificationOpen, notifications, unreadNotificationCount } from '$lib/stores/notifications.js';

	export let user = null;
	export let isAdmin = false;

	let loading = true;
	let pollInterval;

	// Admin create form
	let showCreateForm = false;
	let newTitle = '';
	let newDescription = '';
	let creating = false;

	async function loadNotifications() {
		try {
			const res = await fetch('/api/admin/notifications');
			if (res.ok) {
				const resp = await res.json();
				$notifications = resp.data || [];
				$unreadNotificationCount = resp.unreadCount || 0;
			}
		} catch (err) {
			console.error('Failed to load notifications:', err);
		} finally {
			loading = false;
		}
	}

	async function markAsRead(id) {
		try {
			await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
			$notifications = $notifications.map(n =>
				n.id === id ? { ...n, read_at: new Date().toISOString() } : n
			);
			$unreadNotificationCount = $notifications.filter(n => !n.read_at).length;
		} catch (err) {
			console.error('Failed to mark as read:', err);
		}
	}

	async function markAllAsRead() {
		try {
			await fetch('/api/admin/notifications/read-all', { method: 'POST' });
			$notifications = $notifications.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
			$unreadNotificationCount = 0;
		} catch {}
	}

	async function createNotification() {
		if (!newTitle.trim() || !newDescription.trim() || creating) return;
		creating = true;
		try {
			const res = await fetch('/api/admin/notifications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() })
			});
			if (res.ok) {
				newTitle = '';
				newDescription = '';
				showCreateForm = false;
				await loadNotifications();
			}
		} catch (err) {
			console.error('Failed to create notification:', err);
		} finally {
			creating = false;
		}
	}

	function formatTimeAgo(dateStr) {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now - date;
		const diffMin = Math.floor(diffMs / 60000);
		const diffHr = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHr / 24);

		if (diffMin < 1) return 'Just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		if (diffHr < 24) return `${diffHr}h ago`;
		if (diffDay < 7) return `${diffDay}d ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
	}

	function extractVersion(title) {
		const match = title.match(/v?(\d+\.\d+(\.\d+)?)/i);
		return match ? match[1] : null;
	}

	function close() {
		$isNotificationOpen = false;
	}

	onMount(() => {
		loadNotifications();
		pollInterval = setInterval(loadNotifications, 30000);
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});
</script>

<!-- Backdrop -->
{#if $isNotificationOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="notif-backdrop" on:click={close}></div>
{/if}

<!-- Panel -->
<div class="notif-panel {$isNotificationOpen ? 'open' : ''}">
	<!-- Header -->
	<div class="notif-header">
		<div class="notif-header-left">
			<span class="material-symbols-outlined notif-header-icon">notifications</span>
			<h3>Notifications</h3>
			{#if $unreadNotificationCount > 0}
				<span class="notif-badge">{$unreadNotificationCount}</span>
			{/if}
		</div>
		<div class="notif-header-actions">
			{#if $unreadNotificationCount > 0}
				<button class="notif-mark-all" on:click={markAllAsRead}>
					<span class="material-symbols-outlined">done_all</span>
					Mark all read
				</button>
			{/if}
			<button class="notif-close" on:click={close}>
				<span class="material-symbols-outlined">close</span>
			</button>
		</div>
	</div>

	<!-- Admin: Create new notification -->
	{#if isAdmin}
		<div class="notif-admin-section">
			{#if showCreateForm}
				<div class="notif-create-form">
					<div class="notif-create-header">
						<span class="material-symbols-outlined text-primary">campaign</span>
						<span class="notif-create-title">Broadcast Update</span>
					</div>
					<input
						class="notif-input"
						type="text"
						placeholder="e.g. Version 2.1.0"
						bind:value={newTitle}
					/>
					<textarea
						class="notif-textarea"
						placeholder="Describe what's new in this version..."
						rows="4"
						bind:value={newDescription}
					></textarea>
					<div class="notif-create-actions">
						<button class="notif-btn-cancel" on:click={() => { showCreateForm = false; newTitle = ''; newDescription = ''; }}>
							Cancel
						</button>
						<button
							class="notif-btn-send"
							on:click={createNotification}
							disabled={creating || !newTitle.trim() || !newDescription.trim()}
						>
							{#if creating}
								<div class="notif-spinner"></div>
							{:else}
								<span class="material-symbols-outlined">send</span>
							{/if}
							Broadcast
						</button>
					</div>
				</div>
			{:else}
				<button class="notif-create-trigger" on:click={() => showCreateForm = true}>
					<span class="material-symbols-outlined">add_circle</span>
					New Version Update
				</button>
			{/if}
		</div>
	{/if}

	<!-- Notification list -->
	<div class="notif-list custom-scrollbar">
		{#if loading}
			<div class="notif-loading">
				<div class="notif-spinner-lg"></div>
				<p>Loading notifications...</p>
			</div>
		{:else if $notifications.length === 0}
			<div class="notif-empty">
				<span class="material-symbols-outlined notif-empty-icon">notifications_off</span>
				<h4>No notifications yet</h4>
				<p>Version updates will appear here</p>
			</div>
		{:else}
			{#each $notifications as notif (notif.id)}
				{@const version = extractVersion(notif.title)}
				{@const isUnread = !notif.read_at}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="notif-item {isUnread ? 'unread' : ''}"
					on:click={() => isUnread && markAsRead(notif.id)}
				>
					<!-- Unread indicator -->
					{#if isUnread}
						<div class="notif-unread-dot"></div>
					{/if}

					<!-- Icon -->
					<div class="notif-item-icon {isUnread ? 'icon-unread' : 'icon-read'}">
						{#if version}
							<span class="material-symbols-outlined">rocket_launch</span>
						{:else}
							<span class="material-symbols-outlined">campaign</span>
						{/if}
					</div>

					<!-- Content -->
					<div class="notif-item-content">
						<div class="notif-item-top">
							<h4 class="notif-item-title">{notif.title}</h4>
							<span class="notif-item-time">{formatTimeAgo(notif.created_at)}</span>
						</div>

						{#if version}
							<div class="notif-version-badge">
								<span class="material-symbols-outlined">new_releases</span>
								v{version}
							</div>
						{/if}

						<div class="notif-item-desc">{notif.description}</div>

						<div class="notif-item-footer">
							<span class="material-symbols-outlined">person</span>
							{notif.creator_name || 'Admin'}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	/* Backdrop */
	.notif-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(4px);
		z-index: 89;
		animation: fadeIn 0.2s ease;
	}

	/* Panel */
	.notif-panel {
		position: fixed;
		top: 0;
		right: 0;
		height: 100vh;
		width: 420px;
		max-width: 100vw;
		background: #fff;
		border-left: 1px solid #e2e8f0;
		box-shadow: -8px 0 30px rgba(0, 0, 0, 0.08);
		z-index: 90;
		display: flex;
		flex-direction: column;
		transform: translateX(100%);
		transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.notif-panel.open {
		transform: translateX(0);
	}

	/* Header */
	.notif-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #f1f5f9;
		background: linear-gradient(135deg, #f8fafc 0%, #fff 100%);
		flex-shrink: 0;
	}
	.notif-header-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.notif-header-icon {
		font-size: 24px;
		color: #6366f1;
	}
	.notif-header h3 {
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
	}
	.notif-badge {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		color: #fff;
		font-size: 11px;
		font-weight: 700;
		min-width: 20px;
		height: 20px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6px;
		animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.notif-header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.notif-mark-all {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 600;
		color: #6366f1;
		background: #eef2ff;
		border: none;
		border-radius: 8px;
		padding: 6px 12px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.notif-mark-all:hover {
		background: #e0e7ff;
	}
	.notif-mark-all .material-symbols-outlined {
		font-size: 16px;
	}
	.notif-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.15s;
	}
	.notif-close:hover {
		background: #f1f5f9;
		color: #475569;
	}

	/* Admin section */
	.notif-admin-section {
		padding: 16px 24px;
		border-bottom: 1px solid #f1f5f9;
		flex-shrink: 0;
	}
	.notif-create-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px;
		background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
		border: 1px dashed #a5b4fc;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 600;
		color: #6366f1;
		cursor: pointer;
		transition: all 0.2s;
	}
	.notif-create-trigger:hover {
		background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
		border-color: #818cf8;
		transform: translateY(-1px);
	}
	.notif-create-trigger .material-symbols-outlined {
		font-size: 20px;
	}

	/* Create form */
	.notif-create-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.notif-create-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 700;
		color: #334155;
	}
	.notif-create-header .material-symbols-outlined {
		font-size: 20px;
		color: #6366f1;
	}
	.notif-create-title {
		letter-spacing: 0.02em;
	}
	.notif-input {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		color: #0f172a;
		background: #f8fafc;
		outline: none;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}
	.notif-input:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
		background: #fff;
	}
	.notif-textarea {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		font-size: 13px;
		color: #334155;
		background: #f8fafc;
		outline: none;
		resize: vertical;
		min-height: 80px;
		font-family: inherit;
		line-height: 1.6;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}
	.notif-textarea:focus {
		border-color: #818cf8;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
		background: #fff;
	}
	.notif-create-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	.notif-btn-cancel {
		padding: 8px 16px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
		background: #fff;
		cursor: pointer;
		transition: all 0.15s;
	}
	.notif-btn-cancel:hover {
		background: #f1f5f9;
	}
	.notif-btn-send {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 18px;
		border: none;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 700;
		color: #fff;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		cursor: pointer;
		transition: all 0.2s;
	}
	.notif-btn-send:hover:not(:disabled) {
		background: linear-gradient(135deg, #4f46e5, #4338ca);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
		transform: translateY(-1px);
	}
	.notif-btn-send:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.notif-btn-send .material-symbols-outlined {
		font-size: 16px;
	}

	/* List */
	.notif-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px 0;
	}

	/* Loading */
	.notif-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 24px;
		gap: 12px;
	}
	.notif-loading p {
		font-size: 13px;
		color: #94a3b8;
		margin: 0;
	}

	/* Empty */
	.notif-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 24px;
		text-align: center;
	}
	.notif-empty-icon {
		font-size: 48px;
		color: #cbd5e1;
		margin-bottom: 16px;
	}
	.notif-empty h4 {
		font-size: 15px;
		font-weight: 700;
		color: #475569;
		margin: 0 0 4px;
	}
	.notif-empty p {
		font-size: 13px;
		color: #94a3b8;
		margin: 0;
	}

	/* Notification item */
	.notif-item {
		position: relative;
		display: flex;
		gap: 14px;
		padding: 16px 24px;
		cursor: pointer;
		transition: background-color 0.15s;
		border-bottom: 1px solid #f8fafc;
	}
	.notif-item:hover {
		background: #fafbfc;
	}
	.notif-item.unread {
		background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
	}
	.notif-item.unread:hover {
		background: linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%);
	}

	/* Unread dot */
	.notif-unread-dot {
		position: absolute;
		top: 22px;
		left: 12px;
		width: 7px;
		height: 7px;
		background: #6366f1;
		border-radius: 50%;
		animation: dotPulse 2s ease-in-out infinite;
	}

	/* Item icon */
	.notif-item-icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.notif-item-icon.icon-unread {
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: #fff;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}
	.notif-item-icon.icon-read {
		background: #f1f5f9;
		color: #94a3b8;
	}
	.notif-item-icon .material-symbols-outlined {
		font-size: 20px;
	}

	/* Item content */
	.notif-item-content {
		flex: 1;
		min-width: 0;
	}
	.notif-item-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 4px;
	}
	.notif-item-title {
		font-size: 13px;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
		line-height: 1.3;
	}
	.notif-item-time {
		font-size: 11px;
		font-weight: 500;
		color: #94a3b8;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Version badge */
	.notif-version-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 10px;
		background: linear-gradient(135deg, #ecfdf5, #d1fae5);
		border: 1px solid #a7f3d0;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 700;
		color: #059669;
		margin: 6px 0;
	}
	.notif-version-badge .material-symbols-outlined {
		font-size: 14px;
	}

	/* Description */
	.notif-item-desc {
		font-size: 12.5px;
		line-height: 1.7;
		color: #475569;
		white-space: pre-line;
		word-wrap: break-word;
		margin-top: 4px;
	}

	/* Footer */
	.notif-item-footer {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 8px;
		font-size: 11px;
		font-weight: 500;
		color: #94a3b8;
	}
	.notif-item-footer .material-symbols-outlined {
		font-size: 14px;
	}

	/* Spinners */
	.notif-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	.notif-spinner-lg {
		width: 28px;
		height: 28px;
		border: 3px solid #e2e8f0;
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	/* Animations */
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes badgePop {
		from { transform: scale(0); }
		to { transform: scale(1); }
	}
	@keyframes dotPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>

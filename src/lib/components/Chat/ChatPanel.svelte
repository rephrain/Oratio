<script>
	import { isChatOpen, unreadCount } from '$lib/stores/chat.js';
	import { onMount, onDestroy, tick } from 'svelte';

	export let user = null;

	// === State ===
	let view = 'conversations'; // 'conversations' | 'chat' | 'newChat'
	let conversations = [];
	let chatUsers = [];
	let messages = [];
	let activeConversation = null;
	let messageInput = '';
	let searchQuery = '';
	let loadingConversations = false;
	let loadingMessages = false;
	let loadingUsers = false;
	let sending = false;
	let messagesContainer;
	let pollConvInterval;
	let pollMsgInterval;
	let pollUnreadInterval;
	let lastMessageTimestamp = null;
	let wasChatOpen = false;

	// === Lifecycle ===
	onMount(() => {
		fetchUnreadCount();
		pollUnreadInterval = setInterval(fetchUnreadCount, 10000);
	});

	onDestroy(() => {
		clearInterval(pollConvInterval);
		clearInterval(pollMsgInterval);
		clearInterval(pollUnreadInterval);
	});

	// Watch for panel open/close — only react to actual transitions
	$: {
		const isOpen = $isChatOpen;
		if (isOpen && !wasChatOpen) {
			onPanelOpen();
		} else if (!isOpen && wasChatOpen) {
			onPanelClose();
		}
		wasChatOpen = isOpen;
	}

	function onPanelOpen() {
		clearInterval(pollConvInterval);
		fetchConversations();
		pollConvInterval = setInterval(fetchConversations, 10000);
	}

	function onPanelClose() {
		clearInterval(pollConvInterval);
		clearInterval(pollMsgInterval);
		view = 'conversations';
		activeConversation = null;
		messages = [];
		lastMessageTimestamp = null;
	}

	// === API Calls ===
	async function fetchUnreadCount() {
		try {
			const res = await fetch('/api/chat/unread');
			if (res.ok) {
				const data = await res.json();
				$unreadCount = data.unreadCount;
			}
		} catch (e) {
			// silent
		}
	}

	async function fetchConversations() {
		try {
			loadingConversations = conversations.length === 0;
			const res = await fetch('/api/chat/conversations');
			if (res.ok) {
				const data = await res.json();
				conversations = data.conversations;
			}
		} catch (e) {
			// silent
		} finally {
			loadingConversations = false;
		}
	}

	async function fetchChatUsers() {
		try {
			loadingUsers = true;
			const res = await fetch('/api/chat/users');
			if (res.ok) {
				const data = await res.json();
				chatUsers = data.users;
			}
		} catch (e) {
			// silent
		} finally {
			loadingUsers = false;
		}
	}

	async function fetchMessages(isPolling = false) {
		if (!activeConversation) return;
		try {
			if (!isPolling) loadingMessages = true;
			let url = `/api/chat/messages?conversationId=${activeConversation.id}`;
			if (isPolling && lastMessageTimestamp) {
				url += `&after=${encodeURIComponent(lastMessageTimestamp)}`;
			}
			const res = await fetch(url);
			if (res.ok) {
				const data = await res.json();
				if (isPolling && data.messages.length > 0) {
					const existingIds = new Set(messages.map(m => m.id));
					const newMsgs = data.messages.filter(m => !existingIds.has(m.id));
					if (newMsgs.length > 0) {
						messages = [...messages, ...newMsgs];
						lastMessageTimestamp = newMsgs[newMsgs.length - 1].created_at;
					}
					await tick();
					scrollToBottom();
					// Mark as read
					markAsRead();
					// Update unread globally
					fetchUnreadCount();
					// Update conversation list unread counts
					fetchConversations();
				} else if (!isPolling) {
					messages = data.messages;
					if (messages.length > 0) {
						lastMessageTimestamp = messages[messages.length - 1].created_at;
					}
					await tick();
					scrollToBottom();
				}
			}
		} catch (e) {
			// silent
		} finally {
			loadingMessages = false;
		}
	}

	async function markAsRead() {
		if (!activeConversation) return;
		try {
			await fetch('/api/chat/messages/read', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ conversationId: activeConversation.id })
			});
		} catch (e) { /* silent */ }
	}

	async function sendMessage() {
		if (!messageInput.trim() || !activeConversation || sending) return;
		const content = messageInput.trim();
		messageInput = '';
		sending = true;
		try {
			const res = await fetch('/api/chat/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					conversationId: activeConversation.id,
					content
				})
			});
			if (res.ok) {
				const data = await res.json();
				messages = [...messages, {
					...data.message,
					sender_name: user?.name,
					sender_role: user?.role,
					sender_profile_image_url: user?.profile_image_url
				}];
				lastMessageTimestamp = data.message.created_at;
				await tick();
				scrollToBottom();
				// Refresh conversation list to update last message
				fetchConversations();
			}
		} catch (e) {
			// restore on error
			messageInput = content;
		} finally {
			sending = false;
		}
	}

	async function openConversation(conv) {
		activeConversation = conv;
		view = 'chat';
		messages = [];
		lastMessageTimestamp = null;
		clearInterval(pollMsgInterval);
		await fetchMessages(false);
		markAsRead();
		fetchUnreadCount();
		pollMsgInterval = setInterval(() => fetchMessages(true), 3000);
	}

	async function startNewChat(targetUser) {
		try {
			const res = await fetch('/api/chat/conversations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ targetUserId: targetUser.id })
			});
			if (res.ok) {
				const data = await res.json();
				await fetchConversations();
				// Find the enriched conversation from the list
				const enriched = conversations.find(c => c.id === data.conversation.id);
				if (enriched) {
					openConversation(enriched);
				} else {
					// Fallback: use basic info
					openConversation({
						id: data.conversation.id,
						otherUser: targetUser,
						lastMessage: null,
						unreadCount: 0
					});
				}
			}
		} catch (e) {
			// silent
		}
	}

	function goBack() {
		clearInterval(pollMsgInterval);
		view = 'conversations';
		activeConversation = null;
		messages = [];
		lastMessageTimestamp = null;
		fetchConversations();
		fetchUnreadCount();
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	// === Helpers ===
	function timeAgo(dateStr) {
		if (!dateStr) return '';
		const now = new Date();
		const date = new Date(dateStr);
		const diffMs = now - date;
		const diffMin = Math.floor(diffMs / 60000);
		const diffHr = Math.floor(diffMs / 3600000);
		const diffDay = Math.floor(diffMs / 86400000);

		if (diffMin < 1) return 'Just now';
		if (diffMin < 60) return `${diffMin}m ago`;
		if (diffHr < 24) return `${diffHr}h ago`;
		if (diffDay < 7) return `${diffDay}d ago`;
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
	}

	function formatTime(dateStr) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	}

	function formatDateSeparator(dateStr) {
		const date = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) return 'Today';
		if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
		return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function shouldShowDateSeparator(idx) {
		if (idx === 0) return true;
		const curr = new Date(messages[idx].created_at).toDateString();
		const prev = new Date(messages[idx - 1].created_at).toDateString();
		return curr !== prev;
	}

	function getInitials(name) {
		if (!name) return '?';
		return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
	}

	$: filteredUsers = searchQuery
		? chatUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: chatUsers;
</script>

{#if $isChatOpen}
	<!-- Backdrop -->
	<button 
		class="chat-backdrop" 
		on:click={() => ($isChatOpen = false)}
		aria-label="Close chat"
	></button>

	<!-- Panel -->
	<div class="chat-panel">
		<!-- Header -->
		<div class="chat-panel-header">
			{#if view === 'conversations'}
				<div class="chat-panel-header-left">
					<span class="material-symbols-outlined chat-header-icon">chat</span>
					<h2>Messages</h2>
				</div>
				<div class="chat-panel-header-right">
					<button class="chat-icon-btn" on:click={() => { view = 'newChat'; fetchChatUsers(); }} title="New Chat">
						<span class="material-symbols-outlined">edit_square</span>
					</button>
					<button class="chat-icon-btn" on:click={() => ($isChatOpen = false)} title="Close">
						<span class="material-symbols-outlined">close</span>
					</button>
				</div>
			{:else if view === 'newChat'}
				<div class="chat-panel-header-left">
					<button class="chat-icon-btn" on:click={() => { view = 'conversations'; }} title="Back">
						<span class="material-symbols-outlined">arrow_back</span>
					</button>
					<h2>New Chat</h2>
				</div>
				<div class="chat-panel-header-right">
					<button class="chat-icon-btn" on:click={() => ($isChatOpen = false)} title="Close">
						<span class="material-symbols-outlined">close</span>
					</button>
				</div>
			{:else}
				<div class="chat-panel-header-left">
					<button class="chat-icon-btn" on:click={goBack} title="Back">
						<span class="material-symbols-outlined">arrow_back</span>
					</button>
					{#if activeConversation?.otherUser}
						<div class="chat-header-user">
							<div class="chat-avatar-sm" class:role-dokter-avatar={activeConversation.otherUser.role === 'dokter'} class:role-kasir-avatar={activeConversation.otherUser.role === 'kasir'}>
								{#if activeConversation.otherUser.profile_image_url}
									<img src={activeConversation.otherUser.profile_image_url} alt={activeConversation.otherUser.name} />
								{:else}
									{getInitials(activeConversation.otherUser.name)}
								{/if}
							</div>
							<div style="display: flex; flex-direction: column; gap: 4px;">
								<div style="display: flex; align-items: center; gap: 8px;">
									<p class="chat-header-name">{activeConversation.otherUser.name}</p>
									{#if activeConversation.otherUser.is_online}
										<div class="chat-online-pill">
											<span class="chat-online-pulse"></span>
											Online
										</div>
									{/if}
								</div>
								<div>
									<span class="chat-role-badge" class:role-dokter-badge={activeConversation.otherUser.role === 'dokter'} class:role-kasir-badge={activeConversation.otherUser.role === 'kasir'}>
									{activeConversation.otherUser.role === 'dokter' ? 'Dokter' : 'Kasir'}
								</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
				<div class="chat-panel-header-right">
					<button class="chat-icon-btn" on:click={() => ($isChatOpen = false)} title="Close">
						<span class="material-symbols-outlined">close</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- Body -->
		<div class="chat-panel-body">
			{#if view === 'conversations'}
				<!-- Conversation List -->
				{#if loadingConversations}
					<div class="chat-empty-state">
						<div class="chat-spinner"></div>
						<p>Loading conversations...</p>
					</div>
				{:else if conversations.length === 0}
					<div class="chat-empty-state">
						<span class="material-symbols-outlined chat-empty-icon">forum</span>
						<p class="chat-empty-title">No conversations yet</p>
						<p class="chat-empty-subtitle">Start a new chat with your team</p>
						<button class="chat-start-btn" on:click={() => { view = 'newChat'; fetchChatUsers(); }}>
							<span class="material-symbols-outlined">add</span>
							New Chat
						</button>
					</div>
				{:else}
					<div class="chat-conversation-list">
						{#each conversations as conv}
							<button class="chat-conversation-item" class:has-unread={conv.unreadCount > 0} on:click={() => openConversation(conv)}>
								<div class="chat-avatar" class:role-dokter-avatar={conv.otherUser?.role === 'dokter'} class:role-kasir-avatar={conv.otherUser?.role === 'kasir'}>
									{#if conv.otherUser?.profile_image_url}
										<img src={conv.otherUser.profile_image_url} alt={conv.otherUser?.name} />
									{:else}
										{getInitials(conv.otherUser?.name)}
									{/if}
									{#if conv.otherUser?.is_online}
										<span class="chat-online-dot"></span>
									{:else}
										<span class="chat-role-dot" class:role-dokter-dot={conv.otherUser?.role === 'dokter'} class:role-kasir-dot={conv.otherUser?.role === 'kasir'}></span>
									{/if}
								</div>
								<div class="chat-conversation-info">
									<div class="chat-conversation-top">
										<span class="chat-conversation-name">{conv.otherUser?.name || 'Unknown'}</span>
										<span class="chat-conversation-time">{timeAgo(conv.lastMessage?.created_at || conv.created_at)}</span>
									</div>
									<div class="chat-conversation-bottom">
										<p class="chat-conversation-preview">
											{#if conv.lastMessage}
												{#if conv.lastMessage.sender_id === user?.id}<span class="chat-you">You: </span>{/if}{conv.lastMessage.content}
											{:else}
												<span class="chat-no-msg">No messages yet</span>
											{/if}
										</p>
										{#if conv.unreadCount > 0}
											<span class="chat-unread-badge">{conv.unreadCount}</span>
										{/if}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{/if}

			{:else if view === 'newChat'}
				<!-- User Picker -->
				<div class="chat-search-wrapper">
					<span class="material-symbols-outlined chat-search-icon">search</span>
					<input 
						class="chat-search-input" 
						placeholder="Search by name..." 
						bind:value={searchQuery}
						type="text"
					/>
				</div>
				{#if loadingUsers}
					<div class="chat-empty-state">
						<div class="chat-spinner"></div>
						<p>Loading users...</p>
					</div>
				{:else if filteredUsers.length === 0}
					<div class="chat-empty-state">
						<span class="material-symbols-outlined chat-empty-icon">person_off</span>
						<p class="chat-empty-title">No users found</p>
					</div>
				{:else}
					<div class="chat-user-list">
						{#each filteredUsers as u}
							<button class="chat-user-item" on:click={() => startNewChat(u)}>
								<div class="chat-avatar" class:role-dokter-avatar={u.role === 'dokter'} class:role-kasir-avatar={u.role === 'kasir'}>
									{#if u.profile_image_url}
										<img src={u.profile_image_url} alt={u.name} />
									{:else}
										{getInitials(u.name)}
									{/if}
									{#if u.is_online}
										<span class="chat-online-dot"></span>
									{/if}
								</div>
								<div class="chat-user-info">
									<span class="chat-user-name">{u.name}</span>
									<span class="chat-role-badge" class:role-dokter-badge={u.role === 'dokter'} class:role-kasir-badge={u.role === 'kasir'}>
										{u.role === 'dokter' ? 'Dokter' : 'Kasir'}
									</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}

			{:else}
				<!-- Chat Messages -->
				<div class="chat-messages" bind:this={messagesContainer}>
					{#if loadingMessages}
						<div class="chat-empty-state">
							<div class="chat-spinner"></div>
							<p>Loading messages...</p>
						</div>
					{:else if messages.length === 0}
						<div class="chat-empty-state">
							<span class="material-symbols-outlined chat-empty-icon">waving_hand</span>
							<p class="chat-empty-title">Say hello!</p>
							<p class="chat-empty-subtitle">Start the conversation</p>
						</div>
					{:else}
						{#each messages as msg, idx}
							{#if shouldShowDateSeparator(idx)}
								<div class="chat-date-sep">
									<span>{formatDateSeparator(msg.created_at)}</span>
								</div>
							{/if}
							<div class="chat-message" class:chat-message-self={msg.sender_id === user?.id} class:chat-message-other={msg.sender_id !== user?.id}>
								{#if msg.sender_id !== user?.id}
									<div class="chat-msg-avatar-sm" class:role-dokter-avatar={msg.sender_role === 'dokter'} class:role-kasir-avatar={msg.sender_role === 'kasir'}>
										{#if msg.sender_profile_image_url}
											<img src={msg.sender_profile_image_url} alt={msg.sender_name} />
										{:else}
											{getInitials(msg.sender_name)}
										{/if}
									</div>
								{/if}
								<div class="chat-bubble" class:chat-bubble-self={msg.sender_id === user?.id} class:chat-bubble-other={msg.sender_id !== user?.id}>
									<p class="chat-bubble-text">{msg.content}</p>
									<div class="chat-bubble-meta">
										<span class="chat-bubble-time">{formatTime(msg.created_at)}</span>
										{#if msg.sender_id === user?.id}
											<span class="material-symbols-outlined chat-read-icon" class:is-read={msg.read_at}>
												{msg.read_at ? 'done_all' : 'done'}
											</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Input -->
				<div class="chat-input-wrapper">
					<div class="chat-input-box">
						<textarea
							class="chat-textarea"
							placeholder="Type a message..."
							bind:value={messageInput}
							on:keydown={handleKeydown}
							rows="1"
							disabled={sending}
						></textarea>
						<button 
							class="chat-send-btn" 
							on:click={sendMessage} 
							disabled={!messageInput.trim() || sending}
							title="Send"
						>
							<span class="material-symbols-outlined">{sending ? 'hourglass_top' : 'send'}</span>
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* === Backdrop === */
	.chat-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(6px);
		z-index: 998;
		border: none;
		cursor: default;
		animation: fadeInBackdrop 0.3s ease;
	}

	@keyframes fadeInBackdrop {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* === Panel === */
	.chat-panel {
		position: fixed;
		top: 16px;
		right: 16px;
		bottom: 16px;
		width: 440px;
		max-width: calc(100vw - 32px);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(24px);
		border-radius: 28px;
		border: 1px solid rgba(255, 255, 255, 0.6);
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.5);
		z-index: 999;
		display: flex;
		flex-direction: column;
		animation: slideInRightFloat 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		overflow: hidden;
	}

	@keyframes slideInRightFloat {
		from { transform: translateX(120%) scale(0.95); opacity: 0; }
		to { transform: translateX(0) scale(1); opacity: 1; }
	}

	/* === Header === */
	.chat-panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid rgba(226, 232, 240, 0.6);
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(16px);
		flex-shrink: 0;
		z-index: 10;
	}

	.chat-panel-header-left {
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 0;
	}

	.chat-panel-header-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.chat-panel-header h2 {
		font-size: 1.15rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
		white-space: nowrap;
		letter-spacing: -0.01em;
	}

	.chat-header-icon {
		font-size: 24px;
		color: var(--primary, #3b82f6);
		background: rgba(59, 130, 246, 0.1);
		padding: 8px;
		border-radius: 12px;
	}

	.chat-icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		border: none;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.chat-icon-btn:hover {
		background: #f1f5f9;
		color: #0f172a;
		transform: translateY(-1px);
	}

	.chat-icon-btn:active {
		transform: scale(0.95);
	}

	.chat-icon-btn .material-symbols-outlined {
		font-size: 22px;
	}

	.chat-header-user {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.chat-header-name {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 2px 0;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* === Body === */
	.chat-panel-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: #f8fafc;
	}

	/* === Empty State === */
	.chat-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 32px;
		gap: 12px;
		flex: 1;
		text-align: center;
	}

	.chat-empty-icon {
		font-size: 64px;
		color: #cbd5e1;
		margin-bottom: 8px;
		animation: floating 3s ease-in-out infinite;
	}

	@keyframes floating {
		0% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
		100% { transform: translateY(0); }
	}

	.chat-empty-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: #334155;
		margin: 0;
	}

	.chat-empty-subtitle {
		font-size: 0.95rem;
		color: #94a3b8;
		margin: 0;
		max-width: 80%;
	}

	.chat-start-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
		padding: 12px 24px;
		background: var(--primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
	}

	.chat-start-btn:hover {
		filter: brightness(1.05);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.chat-start-btn:active {
		transform: scale(0.97);
	}

	/* === Spinner === */
	.chat-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top-color: var(--primary, #3b82f6);
		border-radius: 50%;
		animation: chatSpin 0.7s linear infinite;
	}

	@keyframes chatSpin {
		to { transform: rotate(360deg); }
	}

	/* === Avatars === */
	.chat-avatar {
		width: 56px;
		height: 56px;
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.1rem;
		font-weight: 700;
		color: white;
		background: #94a3b8;
		flex-shrink: 0;
		position: relative;
		overflow: visible;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.chat-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	.chat-avatar-sm, .chat-msg-avatar-sm {
		width: 40px;
		height: 40px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 700;
		color: white;
		background: #94a3b8;
		flex-shrink: 0;
		overflow: hidden;
		box-shadow: 0 2px 6px rgba(0,0,0,0.08);
	}

	.chat-msg-avatar-sm {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		font-size: 0.75rem;
		margin-top: auto;
		margin-bottom: 2px;
	}

	.role-dokter-avatar {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	}

	.role-kasir-avatar {
		background: linear-gradient(135deg, #10b981, #047857);
	}

	.chat-role-dot {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 3px solid white;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}

	.role-dokter-dot { background: #3b82f6; }
	.role-kasir-dot { background: #10b981; }

	/* === Role Badge === */
	.chat-role-badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 8px;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.role-dokter-badge {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.role-kasir-badge {
		background: #d1fae5;
		color: #047857;
	}

	/* === Conversation List === */
	.chat-conversation-list {
		overflow-y: auto;
		flex: 1;
		padding: 12px;
	}

	.chat-conversation-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		margin-bottom: 6px;
		border: none;
		border-radius: 20px;
		background: transparent;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.chat-conversation-item:hover {
		background: white;
		box-shadow: 0 6px 16px rgba(0,0,0,0.04);
		transform: translateY(-2px);
	}

	.chat-conversation-item:hover .chat-avatar {
		transform: scale(1.05);
	}

	.chat-conversation-item.has-unread {
		background: white;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	}

	.chat-conversation-item.has-unread:hover {
		box-shadow: 0 8px 24px rgba(0,0,0,0.08);
	}

	.chat-conversation-info {
		flex: 1;
		min-width: 0;
	}

	.chat-conversation-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.chat-conversation-name {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chat-conversation-time {
		font-size: 0.75rem;
		color: #94a3b8;
		font-weight: 500;
		flex-shrink: 0;
	}

	.has-unread .chat-conversation-time {
		color: var(--primary, #3b82f6);
		font-weight: 700;
	}

	.chat-conversation-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.chat-conversation-preview {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex: 1;
		min-width: 0;
	}

	.has-unread .chat-conversation-preview {
		color: #1e293b;
		font-weight: 600;
	}

	.chat-you {
		color: #94a3b8;
		font-weight: 500;
	}

	.chat-no-msg {
		color: #cbd5e1;
		font-style: italic;
	}

	.chat-unread-badge {
		background: var(--primary, #3b82f6);
		color: white;
		font-size: 0.75rem;
		font-weight: 700;
		min-width: 24px;
		height: 24px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6px;
		flex-shrink: 0;
		box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
		animation: pulseBadge 2s infinite;
	}

	@keyframes pulseBadge {
		0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
		70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
		100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
	}

	/* === Search === */
	.chat-search-wrapper {
		position: relative;
		padding: 16px 24px 8px;
		flex-shrink: 0;
		background: #f8fafc;
	}

	.chat-search-icon {
		position: absolute;
		left: 40px;
		top: 55%;
		transform: translateY(-50%);
		font-size: 22px;
		color: #64748b;
	}

	.chat-search-input {
		width: 100%;
		padding: 14px 16px 14px 48px;
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 16px;
		font-size: 0.95rem;
		outline: none;
		background: white;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		font-family: inherit;
		color: #0f172a;
		box-shadow: 0 2px 6px rgba(0,0,0,0.02);
	}

	.chat-search-input:focus {
		border-color: var(--primary, #3b82f6);
		box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
	}

	/* === User List (New Chat) === */
	.chat-user-list {
		overflow-y: auto;
		flex: 1;
		padding: 12px;
	}

	.chat-user-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 14px 16px;
		margin-bottom: 6px;
		border: none;
		border-radius: 20px;
		background: transparent;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.chat-user-item:hover {
		background: white;
		box-shadow: 0 6px 16px rgba(0,0,0,0.04);
		transform: translateY(-2px);
	}

	.chat-user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}

	.chat-user-name {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
	}

	/* === Chat Messages === */
	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		scroll-behavior: smooth;
	}

	.chat-messages::-webkit-scrollbar { width: 6px; }
	.chat-messages::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 6px;
	}
	.chat-messages::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

	/* Date Separator */
	.chat-date-sep {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 16px 0 8px;
	}

	.chat-date-sep span {
		background: rgba(226, 232, 240, 0.7);
		color: #475569;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 6px 16px;
		border-radius: 12px;
		backdrop-filter: blur(4px);
	}

	/* Message Row */
	.chat-message {
		display: flex;
		gap: 12px;
		max-width: 85%;
		animation: msgPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		opacity: 0;
		transform: translateY(16px) scale(0.95);
	}

	@keyframes msgPopIn {
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.chat-message-self {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.chat-message-other {
		align-self: flex-start;
	}

	/* Message Bubble */
	.chat-bubble {
		padding: 14px 18px;
		border-radius: 20px;
		max-width: 100%;
		word-wrap: break-word;
		position: relative;
		box-shadow: 0 4px 6px rgba(0,0,0,0.02);
	}

	.chat-bubble-self {
		background: var(--primary, #3b82f6);
		color: white;
		border-bottom-right-radius: 4px;
		box-shadow: 0 6px 16px rgba(0,0,0,0.1);
	}

	.chat-bubble-other {
		background: white;
		color: #0f172a;
		border-bottom-left-radius: 4px;
		border: 1px solid rgba(226, 232, 240, 0.6);
		box-shadow: 0 4px 12px rgba(0,0,0,0.03);
	}

	.chat-bubble-text {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.chat-bubble-meta {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 6px;
		margin-top: 6px;
	}

	.chat-bubble-time {
		font-size: 0.7rem;
		opacity: 0.75;
		font-weight: 500;
	}

	.chat-read-icon {
		font-size: 16px;
		opacity: 0.6;
	}

	.chat-read-icon.is-read {
		opacity: 1;
		color: #fff;
		filter: drop-shadow(0 0 2px rgba(255,255,255,0.4));
	}

	.chat-bubble-other .chat-read-icon.is-read {
		color: var(--primary, #3b82f6);
	}

	/* === Input === */
	.chat-input-wrapper {
		padding: 16px 24px 20px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(16px);
		border-top: 1px solid rgba(226, 232, 240, 0.6);
		flex-shrink: 0;
		z-index: 10;
	}

	.chat-input-box {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		background: white;
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 24px;
		padding: 8px 8px 8px 20px;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 4px 12px rgba(0,0,0,0.04);
	}

	.chat-input-box:focus-within {
		/* Removed blue focus styling as requested */
	}

	.chat-textarea {
		flex: 1;
		border: none;
		outline: none;
		font-size: 0.95rem;
		font-family: inherit;
		resize: none;
		max-height: 120px;
		padding: 12px 0;
		line-height: 1.5;
		background: transparent;
		color: #0f172a;
	}

	.chat-textarea:focus {
		outline: none !important;
		box-shadow: none !important;
		border: none !important;
	}

	.chat-textarea::placeholder {
		color: #94a3b8;
	}

	.chat-send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 18px;
		border: none;
		background: var(--primary, #3b82f6);
		color: white;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(59,130,246,0.3);
	}

	.chat-send-btn:hover:not(:disabled) {
		filter: brightness(1.08);
		transform: scale(1.05) rotate(-8deg);
		box-shadow: 0 8px 20px rgba(59,130,246,0.4);
	}

	.chat-send-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.chat-send-btn:disabled {
		background: #e2e8f0;
		color: #94a3b8;
		cursor: not-allowed;
		box-shadow: none;
	}

	.chat-send-btn .material-symbols-outlined {
		font-size: 20px;
		margin-left: 2px;
	}

	/* === Online & Read UI Additions === */
	.chat-online-dot {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #10b981;
		border: 3px solid white;
		box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
		animation: onlineDotPulse 2s infinite;
	}

	@keyframes onlineDotPulse {
		0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
		70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
		100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
	}

	.chat-online-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(16, 185, 129, 0.1);
		color: #047857;
		padding: 3px 8px;
		border-radius: 12px;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.chat-online-pulse {
		width: 6px;
		height: 6px;
		background: #10b981;
		border-radius: 50%;
		animation: smallPulse 2s infinite;
	}

	@keyframes smallPulse {
		0% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
		100% { opacity: 1; transform: scale(1); }
	}

	.chat-read-badge {
		display: flex;
		align-items: center;
		gap: 3px;
		background: rgba(255, 255, 255, 0.2);
		padding: 2px 8px 2px 6px;
		border-radius: 10px;
		transition: all 0.2s ease;
	}

	.chat-read-badge.is-read {
		background: rgba(255, 255, 255, 0.3);
	}

	.chat-read-icon {
		font-size: 14px;
		opacity: 0.8;
	}

	.chat-read-badge.is-read .chat-read-icon {
		color: #fff;
		filter: drop-shadow(0 0 2px rgba(255,255,255,0.4));
	}

	.chat-read-text {
		font-size: 0.65rem;
		font-weight: 600;
		opacity: 0.9;
	}
</style>
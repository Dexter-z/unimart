import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

// User Notifications tab modeled after admin notifications page UI
const NotificationsTab = () => {
  const { data, isLoading, isPlaceholderData } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: async (): Promise<any[]> => {
      const res = await axiosInstance.get('/admin/api/get-user-notifications');
      console.log('[User Notifications] API response:', res?.status, res?.data);
      const payload = res?.data;
      // Handle various shapes: {notifications: [...]}, {data: [...]}, [...], or paginated .docs
      let list: any = undefined;
      if (Array.isArray(payload?.notifications)) list = payload.notifications;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload)) list = payload;
      else if (payload?.notifications?.docs && Array.isArray(payload.notifications.docs)) list = payload.notifications.docs;
      else if (payload?.data?.docs && Array.isArray(payload.data.docs)) list = payload.data.docs;

      if (Array.isArray(list)) {
        console.log('[User Notifications] Normalized list length:', list.length);
        return list;
      }
      console.warn('[User Notifications] Unexpected response shape, defaulting to []');
      return [] as any[];
    },
    placeholderData: [] as any[],
  });

  // UI state and helpers
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('unread');
  // Local-only read state since there is no user mark-read API route exposed
  const [readMap, setReadMap] = React.useState<Record<string, boolean>>({});

  const notifications: any[] = Array.isArray(data) ? data : [];

  const getId = (n: any, idx: number) => String(n?.id ?? n?._id ?? n?.uuid ?? idx);
  const getType = (n: any): 'info' | 'success' | 'warning' | 'error' => {
    const t = String(n?.type ?? n?.level ?? 'info').toLowerCase();
    if (t.includes('success')) return 'success';
    if (t.includes('warn')) return 'warning';
    if (t.includes('error') || t.includes('danger') || t.includes('fail')) return 'error';
    return 'info';
  };
  const getTitle = (n: any) => n?.title ?? n?.subject ?? n?.heading ?? 'Notification';
  const getMessage = (n: any) => n?.message ?? n?.body ?? n?.content ?? '';
  const getTime = (n: any) => n?.createdAt ?? n?.timestamp ?? n?.time ?? Date.now();
  const getSource = (n: any) => n?.source ?? n?.origin ?? undefined;
  const getRedirectLink = (n: any) => n?.redirect_link ?? n?.redirectLink ?? n?.url ?? undefined;

  const counts = React.useMemo(() => {
    const base = { all: 0, unread: 0, info: 0, success: 0, warning: 0, error: 0 } as Record<string, number>;
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const id = getId(n, i);
      base.all++;
      const status = String(n?.status ?? '').toLowerCase();
      const serverIsRead = typeof n?.read === 'boolean' ? n.read : (status ? status !== 'unread' : false);
      const isRead = (readMap[id] ?? serverIsRead) as boolean;
      if (!isRead) base.unread++;
      base[getType(n)]++;
    }
    return base;
  }, [notifications, readMap]);

  const filtered = React.useMemo(() => {
    const out: any[] = [];
    for (let i = 0; i < notifications.length; i++) {
      const n = notifications[i];
      const id = getId(n, i);
      const type = getType(n);
      const status = String(n?.status ?? '').toLowerCase();
      const serverIsRead = typeof n?.read === 'boolean' ? n.read : (status ? status !== 'unread' : false);
      const isRead = (readMap[id] ?? serverIsRead) as boolean;
      if (filter === 'all' || (filter === 'unread' && !isRead) || filter === type) {
        out.push({ n, id, type, isRead, idx: i });
      }
    }
    return out;
  }, [notifications, filter, readMap]);

  const onOpenNotification = (item: any, uiId: string, isRead: boolean) => {
    // Optimistically mark as read (local only)
    if (!isRead) setReadMap((m) => ({ ...m, [uiId]: true }));
    const link = String(getRedirectLink(item) || '').trim();
    if (link) {
      try {
        const href = /^(https?:)?\//.test(link) ? link : `/${link.replace(/^\//, '')}`;
        window.location.assign(href);
      } catch (e) {
        console.error('[User Notifications] Invalid redirect link:', link, e);
      }
    }
  };

  const Chip = ({ label, value }: { label: string; value: typeof filter }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
        filter === value
          ? 'bg-[#ff8800] text-[#18181b] border-[#ff8800]'
          : 'bg-[#18181b] text-gray-300 border-[#232326] hover:border-[#ff8800]'
      }`}
      aria-pressed={filter === value}
    >
      <span>{label}</span>
      <span className={`${filter === value ? 'bg-[#18181b] text-[#ff8800]' : 'bg-[#232326] text-gray-300'} text-xs px-1.5 py-0.5 rounded-md`}>
        {counts[value] ?? 0}
      </span>
    </button>
  );

  const Skeleton = () => (
    <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-[#2b2b30] rounded w-1/3 mb-2" />
      <div className="h-4 bg-[#2b2b30] rounded w-2/3" />
    </div>
  );

  const Row = ({ item, id, type, isRead }: { item: any; id: string; type: ReturnType<typeof getType>; isRead: boolean }) => (
    <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenNotification(item, id, isRead)}>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-700/40'
              : type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-700/40'
              : type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-700/40'
              : 'bg-blue-500/10 text-blue-400 border border-blue-700/40'
            }`}>{type.toUpperCase()}</span>
            {!isRead && <span className="inline-block w-2 h-2 rounded-full bg-[#ff8800]" title="Unread" />}
            {getSource(item) && <span className="text-xs text-gray-400">{String(getSource(item))}</span>}
          </div>
          <div className="text-gray-200 font-semibold truncate">{String(getTitle(item))}</div>
          {getMessage(item) && <div className="text-gray-300 mt-1 break-words">{String(getMessage(item))}</div>}
          <div className="text-xs text-gray-500 mt-2">{new Date(getTime(item)).toLocaleString()}</div>
        </div>
        {/* No mark read/unread buttons for users (no route). Show read label when applicable */}
        {isRead && (
          <div className="shrink-0">
            <span className="px-3 py-1 rounded-lg text-sm bg-[#18181b] text-gray-300 border border-[#232326]">Read</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="All" value="all" />
          <Chip label="Unread" value="unread" />
          <Chip label="Info" value="info" />
          <Chip label="Success" value="success" />
          <Chip label="Warning" value="warning" />
          <Chip label="Error" value="error" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {(isLoading || isPlaceholderData) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} />))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-8 text-center">
            <div className="text-xl font-semibold text-gray-300">No notifications</div>
            <p className="text-gray-500 mt-1">You're all caught up for now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(({ n, id, type, isRead }) => (
              <Row key={id} item={n} id={id} type={type} isRead={isRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;

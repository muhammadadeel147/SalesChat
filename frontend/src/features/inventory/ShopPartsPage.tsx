'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { ProductListPanel } from '@/components/catalog/ProductListPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useToast } from '@/components/ui/Toast';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { api } from '@/lib/api-client';
import { entityMatchesSearch } from '@/lib/search-match';
import type { ShopPart } from '@/types/api';

export function ShopPartsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ShopPart | null>(null);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<ShopPart | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopPart | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
  });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['shop-parts', debouncedSearch],
    queryFn: () => api.shopParts.list(debouncedSearch.trim() || undefined),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: productsPage, isLoading: countsLoading } = useQuery({
    queryKey: ['products', 'part-counts'],
    queryFn: () => api.products.list({ pageSize: 500, skipCount: true }),
    staleTime: 60_000,
  });

  const productCountByPart = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of productsPage?.data ?? []) {
      const id = p.part?.id;
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [productsPage]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    const q = search.trim();
    if (!q) return rows;
    return rows.filter((p) => entityMatchesSearch([p.name], q));
  }, [data, search]);

  const save = useMutation({
    mutationFn: () =>
      editing ? api.shopParts.update(editing.id, { name }) : api.shopParts.create({ name }),
    onSuccess: () => {
      setModal(false);
      setEditing(null);
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['shop-parts'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Could not save shop part');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.shopParts.delete(id),
    onSuccess: (_, id) => {
      if (selected?.id === id) setSelected(null);
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['shop-parts'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const currency = settings?.currency ?? 'PKR';
  const listLoading = isLoading || (isFetching && !data);

  if (listLoading) return <PageSkeleton rows={6} />;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="min-w-0 truncate text-lg font-bold tracking-tight text-text">
              Shop Parts
            </h1>
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => {
                setEditing(null);
                setName('');
                setModal(true);
              }}
            >
              Add part
            </Button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Split sales and profit by section inside one shop
          </p>
        </div>
        <Input
          className="mb-3"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && (
          <div className="mb-3">
            <div className="skeleton-shine mb-2 h-14 rounded-xl bg-surface-muted" />
            <div className="skeleton-shine h-14 rounded-xl bg-surface-muted" />
          </div>
        )}
        <div
          className={`max-h-[calc(100vh-14rem)] space-y-2 overflow-y-auto ${isFetching ? 'opacity-70' : ''}`}
        >
          {filtered.map((part) => {
            const count = productCountByPart.get(part.id) ?? 0;
            return (
              <div
                key={part.id}
                onClick={() => setSelected(part)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition ${
                  selected?.id === part.id
                    ? 'border-brand-400 bg-brand-50 shadow-sm'
                    : 'border-border bg-surface hover:border-brand-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-text">{part.name}</p>
                  <p className="text-xs text-text-muted">
                    {countsLoading ? '…' : `${count} products`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={part.isActive ? 'brand' : 'default'}>
                    {part.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(part);
                      setName(part.name);
                      setModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(part);
                    }}
                  >
                    Del
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <Card className="text-center text-sm text-text-muted">
              No shop parts yet. Create one to start tracking separate profit.
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        {!selected ? (
          <Card className="flex h-64 items-center justify-center text-text-muted">
            Select a part to browse its products
          </Card>
        ) : (
          <ProductListPanel
            title={selected.name}
            subtitle={`Products in ${selected.name}`}
            partId={selected.id}
            currency={currency}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit shop part' : 'New shop part'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              Save
            </Button>
          </>
        }
      >
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>

      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
        title="Delete shop part"
        message={
          deleteTarget ? (
            <>
              Delete part <strong className="text-text">{deleteTarget.name}</strong>? Products
              linked to it will remain but lose the part tag.
            </>
          ) : null
        }
        confirmLabel="Delete part"
        loading={remove.isPending}
      />
    </div>
  );
}

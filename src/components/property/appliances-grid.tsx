'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search, Plus, LayoutGrid, List, Camera, Shield,
  Thermometer, Wind, Flame, Box, Droplets, RotateCcw,
  Zap, Trash2, DoorOpen, Bell, ChevronRight, SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import type { Appliance } from '@/types/database';
import { ApplianceWizard } from './appliance-wizard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AppliancesGridProps {
  appliances: Appliance[];
  propertyId: string;
  rooms: Array<{ id: string; name: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ViewMode = 'grid' | 'list';
type GroupBy = 'none' | 'room' | 'status';
type SortBy = 'name' | 'date' | 'status';

const STATUS_LABELS: Record<string, string> = {
  good: 'Good',
  needs_attention: 'Needs Attention',
  replace_soon: 'Replace Soon',
};

const STATUS_DOT: Record<string, string> = {
  good: 'bg-sage',
  needs_attention: 'bg-caution',
  replace_soon: 'bg-alert',
};

const STATUS_BADGE: Record<string, string> = {
  good: 'bg-sage/10 text-sage',
  needs_attention: 'bg-caution/10 text-caution',
  replace_soon: 'bg-alert/10 text-alert',
};

const APPLIANCE_ICONS: Record<string, React.ElementType> = {
  'hvac': Thermometer,
  'furnace': Thermometer,
  'air conditioner': Wind,
  'ac': Wind,
  'water heater': Flame,
  'refrigerator': Box,
  'fridge': Box,
  'dishwasher': Droplets,
  'washer': RotateCcw,
  'dryer': Wind,
  'oven': Flame,
  'range': Flame,
  'microwave': Zap,
  'garbage disposal': Trash2,
  'disposal': Trash2,
  'garage door': DoorOpen,
  'smoke detector': Bell,
};

function getApplianceIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(APPLIANCE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return Box;
}

function getWarrantyStatus(expiration: string | null): 'valid' | 'expiring' | 'expired' | 'unknown' {
  if (!expiration) return 'unknown';
  const now = new Date();
  const exp = new Date(expiration);
  if (exp < now) return 'expired';
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (exp.getTime() - now.getTime() < thirtyDays) return 'expiring';
  return 'valid';
}

function getWarrantyBadge(status: ReturnType<typeof getWarrantyStatus>) {
  switch (status) {
    case 'valid':
      return <Badge variant="secondary" className="bg-sage/10 text-sage text-[10px]">Warranty Active</Badge>;
    case 'expiring':
      return <Badge variant="secondary" className="bg-caution/10 text-caution text-[10px]">Expiring Soon</Badge>;
    case 'expired':
      return <Badge variant="secondary" className="bg-stone/10 text-stone text-[10px]">Warranty Expired</Badge>;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppliancesGrid({ appliances, propertyId, rooms }: AppliancesGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ---- Counts ----
  const statusCounts = useMemo(() => {
    const counts = { good: 0, needs_attention: 0, replace_soon: 0 };
    appliances.forEach((a) => { counts[a.status]++; });
    return counts;
  }, [appliances]);

  // ---- Filter + sort ----
  const processed = useMemo(() => {
    let result = [...appliances];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.brand || '').toLowerCase().includes(q) ||
          (a.model || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Room filter
    if (roomFilter !== 'all') {
      result = result.filter((a) => a.room_id === roomFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      // status: replace_soon first, then needs_attention, then good
      const order = { replace_soon: 0, needs_attention: 1, good: 2 };
      return order[a.status] - order[b.status];
    });

    return result;
  }, [appliances, searchQuery, statusFilter, roomFilter, sortBy]);

  // ---- Group ----
  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ label: null, items: processed }];

    const map = new Map<string, Appliance[]>();
    processed.forEach((a) => {
      let key: string;
      if (groupBy === 'room') {
        const room = rooms.find((r) => r.id === a.room_id);
        key = room?.name || 'No Room';
      } else {
        key = STATUS_LABELS[a.status] || a.status;
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });

    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [processed, groupBy, rooms]);

  const getRoomName = (roomId: string | null) => {
    if (!roomId) return null;
    return rooms.find((r) => r.id === roomId)?.name || null;
  };

  // ---- Render helpers ----

  const renderGridCard = (appliance: Appliance) => {
    const Icon = getApplianceIcon(appliance.name);
    const warrantyStatus = getWarrantyStatus(appliance.warranty_expiration);
    const roomName = getRoomName(appliance.room_id);

    return (
      <Link key={appliance.id} href={`/property/${propertyId}/appliance/${appliance.id}`}>
        <Card className="bg-white border-clay/20 hover:shadow-lg hover:border-ember/20 transition-all duration-300 group cursor-pointer overflow-hidden h-full">
          {/* Photo or placeholder */}
          {appliance.photo_url ? (
            <div className="h-36 overflow-hidden">
              <img
                src={appliance.photo_url}
                alt={appliance.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-36 bg-linen flex items-center justify-center relative">
              <Icon className="h-12 w-12 text-clay/40" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: open photo upload
                }}
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/90 border border-clay/20 flex items-center justify-center text-stone hover:text-ember hover:border-ember/30 transition-colors shadow-sm"
                title="Add photo"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-heading font-semibold text-hearth text-sm group-hover:text-ember transition-colors leading-tight">
                {appliance.name}
              </h3>
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${STATUS_DOT[appliance.status]}`} />
            </div>

            <p className="text-xs text-stone truncate">
              {appliance.brand || 'No brand'}{appliance.model ? ` \u00B7 ${appliance.model}` : ''}
            </p>

            {roomName && (
              <p className="text-xs text-stone/60 mt-0.5 truncate">{roomName}</p>
            )}

            <div className="flex items-center justify-between mt-3">
              {getWarrantyBadge(warrantyStatus)}
              <span className="text-xs text-ember font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                View <ChevronRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const renderListRow = (appliance: Appliance) => {
    const Icon = getApplianceIcon(appliance.name);
    const warrantyStatus = getWarrantyStatus(appliance.warranty_expiration);
    const roomName = getRoomName(appliance.room_id);

    return (
      <Link key={appliance.id} href={`/property/${propertyId}/appliance/${appliance.id}`}>
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-clay/20 hover:shadow-sm hover:border-ember/20 transition-all group">
          {/* Icon */}
          <div className="h-10 w-10 rounded-xl bg-ember/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-ember" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-hearth text-sm group-hover:text-ember transition-colors truncate">
                {appliance.name}
              </h3>
              <div className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[appliance.status]}`} />
            </div>
            <p className="text-xs text-stone truncate">
              {appliance.brand || '---'}{appliance.model ? ` \u00B7 ${appliance.model}` : ''}
              {roomName ? ` \u00B7 ${roomName}` : ''}
            </p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            {getWarrantyBadge(warrantyStatus)}
            <Badge variant="secondary" className={`text-[10px] ${STATUS_BADGE[appliance.status]}`}>
              {STATUS_LABELS[appliance.status]}
            </Badge>
            <ChevronRight className="h-4 w-4 text-stone/40 group-hover:text-ember transition-colors" />
          </div>
        </div>
      </Link>
    );
  };

  // ---- Main render ----

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-hearth">
            Appliances ({appliances.length})
          </h2>
          <div className="flex items-center gap-3 mt-1">
            {statusCounts.good > 0 && (
              <span className="flex items-center gap-1 text-xs text-sage">
                <span className="h-2 w-2 rounded-full bg-sage" /> {statusCounts.good} good
              </span>
            )}
            {statusCounts.needs_attention > 0 && (
              <span className="flex items-center gap-1 text-xs text-caution">
                <span className="h-2 w-2 rounded-full bg-caution" /> {statusCounts.needs_attention} need attention
              </span>
            )}
            {statusCounts.replace_soon > 0 && (
              <span className="flex items-center gap-1 text-xs text-alert">
                <span className="h-2 w-2 rounded-full bg-alert" /> {statusCounts.replace_soon} replace soon
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={() => setWizardOpen(true)}
          className="bg-ember hover:bg-ember-dark text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Appliance
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone" />
          <Input
            placeholder="Search by name, brand, or model..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Filters toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-ember hover:bg-ember-dark text-white' : ''}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </Button>

          {/* View toggle */}
          <div className="flex items-center border border-clay/20 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-ember text-white' : 'bg-white text-stone hover:text-hearth'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-ember text-white' : 'bg-white text-stone hover:text-hearth'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-linen rounded-xl animate-fade-in">
          {/* Status */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-stone uppercase tracking-wider">Status</span>
            <div className="flex gap-1.5">
              {['all', 'good', 'needs_attention', 'replace_soon'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-ember text-white'
                      : 'bg-white text-stone border border-clay/20 hover:border-ember/30'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Room */}
          {rooms.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-stone uppercase tracking-wider">Room</span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setRoomFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    roomFilter === 'all'
                      ? 'bg-ember text-white'
                      : 'bg-white text-stone border border-clay/20 hover:border-ember/30'
                  }`}
                >
                  All
                </button>
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoomFilter(r.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      roomFilter === r.id
                        ? 'bg-ember text-white'
                        : 'bg-white text-stone border border-clay/20 hover:border-ember/30'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-stone uppercase tracking-wider">Sort by</span>
            <div className="flex gap-1.5">
              {([
                { value: 'name' as const, label: 'Name' },
                { value: 'date' as const, label: 'Date Added' },
                { value: 'status' as const, label: 'Status' },
              ]).map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    sortBy === s.value
                      ? 'bg-ember text-white'
                      : 'bg-white text-stone border border-clay/20 hover:border-ember/30'
                  }`}
                >
                  {sortBy === s.value && <ArrowUpDown className="h-3 w-3" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-stone uppercase tracking-wider">Group by</span>
            <div className="flex gap-1.5">
              {([
                { value: 'none' as const, label: 'None' },
                { value: 'room' as const, label: 'Room' },
                { value: 'status' as const, label: 'Status' },
              ]).map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGroupBy(g.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    groupBy === g.value
                      ? 'bg-ember text-white'
                      : 'bg-white text-stone border border-clay/20 hover:border-ember/30'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {processed.length === 0 ? (
        <div className="text-center py-16">
          {appliances.length === 0 ? (
            <>
              <div className="h-16 w-16 rounded-2xl bg-ember/10 flex items-center justify-center mx-auto mb-4">
                <Box className="h-8 w-8 text-ember/40" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-hearth mb-2">No appliances yet</h3>
              <p className="text-sm text-stone mb-6 max-w-xs mx-auto">
                Start documenting your home&apos;s appliances. It only takes a minute per appliance.
              </p>
              <Button
                onClick={() => setWizardOpen(true)}
                className="bg-ember hover:bg-ember-dark text-white"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Your First Appliance
              </Button>
            </>
          ) : (
            <>
              <Search className="h-10 w-10 text-stone/30 mx-auto mb-3" />
              <p className="text-stone">No appliances match your search or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={group.label || gi}>
              {group.label && (
                <h3 className="font-heading text-sm font-semibold text-hearth mb-3 flex items-center gap-2">
                  {group.label}
                  <span className="text-xs font-normal text-stone">({group.items.length})</span>
                </h3>
              )}

              {viewMode === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                  {group.items.map(renderGridCard)}
                </div>
              ) : (
                <div className="space-y-2 stagger-children">
                  {group.items.map(renderListRow)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wizard dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-linen border-clay/20">
          <DialogHeader>
            <DialogTitle className="sr-only">Add Appliance</DialogTitle>
          </DialogHeader>
          <ApplianceWizard
            propertyId={propertyId}
            rooms={rooms}
            onSuccess={() => setWizardOpen(false)}
            onCancel={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

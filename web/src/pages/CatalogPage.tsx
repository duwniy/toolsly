import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Package } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useState } from 'react';
import RentalModal from '../components/RentalModal';

interface EquipmentItem {
  id: string;
  modelId: string;
  modelName: string;
  branchId: string;
  branchName: string;
  categoryName: string;
  status: string;
  dailyRate: number;
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  const { data: items, isLoading } = useQuery<EquipmentItem[]>({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/inventory/items');
      return data;
    }
  });

  const { data: branches } = useQuery<any[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/inventory/branches');
      return data;
    }
  });

  const filteredItems = items?.filter(item => 
    (item.modelName.toLowerCase().includes(search.toLowerCase()) || 
     item.categoryName.toLowerCase().includes(search.toLowerCase())) &&
    (selectedBranch === '' || item.branchName === selectedBranch)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Catalog</h1>
          <p className="text-neutral-400">Browse available tools and equipment for rent</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search tools, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="pl-11 pr-10 py-3 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all font-medium text-sm appearance-none min-w-[180px]"
            >
              <option value="">All Branches</option>
              {branches?.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-neutral-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-neutral-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'AVAILABLE' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold tracking-tight mb-1">{item.modelName}</h3>
                <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-4">{item.categoryName}</p>
                
                <div className="flex items-center gap-2 text-neutral-500 text-sm mb-6">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.branchName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-neutral-100 mt-auto">
                <div>
                  <p className="text-xs text-neutral-400 mb-0.5">Daily Rate</p>
                  <p className="text-lg font-semibold tracking-tight">RUB {item.dailyRate?.toLocaleString()}</p>
                </div>
                <button 
                  disabled={item.status !== 'AVAILABLE'}
                  onClick={() => setSelectedItem(item)}
                  className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-black disabled:cursor-not-allowed"
                >
                  Rent Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <RentalModal 
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          item={selectedItem}
        />
      )}

      {!isLoading && filteredItems?.length === 0 && (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <div className="mx-auto w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-neutral-300" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">No items found</h2>
          <p className="text-neutral-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

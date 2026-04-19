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
  condition: string;
  dailyRate: number;
}

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  const { data: items, isLoading, isError } = useQuery<EquipmentItem[]>({
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
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">Catalog</h1>
          <p className="text-neutral-400 text-sm sm:text-base">Browse available tools and equipment for rent</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search tools, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-auto pl-11 pr-10 py-2.5 sm:py-3 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all font-medium text-sm appearance-none sm:min-w-[180px]"
            >
              <option value="">All Branches</option>
              {branches?.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="text-center py-12 sm:py-20 bg-red-50 rounded-2xl border border-dashed border-red-200">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-red-300" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-red-900">Loading Error</h2>
          <p className="text-red-500 text-xs sm:text-sm px-4">Could not load equipment list. Please refresh the page.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 sm:h-64 bg-neutral-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems?.map(item => (
            <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-2.5 sm:p-3 bg-neutral-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 sm:gap-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                      item.status === 'AVAILABLE' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {item.status}
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[10px] sm:text-xs font-medium border border-neutral-200">
                      {item.condition || 'USED'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-1">{item.modelName}</h3>
                <p className="text-neutral-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-3 sm:mb-4">{item.categoryName}</p>
                
                <div className="flex items-center gap-2 text-neutral-500 text-xs sm:text-sm mb-4 sm:mb-6">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {item.branchName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-neutral-100 mt-auto gap-3">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mb-0.5">Daily Rate</p>
                  <p className="text-base sm:text-lg font-semibold tracking-tight">RUB {item.dailyRate?.toLocaleString()}</p>
                </div>
                <button 
                  disabled={item.status !== 'AVAILABLE'}
                  onClick={() => setSelectedItem(item)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 bg-black text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-black disabled:cursor-not-allowed flex-shrink-0"
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
        <div className="text-center py-12 sm:py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-300" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">No items found</h2>
          <p className="text-neutral-400 text-xs sm:text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

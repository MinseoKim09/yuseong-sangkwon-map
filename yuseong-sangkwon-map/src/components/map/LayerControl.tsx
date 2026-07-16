'use client'

export type MapLayer = 'none' | 'category' | 'vacancy' | 'population'

interface LayerControlProps {
  activeLayer: MapLayer
  onLayerChange: (layer: MapLayer) => void
}

const LAYERS: { key: MapLayer; label: string; icon: string }[] = [
  { key: 'none', label: '기본', icon: '🗺️' },
  { key: 'category', label: '업종', icon: '🏪' },
  { key: 'vacancy', label: '공실', icon: '🏚️' },
  { key: 'population', label: '유동인구', icon: '👥' },
]

export function LayerControl({ activeLayer, onLayerChange }: LayerControlProps) {
  return (
    <div className="absolute right-4 top-20 z-[1001] flex flex-col gap-1 rounded-xl bg-white p-1 shadow-md">
      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          type="button"
          onClick={() => onLayerChange(layer.key)}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
            activeLayer === layer.key
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {layer.icon} {layer.label}
        </button>
      ))}
    </div>
  )
}

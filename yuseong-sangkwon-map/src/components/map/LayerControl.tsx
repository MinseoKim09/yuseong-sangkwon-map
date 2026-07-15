'use client'

export type MapLayer = 'none' | 'category' | 'vacancy' | 'population'

interface LayerControlProps {
  activeLayer: MapLayer
  onLayerChange: (layer: MapLayer) => void
}

const LAYERS: { key: MapLayer; label: string }[] = [
  { key: 'none', label: '기본' },
  { key: 'category', label: '업종' },
  { key: 'vacancy', label: '공실' },
  { key: 'population', label: '유동인구' },
]

export function LayerControl({ activeLayer, onLayerChange }: LayerControlProps) {
  return (
    <div className="absolute right-4 top-20 z-[1001] flex flex-col gap-1 rounded-md bg-white p-1 shadow-md">
      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          type="button"
          onClick={() => onLayerChange(layer.key)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            activeLayer === layer.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {layer.label}
        </button>
      ))}
    </div>
  )
}

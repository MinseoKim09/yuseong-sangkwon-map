'use client'

import { useState, type ReactNode } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Tables } from '@/types/database'
import type { MapLayer } from './LayerControl'

interface LeafletMapProps {
  stores: Tables<'stores'>[]
  categories: Tables<'categories'>[]
  activeLayer: MapLayer
  onSelectStore: (store: Tables<'stores'>) => void
  onMapClick?: (latlng: { lat: number; lng: number }) => void
  analysisCenter?: { lat: number; lng: number } | null
  analysisRadius?: number
  children?: ReactNode
}

type MapType = 'normal' | 'satellite' | 'terrain'

const YUSEONG_CENTER: [number, number] = [36.3624, 127.3564]

const TILE_LAYERS: Record<MapType, { label: string; url: string; attribution: string }> = {
  normal: {
    label: '일반지도',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  satellite: {
    label: '위성지도',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  terrain: {
    label: '지형지도',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, &copy; OpenTopoMap',
  },
}

function MapTypeControl({
  mapType,
  onChange,
}: {
  mapType: MapType
  onChange: (type: MapType) => void
}) {
  return (
    <div className="absolute bottom-20 right-4 z-[1001] flex overflow-hidden rounded-md bg-white shadow-md">
      {(Object.keys(TILE_LAYERS) as MapType[]).map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            mapType === type
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-700 hover:bg-gray-50'
          }`}
        >
          {TILE_LAYERS[type].label}
        </button>
      ))}
    </div>
  )
}

function createDivIcon(color: string, size: number, opacity = 1): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);opacity:${opacity};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (latlng: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click: (e) => {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LeafletMap({
  stores,
  categories,
  activeLayer,
  onSelectStore,
  onMapClick,
  analysisCenter,
  analysisRadius,
  children,
}: LeafletMapProps) {
  const [mapType, setMapType] = useState<MapType>('normal')

  return (
    <div className="relative h-full w-full">
      <MapContainer center={YUSEONG_CENTER} zoom={14} className="h-full w-full">
        <TileLayer
          key={mapType}
          url={TILE_LAYERS[mapType].url}
          attribution={TILE_LAYERS[mapType].attribution}
        />

        <MapClickHandler onMapClick={onMapClick} />

        {stores.map((store) => {
          if (activeLayer === 'category') {
            const category = categories.find((c) => c.code === store.category)
            return (
              <Marker
                key={store.id}
                position={[store.lat, store.lng]}
                icon={createDivIcon(category?.color ?? '#9CA3AF', 12)}
                eventHandlers={{ click: () => onSelectStore(store) }}
              />
            )
          }

          if (activeLayer === 'vacancy' && store.is_vacant) {
            return (
              <Marker
                key={store.id}
                position={[store.lat, store.lng]}
                icon={createDivIcon('#EF4444', 14)}
                eventHandlers={{ click: () => onSelectStore(store) }}
              />
            )
          }

          return (
            <Marker
              key={store.id}
              position={[store.lat, store.lng]}
              icon={createDivIcon('#3B82F6', 12, activeLayer === 'vacancy' ? 0.3 : 1)}
              eventHandlers={{ click: () => onSelectStore(store) }}
            />
          )
        })}

        {analysisCenter && analysisRadius && (
          <Circle
            center={[analysisCenter.lat, analysisCenter.lng]}
            radius={analysisRadius}
            pathOptions={{
              color: '#3B82F6',
              weight: 2,
              opacity: 0.8,
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
            }}
          />
        )}

        {children}
      </MapContainer>

      <MapTypeControl mapType={mapType} onChange={setMapType} />
    </div>
  )
}

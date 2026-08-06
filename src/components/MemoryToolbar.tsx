import { Button, Dropdown, ListBox, SearchField, Select, Tabs } from '@heroui/react'
import { Bird, FileText, ListFilter, MessageCircle, MessageSquareText, Plus, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Translation } from '../content/translations.ts'
import { memoryLayers, memorySources } from '../memoryState.ts'
import type { MaterialKind, MemoryLayer, MemorySource } from '../memoryState.ts'

type MemoryToolbarProps = {
  copy: Translation['workspace']['memory']
  keyword: string
  layer: MemoryLayer
  onKeywordChange: (keyword: string) => void
  onLayerChange: (layer: MemoryLayer) => void
  onOpenMaterial: (kind: MaterialKind) => void
  onSourceChange: (source: MemorySource) => void
  source: MemorySource
}

const sourceIcons: Record<MemorySource, LucideIcon> = {
  all: ListFilter,
  dingtalk: MessageCircle,
  feishu: Bird,
  teams: UsersRound,
  file: FileText,
  conversation: MessageSquareText,
}

export default function MemoryToolbar({ copy, keyword, layer, onKeywordChange, onLayerChange, onOpenMaterial, onSourceChange, source }: MemoryToolbarProps) {
  return <div className="memory-toolbar">
    <div className="memory-layer-control">
      <Tabs aria-label={copy.layersLabel} className="memory-tabs" selectedKey={layer} onSelectionChange={(key) => onLayerChange(key as MemoryLayer)}>
        <Tabs.List className="memory-tab-list">{memoryLayers.map((item) => <Tabs.Tab className="memory-tab" id={item} key={item}>{copy.layers[item].label}</Tabs.Tab>)}</Tabs.List>
      </Tabs>
    </div>
    <div className="memory-controls">
      <SearchField aria-label={copy.searchLabel} className="memory-search" value={keyword} onChange={onKeywordChange}>
        <SearchField.Group className="memory-search-field"><SearchField.SearchIcon /><SearchField.Input className="memory-search-input" placeholder={copy.searchPlaceholder} /></SearchField.Group>
      </SearchField>
      <Select aria-label={copy.sourceLabel} selectedKey={source} onSelectionChange={(key) => onSourceChange(key as MemorySource)}>
        <Select.Trigger className="memory-select"><Select.Value /></Select.Trigger>
        <Select.Popover className="memory-select-popover"><ListBox>{memorySources.map((item) => {
          const SourceIcon = sourceIcons[item]
          return <ListBox.Item id={item} key={item} textValue={copy.sources[item]}><SourceIcon aria-hidden="true" className="memory-source-icon" />{copy.sources[item]}</ListBox.Item>
        })}</ListBox></Select.Popover>
      </Select>
      <Dropdown>
        <Button className="memory-add-button" type="button"><Plus aria-hidden="true" className="memory-add-icon" />{copy.add}</Button>
        <Dropdown.Popover className="memory-add-menu" placement="bottom right"><Dropdown.Menu aria-label={copy.add} onAction={(key) => onOpenMaterial(key as MaterialKind)}><Dropdown.Item id="file" textValue={copy.upload}>{copy.upload}</Dropdown.Item><Dropdown.Item id="migration" textValue={copy.migration}>{copy.migration}</Dropdown.Item></Dropdown.Menu></Dropdown.Popover>
      </Dropdown>
    </div>
  </div>
}

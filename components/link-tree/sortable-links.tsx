"use client"

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LinkItem } from '@/components/link-item'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LinkItemProps } from '@/hooks/use-links'

interface SortableLinksProps {
  links: LinkItemProps[]
  onReorder: (links: LinkItemProps[]) => void
  onDelete: (id: string) => void
  onUpdate: (link: LinkItemProps) => void
  isEditMode?: boolean
}

interface SortableLinkItemProps {
  link: LinkItemProps
  onDelete: (id: string) => void
  onUpdate: (link: LinkItemProps) => void
  isEditMode?: boolean
}

function SortableLinkItem({ link, onDelete, onUpdate, isEditMode = false }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!isEditMode) {
    // In view mode, render the link item without any drag-and-drop interference
    return <LinkItem {...link} isEditMode={false} />
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
    >
      <div className="flex items-center gap-2">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded cursor-grab active:cursor-grabbing",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "flex-shrink-0"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        {/* Link Item */}
        <div className="flex-1">
          <LinkItem 
            {...link} 
            isEditMode={isEditMode} 
            onDelete={onDelete} 
            onUpdate={onUpdate} 
          />
        </div>
      </div>
    </div>
  )
}

export function SortableLinks({ links, onReorder, onDelete, onUpdate, isEditMode = false }: SortableLinksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id)
      const newIndex = links.findIndex((link) => link.id === over?.id)

      const reorderedLinks = arrayMove(links, oldIndex, newIndex)
      onReorder(reorderedLinks)
    }
  }

  if (links.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No links added yet. Add your first link above.
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onDelete={onDelete}
              onUpdate={onUpdate}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

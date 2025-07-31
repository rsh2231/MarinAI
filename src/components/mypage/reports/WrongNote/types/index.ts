import { WrongNote } from "@/types/wrongNote";

export interface WrongNoteFilters {
  subject: string;
  license: string;
  grade: string;
}

export interface FilterOptions {
  subjects: string[];
  licenses: string[];
  grades: string[];
}

export interface WrongNoteViewProps {
  setWrongNotes?: (notes: WrongNote[]) => void;
}

export interface WrongNoteItemProps {
  note: WrongNote;
  isOpen: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
  index: number;
}

export interface RetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrongNotes: WrongNote[];
} 
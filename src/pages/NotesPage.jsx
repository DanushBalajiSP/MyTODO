import { useState, useEffect, useRef, useCallback } from 'react';
import { Pin, PinOff, Trash2, X, Palette, Tag, Plus, Save, Check } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useTasks } from '../hooks/useTasks';
import Loader from '../components/common/Loader';

/* ------------------------------------------------------------------
   Color definitions — both light and dark backgrounds
------------------------------------------------------------------- */
const NOTE_COLORS = [
  {
    id: 'default',
    label: 'Default',
    light: { bg: 'var(--bg-secondary)',  border: 'var(--border-color)' },
    dark:  { bg: 'var(--bg-secondary)',  border: 'var(--border-color)' },
  },
  {
    id: 'yellow',
    label: 'Yellow',
    light: { bg: '#fef9c3', border: '#fde047' },
    dark:  { bg: '#3d3000', border: '#ca8a04' },
  },
  {
    id: 'blue',
    label: 'Blue',
    light: { bg: '#dbeafe', border: '#93c5fd' },
    dark:  { bg: '#0c2040', border: '#3b82f6' },
  },
  {
    id: 'green',
    label: 'Green',
    light: { bg: '#dcfce7', border: '#86efac' },
    dark:  { bg: '#052e16', border: '#22c55e' },
  },
  {
    id: 'pink',
    label: 'Pink',
    light: { bg: '#fce7f3', border: '#f9a8d4' },
    dark:  { bg: '#3d0022', border: '#ec4899' },
  },
  {
    id: 'purple',
    label: 'Purple',
    light: { bg: '#ede9fe', border: '#c4b5fd' },
    dark:  { bg: '#1e1030', border: '#a855f7' },
  },
  {
    id: 'orange',
    label: 'Orange',
    light: { bg: '#ffedd5', border: '#fdba74' },
    dark:  { bg: '#3d1500', border: '#f97316' },
  },
];

/** Returns the correct color vars for the current theme */
const getColorVars = (colorId) => {
  const entry = NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  const isDark = document.documentElement.classList.contains('dark');
  const { bg, border } = isDark ? entry.dark : entry.light;
  return { '--note-bg': bg, '--note-border': border };
};

/* ------------------------------------------------------------------
   NoteCard — the interactive card displayed in the grid
------------------------------------------------------------------- */
const NoteCard = ({ note, onOpen }) => {
  const { editNote, removeNote } = useNotes();
  const [colorVars, setColorVars] = useState(() => getColorVars(note.color || 'default'));

  // Re-compute if color or theme changes
  useEffect(() => {
    setColorVars(getColorVars(note.color || 'default'));
    const observer = new MutationObserver(() =>
      setColorVars(getColorVars(note.color || 'default'))
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [note.color]);

  const handlePin = async (e) => {
    e.stopPropagation();
    await editNote(note.id, { pinned: !note.pinned });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await removeNote(note.id);
  };

  const preview = note.content
    ? note.content.replace(/<[^>]+>/g, ' ').trim().slice(0, 200)
    : '';

  return (
    <div
      className="note-card"
      style={colorVars}
      onClick={() => onOpen(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(note)}
    >
      {note.pinned && <div className="note-card__pin-badge"><Pin size={11} /></div>}
      {note.title && note.title !== 'Untitled' && (
        <h3 className="note-card__title">{note.title}</h3>
      )}
      {preview && <p className="note-card__preview">{preview}</p>}
      {note.tags?.length > 0 && (
        <div className="note-card__tags">
          {note.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
        </div>
      )}
      <div className="note-card__actions">
        <button
          className="note-card__action-btn"
          onClick={handlePin}
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
        <button
          className="note-card__action-btn note-card__action-btn--delete"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <span className="note-card__date">
        {note.updatedAt?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------
   NoteEditor — the full-screen modal editor
------------------------------------------------------------------- */
const NoteEditor = ({ note, onClose, onSave }) => {
  const [title, setTitle]             = useState(note?.title === 'Untitled' ? '' : (note?.title || ''));
  const [content, setContent]         = useState(note?.content || '');
  const [color, setColor]             = useState(note?.color || 'default');
  const [tags, setTags]               = useState(note?.tags || []);
  const [tagInput, setTagInput]       = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [saveStatus, setSaveStatus]   = useState('idle'); // 'idle' | 'saving' | 'saved'
  const editorRef   = useRef(null);
  const saveTimerRef = useRef(null);
  const isDirty     = useRef(false);

  /* ---- helpers ---- */
  const buildPayload = useCallback((overrides = {}) => ({
    title:   (overrides.title   ?? title)   || 'Untitled',
    content: (overrides.content ?? content),
    color:   overrides.color   ?? color,
    tags:    overrides.tags    ?? tags,
  }), [title, content, color, tags]);

  const executeSave = useCallback(async (overrides = {}) => {
    setSaveStatus('saving');
    try {
      await onSave(buildPayload(overrides));
      isDirty.current = false;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } catch {
      setSaveStatus('idle');
    }
  }, [onSave, buildPayload]);

  /* ---- Auto-save (debounced 700ms) ---- */
  const scheduleAutoSave = useCallback(() => {
    if (!isDirty.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => executeSave(), 700);
  }, [executeSave]);

  /* ---- Cleanup / final save on unmount ---- */
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
      if (isDirty.current) {
        // Fire-and-forget on unmount
        onSave(buildPayload());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Event handlers ---- */
  const markDirty = () => { isDirty.current = true; };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    markDirty();
    scheduleAutoSave();
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    markDirty();
    scheduleAutoSave();
  };

  /** FIX: paste also triggers auto-save (after DOM updates via setTimeout) */
  const handleContentPaste = () => {
    markDirty();
    // setTimeout ensures the pasted value is reflected in state first
    setTimeout(() => scheduleAutoSave(), 50);
  };

  const handleTitlePaste = () => {
    markDirty();
    setTimeout(() => scheduleAutoSave(), 50);
  };

  const handleColorChange = (colorId) => {
    setColor(colorId);
    markDirty();
    executeSave({ color: colorId });
    setShowPalette(false);
  };

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (clean && !tags.includes(clean) && tags.length < 5) {
      const newTags = [...tags, clean];
      setTags(newTags);
      setTagInput('');
      executeSave({ tags: newTags });
    }
  };

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    executeSave({ tags: newTags });
  };

  const handleManualSave = () => {
    clearTimeout(saveTimerRef.current);
    executeSave();
  };

  /* ---- Derive color CSS vars ---- */
  const [colorVars, setColorVars] = useState(() => getColorVars(color));
  useEffect(() => {
    setColorVars(getColorVars(color));
    const observer = new MutationObserver(() => setColorVars(getColorVars(color)));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [color]);

  /* ---- Save status label ---- */
  const saveLabel =
    saveStatus === 'saving' ? 'Saving…' :
    saveStatus === 'saved'  ? 'Saved ✓'  :
    isDirty.current         ? 'Unsaved'  : 'Auto-saved';

  return (
    <div className="note-editor-overlay" onClick={onClose}>
      <div
        className="note-editor"
        style={colorVars}
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="note-editor__toolbar">
          <div className="note-editor__toolbar-actions">
            {/* Color palette */}
            <div style={{ position: 'relative' }}>
              <button
                className="note-editor__tool-btn"
                onClick={() => setShowPalette(p => !p)}
                title="Change color"
              >
                <Palette size={18} />
              </button>
              {showPalette && (
                <div className="note-color-palette">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.id}
                      className={`note-color-swatch ${color === c.id ? 'note-color-swatch--active' : ''}`}
                      style={{
                        background: document.documentElement.classList.contains('dark')
                          ? c.dark.bg : c.light.bg,
                        border: `2px solid ${
                          document.documentElement.classList.contains('dark')
                            ? c.dark.border : c.light.border
                        }`,
                      }}
                      onClick={() => handleColorChange(c.id)}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* Tag toggle */}
            <button
              className="note-editor__tool-btn"
              onClick={() => setShowTagInput(p => !p)}
              title="Add tags"
            >
              <Tag size={18} />
            </button>
          </div>

          {/* Manual Save button */}
          <button
            className={`note-editor__save-btn ${saveStatus === 'saved' ? 'note-editor__save-btn--saved' : ''}`}
            onClick={handleManualSave}
            title="Save now"
          >
            {saveStatus === 'saved' ? <Check size={15} /> : <Save size={15} />}
            <span>{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
          </button>

          <button className="note-editor__close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <input
          className="note-editor__title"
          placeholder="Title"
          value={title}
          onChange={handleTitleChange}
          onPaste={handleTitlePaste}
          maxLength={200}
        />

        {/* Tags row */}
        {(showTagInput || tags.length > 0) && (
          <div className="note-editor__tags">
            {tags.map(t => (
              <span key={t} className="tag-chip">
                #{t}
                <button onClick={() => removeTag(t)} type="button"><X size={12} /></button>
              </span>
            ))}
            {tags.length < 5 && (
              <div className="note-editor__tag-input-row">
                <input
                  className="note-editor__tag-input"
                  placeholder="Add tag…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                  }}
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="note-editor__tool-btn"
                  disabled={!tagInput.trim()}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content textarea */}
        <textarea
          ref={editorRef}
          className="note-editor__content"
          placeholder="Take a note…"
          value={content}
          onChange={handleContentChange}
          onPaste={handleContentPaste}
          autoFocus={!note}
        />

        <div className="note-editor__footer">
          <span className="note-editor__word-count">
            {content.trim() ? `${content.trim().split(/\s+/).length} words` : 'Empty note'}
          </span>
          <span className={`note-editor__save-hint ${saveStatus === 'saved' ? 'note-editor__save-hint--saved' : ''}`}>
            {saveLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------
   NotesPage — main page component
------------------------------------------------------------------- */
const NotesPage = () => {
  const { notes, pinnedNotes, unpinnedNotes, loading, addNote, editNote } = useNotes();
  const { activeTag, setActiveTag } = useTasks();
  const [editingNote, setEditingNote] = useState(null); // null = closed, {} = new, note = editing
  const [search, setSearch] = useState('');

  const filtered = (list) => {
    let result = list;
    if (activeTag) {
      result = result.filter(n => n.tags && n.tags.includes(activeTag));
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(n =>
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.tags?.some(t => t.includes(q))
    );
  };

  const handleOpen  = (note) => setEditingNote(note);
  const handleNew   = () => setEditingNote({});
  const handleClose = () => setEditingNote(null);

  const handleSave = async (data) => {
    if (!editingNote) return;
    if (editingNote.id) {
      await editNote(editingNote.id, data);
    } else {
      const id = await addNote(data);
      setEditingNote(prev => ({ ...prev, ...data, id }));
    }
  };

  if (loading) return <Loader text="Loading notes…" />;

  const pinnedFiltered   = filtered(pinnedNotes);
  const unpinnedFiltered = filtered(unpinnedNotes);

  return (
    <div className="notes-page">
      {/* Header bar */}
      <div className="notes-page__header">
        <div>
          <h1 className="page-header__title">Notes</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginTop: 2 }}>
            Your personal workspace — capture ideas, plans &amp; thoughts
          </p>
        </div>
        <button className="notes-new-btn" onClick={handleNew}>
          <Plus size={18} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="notes-search-bar">
        <input
          className="notes-search-input"
          placeholder="Search notes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="notes-search-clear" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="notes-empty">
          <div className="notes-empty__icon">📝</div>
          <h3>No notes yet</h3>
          <p>Click "New Note" to capture your first idea.</p>
          <button className="notes-new-btn" onClick={handleNew}>
            <Plus size={18} /> New Note
          </button>
        </div>
      )}

      {/* Pinned */}
      {pinnedFiltered.length > 0 && (
        <section className="notes-section">
          <h2 className="notes-section__label"><Pin size={13} /> Pinned</h2>
          <div className="notes-grid">
            {pinnedFiltered.map(n => <NoteCard key={n.id} note={n} onOpen={handleOpen} />)}
          </div>
        </section>
      )}

      {/* Other */}
      {unpinnedFiltered.length > 0 && (
        <section className="notes-section">
          {pinnedFiltered.length > 0 && <h2 className="notes-section__label">Other</h2>}
          <div className="notes-grid">
            {unpinnedFiltered.map(n => <NoteCard key={n.id} note={n} onOpen={handleOpen} />)}
          </div>
        </section>
      )}

      {/* No search results */}
      {search && pinnedFiltered.length === 0 && unpinnedFiltered.length === 0 && (
        <div className="notes-empty">
          <div className="notes-empty__icon">🔍</div>
          <h3>No results for "{search}"</h3>
          <p>Try different keywords.</p>
        </div>
      )}

      {/* Editor */}
      {editingNote !== null && (
        <NoteEditor
          note={editingNote.id ? editingNote : null}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default NotesPage;

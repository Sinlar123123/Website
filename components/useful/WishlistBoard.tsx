"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ColumnId = "nastyushka" | "danyushka" | "family" | "dreams";

type WishlistRow = {
  id: string;
  body: string;
  column_id: ColumnId;
  author_label: string;
  link_url: string | null;
  image_storage_path: string | null;
  approximate_price: string | null;
  created_at: string;
};

const COLUMNS: { id: ColumnId; title: string; hint: string }[] = [
  { id: "nastyushka", title: "Настюшка", hint: "Хотелки и приколы Настюшки" },
  { id: "danyushka", title: "Данюшка", hint: "Хотелки и приколы Данюшки" },
  { id: "family", title: "Семья", hint: "Общие на двоих" },
  { id: "dreams", title: "Мечты", hint: "Большие и маленькие мечты" },
];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PRICE_LEN = 120;

const columnCollision: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);
  if (byPointer.length > 0) return byPointer;
  return closestCorners(args);
};

function normalizeLinkUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

type AuthorChoice = "Я" | "Она" | "Мы" | "custom";

function labelToAuthorChoice(label: string): AuthorChoice {
  if (label === "Я" || label === "Она" || label === "Мы") return label;
  if (!label) return "Я";
  return "custom";
}

function WishlistCardInner({
  card,
  getImagePublicUrl,
  isOverlay,
}: {
  card: WishlistRow;
  getImagePublicUrl: (path: string) => string;
  isOverlay?: boolean;
}) {
  const linkStop = { onPointerDown: (e: ReactPointerEvent) => e.stopPropagation() };
  const price = card.approximate_price?.trim();

  return (
    <>
      {card.link_url ? (
        isOverlay ? (
          <span className="block whitespace-pre-wrap font-medium text-indigo-300">{card.body}</span>
        ) : (
          <a
            href={card.link_url}
            target="_blank"
            rel="noopener noreferrer"
            {...linkStop}
            className="block whitespace-pre-wrap font-medium text-indigo-300 underline decoration-indigo-500/40 underline-offset-2 hover:text-indigo-200"
          >
            {card.body}
          </a>
        )
      ) : (
        <p className="whitespace-pre-wrap">{card.body}</p>
      )}
      {price ? (
        <p className="mt-2 text-xs font-medium text-amber-200/95">
          <span className="text-slate-500">Ориентир: </span>
          {price}
        </p>
      ) : null}
      {card.image_storage_path ? (
        <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-[#141422]">
          <Image
            src={getImagePublicUrl(card.image_storage_path)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 50vw, 25vw"
          />
        </div>
      ) : null}
      {card.author_label ? (
        <p className="mt-2 text-xs text-indigo-300/90">— {card.author_label}</p>
      ) : null}
    </>
  );
}

function DroppableColumn({
  col,
  isEmpty,
  children,
}: {
  col: (typeof COLUMNS)[number];
  isEmpty: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div className="flex min-h-[min(420px,55vh)] flex-col rounded-2xl border border-white/10 bg-[#141422] p-4">
      <h3 className="font-semibold text-white">{col.title}</h3>
      <p className="text-xs text-slate-500">{col.hint}</p>
      <div
        ref={setNodeRef}
        className={`mt-4 flex flex-1 flex-col gap-3 rounded-xl p-1 transition-[background-color,box-shadow] duration-300 ease-out ${
          isOver
            ? "bg-indigo-500/[0.12] shadow-[inset_0_0_0_2px_rgba(129,140,248,0.45)]"
            : "bg-transparent"
        }`}
      >
        {children}
        {isEmpty ? (
          <p
            className={`pointer-events-none select-none py-8 text-center text-xs transition-colors duration-300 ${
              isOver ? "text-indigo-300/90" : "text-slate-600"
            }`}
          >
            Перетащите сюда
          </p>
        ) : null}
      </div>
    </div>
  );
}

function DraggableWishlistCard({
  card,
  getImagePublicUrl,
  onRemove,
  isEditing,
  editSaving,
  editBody,
  setEditBody,
  editLink,
  setEditLink,
  editPrice,
  setEditPrice,
  editAuthorChoice,
  setEditAuthorChoice,
  editAuthorCustom,
  setEditAuthorCustom,
  editImageInputRef,
  editImageFile,
  setEditImageFile,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  card: WishlistRow;
  getImagePublicUrl: (path: string) => string;
  onRemove: (card: WishlistRow) => void;
  isEditing: boolean;
  editSaving: boolean;
  editBody: string;
  setEditBody: (v: string) => void;
  editLink: string;
  setEditLink: (v: string) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editAuthorChoice: AuthorChoice;
  setEditAuthorChoice: (v: AuthorChoice) => void;
  editAuthorCustom: string;
  setEditAuthorCustom: (v: string) => void;
  editImageInputRef: React.RefObject<HTMLInputElement | null>;
  editImageFile: File | null;
  setEditImageFile: (f: File | null) => void;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: isEditing,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    transition: isDragging ? undefined : "opacity 0.2s ease",
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-[#0f0f1a] text-sm text-slate-200 shadow-sm shadow-black/20 transition-[border-color,box-shadow] duration-200 ease-out hover:border-indigo-500/30 hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.35)]">
        <button
          type="button"
          {...listeners}
          {...attributes}
          disabled={isEditing}
          aria-label="Перетащить карточку"
          className={`flex w-9 shrink-0 flex-col items-center justify-center border-r border-white/10 bg-[#141422]/80 text-slate-500 transition-colors hover:bg-[#1a1a2e] hover:text-slate-300 ${
            isEditing ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <span className="text-base leading-none text-slate-400" aria-hidden>
            {"\u2630"}
          </span>
        </button>
        <div className="min-w-0 flex-1 p-3">
          {isEditing ? (
            <div className="space-y-2" onPointerDown={(e) => e.stopPropagation()}>
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">Название</span>
                <input
                  className="w-full rounded border border-white/15 bg-[#0f0f1a] px-2 py-1.5 text-sm text-slate-200"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  maxLength={500}
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">Ссылка</span>
                <input
                  className="w-full rounded border border-white/15 bg-[#0f0f1a] px-2 py-1.5 text-sm text-slate-200"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  maxLength={2000}
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">Приблизительная цена</span>
                <input
                  className="w-full rounded border border-white/15 bg-[#0f0f1a] px-2 py-1.5 text-sm text-slate-200"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value.slice(0, MAX_PRICE_LEN))}
                  maxLength={MAX_PRICE_LEN}
                  placeholder="Например: до 10к, ~5000 руб."
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">Кто</span>
                <select
                  className="w-full rounded border border-white/15 bg-[#0f0f1a] px-2 py-1.5 text-sm text-slate-200"
                  value={editAuthorChoice}
                  onChange={(e) => setEditAuthorChoice(e.target.value as AuthorChoice)}
                >
                  <option value="Я">Я</option>
                  <option value="Она">Она</option>
                  <option value="Мы">Мы</option>
                  <option value="custom">Свой ярлык…</option>
                </select>
              </label>
              {editAuthorChoice === "custom" ? (
                <input
                  className="w-full rounded border border-white/15 bg-[#0f0f1a] px-2 py-1.5 text-sm text-slate-200"
                  value={editAuthorCustom}
                  onChange={(e) => setEditAuthorCustom(e.target.value.slice(0, 32))}
                  maxLength={32}
                  placeholder="Ярлык"
                />
              ) : null}
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">Новое фото (необязательно)</span>
                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="w-full text-xs text-slate-400 file:mr-2 file:rounded file:border-0 file:bg-indigo-600 file:px-2 file:py-1 file:text-[10px] file:text-white"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ) : (
            <WishlistCardInner card={card} getImagePublicUrl={getImagePublicUrl} />
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-end gap-1.5">
        {isEditing ? (
          <>
            <button
              type="button"
              disabled={editSaving}
              onClick={() => onSaveEdit()}
              className="rounded border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {editSaving ? "Сохраняю…" : "Сохранить"}
            </button>
            <button
              type="button"
              disabled={editSaving}
              onClick={onCancelEdit}
              className="rounded border border-white/15 px-2 py-1 text-[11px] text-slate-400 hover:bg-white/5"
            >
              Отмена
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBeginEdit}
              className="rounded border border-indigo-500/30 px-2 py-1 text-[11px] text-indigo-200 hover:bg-indigo-500/10"
            >
              Изменить
            </button>
            <button
              type="button"
              onClick={() => onRemove(card)}
              className="rounded border border-rose-500/20 px-2 py-1 text-[11px] text-rose-300/90 hover:bg-rose-500/10"
            >
              Удалить
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function WishlistBoard() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAuthorChoice, setEditAuthorChoice] = useState<AuthorChoice>("Я");
  const [editAuthorCustom, setEditAuthorCustom] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const [draftBody, setDraftBody] = useState("");
  const [draftLink, setDraftLink] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftImage, setDraftImage] = useState<File | null>(null);
  const [draftColumn, setDraftColumn] = useState<ColumnId>("dreams");
  const [authorChoice, setAuthorChoice] = useState<AuthorChoice>("Я");
  const [authorCustom, setAuthorCustom] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 12 },
    }),
  );

  const getImagePublicUrl = useCallback(
    (path: string) => supabase.storage.from("wishlist").getPublicUrl(path).data.publicUrl,
    [supabase],
  );

  const loadItems = useCallback(async () => {
    setError("");
    const { data, error: qErr } = await supabase
      .from("wishlist_items")
      .select(
        "id, body, column_id, author_label, link_url, image_storage_path, approximate_price, created_at",
      )
      .order("created_at", { ascending: false });
    if (qErr) {
      setError(qErr.message);
      setItems([]);
      return;
    }
    setItems((data ?? []) as WishlistRow[]);
  }, [supabase]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setUserEmail(null);
      setAllowed(false);
      setItems([]);
      setLoading(false);
      return;
    }
    setUserEmail(user.email);
    const { data: row, error: allowErr } = await supabase.from("wishlist_allowlist").select("email").maybeSingle();
    if (allowErr) {
      setError(allowErr.message);
      setAllowed(false);
      setItems([]);
      setLoading(false);
      return;
    }
    const isAllowed = !!row?.email;
    setAllowed(isAllowed);
    if (isAllowed) await loadItems();
    else setItems([]);
    setLoading(false);
  }, [supabase, loadItems]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void bootstrap();
    });
    return () => subscription.unsubscribe();
  }, [supabase, bootstrap]);

  function cancelEdit() {
    setEditingId(null);
    setEditImageFile(null);
    if (editImageInputRef.current) editImageInputRef.current.value = "";
  }

  function beginEdit(card: WishlistRow) {
    setEditingId(card.id);
    setEditBody(card.body);
    setEditLink(card.link_url ?? "");
    setEditPrice(card.approximate_price ?? "");
    const ac = labelToAuthorChoice(card.author_label);
    setEditAuthorChoice(ac);
    setEditAuthorCustom(ac === "custom" ? card.author_label : "");
    setEditImageFile(null);
    if (editImageInputRef.current) editImageInputRef.current.value = "";
  }

  async function saveEdit() {
    if (!editingId || !allowed) return;
    const body = editBody.trim();
    if (!body) {
      setError("Название не может быть пустым.");
      return;
    }
    const linkNorm = normalizeLinkUrl(editLink);
    if (editLink.trim() && !linkNorm) {
      setError("Ссылка не похожа на адрес. Укажите http(s)://… или домен без протокола.");
      return;
    }
    const priceTrim = editPrice.trim().slice(0, MAX_PRICE_LEN);
    const author_label =
      editAuthorChoice === "custom" ? editAuthorCustom.trim().slice(0, 32) : editAuthorChoice;

    const card = items.find((i) => i.id === editingId);
    if (!card) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      setError("Нужна сессия пользователя.");
      return;
    }

    setEditSaving(true);
    setError("");

    let nextImagePath = card.image_storage_path;
    const file = editImageFile;

    try {
      if (file) {
        const ext = MIME_TO_EXT[file.type];
        if (!ext) {
          setError("Фото: только JPEG, PNG, WebP или GIF.");
          setEditSaving(false);
          return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setError("Фото не больше 5 МБ.");
          setEditSaving(false);
          return;
        }
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("wishlist").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (upErr) {
          setError(upErr.message);
          setEditSaving(false);
          return;
        }
        if (card.image_storage_path) {
          await supabase.storage.from("wishlist").remove([card.image_storage_path]);
        }
        nextImagePath = path;
      }

      const { error: upErr } = await supabase
        .from("wishlist_items")
        .update({
          body,
          link_url: linkNorm,
          approximate_price: priceTrim || null,
          author_label,
          image_storage_path: nextImagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (upErr) {
        if (file && nextImagePath && nextImagePath !== card.image_storage_path) {
          await supabase.storage.from("wishlist").remove([nextImagePath]);
        }
        setError(upErr.message);
        setEditSaving(false);
        return;
      }

      cancelEdit();
      await loadItems();
    } finally {
      setEditSaving(false);
    }
  }

  async function addCard() {
    const body = draftBody.trim();
    if (!body || !allowed) return;

    const linkNorm = normalizeLinkUrl(draftLink);
    if (draftLink.trim() && !linkNorm) {
      setError("Ссылка не похожа на адрес. Укажите http(s)://… или домен без протокола.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      setError("Нужна сессия пользователя.");
      return;
    }

    const author_label =
      authorChoice === "custom" ? authorCustom.trim().slice(0, 32) : authorChoice;
    const priceTrim = draftPrice.trim().slice(0, MAX_PRICE_LEN);

    setSaving(true);
    setError("");

    let image_storage_path: string | null = null;
    const file = draftImage;

    try {
      if (file) {
        const ext = MIME_TO_EXT[file.type];
        if (!ext) {
          setError("Фото: только JPEG, PNG, WebP или GIF.");
          setSaving(false);
          return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setError("Фото не больше 5 МБ.");
          setSaving(false);
          return;
        }
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("wishlist").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (upErr) {
          setError(upErr.message);
          setSaving(false);
          return;
        }
        image_storage_path = path;
      }

      const { error: insErr } = await supabase.from("wishlist_items").insert({
        body,
        column_id: draftColumn,
        author_label,
        link_url: linkNorm,
        image_storage_path,
        approximate_price: priceTrim || null,
      });

      if (insErr) {
        if (image_storage_path) {
          await supabase.storage.from("wishlist").remove([image_storage_path]);
        }
        setError(insErr.message);
        setSaving(false);
        return;
      }

      setDraftBody("");
      setDraftLink("");
      setDraftPrice("");
      setDraftImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadItems();
    } finally {
      setSaving(false);
    }
  }

  async function persistColumnMove(id: string, column_id: ColumnId) {
    if (editingId === id) cancelEdit();
    const { error: upErr } = await supabase
      .from("wishlist_items")
      .update({ column_id, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await loadItems();
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = active.id as string;
    const overId = over.id as string;
    if (!COLUMNS.some((c) => c.id === overId)) return;
    const nextColumn = overId as ColumnId;
    const card = items.find((i) => i.id === cardId);
    if (!card || card.column_id === nextColumn) return;
    void persistColumnMove(cardId, nextColumn);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  async function removeCard(card: WishlistRow) {
    if (editingId === card.id) cancelEdit();
    if (!confirm("Удалить карточку?")) return;
    if (card.image_storage_path) {
      const { error: stErr } = await supabase.storage.from("wishlist").remove([card.image_storage_path]);
      if (stErr) {
        setError(stErr.message);
        return;
      }
    }
    const { error: delErr } = await supabase.from("wishlist_items").delete().eq("id", card.id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    await loadItems();
  }

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, WishlistRow[]> = {
      nastyushka: [],
      danyushka: [],
      family: [],
      dreams: [],
    };
    for (const row of items) {
      if (map[row.column_id]) map[row.column_id].push(row);
      else map.dreams.push(row);
    }
    return map;
  }, [items]);

  const activeCard = activeId ? items.find((i) => i.id === activeId) : null;

  if (loading) {
    return (
      <p className="text-sm text-slate-500" role="status">
        Загрузка…
      </p>
    );
  }

  if (!userEmail) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#141422] p-6">
        <p className="text-slate-300">Войдите — доска видна только вам двоим (список email в Supabase).</p>
        <Link
          href="/login?next=/useful/wishlist"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Войти
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
        <p className="font-medium text-amber-50">Почта {userEmail} пока не в белом списке доски.</p>
        <p className="mt-2 text-amber-100/90">
          В Supabase выполните:{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
            insert into wishlist_allowlist (email) values (&apos;…&apos;);
          </code>{" "}
          для вашей почты и почты партнёра.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-[#141422] p-5">
        <h2 className="text-lg font-semibold text-white">Новая хотелка</h2>
        <p className="mt-1 text-sm text-slate-500">
          Название, цена, ссылка и фото. Карточки можно править после публикации. Перетаскивание — за узкую колонку слева.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="lg:w-44">
              <span className="mb-1 block text-xs text-slate-500">Колонка</span>
              <select
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200"
                value={draftColumn}
                onChange={(e) => setDraftColumn(e.target.value as ColumnId)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-xs text-slate-500">Название хотелки</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200 placeholder:text-slate-600"
                placeholder="Например: поехать на выходных в …"
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                maxLength={500}
              />
            </label>
            <label className="block w-full lg:max-w-[200px]">
              <span className="mb-1 block text-xs text-slate-500">Приблизительная цена</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200 placeholder:text-slate-600"
                placeholder="до 10к, бесплатно…"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value.slice(0, MAX_PRICE_LEN))}
                maxLength={MAX_PRICE_LEN}
              />
            </label>
            <label className="block flex-1 lg:max-w-md">
              <span className="mb-1 block text-xs text-slate-500">Ссылка (необязательно)</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200 placeholder:text-slate-600"
                placeholder="https://… или просто сайт.ру"
                value={draftLink}
                onChange={(e) => setDraftLink(e.target.value)}
                maxLength={2000}
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="sm:w-44">
              <span className="mb-1 block text-xs text-slate-500">Кто</span>
              <select
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200"
                value={authorChoice}
                onChange={(e) => setAuthorChoice(e.target.value as AuthorChoice)}
              >
                <option value="Я">Я</option>
                <option value="Она">Она</option>
                <option value="Мы">Мы</option>
                <option value="custom">Свой ярлык…</option>
              </select>
            </label>
            {authorChoice === "custom" ? (
              <label className="sm:w-36">
                <span className="mb-1 block text-xs text-slate-500">Ярлык</span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-slate-200"
                  value={authorCustom}
                  onChange={(e) => setAuthorCustom(e.target.value.slice(0, 32))}
                  maxLength={32}
                  placeholder="Ник или шутка"
                />
              </label>
            ) : null}
            <label className="block flex-1">
              <span className="mb-1 block text-xs text-slate-500">Фото (необязательно, до 5 МБ)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="w-full rounded-lg border border-white/10 bg-[#0f0f1a] px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                onChange={(e) => setDraftImage(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={() => void addCard()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 sm:shrink-0"
            >
              {saving ? "Сохраняю…" : "Добавить"}
            </button>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={columnCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <DroppableColumn key={col.id} col={col} isEmpty={byColumn[col.id].length === 0}>
              {byColumn[col.id].map((card) => (
                <DraggableWishlistCard
                  key={card.id}
                  card={card}
                  getImagePublicUrl={getImagePublicUrl}
                  onRemove={removeCard}
                  isEditing={editingId === card.id}
                  editSaving={editSaving}
                  editBody={editBody}
                  setEditBody={setEditBody}
                  editLink={editLink}
                  setEditLink={setEditLink}
                  editPrice={editPrice}
                  setEditPrice={setEditPrice}
                  editAuthorChoice={editAuthorChoice}
                  setEditAuthorChoice={setEditAuthorChoice}
                  editAuthorCustom={editAuthorCustom}
                  setEditAuthorCustom={setEditAuthorCustom}
                  editImageInputRef={editImageInputRef}
                  editImageFile={editImageFile}
                  setEditImageFile={setEditImageFile}
                  onBeginEdit={() => beginEdit(card)}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={() => void saveEdit()}
                />
              ))}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 220,
            easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
        >
          {activeCard ? (
            <div className="pointer-events-none w-[min(100vw-2rem,280px)] cursor-grabbing rounded-xl border border-indigo-400/55 bg-[#0f0f1a] p-3 text-sm text-slate-200 shadow-[0_22px_50px_-12px_rgba(79,70,229,0.55)] ring-2 ring-indigo-400/35">
              <WishlistCardInner card={activeCard} getImagePublicUrl={getImagePublicUrl} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import type { ChatMessage, ChatThread } from "@/types/database.types";

type ThreadRow = ChatThread & {
  products: { name: string } | null;
  kits: { name: string } | null;
  chat_messages: Pick<ChatMessage, "content" | "sender_type" | "created_at">[];
};

const statusVariant = { open: "warning", answered: "success", closed: "secondary" } as const;
const statusLabel = { open: "Sin responder", answered: "Respondido", closed: "Cerrado" } as const;

function lastMessage(thread: ThreadRow) {
  return [...thread.chat_messages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/chat")
      .then((res) => res.json())
      .then((json) => setThreads(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Mensajes</h1>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay mensajes.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Sobre</TableHead>
              <TableHead>Último mensaje</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {threads.map((thread) => (
              <TableRow key={thread.id}>
                <TableCell className="font-medium">
                  {thread.customer_name}
                  <p className="text-xs font-normal text-neutral-500">{thread.customer_email}</p>
                </TableCell>
                <TableCell>{thread.products?.name ?? thread.kits?.name ?? thread.subject ?? "General"}</TableCell>
                <TableCell className="max-w-xs truncate">{lastMessage(thread)?.content}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[thread.status]}>{statusLabel[thread.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(thread.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => {
                      setSelectedId(thread.id);
                      setOpen(true);
                    }}
                    className="text-purple-700 hover:underline"
                  >
                    Ver
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ThreadDialog
        key={`${open}-${selectedId ?? "none"}`}
        open={open}
        onOpenChange={setOpen}
        threadId={selectedId}
        onChanged={load}
      />
    </div>
  );
}

function ThreadDialog({
  open,
  onOpenChange,
  threadId,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string | null;
  onChanged: () => void;
}) {
  const [thread, setThread] = useState<ThreadRow | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Empieza en true: este componente se remonta (vía `key`) cada vez que se
  // selecciona un hilo distinto, así que el estado inicial ya cubre la carga.
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!threadId) return;
    fetch(`/api/admin/chat/${threadId}`)
      .then((res) => res.json())
      .then((json) => {
        setThread(json.data.thread);
        setMessages(json.data.messages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (open && threadId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, threadId]);

  if (!threadId) return null;

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar");
      setReply("");
      load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(status: ChatThread["status"]) {
    await fetch(`/api/admin/chat/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
    onChanged();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{thread ? `Conversación con ${thread.customer_name}` : "Cargando…"}</DialogTitle>
        </DialogHeader>

        {loading || !thread ? (
          <p className="text-sm text-neutral-500">Cargando…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-sm text-neutral-500">
              {thread.customer_email}
              {thread.customer_phone && ` · ${thread.customer_phone}`}
              {" · "}
              {thread.products?.name ?? thread.kits?.name ?? thread.subject ?? "Consulta general"}
            </div>

            <Select value={thread.status} onValueChange={(v) => updateStatus(v as ChatThread["status"])}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    message.sender_type === "admin"
                      ? "self-end bg-purple-700 text-white"
                      : "self-start bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  )}
                >
                  {message.sender_name && (
                    <p className="mb-0.5 text-xs font-semibold opacity-70">{message.sender_name}</p>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                rows={3}
                placeholder="Escribe tu respuesta…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button onClick={sendReply} disabled={sending || !reply.trim()} className="w-fit">
                {sending ? "Enviando…" : "Responder"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { newThreadSchema, type NewThreadInput } from "@/lib/validations/chat";
import type { ChatMessage, ChatThread } from "@/types/database.types";

const POLL_INTERVAL_MS = 15000;

const statusLabel: Record<ChatThread["status"], string> = {
  open: "Enviado — esperando respuesta",
  answered: "Respondido",
  closed: "Cerrado",
};

const statusVariant: Record<ChatThread["status"], "warning" | "success" | "secondary"> = {
  open: "warning",
  answered: "success",
  closed: "secondary",
};

function storageKey(productId?: string | null, kitId?: string | null) {
  return `sanacion-san-charbel:chat:${productId ?? kitId ?? "general"}`;
}

export function ChatWidget({
  productId,
  kitId,
  subject,
  promptLabel = "Preguntar",
  trigger = "inline",
}: {
  productId?: string;
  kitId?: string;
  subject?: string;
  promptLabel?: string;
  trigger?: "inline" | "floating";
}) {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Empieza en true: se apaga en cuanto resuelve la primera carga del hilo;
  // los refrescos de polling posteriores ya no muestran el estado de carga.
  const [loadingThread, setLoadingThread] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const key = storageKey(productId, kitId);

  useEffect(() => {
    if (!open) return;
    const stored = window.localStorage.getItem(key);
    // Leer localStorage al abrir el diálogo es una sincronización con un
    // sistema externo sin un punto async natural donde diferirla.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThreadId(stored);
  }, [open, key]);

  async function loadThread(id: string) {
    try {
      const res = await fetch(`/api/chat/${id}`);
      if (!res.ok) {
        // El hilo ya no existe (borrado por el admin, por ejemplo) — volvemos al formulario.
        window.localStorage.removeItem(key);
        setThreadId(null);
        return;
      }
      const json = await res.json();
      setThread(json.data.thread);
      setMessages(json.data.messages);
    } finally {
      setLoadingThread(false);
    }
  }

  useEffect(() => {
    if (!open || !threadId) return;
    loadThread(threadId);
    pollRef.current = setInterval(() => loadThread(threadId), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, threadId]);

  function handleThreadCreated(newThreadId: string) {
    window.localStorage.setItem(key, newThreadId);
    setThreadId(newThreadId);
  }

  return (
    <>
      {trigger === "floating" ? (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-30 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-4 w-4" />
          {promptLabel}
        </Button>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          <MessageCircle className="h-4 w-4" />
          {promptLabel}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{subject ? `Preguntar sobre: ${subject}` : "Escríbenos"}</DialogTitle>
          </DialogHeader>

          {threadId ? (
            <ThreadView
              threadId={threadId}
              thread={thread}
              messages={messages}
              loading={loadingThread}
              onMessageSent={() => loadThread(threadId)}
            />
          ) : (
            <NewThreadForm
              productId={productId}
              kitId={kitId}
              subject={subject}
              onCreated={handleThreadCreated}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewThreadForm({
  productId,
  kitId,
  subject,
  onCreated,
}: {
  productId?: string;
  kitId?: string;
  subject?: string;
  onCreated: (threadId: string) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewThreadInput>({
    resolver: zodResolver(newThreadSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      product_id: productId ?? null,
      kit_id: kitId ?? null,
      subject: subject ?? null,
      content: subject ? `Hola, quiero más información sobre "${subject}".` : "",
      website: "",
    },
  });

  async function onSubmit(values: NewThreadInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar tu mensaje");
      onCreated(json.thread_id);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo enviar tu mensaje");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Nombre</Label>
          <Input {...register("customer_name")} />
          {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Correo</Label>
          <Input type="email" {...register("customer_email")} />
          {errors.customer_email && <p className="text-xs text-red-600">{errors.customer_email.message}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Teléfono (opcional)</Label>
        <Input {...register("customer_phone")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Tu mensaje</Label>
        <Textarea rows={4} {...register("content")} />
        {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}

function ThreadView({
  threadId,
  thread,
  messages,
  loading,
  onMessageSent,
}: {
  threadId: string;
  thread: ChatThread | null;
  messages: ChatMessage[];
  loading: boolean;
  onMessageSent: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo enviar tu mensaje");
      setReply("");
      onMessageSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar tu mensaje");
    } finally {
      setSending(false);
    }
  }

  const closed = thread?.status === "closed";

  return (
    <div className="flex flex-col gap-3">
      {thread && (
        <Badge variant={statusVariant[thread.status]} className="w-fit">
          {statusLabel[thread.status]}
        </Badge>
      )}

      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        {loading && messages.length === 0 ? (
          <p className="text-sm text-neutral-500">Cargando conversación…</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                message.sender_type === "admin"
                  ? "self-start bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "self-end bg-purple-700 text-white"
              )}
            >
              {message.sender_name && (
                <p className="mb-0.5 text-xs font-semibold opacity-70">{message.sender_name}</p>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        )}
      </div>

      {closed ? (
        <p className="text-sm text-neutral-500">Este hilo está cerrado. Si tienes otra pregunta, escríbenos de nuevo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <Textarea
            rows={2}
            placeholder="Escribe tu respuesta…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="button" onClick={sendReply} disabled={sending || !reply.trim()} className="w-fit">
            {sending ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      )}
    </div>
  );
}

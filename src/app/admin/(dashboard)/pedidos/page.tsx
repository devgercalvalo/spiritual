"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/database.types";

type OrderRow = Order & { order_items: OrderItem[] };

const statusVariant = {
  pending: "warning",
  confirmed: "secondary",
  fulfilled: "success",
  cancelled: "destructive",
} as const;

const statusLabel = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  fulfilled: "Entregado",
  cancelled: "Cancelado",
} as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OrderRow | null>(null);

  function load() {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((json) => setOrders(json.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Pedidos</h1>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no hay pedidos.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.customer_name}
                  <p className="text-xs font-normal text-neutral-500">{order.customer_email}</p>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(order.created_at)}</TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => {
                      setSelected(order);
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

      <OrderDialog
        key={`${open}-${selected?.id ?? "none"}`}
        open={open}
        onOpenChange={setOpen}
        order={selected}
        onSaved={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          setOpen(false);
        }}
      />
    </div>
  );
}

function OrderDialog({
  open,
  onOpenChange,
  order,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRow | null;
  onSaved: (order: OrderRow) => void;
}) {
  const [status, setStatus] = useState(order?.status ?? "pending");
  const [adminNotes, setAdminNotes] = useState(order?.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!order) return null;

  async function handleSave() {
    setSaving(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo guardar");
      onSaved(json.data);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pedido de {order.customer_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="text-sm">
            <p>
              <span className="font-medium">Correo:</span> {order.customer_email}
            </p>
            {order.customer_phone && (
              <p>
                <span className="font-medium">Teléfono:</span> {order.customer_phone}
              </p>
            )}
            {order.customer_notes && (
              <p>
                <span className="font-medium">Notas del cliente:</span> {order.customer_notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Artículos</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-right text-sm font-semibold">Total: {formatCurrency(order.total)}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
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
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Notas internas</Label>
            <Textarea rows={3} value={adminNotes ?? ""} onChange={(e) => setAdminNotes(e.target.value)} />
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

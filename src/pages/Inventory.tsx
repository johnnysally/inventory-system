import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { Department, DEPARTMENTS, InventoryItem, Unit, UNITS } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const { items, addItem, updateItem, deleteItem, stockIn, stockOut, loading } = useInventory();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [stockDialog, setStockDialog] = useState<{ item: InventoryItem; type: "in" | "out" } | null>(null);
  const [stockQty, setStockQty] = useState("");
  const [stockNotes, setStockNotes] = useState("");
  const [stockRecipient, setStockRecipient] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", department: "Electrical" as Department, quantity: "", minThreshold: "", specification: "", unit: "units" as Unit,
  });

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.specification.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || i.department === deptFilter;
    return matchSearch && matchDept;
  });

  const lowStockItems = filtered.filter(i => i.quantity <= i.minThreshold);

  const resetForm = () => setForm({ name: "", department: "Electrical", quantity: "", minThreshold: "", specification: "", unit: "units" });

  const handleAdd = async () => {
    if (!form.name || !form.quantity) { toast.error("Name and quantity required"); return; }
    try {
      setIsSubmitting(true);
      await addItem({ name: form.name, department: form.department, quantity: Number(form.quantity), minThreshold: Number(form.minThreshold) || 10, specification: form.specification, unit: form.unit });
      toast.success("Item added");
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !form.name) return;
    try {
      setIsSubmitting(true);
      await updateItem(editItem.id, { name: form.name, department: form.department, quantity: Number(form.quantity), minThreshold: Number(form.minThreshold), specification: form.specification, unit: form.unit });
      toast.success("Item updated");
      setEditItem(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      await deleteItem(id);
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStock = async () => {
    if (!stockDialog || !stockQty) return;
    const qty = Number(stockQty);
    if (qty <= 0) { toast.error("Invalid quantity"); return; }
    try {
      setIsSubmitting(true);
      if (stockDialog.type === "in") {
        await stockIn(stockDialog.item.id, qty, stockNotes);
        toast.success(`✅ Stocked in ${qty} units of ${stockDialog.item.name}`);
      } else {
        if (qty > stockDialog.item.quantity) { toast.error("Insufficient stock"); setIsSubmitting(false); return; }
        // Include recipient info in notes for stock out
        const recipientInfo = stockRecipient ? `Recipient: ${stockRecipient}` : "";
        const combinedNotes = [recipientInfo, stockNotes].filter(Boolean).join(" | ");
        await stockOut(stockDialog.item.id, qty, combinedNotes);
        toast.success(`📦 Stocked out ${qty} units of ${stockDialog.item.name} to ${stockRecipient || "Unknown"}`);
      }
      setStockDialog(null);
      setStockQty("");
      setStockNotes("");
      setStockRecipient("");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: InventoryItem) => {
    setForm({ name: item.name, department: item.department, quantity: String(item.quantity), minThreshold: String(item.minThreshold), specification: item.specification, unit: item.unit || "units" as Unit });
    setEditItem(item);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading inventory...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} items • {lowStockItems.length} low stock</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="gap-2" disabled={isSubmitting}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Item Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Department</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Unit</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Specification</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Date Added</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isLow = item.quantity <= item.minThreshold;
              return (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    {item.name}
                    {isLow && <AlertTriangle className="inline h-3.5 w-3.5 text-destructive ml-2" />}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.department === "Electrical" ? "bg-info/10 text-info" :
                      item.department === "Plumbing" ? "bg-success/10 text-success" :
                      "bg-primary/10 text-primary"
                    }`}>{item.department}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={isLow ? "text-destructive font-semibold" : ""}>{item.quantity}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">{item.unit || "units"}</td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate hidden md:table-cell">{item.specification}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{item.dateAdded}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        size="sm" 
                        className="gap-1 bg-success/10 text-success hover:bg-success hover:text-white" 
                        onClick={() => setStockDialog({ item, type: "in" })} 
                        title="Add stock to inventory"
                        disabled={isSubmitting}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">In</span>
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-1 bg-warning/10 text-warning hover:bg-warning hover:text-white" 
                        onClick={() => setStockDialog({ item, type: "out" })} 
                        title="Remove stock from inventory"
                        disabled={isSubmitting}
                      >
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">Out</span>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(item)} disabled={isSubmitting}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(item.id)} disabled={isSubmitting}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editItem} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditItem(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Item Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Copper Wire 2.5mm" disabled={isSubmitting} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v as Department })}>
                <SelectTrigger disabled={isSubmitting}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} disabled={isSubmitting} />
              </div>
              <div>
                <Label>Unit (optional)</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as Unit })}>
                  <SelectTrigger disabled={isSubmitting}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Min Threshold</Label>
              <Input type="number" value={form.minThreshold} onChange={(e) => setForm({ ...form, minThreshold: e.target.value })} disabled={isSubmitting} />
            </div>
            <div>
              <Label>Specification</Label>
              <Textarea value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} placeholder="Size, material, brand, voltage..." rows={3} disabled={isSubmitting} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditItem(null); resetForm(); }} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={editItem ? handleEdit : handleAdd} disabled={isSubmitting}>{editItem ? "Save Changes" : "Add Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock In/Out Dialog */}
      <Dialog open={!!stockDialog} onOpenChange={(open) => { if (!open) { setStockDialog(null); setStockQty(""); setStockNotes(""); setStockRecipient(""); } }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockDialog?.type === "in" ? (
                <>
                  <ArrowDownToLine className="h-5 w-5 text-success" />
                  Stock In: {stockDialog?.item.name}
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-5 w-5 text-warning" />
                  Stock Out: {stockDialog?.item.name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-lg border">
              <p className="text-xs text-muted-foreground">Current Stock Level</p>
              <p className="text-2xl font-bold">{stockDialog?.item.quantity} units</p>
              <p className="text-xs text-muted-foreground mt-1">Minimum Threshold: {stockDialog?.item.minThreshold}</p>
            </div>
            <div>
              <Label htmlFor="qty">Quantity to {stockDialog?.type === "in" ? "Add" : "Remove"}</Label>
              <Input 
                id="qty"
                type="number" 
                value={stockQty} 
                onChange={(e) => setStockQty(e.target.value)} 
                placeholder="Enter quantity" 
                disabled={isSubmitting}
                min="1"
              />
            </div>
            {stockDialog?.type === "out" && (
              <div>
                <Label htmlFor="recipient">Recipient Name (required for stock out)</Label>
                <Input 
                  id="recipient"
                  value={stockRecipient} 
                  onChange={(e) => setStockRecipient(e.target.value)} 
                  placeholder="e.g. John Smith, Site Manager, Site A" 
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input 
                id="notes"
                value={stockNotes} 
                onChange={(e) => setStockNotes(e.target.value)} 
                placeholder={stockDialog?.type === "in" ? "e.g. Supplier delivery" : "e.g. Installation work"} 
                disabled={isSubmitting} 
              />
            </div>
            {stockDialog?.type === "out" && stockQty && Number(stockQty) > (stockDialog?.item.quantity || 0) && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">Quantity exceeds available stock!</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(null)} disabled={isSubmitting}>Cancel</Button>
            <Button 
              onClick={handleStock} 
              disabled={isSubmitting || !stockQty || (stockDialog?.type === "out" && Number(stockQty) > (stockDialog?.item.quantity || 0)) || (stockDialog?.type === "out" && !stockRecipient)}
              className={stockDialog?.type === "in" ? "bg-success hover:bg-success/90" : ""}
            >
              {stockDialog?.type === "in" ? "Stock In" : "Stock Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

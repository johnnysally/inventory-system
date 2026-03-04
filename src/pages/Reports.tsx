import { useState, useRef } from "react";
import { useInventory } from "@/hooks/useInventory";
import { DEPARTMENTS } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, AlertTriangle, ArrowLeftRight, Package, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) { toast.error("No data to export"); return; }
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map((row) => keys.map((k) => `"${row[k]}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}

function downloadOrganizedCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}

function handlePrint(printContentId: string) {
  // Add print styles that only show the print preview
  const style = document.createElement("style");
  style.innerHTML = `
    @media print {
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { padding: 20px; background: white; font-family: Arial, sans-serif; }
      header { display: none !important; }
      nav { display: none !important; }
      .tabs { display: none !important; }
      .space-y-6 > div:not(.print-preview-container) { display: none !important; }
      .print-hidden { display: none !important; }
      
      .print-preview-container {
        display: block !important;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      
      .print-header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .print-header h1 {
        font-size: 24px;
        margin-bottom: 5px;
        font-weight: bold;
      }
      
      .print-header p {
        font-size: 12px;
        color: #666;
        margin-bottom: 3px;
      }
      
      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      
      .print-table th {
        background-color: #f0f0f0;
        border: 1px solid #333;
        padding: 12px;
        text-align: left;
        font-weight: bold;
        font-size: 12px;
      }
      
      .print-table td {
        border: 1px solid #333;
        padding: 10px 12px;
        font-size: 11px;
      }
      
      .print-table tbody tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .print-summary {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #333;
        font-size: 12px;
      }
      
      .print-footer {
        margin-top: 30px;
        text-align: right;
        font-size: 11px;
        color: #666;
      }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    window.print();
    document.head.removeChild(style);
  }, 100);
  
  toast.success("Opening print dialog...");
}

export default function Reports() {
  const { items, transactions, refreshData } = useInventory();
  const [deptFilter, setDeptFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedInventory, setSelectedInventory] = useState<Set<string>>(new Set());
  const [selectedLowStock, setSelectedLowStock] = useState<Set<string>>(new Set());
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectedStockOut, setSelectedStockOut] = useState<Set<string>>(new Set());
  const printContainerRef = useRef<HTMLDivElement>(null);

  const filteredItems = deptFilter === "all" ? items : items.filter((i) => i.department === deptFilter);
  const lowStockItems = filteredItems.filter((i) => i.quantity <= i.minThreshold);
  const filteredTx = deptFilter === "all" ? transactions : transactions.filter((t) => t.department === deptFilter);
  const stockOutTx = filteredTx.filter((t) => t.type === "Stock Out");

  const handleDeleteTransaction = async (transactionId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete this stock out record for "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/transactions/${transactionId}`);
      toast.success("Transaction deleted successfully");
      await refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection handlers for inventory
  const toggleInventorySelection = (id: string) => {
    const newSet = new Set(selectedInventory);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedInventory(newSet);
  };

  const toggleAllInventory = (checked: boolean) => {
    setSelectedInventory(checked ? new Set(filteredItems.map(i => i.id)) : new Set());
  };

  // Selection handlers for low stock
  const toggleLowStockSelection = (id: string) => {
    const newSet = new Set(selectedLowStock);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedLowStock(newSet);
  };

  const toggleAllLowStock = (checked: boolean) => {
    setSelectedLowStock(checked ? new Set(lowStockItems.map(i => i.id)) : new Set());
  };

  // Selection handlers for transactions
  const toggleTransactionSelection = (id: string) => {
    const newSet = new Set(selectedTransactions);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedTransactions(newSet);
  };

  const toggleAllTransactions = (checked: boolean) => {
    setSelectedTransactions(checked ? new Set(filteredTx.map(t => t.id)) : new Set());
  };

  // Selection handlers for stock out
  const toggleStockOutSelection = (id: string) => {
    const newSet = new Set(selectedStockOut);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedStockOut(newSet);
  };

  const toggleAllStockOut = (checked: boolean) => {
    setSelectedStockOut(checked ? new Set(stockOutTx.map(t => t.id)) : new Set());
  };

  // Bulk actions
  const handleBulkDeleteStockOut = async () => {
    if (selectedStockOut.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedStockOut.size} stock out record(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const promises = Array.from(selectedStockOut).map(id => api.delete(`/transactions/${id}`));
      await Promise.all(promises);
      toast.success(`${selectedStockOut.size} record(s) deleted`);
      setSelectedStockOut(new Set());
      await refreshData();
    } catch (error: any) {
      toast.error("Failed to delete records");
    } finally {
      setIsDeleting(false);
    }
  };

  // Print preview generators
  const generateInventoryPrintContent = () => {
    const selectedData = filteredItems.filter(i => selectedInventory.has(i.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to print");
      return;
    }

    let html = `
      <div class="print-header">
        <h1>Inventory Report</h1>
        <p>SawelaCapella Inventory Management System</p>
        <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Min Threshold</th>
            <th>Specification</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    let totalQty = 0;
    selectedData.forEach(item => {
      html += `
        <tr>
          <td>${item.name}</td>
          <td>${item.department}</td>
          <td>${item.quantity}</td>
          <td>${item.unit || "units"}</td>
          <td>${item.minThreshold}</td>
          <td>${item.specification}</td>
        </tr>
      `;
      totalQty += item.quantity;
    });

    html += `
        </tbody>
      </table>
      <div class="print-summary">
        <strong>Total Items:</strong> ${selectedData.length} | <strong>Total Quantity:</strong> ${totalQty}
      </div>
      <div class="print-footer">
        Page prepared for printing
      </div>
    `;

    if (printContainerRef.current) {
      printContainerRef.current.innerHTML = html;
    }
  };

  const generateLowStockPrintContent = () => {
    const selectedData = lowStockItems.filter(i => selectedLowStock.has(i.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to print");
      return;
    }

    let html = `
      <div class="print-header">
        <h1>Low Stock Report</h1>
        <p>SawelaCapella Inventory Management System</p>
        <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Min Threshold</th>
            <th>Deficit</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalDeficit = 0;
    selectedData.forEach(item => {
      const deficit = item.minThreshold - item.quantity;
      totalDeficit += deficit;
      html += `
        <tr>
          <td>${item.name}</td>
          <td>${item.department}</td>
          <td>${item.quantity}</td>
          <td>${item.unit || "units"}</td>
          <td>${item.minThreshold}</td>
          <td><strong>${deficit}</strong></td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="print-summary">
        <strong>Alert Items:</strong> ${selectedData.length} | <strong>Total Deficit:</strong> ${totalDeficit} units
      </div>
      <div class="print-footer">
        Page prepared for printing
      </div>
    `;

    if (printContainerRef.current) {
      printContainerRef.current.innerHTML = html;
    }
  };

  const generateTransactionsPrintContent = () => {
    const selectedData = filteredTx.filter(t => selectedTransactions.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to print");
      return;
    }

    let html = `
      <div class="print-header">
        <h1>Transaction Report</h1>
        <p>SawelaCapella Inventory Management System</p>
        <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Department</th>
            <th>User</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalIn = 0, totalOut = 0;
    selectedData.forEach(tx => {
      if (tx.type === "Stock In") totalIn += tx.quantity;
      else totalOut += tx.quantity;
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.itemName}</td>
          <td><strong>${tx.type}</strong></td>
          <td>${tx.quantity}</td>
          <td>${tx.department}</td>
          <td>${tx.user}</td>
          <td>${tx.notes || "—"}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="print-summary">
        <strong>Total Transactions:</strong> ${selectedData.length} | <strong>Stock In:</strong> ${totalIn} | <strong>Stock Out:</strong> ${totalOut}
      </div>
      <div class="print-footer">
        Page prepared for printing
      </div>
    `;

    if (printContainerRef.current) {
      printContainerRef.current.innerHTML = html;
    }
  };

  const generateStockOutPrintContent = () => {
    const selectedData = stockOutTx.filter(t => selectedStockOut.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to print");
      return;
    }

    let html = `
      <div class="print-header">
        <h1>Stock Out Report</h1>
        <p>SawelaCapella Inventory Management System</p>
        <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Department</th>
            <th>Recipient</th>
            <th>Notes</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalQty = 0;
    selectedData.forEach(tx => {
      totalQty += tx.quantity;
      const recipientMatch = tx.notes?.match(/Recipient: ([^|]+)/);
      const recipient = recipientMatch ? recipientMatch[1].trim() : "—";
      const otherNotes = tx.notes?.replace(/Recipient: [^|]+\s*\|\s*/, '') || "";
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.itemName}</td>
          <td>${tx.quantity}</td>
          <td>${tx.department}</td>
          <td>${recipient}</td>
          <td>${otherNotes || "—"}</td>
          <td>${tx.user}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
      <div class="print-summary">
        <strong>Total Stock Out Records:</strong> ${selectedData.length} | <strong>Total Quantity Issued:</strong> ${totalQty}
      </div>
      <div class="print-footer">
        Page prepared for printing
      </div>
    `;

    if (printContainerRef.current) {
      printContainerRef.current.innerHTML = html;
    }
  };

  const handlePrintSelected = () => {
    if (activeTab === "inventory") {
      generateInventoryPrintContent();
    } else if (activeTab === "low-stock") {
      generateLowStockPrintContent();
    } else if (activeTab === "transactions") {
      generateTransactionsPrintContent();
    } else if (activeTab === "stock-out") {
      generateStockOutPrintContent();
    }
    
    setTimeout(() => {
      handlePrint("print-preview-container");
    }, 50);
  };

  // Organized CSV exports
  const generateInventoryCSV = () => {
    const selectedData = filteredItems.filter(i => selectedInventory.has(i.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to export");
      return;
    }

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    let csv = `SawelaCapella Inventory Management System\nInventory Report\nGenerated: ${timestamp}\n\n`;
    csv += "Name,Department,Quantity,Unit,Min Threshold,Specification,Date Added\n";
    
    let totalQty = 0;
    selectedData.forEach(item => {
      csv += `"${item.name}","${item.department}",${item.quantity},"${item.unit || "units"}",${item.minThreshold},"${item.specification}","${item.dateAdded}"\n`;
      totalQty += item.quantity;
    });

    csv += `\nTotal Items:,${selectedData.length}\nTotal Quantity:,${totalQty}\n`;
    downloadOrganizedCSV(csv, "inventory-report.csv");
  };

  const generateLowStockCSV = () => {
    const selectedData = lowStockItems.filter(i => selectedLowStock.has(i.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to export");
      return;
    }

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    let csv = `SawelaCapella Inventory Management System\nLow Stock Report\nGenerated: ${timestamp}\n\n`;
    csv += "Name,Department,Quantity,Unit,Min Threshold,Deficit\n";
    
    let totalDeficit = 0;
    selectedData.forEach(item => {
      const deficit = item.minThreshold - item.quantity;
      totalDeficit += deficit;
      csv += `"${item.name}","${item.department}",${item.quantity},"${item.unit || "units"}",${item.minThreshold},${deficit}\n`;
    });

    csv += `\nAlert Items:,${selectedData.length}\nTotal Deficit:,${totalDeficit}\n`;
    downloadOrganizedCSV(csv, "low-stock-report.csv");
  };

  const generateTransactionsCSV = () => {
    const selectedData = filteredTx.filter(t => selectedTransactions.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to export");
      return;
    }

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    let csv = `SawelaCapella Inventory Management System\nTransaction Report\nGenerated: ${timestamp}\n\n`;
    csv += "Date,Item,Type,Quantity,Department,User,Notes\n";
    
    let totalIn = 0, totalOut = 0;
    selectedData.forEach(tx => {
      if (tx.type === "Stock In") totalIn += tx.quantity;
      else totalOut += tx.quantity;
      csv += `"${tx.date}","${tx.itemName}","${tx.type}",${tx.quantity},"${tx.department}","${tx.user}","${(tx.notes || "").replace(/"/g, '""')}"\n`;
    });

    csv += `\nTotal Transactions:,${selectedData.length}\nStock In:,${totalIn}\nStock Out:,${totalOut}\n`;
    downloadOrganizedCSV(csv, "transactions-report.csv");
  };

  const generateStockOutCSV = () => {
    const selectedData = stockOutTx.filter(t => selectedStockOut.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to export");
      return;
    }

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    let csv = `SawelaCapella Inventory Management System\nStock Out Report\nGenerated: ${timestamp}\n\n`;
    csv += "Date,Item,Quantity,Department,Recipient,Notes,User\n";
    
    let totalQty = 0;
    selectedData.forEach(tx => {
      totalQty += tx.quantity;
      const recipientMatch = tx.notes?.match(/Recipient: ([^|]+)/);
      const recipient = recipientMatch ? recipientMatch[1].trim() : "—";
      const otherNotes = tx.notes?.replace(/Recipient: [^|]+\s*\|\s*/, '') || "";
      csv += `"${tx.date}","${tx.itemName}",${tx.quantity},"${tx.department}","${recipient}","${otherNotes.replace(/"/g, '""')}","${tx.user}"\n`;
    });

    csv += `\nTotal Records:,${selectedData.length}\nTotal Quantity Issued:,${totalQty}\n`;
    downloadOrganizedCSV(csv, "stock-out-report.csv");
  };

  return (
    <div className="space-y-6">
      <div className="print-preview-container hidden" ref={printContainerRef}></div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and export inventory reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handlePrintSelected} title="Print selected items" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory" className="gap-2"><Package className="h-3.5 w-3.5" /> Inventory</TabsTrigger>
          <TabsTrigger value="low-stock" className="gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Low Stock</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2"><ArrowLeftRight className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
          <TabsTrigger value="stock-out" className="gap-2"><Trash2 className="h-3.5 w-3.5" /> Stock Out</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {selectedInventory.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">{selectedInventory.size} item(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={generateInventoryCSV}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrintSelected}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedInventory(new Set(filteredItems.map(i => i.id)));
              setTimeout(() => generateInventoryCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-center py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedInventory.size === filteredItems.length && filteredItems.length > 0} onChange={(e) => toggleAllInventory(e.target.checked)} className="cursor-pointer" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Specification</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className={`border-b last:border-0 ${selectedInventory.has(item.id) ? 'bg-primary/5' : ''}`}>
                    <td className="text-center py-2.5 px-4">
                      <input type="checkbox" checked={selectedInventory.has(item.id)} onChange={() => toggleInventorySelection(item.id)} className="cursor-pointer" />
                    </td>
                    <td className="py-2.5 px-4 font-medium">{item.name}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{item.department}</td>
                    <td className="py-2.5 px-4">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell text-xs">{item.unit || "units"}</td>
                    <td className="py-2.5 px-4 text-muted-foreground truncate max-w-xs hidden md:table-cell">{item.specification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {selectedLowStock.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">{selectedLowStock.size} item(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={generateLowStockCSV}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrintSelected}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedLowStock(new Set(lowStockItems.map(i => i.id)));
              setTimeout(() => generateLowStockCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-center py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedLowStock.size === lowStockItems.length && lowStockItems.length > 0} onChange={(e) => toggleAllLowStock(e.target.checked)} className="cursor-pointer" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Unit</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Min</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Deficit</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id} className={`border-b last:border-0 ${selectedLowStock.has(item.id) ? 'bg-primary/5' : ''}`}>
                    <td className="text-center py-2.5 px-4">
                      <input type="checkbox" checked={selectedLowStock.has(item.id)} onChange={() => toggleLowStockSelection(item.id)} className="cursor-pointer" />
                    </td>
                    <td className="py-2.5 px-4 font-medium">{item.name}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{item.department}</td>
                    <td className="py-2.5 px-4 text-destructive font-semibold">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell text-xs">{item.unit || "units"}</td>
                    <td className="py-2.5 px-4">{item.minThreshold}</td>
                    <td className="py-2.5 px-4"><span className="low-stock-badge">{item.minThreshold - item.quantity}</span></td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">All items are adequately stocked</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {selectedTransactions.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">{selectedTransactions.size} transaction(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={generateTransactionsCSV}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrintSelected}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedTransactions(new Set(filteredTx.map(t => t.id)));
              setTimeout(() => generateTransactionsCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-center py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedTransactions.size === filteredTx.length && filteredTx.length > 0} onChange={(e) => toggleAllTransactions(e.target.checked)} className="cursor-pointer" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className={`border-b last:border-0 ${selectedTransactions.has(tx.id) ? 'bg-primary/5' : ''}`}>
                    <td className="text-center py-2.5 px-4">
                      <input type="checkbox" checked={selectedTransactions.has(tx.id)} onChange={() => toggleTransactionSelection(tx.id)} className="cursor-pointer" />
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{tx.date}</td>
                    <td className="py-2.5 px-4 font-medium">{tx.itemName}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tx.type === "Stock In" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{tx.quantity}</td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden md:table-cell">{tx.user}</td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden lg:table-cell">{tx.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="stock-out" className="space-y-4">
          {selectedStockOut.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">{selectedStockOut.size} record(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={generateStockOutCSV}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrintSelected}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <Button size="sm" variant="destructive" className="gap-2" onClick={handleBulkDeleteStockOut} disabled={isDeleting}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">{stockOutTx.length} stock out records</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                setSelectedStockOut(new Set(stockOutTx.map(t => t.id)));
                setTimeout(() => generateStockOutCSV(), 0);
              }}>
                <Download className="h-3.5 w-3.5" /> Export CSV (All)
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-center py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedStockOut.size === stockOutTx.length && stockOutTx.length > 0} onChange={(e) => toggleAllStockOut(e.target.checked)} className="cursor-pointer" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Item</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Recipient</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Notes</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden xl:table-cell">User</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockOutTx.length > 0 ? (
                  stockOutTx.map((tx) => {
                    const recipientMatch = tx.notes?.match(/Recipient: ([^|]+)/);
                    const recipient = recipientMatch ? recipientMatch[1].trim() : "—";
                    const otherNotes = tx.notes?.replace(/Recipient: [^|]+\s*\|\s*/, '') || "";
                    
                    return (
                      <tr key={tx.id} className={`border-b last:border-0 hover:bg-muted/30 ${selectedStockOut.has(tx.id) ? 'bg-primary/5' : ''}`}>
                        <td className="text-center py-3 px-4">
                          <input type="checkbox" checked={selectedStockOut.has(tx.id)} onChange={() => toggleStockOutSelection(tx.id)} className="cursor-pointer" />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{tx.date}</td>
                        <td className="py-3 px-4 font-medium">{tx.itemName}</td>
                        <td className="py-3 px-4 font-semibold text-destructive">{tx.quantity}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">{recipient}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-xs">{otherNotes || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell text-xs">{tx.user}</td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteTransaction(tx.id, tx.itemName)}
                            disabled={isDeleting}
                            title="Delete this stock out record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No stock out records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useRef } from "react";
import { useInventory } from "@/hooks/useInventory";
import { useDetailViewPreference } from "@/hooks/useDetailViewPreference";
import { DEPARTMENTS } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, AlertTriangle, ArrowLeftRight, ArrowDownToLine, Package, Printer, Trash2, Eye, Grid3x3, List, Settings } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { ReportDetailView } from "@/components/ReportDetailView";
import { ReportDetailViewEnhanced } from "@/components/ReportDetailViewEnhanced";
import { InventoryItem, Transaction } from "@/types/inventory";

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
    /* Color Scheme */
    :root {
      --primary-blue: #1e5a96;
      --light-gray: #f8f9fa;
      --border-gray: #dee2e6;
      --text-dark: #212529;
      --text-light: #6c757d;
    }
    
    /* ===== SCREEN PREVIEW STYLES ===== */
    .print-preview-container {
      background: white;
      color: var(--text-dark);
      padding: 20px;
      margin: 15px auto;
      border-radius: 4px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.55;
      max-width: 900px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    
    /* Header Styling */
    .print-header {
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary-blue);
      position: relative;
    }
    
    .print-header .system-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary-blue);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    
    .print-header .report-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 10px;
    }
    
    .print-header .report-meta {
      font-size: 9px;
      color: var(--text-light);
      line-height: 1.5;
      display: block;
    }
    
    .print-header .report-meta p {
      margin: 1px 0;
      text-align: center;
    }
    
    .print-header .report-meta strong {
      color: var(--text-dark);
      font-weight: 600;
    }
    
    /* Section Styling */
    .report-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: white;
      background-color: var(--primary-blue);
      padding: 8px 12px;
      margin-bottom: 0;
      border-radius: 0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    /* Table Styling */
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      background: white;
      border: 1px solid var(--border-gray);
    }
    
    .print-table th {
      background-color: var(--primary-blue);
      color: #ffffff;
      border: 1px solid var(--primary-blue);
      padding: 9px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 9px;
      letter-spacing: 0.2px;
      text-transform: uppercase;
      vertical-align: middle;
    }
    
    .print-table td {
      border: 1px solid var(--border-gray);
      padding: 8px 10px;
      font-size: 10px;
      line-height: 1.3;
      vertical-align: top;
      color: var(--text-dark);
    }
    
    .print-table tbody tr:nth-child(odd) {
      background-color: white;
    }
    
    .print-table tbody tr:nth-child(even) {
      background-color: var(--light-gray);
    }
    
    /* Summary Box Styling */
    .print-summary {
      background: var(--light-gray);
      margin-top: 0;
      padding: 10px 12px;
      border: 1px solid var(--border-gray);
      border-top: none;
      font-size: 10px;
      line-height: 1.5;
      color: var(--text-dark);
      page-break-inside: avoid;
    }
    
    .print-summary strong {
      font-weight: 600;
      color: var(--primary-blue);
      display: inline;
      margin-right: 6px;
      font-size: 10px;
    }
    
    /* Footer Styling */
    .print-footer {
      margin-top: 25px;
      padding-top: 10px;
      border-top: 1px solid var(--border-gray);
      text-align: center;
      font-size: 8px;
      color: var(--text-light);
      page-break-after: avoid;
    }
    
    .print-footer strong {
      color: var(--text-dark);
      font-weight: 600;
      display: block;
      margin-bottom: 2px;
    }
    
    /* ===== PRINT MEDIA STYLES ===== */
    @media print {
      * { 
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        color: var(--text-dark) !important;
        background-color: transparent !important;
      }
      
      html { 
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: white !important;
        color-scheme: light !important;
      }
      
      body { 
        padding: 15mm 10mm !important;
        background: white !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
        line-height: 1.5 !important;
        color: var(--text-dark) !important;
        margin: 0 !important;
        width: 100% !important;
        font-size: 10px !important;
      }
      
      header { display: none !important; }
      nav { display: none !important; }
      .tabs { display: none !important; }
      .space-y-6 > div:not(.print-preview-container) { display: none !important; }
      .print-hidden { display: none !important; }
      
      .print-preview-container {
        display: block !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: var(--text-dark) !important;
      }
      
      .print-header {
        margin-bottom: 16px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--primary-blue) !important;
        background: white !important;
        color: var(--text-dark) !important;
        page-break-after: avoid;
      }
      
      .print-header .system-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--primary-blue) !important;
        letter-spacing: 0.4px;
        margin: 0 0 3px 0;
        background: white !important;
        text-transform: uppercase;
      }
      
      .print-header .report-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-dark) !important;
        margin: 0 0 8px 0;
        background: white !important;
      }
      
      .print-header .report-meta {
        font-size: 9px;
        color: var(--text-light) !important;
        line-height: 1.5;
        background: white !important;
        text-align: center;
      }
      
      .print-header .report-meta p {
        margin: 1px 0;
        color: var(--text-light) !important;
        background: white !important;
      }
      
      .print-header .report-meta strong {
        color: var(--text-dark) !important;
        font-weight: 600;
      }
      
      .report-section {
        margin-bottom: 18px;
        background: white !important;
        color: var(--text-dark) !important;
        page-break-inside: avoid;
      }
      
      .section-title {
        font-size: 11px;
        font-weight: 700;
        color: white !important;
        background: var(--primary-blue) !important;
        padding: 7px 10px !important;
        margin: 0 !important;
        text-transform: uppercase;
        letter-spacing: 0.2px;
        border: none !important;
      }
      
      .print-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0 !important;
        background: white !important;
        border: 1px solid var(--border-gray) !important;
      }
      
      .print-table th {
        background-color: var(--primary-blue) !important;
        color: #ffffff !important;
        border: 1px solid var(--primary-blue) !important;
        padding: 8px 10px !important;
        text-align: left;
        font-weight: 700;
        font-size: 9px;
        letter-spacing: 0.2px;
        text-transform: uppercase;
        vertical-align: middle;
      }
      
      .print-table td {
        border: 1px solid var(--border-gray) !important;
        padding: 7px 10px !important;
        font-size: 10px;
        line-height: 1.2;
        color: var(--text-dark) !important;
        background: white !important;
        vertical-align: top;
      }
      
      .print-table tbody tr {
        page-break-inside: avoid;
        background: white !important;
      }
      
      .print-table tbody tr:nth-child(odd) {
        background-color: white !important;
      }
      
      .print-table tbody tr:nth-child(even) {
        background-color: var(--light-gray) !important;
      }
      
      .print-summary {
        background: var(--light-gray) !important;
        margin: 0 !important;
        padding: 9px 10px !important;
        border: 1px solid var(--border-gray) !important;
        border-top: none !important;
        font-size: 10px;
        line-height: 1.5;
        color: var(--text-dark) !important;
        page-break-inside: avoid;
        display: block;
      }
      
      .print-summary strong {
        font-weight: 600;
        color: var(--primary-blue) !important;
        display: inline;
        margin-right: 5px;
        font-size: 10px;
      }
      
      .print-footer {
        margin-top: 22px;
        padding-top: 8px;
        border-top: 1px solid var(--border-gray) !important;
        text-align: center;
        font-size: 8px;
        color: var(--text-light) !important;
        page-break-after: avoid;
        background: white !important;
      }
      
      .print-footer strong {
        color: var(--text-dark) !important;
        font-weight: 600;
        display: block;
        margin-bottom: 2px;
      }
      
      @page {
        margin: 15mm 10mm;
        size: A4;
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
  const [selectedStockIn, setSelectedStockIn] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<InventoryItem | Transaction | null>(null);
  const [detailViewType, setDetailViewType] = useState<'inventory' | 'transaction' | 'lowstock' | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showViewStyleMenu, setShowViewStyleMenu] = useState(false);
  const { viewStyle, updateViewStyle, isLoaded } = useDetailViewPreference();
  const printContainerRef = useRef<HTMLDivElement>(null);

  const filteredItems = deptFilter === "all" ? items : items.filter((i) => i.department === deptFilter);
  const lowStockItems = filteredItems.filter((i) => i.quantity <= i.minThreshold);
  const filteredTx = deptFilter === "all" ? transactions : transactions.filter((t) => t.department === deptFilter);
  const stockOutTx = filteredTx.filter((t) => t.type === "Stock Out");
  const stockInTx = filteredTx.filter((t) => t.type === "Stock In");

  const openDetailView = (data: InventoryItem | Transaction, type: 'inventory' | 'transaction' | 'lowstock') => {
    setSelectedReport(data);
    setDetailViewType(type);
    setShowDetailView(true);
  };

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

  const handleDeleteReport = async (reportId: string) => {
    try {
      if (detailViewType === 'transaction' || detailViewType === 'lowstock') {
        await api.delete(`/transactions/${reportId}`);
      }
      await refreshData();
      setShowDetailView(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete report");
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

  // Selection handlers for stock in
  const toggleStockInSelection = (id: string) => {
    const newSet = new Set(selectedStockIn);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedStockIn(newSet);
  };

  const toggleAllStockIn = (checked: boolean) => {
    setSelectedStockIn(checked ? new Set(stockInTx.map(t => t.id)) : new Set());
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

  const handleBulkDeleteStockIn = async () => {
    if (selectedStockIn.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedStockIn.size} stock in record(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const promises = Array.from(selectedStockIn).map(id => api.delete(`/transactions/${id}`));
      await Promise.all(promises);
      toast.success(`${selectedStockIn.size} record(s) deleted`);
      setSelectedStockIn(new Set());
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

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let html = `
      <div class="print-header">
        <div class="system-title">SawelaCapellaLodge Inventory System</div>
        <div class="report-title">📦 Complete Inventory Report</div>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Department Filter:</strong> ${deptFilter === 'all' ? 'All Departments' : deptFilter}</p>
        </div>
      </div>
      
      <div class="report-section">
        <div class="section-title">Inventory Items</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Department</th>
              <th>Current Qty</th>
              <th>Unit</th>
              <th>Min Threshold</th>
              <th>Specification</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    let totalQty = 0;
    selectedData.forEach((item, index) => {
      html += `
        <tr>
          <td>${item.name}</td>
          <td>${item.department}</td>
          <td><strong>${item.quantity}</strong></td>
          <td>${item.unit || 'units'}</td>
          <td>${item.minThreshold}</td>
          <td>${item.specification}</td>
        </tr>
      `;
      totalQty += item.quantity;
    });

    html += `
          </tbody>
        </table>
      </div>
      
      <div class="print-summary">
        <strong>📊 Summary Statistics:</strong><br/>
        Total Items Inventoried: <strong>${selectedData.length}</strong> | 
        Total Quantity: <strong>${totalQty} units</strong>
      </div>
      
      <div class="print-footer">
        <strong>SawelaCapellaLodge Inventory Management System</strong> | Report Date: ${dateStr} | Page printed for archival purposes
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

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let html = `
      <div class="print-header">
        <div class="system-title">SawelaCapellaLodge Inventory System</div>
        <div class="report-title">⚠️ Low Stock Alert Report</div>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Department Filter:</strong> ${deptFilter === 'all' ? 'All Departments' : deptFilter}</p>
        </div>
      </div>
      
      <div class="report-section">
        <div class="section-title">Items Below Minimum Threshold</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Department</th>
              <th>Current Stock</th>
              <th>Unit</th>
              <th>Min Required</th>
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
          <td><strong style="color: #000; font-weight: 900;">${item.quantity}</strong></td>
          <td>${item.unit || 'units'}</td>
          <td>${item.minThreshold}</td>
          <td><strong style="color: #000; font-weight: 900;">${deficit}</strong></td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      
      <div class="print-summary">
        <strong>🚨 Alert Summary:</strong><br/>
        Items Below Threshold: <strong>${selectedData.length}</strong> | 
        Total Units Needed: <strong>${totalDeficit} units</strong><br/>
        <em>Immediate action required to replenish stock</em>
      </div>
      
      <div class="print-footer">
        <strong>SawelaCapellaLodge Inventory Management System</strong> | Report Date: ${dateStr} | Page printed for archival purposes
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

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let html = `
      <div class="print-header">
        <div class="system-title">SawelaCapellaLodge Inventory System</div>
        <div class="report-title">🔄 Complete Transaction Report</div>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Department Filter:</strong> ${deptFilter === 'all' ? 'All Departments' : deptFilter}</p>
        </div>
      </div>
      
      <div class="report-section">
        <div class="section-title">All Transactions (Stock In & Out)</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item Name</th>
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
      const typeLabel = tx.type === 'Stock In' ? '📥' : '📤';
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.itemName}</td>
          <td><strong>${typeLabel} ${tx.type}</strong></td>
          <td>${tx.quantity}</td>
          <td>${tx.department}</td>
          <td>${tx.user}</td>
          <td>${tx.notes || '—'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      
      <div class="print-summary">
        <strong>📋 Transaction Summary:</strong><br/>
        Total Transactions: <strong>${selectedData.length}</strong> | 
        Total Stock In: <strong>${totalIn} units</strong> | 
        Total Stock Out: <strong>${totalOut} units</strong>
      </div>
      
      <div class="print-footer">
        <strong>SawelaCapellaLodge Inventory Management System</strong> | Report Date: ${dateStr} | Page printed for archival purposes
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

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let html = `
      <div class="print-header">
        <div class="system-title">SawelaCapellaLodge Inventory System</div>
        <div class="report-title">📤 Stock Out Report</div>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Department Filter:</strong> ${deptFilter === 'all' ? 'All Departments' : deptFilter}</p>
        </div>
      </div>
      
      <div class="report-section">
        <div class="section-title">Items Issued / Stock Out Transactions</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item Name</th>
              <th>Quantity Issued</th>
              <th>Department</th>
              <th>Recipient/Destination</th>
              <th>Notes</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalQty = 0;
    selectedData.forEach(tx => {
      totalQty += tx.quantity;
      const recipientMatch = tx.notes?.match(/Recipient: ([^|]+)/);
      const recipient = recipientMatch ? recipientMatch[1].trim() : '—';
      const otherNotes = tx.notes?.replace(/Recipient: [^|]+\s*\|\s*/, '') || '';
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.itemName}</td>
          <td><strong>${tx.quantity}</strong></td>
          <td>${tx.department}</td>
          <td>${recipient}</td>
          <td>${otherNotes || '—'}</td>
          <td>${tx.user}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      
      <div class="print-summary">
        <strong>📊 Stock Out Summary:</strong><br/>
        Total Transactions: <strong>${selectedData.length}</strong> | 
        Total Units Issued: <strong>${totalQty} units</strong>
      </div>
      
      <div class="print-footer">
        <strong>SawelaCapellaLodge Inventory Management System</strong> | Report Date: ${dateStr} | Page printed for archival purposes
      </div>
    `;

    if (printContainerRef.current) {
      printContainerRef.current.innerHTML = html;
    }
  };

  const generateStockInPrintContent = () => {
    const selectedData = stockInTx.filter(t => selectedStockIn.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to print");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let html = `
      <div class="print-header">
        <div class="system-title">SawelaCapellaLodge Inventory System</div>
        <div class="report-title">📥 Stock In Report</div>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${dateStr} at ${timeStr}</p>
          <p><strong>Department Filter:</strong> ${deptFilter === 'all' ? 'All Departments' : deptFilter}</p>
        </div>
      </div>
      
      <div class="report-section">
        <div class="section-title">Items Received / Stock In Transactions</div>
        <table class="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item Name</th>
              <th>Quantity Received</th>
              <th>Department</th>
              <th>Supplier / Source</th>
              <th>Notes</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalQty = 0;
    selectedData.forEach(tx => {
      totalQty += tx.quantity;
      html += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.itemName}</td>
          <td><strong>${tx.quantity}</strong></td>
          <td>${tx.department}</td>
          <td>${tx.notes || '—'}</td>
          <td></td>
          <td>${tx.user}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      
      <div class="print-summary">
        <strong>📊 Stock In Summary:</strong><br/>
        Total Transactions: <strong>${selectedData.length}</strong> | 
        Total Units Received: <strong>${totalQty} units</strong>
      </div>
      
      <div class="print-footer">
        <strong>SawelaCapellaLodge Inventory Management System</strong> | Report Date: ${dateStr} | Page printed for archival purposes
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
    } else if (activeTab === "stock-in") {
      generateStockInPrintContent();
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
    let csv = `SawelaCapellaLodge Inventory Management System\nInventory Report\nGenerated: ${timestamp}\n\n`;
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
    let csv = `SawelaCapellaLodge Inventory Management System\nLow Stock Report\nGenerated: ${timestamp}\n\n`;
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
    let csv = `SawelaCapellaLodge Inventory Management System\nTransaction Report\nGenerated: ${timestamp}\n\n`;
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
    let csv = `SawelaCapellaLodge Inventory Management System\nStock Out Report\nGenerated: ${timestamp}\n\n`;
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

  const generateStockInCSV = () => {
    const selectedData = stockInTx.filter(t => selectedStockIn.has(t.id));
    if (selectedData.length === 0) {
      toast.error("No items selected to export");
      return;
    }

    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    let csv = `SawelaCapellaLodge Inventory Management System\nStock In Report\nGenerated: ${timestamp}\n\n`;
    csv += "Date,Item,Quantity,Department,Supplier/Source,Notes,User\n";
    
    let totalQty = 0;
    selectedData.forEach(tx => {
      totalQty += tx.quantity;
      csv += `"${tx.date}","${tx.itemName}",${tx.quantity},"${tx.department}","${(tx.notes || "").replace(/"/g, '""')}","","${tx.user}"\n`;
    });

    csv += `\nTotal Records:,${selectedData.length}\nTotal Quantity Received:,${totalQty}\n`;
    downloadOrganizedCSV(csv, "stock-in-report.csv");
  };

  return (
    <div className="space-y-6">
      {/* Render the appropriate detail view based on user preference */}
      {isLoaded && viewStyle === 'enhanced' ? (
        <ReportDetailViewEnhanced
          isOpen={showDetailView}
          onClose={() => setShowDetailView(false)}
          reportData={selectedReport}
          reportType={detailViewType}
          onDelete={handleDeleteReport}
        />
      ) : (
        <ReportDetailView
          isOpen={showDetailView}
          onClose={() => setShowDetailView(false)}
          reportData={selectedReport}
          reportType={detailViewType}
          onDelete={handleDeleteReport}
        />
      )}
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
          {/* Detail View Style Toggle */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowViewStyleMenu(!showViewStyleMenu)}
              title="Detail view settings"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {showViewStyleMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Detail View Style</p>
                </div>
                <button
                  onClick={() => {
                    updateViewStyle('classic');
                    setShowViewStyleMenu(false);
                    toast.success('Switched to Classic view');
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    viewStyle === 'classic'
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Classic</span>
                    {viewStyle === 'classic' && <span className="ml-auto text-lg">✓</span>}
                  </span>
                </button>
                <button
                  onClick={() => {
                    updateViewStyle('enhanced');
                    setShowViewStyleMenu(false);
                    toast.success('Switched to Enhanced view');
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors border-t border-gray-100 ${
                    viewStyle === 'enhanced'
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    <span>Enhanced</span>
                    {viewStyle === 'enhanced' && <span className="ml-auto text-lg">✓</span>}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory" className="gap-2"><Package className="h-3.5 w-3.5" /> Inventory</TabsTrigger>
          <TabsTrigger value="low-stock" className="gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Low Stock</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2"><ArrowLeftRight className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
          <TabsTrigger value="stock-in" className="gap-2"><ArrowDownToLine className="h-3.5 w-3.5" /> Stock In</TabsTrigger>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-3.5 w-3.5" /> List View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'detail' ? 'default' : 'outline'}
                onClick={() => setViewMode('detail')}
                className="gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Detail View
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedInventory(new Set(filteredItems.map(i => i.id)));
              setTimeout(() => generateInventoryCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          
          {viewMode === 'detail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                    <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.department}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Quantity</p>
                        <p className="text-2xl font-bold text-primary mt-1">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Min Threshold</p>
                        <p className="text-2xl font-bold mt-1">{item.minThreshold}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.quantity <= item.minThreshold ? 'bg-destructive' : 'bg-green-500'
                          }`}
                        />
                        <span className={item.quantity <= item.minThreshold ? 'text-destructive text-sm font-semibold' : 'text-green-600 text-sm font-semibold'}>
                          {item.quantity <= item.minThreshold ? 'Low Stock' : 'Adequate'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.specification}</p>
                  </div>
                  <div className="border-t p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => openDetailView(item, 'inventory')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${selectedInventory.has(item.id) ? 'bg-primary/5' : ''}`}>
                      <td className="text-center py-2.5 px-4">
                        <input type="checkbox" checked={selectedInventory.has(item.id)} onChange={() => toggleInventorySelection(item.id)} className="cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-4 font-medium">{item.name}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{item.department}</td>
                      <td className="py-2.5 px-4">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell text-xs">{item.unit || "units"}</td>
                      <td className="py-2.5 px-4 text-muted-foreground truncate max-w-xs hidden md:table-cell">{item.specification}</td>
                      <td className="text-center py-2.5 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openDetailView(item, 'inventory')}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-3.5 w-3.5" /> List View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'detail' ? 'default' : 'outline'}
                onClick={() => setViewMode('detail')}
                className="gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Detail View
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedLowStock(new Set(lowStockItems.map(i => i.id)));
              setTimeout(() => generateLowStockCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          
          {viewMode === 'detail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
                  <div className="bg-destructive/10 p-4 border-b border-destructive/30">
                    <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.department}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Current Qty</p>
                        <p className="text-2xl font-bold text-destructive mt-1">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Min Threshold</p>
                        <p className="text-2xl font-bold text-primary mt-1">{item.minThreshold}</p>
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 text-center">
                      <p className="text-xs text-destructive font-bold">Deficit: {item.minThreshold - item.quantity} units</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.specification}</p>
                  </div>
                  <div className="border-t p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => openDetailView(item, 'lowstock')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {lowStockItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>All items are adequately stocked</p>
                </div>
              )}
            </div>
          ) : (
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
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${selectedLowStock.has(item.id) ? 'bg-primary/5' : ''}`}>
                      <td className="text-center py-2.5 px-4">
                        <input type="checkbox" checked={selectedLowStock.has(item.id)} onChange={() => toggleLowStockSelection(item.id)} className="cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-4 font-medium">{item.name}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{item.department}</td>
                      <td className="py-2.5 px-4 text-destructive font-semibold">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell text-xs">{item.unit || "units"}</td>
                      <td className="py-2.5 px-4">{item.minThreshold}</td>
                      <td className="py-2.5 px-4"><span className="bg-destructive/10 text-destructive px-2 py-1 rounded text-xs font-semibold">{item.minThreshold - item.quantity}</span></td>
                      <td className="text-center py-2.5 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openDetailView(item, 'lowstock')}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {lowStockItems.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">All items are adequately stocked</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-3.5 w-3.5" /> List View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'detail' ? 'default' : 'outline'}
                onClick={() => setViewMode('detail')}
                className="gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Detail View
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              setSelectedTransactions(new Set(filteredTx.map(t => t.id)));
              setTimeout(() => generateTransactionsCSV(), 0);
            }}>
              <Download className="h-3.5 w-3.5" /> Export CSV (All)
            </Button>
          </div>
          
          {viewMode === 'detail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTx.map((tx) => (
                <div key={tx.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`${tx.type === 'Stock In' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' : 'bg-gradient-to-r from-red-500/10 to-orange-500/10'} p-4 border-b`}>
                    <div className="flex items-center gap-2 justify-between">
                      <h3 className="font-bold text-lg text-foreground">{tx.itemName}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        tx.type === "Stock In" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Quantity</p>
                        <p className={`text-2xl font-bold mt-1 ${
                          tx.type === "Stock In" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Department</p>
                        <p className="text-sm font-semibold mt-1">{tx.department}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Processed By</p>
                      <p className="text-sm">{tx.user}</p>
                    </div>
                    {tx.notes && <p className="text-xs text-muted-foreground line-clamp-2 bg-muted p-2 rounded">{tx.notes}</p>}
                  </div>
                  <div className="border-t p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => openDetailView(tx, 'transaction')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx) => (
                    <tr key={tx.id} className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${selectedTransactions.has(tx.id) ? 'bg-primary/5' : ''}`}>
                      <td className="text-center py-2.5 px-4">
                        <input type="checkbox" checked={selectedTransactions.has(tx.id)} onChange={() => toggleTransactionSelection(tx.id)} className="cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{tx.date}</td>
                      <td className="py-2.5 px-4 font-medium">{tx.itemName}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tx.type === "Stock In" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">{tx.quantity}</td>
                      <td className="py-2.5 px-4 text-muted-foreground hidden md:table-cell">{tx.user}</td>
                      <td className="py-2.5 px-4 text-muted-foreground hidden lg:table-cell">{tx.notes || "—"}</td>
                      <td className="text-center py-2.5 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openDetailView(tx, 'transaction')}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-3.5 w-3.5" /> List View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'detail' ? 'default' : 'outline'}
                onClick={() => setViewMode('detail')}
                className="gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Detail View
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{stockOutTx.length} records</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                setSelectedStockOut(new Set(stockOutTx.map(t => t.id)));
                setTimeout(() => generateStockOutCSV(), 0);
              }}>
                <Download className="h-3.5 w-3.5" /> Export CSV (All)
              </Button>
            </div>
          </div>
          
          {viewMode === 'detail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockOutTx.map((tx) => {
                const recipientMatch = tx.notes?.match(/Recipient: ([^|]+)/);
                const recipient = recipientMatch ? recipientMatch[1].trim() : "—";
                return (
                  <div key={tx.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
                    <div className="bg-destructive/10 p-4 border-b border-destructive/30">
                      <h3 className="font-bold text-lg text-foreground">{tx.itemName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Quantity Issued</p>
                          <p className="text-2xl font-bold text-destructive mt-1">{tx.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Department</p>
                          <p className="text-sm font-semibold mt-1">{tx.department}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold mb-1">Recipient</p>
                        <p className="text-sm">{recipient}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold mb-1">Processed By</p>
                        <p className="text-sm">{tx.user}</p>
                      </div>
                    </div>
                    <div className="border-t p-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => openDetailView(tx, 'transaction')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteTransaction(tx.id, tx.itemName)}
                        disabled={isDeleting}
                        title="Delete this record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {stockOutTx.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No stock out records found</p>
                </div>
              )}
            </div>
          ) : (
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
                        <tr key={tx.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${selectedStockOut.has(tx.id) ? 'bg-primary/5' : ''}`}>
                          <td className="text-center py-3 px-4">
                            <input type="checkbox" checked={selectedStockOut.has(tx.id)} onChange={() => toggleStockOutSelection(tx.id)} className="cursor-pointer" />
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">{tx.date}</td>
                          <td className="py-3 px-4 font-medium">{tx.itemName}</td>
                          <td className="py-3 px-4 font-semibold text-destructive">{tx.quantity}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">{recipient}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-xs">{otherNotes || "—"}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell text-xs">{tx.user}</td>
                          <td className="py-3 px-4 text-right flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              onClick={() => openDetailView(tx, 'transaction')}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
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
          )}
        </TabsContent>

        <TabsContent value="stock-in" className="space-y-4">
          {selectedStockIn.size > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium">{selectedStockIn.size} record(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={generateStockInCSV}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handlePrintSelected}>
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
                <Button size="sm" variant="destructive" className="gap-2" onClick={handleBulkDeleteStockIn} disabled={isDeleting}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-3.5 w-3.5" /> List View
              </Button>
              <Button 
                size="sm" 
                variant={viewMode === 'detail' ? 'default' : 'outline'}
                onClick={() => setViewMode('detail')}
                className="gap-2"
              >
                <Eye className="h-3.5 w-3.5" /> Detail View
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{stockInTx.length} records</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                setSelectedStockIn(new Set(stockInTx.map(t => t.id)));
                setTimeout(() => generateStockInCSV(), 0);
              }}>
                <Download className="h-3.5 w-3.5" /> Export CSV (All)
              </Button>
            </div>
          </div>
          
          {viewMode === 'detail' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockInTx.map((tx) => (
                <div key={tx.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="bg-green-100/50 p-4 border-b border-green-200">
                    <h3 className="font-bold text-lg text-foreground">{tx.itemName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Quantity Received</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{tx.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Department</p>
                        <p className="text-sm font-semibold mt-1">{tx.department}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Supplier/Source</p>
                      <p className="text-sm">{tx.notes || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Received By</p>
                      <p className="text-sm">{tx.user}</p>
                    </div>
                  </div>
                  <div className="border-t p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => openDetailView(tx, 'transaction')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteTransaction(tx.id, tx.itemName)}
                      disabled={isDeleting}
                      title="Delete this record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {stockInTx.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <ArrowDownToLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No stock in records found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-center py-3 px-4 w-10">
                      <input type="checkbox" checked={selectedStockIn.size === stockInTx.length && stockInTx.length > 0} onChange={(e) => toggleAllStockIn(e.target.checked)} className="cursor-pointer" />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Item</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden md:table-cell">Supplier/Source</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden lg:table-cell">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground hidden xl:table-cell">User</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockInTx.length > 0 ? (
                    stockInTx.map((tx) => (
                      <tr key={tx.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${selectedStockIn.has(tx.id) ? 'bg-primary/5' : ''}`}>
                        <td className="text-center py-3 px-4">
                          <input type="checkbox" checked={selectedStockIn.has(tx.id)} onChange={() => toggleStockInSelection(tx.id)} className="cursor-pointer" />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{tx.date}</td>
                        <td className="py-3 px-4 font-medium">{tx.itemName}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">{tx.quantity}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">{tx.notes || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-xs">{tx.department}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell text-xs">{tx.user}</td>
                        <td className="py-3 px-4 text-right flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => openDetailView(tx, 'transaction')}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteTransaction(tx.id, tx.itemName)}
                            disabled={isDeleting}
                            title="Delete this stock in record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No stock in records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

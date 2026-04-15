import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, Trash2, Edit2, Copy, AlertCircle, Clock, Link2, 
  MessageSquare, ChevronRight, TrendingUp, TrendingDown, BarChart3 
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { InventoryItem, Transaction } from '@/types/inventory';
import html2pdf from 'html2pdf.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportDetailViewEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: InventoryItem | Transaction | null;
  reportType: 'inventory' | 'transaction' | 'lowstock' | null;
  onDelete?: (id: string) => void;
  onEdit?: (data: any) => void;
}

// Mock audit trail data - in real app this would come from backend
const mockAuditTrail = [
  { action: 'Created', user: 'System Admin', timestamp: '2024-01-15 10:30 AM', details: 'Initial report creation' },
  { action: 'Updated', user: 'John Doe', timestamp: '2024-01-15 12:45 PM', details: 'Quantity adjustment' },
  { action: 'Exported', user: 'Jane Smith', timestamp: '2024-01-15 03:20 PM', details: 'PDF export' },
];

// Mock timeline data
const mockTimeline = [
  { event: 'Stock Received', date: '2024-01-10', quantity: '+50 units', status: 'completed' },
  { event: 'Stock Issued', date: '2024-01-14', quantity: '-15 units', status: 'completed' },
  { event: 'Inventory Check', date: '2024-01-15', quantity: 'Verified OK', status: 'completed' },
  { event: 'Low Stock Alert', date: '2024-01-16', quantity: 'Below threshold', status: 'pending' },
];

// Mock related items
const mockRelatedItems = [
  { id: 'RLT001', name: 'Related Item 1', status: 'in-stock', quantity: 45 },
  { id: 'RLT002', name: 'Related Item 2', status: 'low-stock', quantity: 8 },
  { id: 'RLT003', name: 'Related Item 3', status: 'in-stock', quantity: 120 },
];

// Mock notes
const mockNotes = [
  { id: 1, author: 'John Doe', date: '2024-01-15 10:30 AM', text: 'Initial check completed. All items accounted for.' },
  { id: 2, author: 'Jane Smith', date: '2024-01-15 02:15 PM', text: 'Standard re-stocking performed. No discrepancies found.' },
];

export function ReportDetailViewEnhanced({
  isOpen,
  onClose,
  reportData,
  reportType,
  onDelete,
  onEdit,
}: ReportDetailViewEnhancedProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !reportData) return null;

  const isInventory = reportType === 'inventory' || reportType === 'lowstock';
  const item = reportData as InventoryItem;
  const tx = reportData as Transaction;

  const handleDeleteReport = async () => {
    if (!reportData?.id) return;
    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(reportData.id);
        toast.success('Report deleted successfully');
        setDeleteDialogOpen(false);
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(reportData.id);
    toast.success('ID copied to clipboard');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast.success('Note added successfully');
    setNewNote('');
  };

  const handlePrintPDF = () => {
    if (!reportData) return;

    const exportElement = document.createElement('div');
    exportElement.style.cssText = `
      width: 100%;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: white;
      color: #1a1a1a;
    `;

    const headerHTML = `
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1e5a96; padding-bottom: 15px;">
        <div style="font-size: 22px; font-weight: bold; color: #1e5a96 !important; margin-bottom: 5px;">SawelaCapellaLodge</div>
        <div style="font-size: 14px; color: #666 !important; margin-bottom: 8px;">Inventory System - Detailed Report Export</div>
        <div style="font-size: 11px; color: #999 !important;">Generated: ${new Date().toLocaleString()}</div>
      </div>
    `;

    const titleHTML = isInventory
      ? `
        <div style="margin-bottom: 25px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #1e5a96 !important; margin: 0 0 10px 0;">
            Inventory Item: ${item.name}
          </h1>
          <p style="font-size: 12px; color: #666 !important; margin: 0;">
            Item ID: <code style="background-color: #e9ecef; color: #1a1a1a !important; padding: 2px 6px; border-radius: 3px;">${item.id}</code>
          </p>
        </div>
      `
      : `
        <div style="margin-bottom: 25px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #1e5a96 !important; margin: 0 0 10px 0;">
            Transaction Report: ${tx.type} - ${tx.itemName}
          </h1>
          <p style="font-size: 12px; color: #666 !important; margin: 0;">
            Item ID: <code style="background-color: #e9ecef; color: #1a1a1a !important; padding: 2px 6px; border-radius: 3px;">${tx.id}</code>
          </p>
        </div>
      `;

    const statsHTML = isInventory
      ? `
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Current Stock</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e5a96 !important;">${item.quantity}</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Min. Threshold</div>
            <div style="font-size: 18px; font-weight: 700; color: #1e5a96 !important;">${item.minThreshold || 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Location</div>
            <div style="font-size: 14px; font-weight: 600; color: #1a1a1a !important;">${item.location || 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Status</div>
            <div style="font-size: 14px; font-weight: 600; color: #1e5a96 !important;">Active</div>
          </div>
        </div>
      `
      : `
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Transaction Type</div>
            <div style="font-size: 16px; font-weight: 700; color: #1e5a96 !important;">${tx.type}</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Quantity</div>
            <div style="font-size: 16px; font-weight: 700; color: #1e5a96 !important;">${tx.quantity}</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 600; color: #666 !important; text-transform: uppercase; margin-bottom: 5px;">Date</div>
            <div style="font-size: 14px; font-weight: 600; color: #1a1a1a !important;">${new Date(tx.date || Date.now()).toLocaleDateString()}</div>
          </div>
        </div>
      `;

    const detailsHTML = isInventory
      ? `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 14px; font-weight: 600; color: #1e5a96 !important; margin: 0 0 15px 0; border-left: 3px solid #1e5a96; padding-left: 10px;">Item Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Item Name</div>
              <div style="font-size: 13px; font-weight: 600; color: #1a1a1a !important;">${item.name}</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Category</div>
              <div style="font-size: 13px; font-weight: 600; color: #1a1a1a !important;">${item.category || '—'}</div>
            </div>
          </div>
          <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; margin-bottom: 15px;">
            <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Description</div>
            <div style="font-size: 12px; color: #2d3436 !important;">${item.description || 'No description available'}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Location</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${item.location || '—'}</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Current Stock</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${item.quantity} units</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Min. Threshold</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${item.minThreshold || '—'}</div>
            </div>
          </div>
        </div>
      `
      : `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 14px; font-weight: 600; color: #1e5a96 !important; margin: 0 0 15px 0; border-left: 3px solid #1e5a96; padding-left: 10px;">Transaction Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Item Name</div>
              <div style="font-size: 13px; font-weight: 600; color: #1a1a1a !important;">${tx.itemName}</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Type</div>
              <div style="font-size: 13px; font-weight: 600; color: ${tx.type === 'Stock In' ? '#16a34a' : '#ea580c'} !important;">${tx.type === 'Stock In' ? '➕' : '➖'} ${tx.type}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Previous Qty</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${tx.previousQuantity || '—'}</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Quantity</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${tx.quantity}</div>
            </div>
            <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
              <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">New Qty</div>
              <div style="font-size: 13px; font-weight: 600; color: #1e5a96 !important;">${tx.newQuantity || '—'}</div>
            </div>
          </div>
          <div style="padding: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">
            <div style="font-size: 10px; font-weight: 600; color: #4b5563 !important; text-transform: uppercase; margin-bottom: 8px;">Notes</div>
            <div style="font-size: 12px; color: #2d3436 !important;">${tx.notes || 'No notes available'}</div>
          </div>
        </div>
      `;

    const footerHTML = `
      <div style="margin-top: 25px; padding-top: 15px; border-top: 2px solid #dee2e6; text-align: center; font-size: 10px; color: #999 !important;">
        <p style="margin: 0; color: #999 !important;">This is an automated report generated by SawelaCapellaLodge Inventory System</p>
        <p style="margin: 5px 0 0 0; color: #999 !important;">For official use only | Confidential</p>
      </div>
    `;

    const styleHTML = `
      <style>
        * { color: #1a1a1a !important; }
        body { background-color: white; }
        code { background-color: #e9ecef !important; color: #1a1a1a !important; padding: 2px 6px; border-radius: 3px; font-size: 11px; }
      </style>
    `;

    exportElement.innerHTML = styleHTML + headerHTML + titleHTML + statsHTML + detailsHTML + footerHTML;

    const opt = {
      margin: 10,
      filename: `report-${reportData.id}-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(exportElement).save();
    toast.success('PDF downloaded successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with Quick Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-25 border-b sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#1e5a96] mb-1">
                  {isInventory ? `${item.name}` : `${tx.type} - ${tx.itemName}`}
                </h2>
                <div className="flex items-center gap-2 text-sm text-[#4b5563]">
                  <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300">
                    {reportData.id.substring(0, 16)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="h-auto p-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintPDF}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(reportData)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {isInventory ? (
                <>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Current Stock</div>
                      <div className="text-2xl font-bold text-[#1e5a96]">{item.quantity}</div>
                      <div className="text-xs text-[#6b7280] mt-1">units</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Min. Threshold</div>
                      <div className="text-2xl font-bold text-[#1e5a96]">{item.minThreshold || '—'}</div>
                      <div className="text-xs text-[#6b7280] mt-1">alert level</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Status</div>
                      <div className={`text-sm font-bold ${item.quantity < (item.minThreshold || 10) ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity < (item.minThreshold || 10) ? '⚠️ Low' : '✓ OK'}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-1">condition</div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Type</div>
                      <div className={`text-lg font-bold ${tx.type === 'Stock In' ? 'text-green-600' : 'text-orange-600'}`}>
                        {tx.type === 'Stock In' ? '➕' : '➖'} {tx.type}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-1">transaction</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Quantity</div>
                      <div className="text-2xl font-bold text-[#1e5a96]">{tx.quantity}</div>
                      <div className="text-xs text-[#6b7280] mt-1">units</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Date</div>
                      <div className="text-lg font-bold text-[#1e5a96]">
                        {new Date(tx.date || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-[#6b7280] mt-1">recorded</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-none bg-white">
                    <CardContent className="p-3">
                      <div className="text-xs font-semibold text-[#4b5563] uppercase mb-1">Status</div>
                      <div className="text-sm font-bold text-green-600">✓ Completed</div>
                      <div className="text-xs text-[#6b7280] mt-1">verified</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="p-6 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="related" className="gap-2">
                <Link2 className="h-4 w-4" />
                Related
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Audit Trail
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Item Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {isInventory ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Item Name</Label>
                            <p className="text-lg font-semibold text-[#1a1a1a] mt-1">{item.name}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Category</Label>
                            <p className="text-lg font-semibold text-[#1a1a1a] mt-1">{item.category || '—'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-[#4b5563] uppercase">Description</Label>
                          <p className="text-[#2d3436] mt-1">{item.description || 'No description available'}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Location</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{item.location || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Current Stock</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{item.quantity}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Min. Threshold</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{item.minThreshold || '—'}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Item Name</Label>
                            <p className="text-lg font-semibold text-[#1a1a1a] mt-1">{tx.itemName}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Type</Label>
                            <p className={`text-lg font-semibold mt-1 ${tx.type === 'Stock In' ? 'text-green-600' : 'text-orange-600'}`}>
                              {tx.type === 'Stock In' ? '➕' : '➖'} {tx.type}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Previous Qty</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{tx.previousQuantity || '—'}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">Quantity</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{tx.quantity}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#4b5563] uppercase">New Qty</Label>
                            <p className="text-lg font-semibold text-[#1e5a96] mt-1">{tx.newQuantity || '—'}</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <Label className="text-xs font-semibold text-[#4b5563] uppercase">Notes</Label>
                          <p className="text-[#2d3436] mt-1">{tx.notes || 'No notes available'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {mockTimeline.map((item, idx) => (
                      <div key={idx} className="flex gap-4 pb-4 last:pb-0 border-b last:border-0">
                        <div className="mt-1">
                          <div className={`h-3 w-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[#1a1a1a]">{item.event}</p>
                              <p className="text-sm text-[#4b5563] mt-1">{item.quantity}</p>
                            </div>
                            <span className="text-xs text-[#6b7280]">{item.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Related Items Tab */}
            <TabsContent value="related" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Related Items</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {mockRelatedItems.map((relItem) => (
                      <div key={relItem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50">
                        <div className="flex-1">
                          <p className="font-semibold text-[#1a1a1a]">{relItem.name}</p>
                          <p className="text-xs text-[#4b5563]">{relItem.id}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${relItem.status === 'in-stock' ? 'text-green-600' : 'text-orange-600'}`}>
                            {relItem.status === 'in-stock' ? '✓' : '⚠'} {relItem.quantity} units
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Trail Tab */}
            <TabsContent value="audit" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Action</TableHead>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Timestamp</TableHead>
                        <TableHead className="text-xs">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAuditTrail.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm font-semibold text-[#1e5a96]">{entry.action}</TableCell>
                          <TableCell className="text-sm text-[#1a1a1a]">{entry.user}</TableCell>
                          <TableCell className="text-xs text-[#4b5563]">{entry.timestamp}</TableCell>
                          <TableCell className="text-sm text-[#2d3436]">{entry.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 mt-0">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Notes & Comments</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Add New Note */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <Label className="text-sm font-semibold text-[#1a1a1a]">Add a Note</Label>
                      <Textarea
                        placeholder="Write your comments here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="mt-2 resize-none text-[#1a1a1a]"
                        rows={3}
                      />
                      <Button
                        onClick={handleAddNote}
                        className="mt-2 bg-[#1e5a96] hover:bg-[#1e5a96]/90"
                      >
                        Add Note
                      </Button>
                    </div>

                    {/* Existing Notes */}
                    <div className="space-y-3 mt-4">
                      {mockNotes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-[#1a1a1a]">{note.author}</p>
                            <span className="text-xs text-[#6b7280]">{note.date}</span>
                          </div>
                          <p className="text-[#2d3436] text-sm">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={handleDeleteReport}
            className="bg-destructive text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

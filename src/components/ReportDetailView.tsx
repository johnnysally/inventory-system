import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, Edit2, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
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

interface ReportDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: InventoryItem | Transaction | null;
  reportType: 'inventory' | 'transaction' | 'lowstock' | null;
  onDelete?: (id: string) => void;
  onEdit?: (data: any) => void;
}

export function ReportDetailView({
  isOpen,
  onClose,
  reportData,
  reportType,
  onDelete,
  onEdit,
}: ReportDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!isOpen || !reportData) return null;

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

  const handlePrintPDF = () => {
    if (!reportData) return;

    const element = document.getElementById('report-table-content');
    if (!element) return;

    const opt = {
      margin: 15,
      filename: `report-${reportData.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded successfully');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(reportData.id);
    toast.success('ID copied to clipboard');
  };

  const isInventory = reportType === 'inventory' || reportType === 'lowstock';
  const item = reportData as InventoryItem;
  const tx = reportData as Transaction;

  const renderInventoryDetail = (item: InventoryItem) => (
    <div id="report-table-content" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📦 Inventory Information
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="w-1/3 font-semibold bg-muted/30">Item ID</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{item.id}</code>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy ID"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Item Name</TableCell>
                <TableCell className="font-semibold text-primary">{item.name}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Department</TableCell>
                <TableCell>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {item.department}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Specification</TableCell>
                <TableCell className="text-sm">{item.specification}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Unit</TableCell>
                <TableCell>{item.unit || 'units'}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Date Added</TableCell>
                <TableCell>{item.dateAdded}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Stock Status
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="w-1/3 font-semibold bg-muted/30">Current Quantity</TableCell>
                <TableCell>
                  <span className="text-2xl font-bold text-primary">{item.quantity}</span>
                  <span className="text-sm text-muted-foreground ml-2">{item.unit || 'units'}</span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Minimum Threshold</TableCell>
                <TableCell className="text-lg font-semibold">{item.minThreshold}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Status</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.quantity <= item.minThreshold ? 'bg-destructive animate-pulse' : 'bg-green-500'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        item.quantity <= item.minThreshold
                          ? 'text-destructive'
                          : 'text-green-600'
                      }`}
                    >
                      {item.quantity <= item.minThreshold ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Low Stock Warning
                        </div>
                      ) : (
                        'Adequate Stock'
                      )}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Stock Coverage</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.quantity <= item.minThreshold
                            ? 'bg-destructive'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((item.quantity / (item.minThreshold || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((item.quantity / (item.minThreshold || 1)) * 100).toFixed(1)}% of minimum threshold
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  const renderTransactionDetail = (tx: Transaction) => (
    <div id="report-table-content" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🔄 Transaction Information
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="w-1/3 font-semibold bg-muted/30">Transaction ID</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{tx.id}</code>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy ID"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Item Name</TableCell>
                <TableCell className="font-semibold text-primary">{tx.itemName}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Type</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
                      tx.type === 'Stock In'
                        ? 'bg-green-500/20 text-green-700'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {tx.type === 'Stock In' ? '⬆️' : '⬇️'} {tx.type}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Department</TableCell>
                <TableCell>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {tx.department}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Date</TableCell>
                <TableCell>{tx.date}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📈 Quantity & Personnel
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="w-1/3 font-semibold bg-muted/30">Quantity</TableCell>
                <TableCell>
                  <span className="text-2xl font-bold text-primary">{tx.quantity}</span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-accent/50">
                <TableCell className="font-semibold bg-muted/30">Processed By</TableCell>
                <TableCell className="font-semibold">{tx.user}</TableCell>
              </TableRow>
              {tx.notes && (
                <TableRow className="hover:bg-accent/50">
                  <TableCell className="font-semibold bg-muted/30">Notes</TableCell>
                  <TableCell className="text-sm">{tx.notes}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h1 className="text-2xl font-bold">
                {isInventory ? 'Inventory Report Details' : 'Transaction Report Details'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isInventory ? `Item: ${item.name}` : `Transaction: ${tx.type} - ${tx.itemName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <CardContent className="p-6 space-y-6">
            {isInventory && renderInventoryDetail(item)}
            {!isInventory && renderTransactionDetail(tx)}

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-semibold mb-3 text-muted-foreground">SUMMARY STATISTICS</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">ID</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">{reportData.id.substring(0, 8)}...</code>
                </div>
                {isInventory && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">DEPT</p>
                      <p className="text-sm font-semibold mt-1">{item.department}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">QTY</p>
                      <p className="text-lg font-bold text-primary mt-1">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">MIN</p>
                      <p className="text-sm font-semibold mt-1">{item.minThreshold}</p>
                    </div>
                  </>
                )}
                {!isInventory && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">TYPE</p>
                      <p className="text-sm font-semibold mt-1">{tx.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">QTY</p>
                      <p className="text-lg font-bold text-primary mt-1">{tx.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">USER</p>
                      <p className="text-sm font-semibold mt-1">{tx.user}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>

          {/* Action Footer */}
          <div className="border-t p-6 flex flex-wrap items-center justify-between gap-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Report ID: <code>{reportData.id}</code>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handlePrintPDF}
                variant="outline"
                className="gap-2"
                title="Download as PDF"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>

              <Button
                onClick={handleCopyId}
                variant="outline"
                className="gap-2"
                title="Copy report ID"
              >
                <Copy className="h-4 w-4" />
                Copy ID
              </Button>

              {onEdit && (
                <Button
                  onClick={() => {
                    if (onEdit) onEdit(reportData);
                    onClose();
                  }}
                  variant="outline"
                  className="gap-2"
                  title="Edit this report"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              )}

              {onDelete && (
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive"
                  title="Delete this report"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}

              <Button onClick={onClose} className="gap-2">
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {isInventory ? 'inventory item' : 'transaction'}? This action
              cannot be undone.
              {isInventory && (
                <div className="mt-3 p-3 bg-destructive/10 rounded text-sm text-destructive">
                  <strong>Item:</strong> {item.name}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

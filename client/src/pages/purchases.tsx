import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Plus, Trash2, Package, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getPurchases,
  createPurchase,
  getItems,
  getSuppliers,
  createSupplier,
  getRawMaterials,
  createRawMaterial,
} from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/format";
import { useEffect } from "react";
import { ItemForm } from "@/components/ItemForm";

const SUPPLIERS_KEY = ["/api/suppliers"];
const RAW_MATERIALS_KEY = ["/api/raw-materials"];

interface PurchaseItem {
  itemId: string;
  quantity: string;
  totalCost: string;
}

export default function Purchases() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSupplierSelectOpen, setIsSupplierSelectOpen] = useState(false);
  const [reopenSupplierSelect, setReopenSupplierSelect] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [addItemRowIndex, setAddItemRowIndex] = useState<number | null>(null);
  const [viewPurchase, setViewPurchase] = useState<any | null>(null);

  // Form state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { itemId: "", quantity: "", totalCost: "" },
  ]);

  // New Supplier Form State
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierEmail, setNewSupplierEmail] = useState("");

  const { toast } = useToast();

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["/api/purchases"],
    queryFn: () => getPurchases(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    onSuccess: (fetched) => {
      console.log("Purchases fetched:", fetched);
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: RAW_MATERIALS_KEY,
    queryFn: getRawMaterials,
    staleTime: 0,
    select: (fetched) => {
      const cached = (queryClient.getQueryData(RAW_MATERIALS_KEY) as any[]) || [];
      const byId = new Map<string, any>();
      cached.forEach((c) => byId.set(c.id, c));
      fetched.forEach((f: any) => byId.set(f.id, f));
      const merged = Array.from(byId.values());
      queryClient.setQueryData(RAW_MATERIALS_KEY, merged);
      console.log("Raw materials merged (select):", merged);
      return merged;
    },
  });
  const rawItems = items.filter((item: any) => item.type === "RAW");

  const { data: suppliers = [] } = useQuery({
    queryKey: SUPPLIERS_KEY,
    queryFn: () => getSuppliers(),
    staleTime: 0,
    select: (fetched) => {
      const cached = (queryClient.getQueryData(SUPPLIERS_KEY) as any[]) || [];
      // Prefer fetched data for existing ids, but include optimistic ones too
      const byId = new Map<string, any>();
      cached.forEach((c) => byId.set(c.id, c));
      fetched.forEach((f: any) => byId.set(f.id, f));
      const merged = Array.from(byId.values());
      queryClient.setQueryData(SUPPLIERS_KEY, merged);
      console.log("Suppliers merged (select):", merged);
      return merged;
    },
  });

  // Debug: log supplier list when it changes and optionally reopen select
  useEffect(() => {
    console.log("Suppliers fetched:", suppliers);
    if (reopenSupplierSelect) {
      setIsSupplierSelectOpen(true);
      setReopenSupplierSelect(false);
    }
  }, [suppliers, reopenSupplierSelect]);

  const createPurchaseMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: async (newPurchase) => {
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      // Optimistically add the new purchase
      queryClient.setQueryData(["/api/purchases"], (oldData: any) => {
        return oldData ? [newPurchase, ...oldData] : [newPurchase];
      });
      // Force a fresh fetch and replace cache with server truth
      const fresh = await queryClient.fetchQuery({
        queryKey: ["/api/purchases"],
        queryFn: () => getPurchases(),
      });
      queryClient.setQueryData(["/api/purchases"], fresh);
      console.log("Purchases refreshed after create:", fresh);
      console.log("Purchase history now:", queryClient.getQueryData(["/api/purchases"]));

      queryClient.invalidateQueries({ queryKey: ["/api/stock/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock/movements"] });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: async (created) => {
      console.log("Supplier created:", created);
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
      // Start with current list plus the created supplier (dedupe by id)
      const mergedLocal = [
        ...suppliers.filter((s: any) => s.id !== created.id),
        created,
      ];
      queryClient.setQueryData(SUPPLIERS_KEY, mergedLocal);

      // Optionally let a background invalidate run, but keep the optimistic list to avoid drops
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      console.log("Suppliers cache after create (optimistic):", mergedLocal);

      if (created?.id) {
        setSelectedSupplier(created.id);
        setIsSupplierSelectOpen(false);
        setReopenSupplierSelect(true);
      }
      setIsAddSupplierDialogOpen(false);
      setNewSupplierName("");
      setNewSupplierPhone("");
      setNewSupplierEmail("");
    },
    onError: (error: any) => {
      console.error("Create supplier failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create supplier",
        variant: "destructive",
      });
    },
  });

  const createRawMaterialMutation = useMutation({
    mutationFn: (input: { payload: any; initialQuantity?: number }) =>
      createRawMaterial(input.payload),
    onSuccess: (created, variables: any) => {
      console.log("Item created:", created);
      queryClient.setQueryData(RAW_MATERIALS_KEY, (old: any) => {
        const existing = Array.isArray(old) ? old : [];
        return [...existing.filter((i: any) => i.id !== created.id), created];
      });
      queryClient.setQueryData(["/api/items"], (old: any) => {
        const existing = Array.isArray(old) ? old : [];
        return [...existing.filter((i: any) => i.id !== created.id), created];
      });
      queryClient.invalidateQueries({ queryKey: RAW_MATERIALS_KEY });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      if (addItemRowIndex !== null) {
        updatePurchaseItem(addItemRowIndex, "itemId", created.id);
        // Prefill quantity and total cost so the row is usable immediately
        const defaultQtyRaw =
          variables?.initialQuantity ??
          variables?.initial_quantity ??
          created.initialQuantity ??
          1;
        const defaultQty = Number(defaultQtyRaw) > 0 ? Number(defaultQtyRaw) : 1;
        const price = Number(
          variables?.payload?.price ?? variables?.price ?? created.price ?? 0
        );
        const total = price && defaultQty ? price * defaultQty : 0;
        updatePurchaseItem(addItemRowIndex, "quantity", String(defaultQty));
        updatePurchaseItem(
          addItemRowIndex,
          "totalCost",
          total ? total.toFixed(2) : "0.00"
        );
      }
      setIsAddItemDialogOpen(false);
      setAddItemRowIndex(null);
      toast({
        title: "Success",
        description: "Item created and added to list",
      });
    },
    onError: (error: any) => {
      console.error("Create item failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedSupplier("");
    setNotes("");
    setPurchaseItems([{ itemId: "", quantity: "", totalCost: "" }]);
  };

  const handleCreatePurchase = () => {
    const validItems = purchaseItems.filter(
      (item) => item.itemId && item.quantity && item.totalCost
    );

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid purchase item",
        variant: "destructive",
      });
      return;
    }

    createPurchaseMutation.mutate({
      supplierId: selectedSupplier || undefined,
      notes: notes || undefined,
      items: validItems,
    });
  };

  const handleCreateSupplier = () => {
    if (!newSupplierName) {
      toast({
        title: "Error",
        description: "Please enter supplier name",
        variant: "destructive",
      });
      return;
    }
    createSupplierMutation.mutate({
      name: newSupplierName,
      phone: newSupplierPhone || undefined,
      email: newSupplierEmail || undefined,
    });
  };

  const addPurchaseItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { itemId: "", quantity: "", totalCost: "" },
    ]);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updatePurchaseItem = (
    index: number,
    field: keyof PurchaseItem,
    value: string
  ) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    setPurchaseItems(updated);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((total, item) => {
      return total + (parseFloat(item.totalCost) || 0);
    }, 0);
  };

  const calculateUnitCost = (totalCost: string, quantity: string) => {
    const total = parseFloat(totalCost);
    const qty = parseFloat(quantity);
    if (total > 0 && qty > 0) {
      return (total / qty).toFixed(2);
    }
    return "0.00";
  };

  return (
    <Layout
      title="Purchase Orders"
      description="Create and manage inventory purchase orders"
    >
      {/* Action Bar */}
      <div
        className="flex items-center justify-between mb-6"
        data-testid="purchases-actions"
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-purchase-button">
              <Plus className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            data-testid="create-purchase-dialog"
          >
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Select a supplier, add items, and specify quantities to create a
                new purchase order.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier">Supplier (optional)</Label>
                  <Select
                    open={isSupplierSelectOpen}
                    onOpenChange={setIsSupplierSelectOpen}
                    value={selectedSupplier}
                    onValueChange={(value) => {
                      if (value === "add-new") {
                        setIsAddSupplierDialogOpen(true);
                        setIsSupplierSelectOpen(false);
                      } else {
                        setSelectedSupplier(value);
                        setIsSupplierSelectOpen(false);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="supplier-select">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add-new">Add New Supplier</SelectItem>
                      {suppliers.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Purchase order notes..."
                    className="h-[60px]"
                    data-testid="notes-input"
                  />
                </div>
              </div>

              {/* Purchase Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Purchase Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPurchaseItem}
                    data-testid="add-purchase-item-button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4" data-testid="purchase-items">
                  {purchaseItems.map((item, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-5">
                          <Label>Item</Label>
                          <Select
                            value={item.itemId}
                            onValueChange={(value) => {
                              if (value === "add-new-item") {
                                setAddItemRowIndex(index);
                                setIsAddItemDialogOpen(true);
                                return;
                              }
                              updatePurchaseItem(index, "itemId", value);
                            }}
                          >
                            <SelectTrigger data-testid={`item-select-${index}`}>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="add-new-item">Add New Item</SelectItem>
                              {rawItems.map((rawItem: any) => (
                                <SelectItem key={rawItem.id} value={rawItem.id}>
                                  {rawItem.name} ({rawItem.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.quantity}
                            onChange={(e) =>
                              updatePurchaseItem(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            data-testid={`quantity-input-${index}`}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Total Cost</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.totalCost}
                            onChange={(e) =>
                              updatePurchaseItem(
                                index,
                                "totalCost",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            data-testid={`cost-input-${index}`}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Unit Cost</Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            {formatCurrency(
                              calculateUnitCost(item.totalCost, item.quantity)
                            )}
                          </p>
                        </div>

                        <div className="col-span-1">
                          {purchaseItems.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePurchaseItem(index)}
                              data-testid={`remove-item-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Add New Item Dialog */}
              <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>Create a raw material to add to this purchase.</DialogDescription>
                  </DialogHeader>
                  <ItemForm
                    items={rawItems}
                    recipes={[]}
                    fixedType="RAW"
                    onSubmit={(values: any) => {
                      const { initialQuantity, initial_quantity, ...rest } = values || {};
                      const payload = { ...rest };
                      // Remove any client-only quantity fields before sending to API
                      delete (payload as any).initialQuantity;
                      delete (payload as any).initial_quantity;
                      createRawMaterialMutation.mutate({
                        payload,
                        initialQuantity:
                          initialQuantity ?? initial_quantity ?? undefined,
                      });
                    }}
                    isPending={createRawMaterialMutation.isPending}
                  />
                </DialogContent>
              </Dialog>

              {/* Total */}
              <Card className="p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total Purchase Cost:
                  </span>
                  <span className="text-2xl font-bold" data-testid="total-cost">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </Card>

              <Button
                onClick={handleCreatePurchase}
                disabled={createPurchaseMutation.isPending}
                className="w-full"
                data-testid="confirm-purchase-button"
              >
                {createPurchaseMutation.isPending
                  ? "Creating..."
                  : "Create Purchase Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add New Supplier Dialog */}
      <Dialog
        open={isAddSupplierDialogOpen}
        onOpenChange={setIsAddSupplierDialogOpen}
      >
        <DialogContent data-testid="add-supplier-dialog">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the new supplier's details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="e.g. Spar"
                data-testid="supplier-name-input"
              />
            </div>
            <div>
              <Label htmlFor="supplierPhone">Phone (optional)</Label>
              <Input
                id="supplierPhone"
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                placeholder="e.g. 123-456-7890"
                data-testid="supplier-phone-input"
              />
            </div>
            <div>
              <Label htmlFor="supplierEmail">Email (optional)</Label>
              <Input
                id="supplierEmail"
                type="email"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                placeholder="e.g. info@spar.com"
                data-testid="supplier-email-input"
              />
            </div>
            <Button
              onClick={handleCreateSupplier}
              disabled={createSupplierMutation.isPending}
              className="w-full"
              data-testid="create-supplier-button"
            >
              {createSupplierMutation.isPending
                ? "Creating..."
                : "Create Supplier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase History */}
      <Card data-testid="purchases-history-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Purchase History</CardTitle>
              <span className="text-sm text-muted-foreground">
                {`(${purchases?.length || 0} records)`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
                queryClient.refetchQueries({
                  queryKey: ["/api/purchases"],
                  exact: true,
                });
              }}
              data-testid="refresh-purchases-button"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {purchasesLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading purchases...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No purchase orders yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first purchase order to track inventory
              </p>
            </div>
          ) : (
            <Table data-testid="purchases-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase: any, index: number) => (
                  <TableRow
                    key={purchase.id}
                    data-testid={`purchase-row-${index}`}
                  >
                    <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      #{purchase.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {purchase.supplierId ? (
                        suppliers.find((s: any) => s.id === purchase.supplierId)
                          ?.name || "Unknown"
                      ) : (
                        <span className="text-muted-foreground">
                          No supplier
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {purchase.items?.length || 0} items
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {purchase.notes || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewPurchase(purchase)}
                        data-testid={`view-purchase-${index}`}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Purchase Details */}
      <Dialog
        open={Boolean(viewPurchase)}
        onOpenChange={(open) => {
          if (!open) {
            setViewPurchase(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl" data-testid="view-purchase-dialog">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>
              Review the items and costs for this purchase order.
            </DialogDescription>
          </DialogHeader>

          {viewPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Purchase ID</p>
                  <p className="font-mono">
                    #{viewPurchase.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatDate(viewPurchase.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier</p>
                  <p>
                    {viewPurchase.supplierId
                      ? suppliers.find((s: any) => s.id === viewPurchase.supplierId)
                          ?.name || "Unknown"
                      : "No supplier"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Notes</p>
                  <p className="break-words">
                    {viewPurchase.notes || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Cost</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      viewPurchase.items?.reduce(
                        (sum: number, item: any) =>
                          sum + (Number(item.totalCost) || 0),
                        0
                      ) || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Line Items</p>
                  <p>{viewPurchase.items?.length || 0} items</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Total Cost</TableHead>
                    <TableHead className="w-[120px]">Unit Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(viewPurchase.items || []).map((item: any) => {
                    const matchedItem =
                      rawItems.find((raw: any) => raw.id === item.itemId) ||
                      items.find((raw: any) => raw.id === item.itemId);
                    const unitCost =
                      Number(item.totalCost) && Number(item.quantity)
                        ? Number(item.totalCost) / Number(item.quantity)
                        : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{matchedItem?.name || "Unknown item"}</span>
                            {matchedItem?.unit && (
                              <span className="text-xs text-muted-foreground">
                                Unit: {matchedItem.unit}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {Number(item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(item.totalCost) || 0)}
                        </TableCell>
                        <TableCell>{formatCurrency(unitCost)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button onClick={() => setViewPurchase(null)} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

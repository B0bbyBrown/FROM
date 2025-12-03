import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRawMaterials, createRawMaterial, getCurrentStock, updateItem, deleteItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { NewItem } from "@shared/schema";
import { ItemTable } from "@/components/ItemTable";
import { ItemForm } from "@/components/ItemForm";
import { Label } from "@/components/ui/label";

export default function RawMaterials() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/raw-materials", "RAW"],
    queryFn: () => getRawMaterials("RAW"),
  });

  const createMutation = useMutation({
    mutationFn: (newItem: NewItem) => createRawMaterial(newItem),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials"] });
      toast({ title: "Item created successfully" });
      setIsDialogOpen(false);
      return data; // Return the created item
    },
    onError: (error) => {
      toast({
        title: "Failed to create item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials"] });
      toast({ title: "Item updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials"] });
      toast({ title: "Item deleted successfully" });
      setIsDeleteDialogOpen(false);
      setDeleteItemId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      deleteMutation.mutate(deleteItemId);
    }
  };

  const { data: currentStock = [] } = useQuery({
    queryKey: ["/api/stock/current"],
    queryFn: () => getCurrentStock(),
  });

  const itemsWithStock = items.map(item => {
    const stockItem = currentStock.find(s => s.itemId === item.id);
    return {
      ...item,
      totalQuantity: stockItem ? stockItem.totalQuantity : '0',
      unit: stockItem ? stockItem.unit : item.unit
    };
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout title="Raw Materials" description="Manage raw materials.">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button>Create New Raw Material</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Raw Material</DialogTitle>
      <DialogDescription>Enter the details for the new raw material.</DialogDescription>
    </DialogHeader>
    <ItemForm items={items} onSubmit={(values: NewItem) => createMutation.mutate(values as NewItem)} isPending={createMutation.isPending} />
  </DialogContent>
</Dialog>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Raw Material</DialogTitle>
            <DialogDescription>Update the details for the raw material.</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <ItemForm
              items={items}
              initialValues={selectedItem}
              onSubmit={(values) => updateMutation.mutate({ id: selectedItem.id, data: values })}
              isPending={updateMutation.isPending}
              fixedType="RAW"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ItemTable items={itemsWithStock} onEdit={handleEdit} onDelete={handleDelete} />
    </Layout>
  );
}

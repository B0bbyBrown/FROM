import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRawMaterials, createRawMaterial, updateItem, deleteItem, getRecipes } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { NewItem } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { ItemForm } from "@/components/ItemForm";

export default function Products() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/raw-materials", "PRODUCT"],
    queryFn: () => getRawMaterials("PRODUCT"),
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["/api/raw-materials"],
    queryFn: () => getRawMaterials(),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    queryFn: getRecipes,
  });

  const createMutation = useMutation({
    mutationFn: (newItem: NewItem) => createRawMaterial(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials", "PRODUCT"] });
      toast({ title: "Product created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedItem) => updateItem(updatedItem.id, updatedItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials", "PRODUCT"] });
      toast({ title: "Product updated successfully" });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials", "PRODUCT"] });
      toast({ title: "Product deleted successfully" });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout title="Products" description="Manage products.">
      <div className="flex justify-end mb-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ItemForm items={allItems} onSubmit={(values) => createMutation.mutate(values)} isPending={createMutation.isPending} fixedType="PRODUCT" recipes={recipes} />
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Low Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.price ? formatCurrency(item.price) : "-"}</TableCell>
              <TableCell>{item.lowStockLevel || "-"}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => {
                  setEditItem(item);
                  setIsEditDialogOpen(true);
                }}>Edit</Button>
                <Button variant="destructive" onClick={() => {
                  setDeleteItemId(item.id);
                  setIsDeleteDialogOpen(true);
                }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ItemForm 
            items={allItems}
            onSubmit={(values) => updateMutation.mutate({ ...values, id: editItem.id })}
            isPending={updateMutation.isPending}
            fixedType="PRODUCT"
            initialValues={editItem}
            recipes={recipes}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this product?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteItemId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

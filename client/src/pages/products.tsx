import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRawMaterials, createRawMaterial, updateItem, deleteItem, getRecipes } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  const [createInitialValues, setCreateInitialValues] = useState<Partial<NewItem> | null>(null);

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

  const recipeMap = new Map(recipes.map((r) => [r.id, r.name]));

  // Derive recipes that don't yet have a product item linked
  const recipeIdsWithProduct = new Set(items.filter((i: any) => i.recipeId).map((i: any) => i.recipeId));
  const recipeOnlyRows = recipes
    .filter((r: any) => !recipeIdsWithProduct.has(r.id))
    .map((r: any) => ({
      id: `recipe-${r.id}`,
      name: r.name,
      sku: "",
      unit: "",
      price: null,
      recipeId: r.id,
      _isRecipeOnly: true,
    }));

  const tableRows = [...items, ...recipeOnlyRows];

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
            <Button onClick={() => setCreateInitialValues(null)}>Create New Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>Set up a product, optionally linking it to a recipe.</DialogDescription>
            </DialogHeader>
            <ItemForm 
              items={allItems} 
              recipes={recipes} 
              onSubmit={(values: NewItem) => createMutation.mutate(values as NewItem)} 
              isPending={createMutation.isPending} 
              fixedType="PRODUCT" 
              initialValues={createInitialValues ?? undefined}
            lockedRecipeId={createInitialValues?.recipeId}
            lockedRecipeName={createInitialValues?.recipeId ? recipeMap.get(createInitialValues.recipeId) : undefined}
            />
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
            <TableHead>Recipe</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.price ? formatCurrency(item.price) : "-"}</TableCell>
              <TableCell>{item.recipeId ? recipeMap.get(item.recipeId) || "-" : "Standalone"}</TableCell>
              <TableCell>
                {item._isRecipeOnly ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateInitialValues({
                        name: item.name,
                        recipeId: item.recipeId,
                        type: "PRODUCT",
                      });
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    Create Product
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => {
                      setEditItem(item);
                      setIsEditDialogOpen(true);
                    }}>Edit</Button>
                    <Button variant="destructive" onClick={() => {
                      setDeleteItemId(item.id);
                      setIsDeleteDialogOpen(true);
                    }}>Delete</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details or its linked recipe.</DialogDescription>
          </DialogHeader>
          <ItemForm 
            items={allItems}
            onSubmit={(values) => updateMutation.mutate({ ...values, id: editItem.id })}
            isPending={updateMutation.isPending}
            fixedType="PRODUCT"
            initialValues={editItem}
            recipes={recipes}
            lockedRecipeId={undefined}
            lockedRecipeName={undefined}
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

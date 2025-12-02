import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecipes, createRecipe, updateRecipe, deleteRecipe, getRawMaterials } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search } from "lucide-react";
import { NewRecipe, Recipe, Item } from "@shared/schema"; // Import types

export default function Recipes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [recipeItems, setRecipeItems] = useState<{ childItemId: string; quantity: number }[]>([{ childItemId: "", quantity: 0 }]); // Use number for quantity
  const [searchTerm, setSearchTerm] = useState(""); // State for search

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    queryFn: getRecipes,
  });

  const { data: rawMaterials = [] } = useQuery<Item[]>({
    queryKey: ["/api/raw-materials", "RAW"],
    queryFn: () => getRawMaterials("RAW"),
  });

  const createMutation = useMutation({
    mutationFn: (newRecipe: NewRecipe) => createRecipe(newRecipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({ title: "Recipe created successfully" });
      setIsCreateDialogOpen(false);
      setName("");
      setRecipeItems([{ childItemId: "", quantity: 0 }]);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create recipe", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: NewRecipe }) => updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({ title: "Recipe updated successfully" });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update recipe", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({ title: "Recipe deleted successfully" });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete recipe", description: error.message, variant: "destructive" });
    },
  });

  const handleAddItem = () => {
    setRecipeItems([...recipeItems, { childItemId: "", quantity: 0 }]);
  };

  const handleItemChange = (index: number, field: "childItemId" | "quantity", value: string) => {
    const newItems = [...recipeItems];
    if (field === "quantity") {
      newItems[index][field] = parseFloat(value) || 0; // Convert to number
    } else {
      newItems[index][field] = value;
    }
    setRecipeItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = recipeItems.filter((_, i) => i !== index);
    setRecipeItems(newItems);
  };

  const openEditDialog = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setName(recipe.name);
    setRecipeItems(recipe.items.map(item => ({ ...item, quantity: Number(item.quantity) })) || [{ childItemId: "", quantity: 0 }]);
    setIsEditDialogOpen(true);
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout title="Recipes" description="Manage recipes.">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1> {/* Prominent page name */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Recipe</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Recipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, items: recipeItems }); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Raw Materials</h3>
                  {recipeItems.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                      <Select onValueChange={(v) => handleItemChange(index, "childItemId", v)} value={item.childItemId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select raw material" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterials.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name} ({r.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} className="w-24" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddItem}>
                    Add Raw Material
                  </Button>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Recipe"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{recipe.name}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => openEditDialog(recipe)}>Edit</Button>
                <Button variant="destructive" onClick={() => {
                  setDeleteRecipeId(recipe.id);
                  setIsDeleteDialogOpen(true);
                }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (editRecipe) {
              updateMutation.mutate({ id: editRecipe.id, data: { name, items: recipeItems } }); 
            }
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <h3 className="font-medium mb-2">Raw Materials</h3>
                {recipeItems.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <Select onValueChange={(v) => handleItemChange(index, "childItemId", v)} value={item.childItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select raw material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} className="w-24" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem}>
                  Add Raw Material
                </Button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Recipe"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this recipe?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteRecipeId) {
                deleteMutation.mutate(deleteRecipeId);
              }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
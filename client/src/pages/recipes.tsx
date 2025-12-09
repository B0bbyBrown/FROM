import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecipes, createRecipe, updateRecipe, deleteRecipe, getRawMaterials } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  const [recipeItems, setRecipeItems] = useState<{ childItemId: string; quantity: number; unit: string }[]>([{ childItemId: "", quantity: 0, unit: "" }]); // quantity in display unit; unit may differ from raw material base
  const [searchTerm, setSearchTerm] = useState(""); // State for search

  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
    queryFn: getRecipes,
  });

  const { data: rawMaterials = [] } = useQuery<Item[]>({
    queryKey: ["/api/raw-materials", "RAW"],
    queryFn: () => getRawMaterials("RAW"),
  });

  const hasRawMaterials = rawMaterials.length > 0;
  const rawMaterialMap = new Map(rawMaterials.map((rm) => [rm.id, rm]));

  const allowedUnitsByBase: Record<string, string[]> = {
    ml: ["ml", "L"],
    L: ["L", "ml"],
    g: ["g", "Kg"],
    Kg: ["Kg", "g"],
    item: ["item"],
    bulk: ["bulk"],
  };

  const getAllowedUnits = (baseUnit: string | undefined) =>
    (allowedUnitsByBase[baseUnit || ""] || [])
      .filter(Boolean) as string[];

  const getDisplayQuantity = (baseUnit: string | undefined, baseQty: number) => {
    if (!baseUnit || !Number.isFinite(baseQty)) return { qty: baseQty, unit: baseUnit };
    if (baseUnit === "L" && baseQty < 1) return { qty: baseQty * 1000, unit: "ml" };
    if (baseUnit === "ml" && baseQty >= 1000) return { qty: baseQty / 1000, unit: "L" };
    if (baseUnit === "Kg" && baseQty < 1) return { qty: baseQty * 1000, unit: "g" };
    if (baseUnit === "g" && baseQty >= 1000) return { qty: baseQty / 1000, unit: "Kg" };
    return { qty: baseQty, unit: baseUnit };
  };

  const toBaseQuantity = (qty: number, fromUnit: string, baseUnit: string) => {
    if (!qty || !fromUnit || !baseUnit || fromUnit === baseUnit) return qty;
    if (fromUnit === "L" && baseUnit === "ml") return qty * 1000;
    if (fromUnit === "ml" && baseUnit === "L") return qty / 1000;
    if (fromUnit === "Kg" && baseUnit === "g") return qty * 1000;
    if (fromUnit === "g" && baseUnit === "Kg") return qty / 1000;
    return qty;
  };

  const fromBaseQuantity = (qty: number, baseUnit: string, toUnit: string) => {
    if (!qty || !baseUnit || !toUnit || baseUnit === toUnit) return qty;
    if (baseUnit === "ml" && toUnit === "L") return qty / 1000;
    if (baseUnit === "L" && toUnit === "ml") return qty * 1000;
    if (baseUnit === "g" && toUnit === "Kg") return qty / 1000;
    if (baseUnit === "Kg" && toUnit === "g") return qty * 1000;
    return qty;
  };

  const createMutation = useMutation({
    mutationFn: (newRecipe: NewRecipe) => createRecipe(newRecipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({ title: "Recipe created successfully" });
      setIsCreateDialogOpen(false);
      setName("");
      setRecipeItems([{ childItemId: "", quantity: 0, unit: "" }]);
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
    setRecipeItems([...recipeItems, { childItemId: "", quantity: 0, unit: "" }]);
  };

  const handleItemChange = (index: number, field: "childItemId" | "quantity" | "unit", value: string) => {
    const newItems = [...recipeItems];
    const current = newItems[index];
    const rawMaterial = rawMaterialMap.get(field === "childItemId" ? value : current.childItemId);
    const baseUnit = rawMaterial?.unit || current.unit || "";
    if (field === "quantity") {
      const numericValue = Number(value);
      current.quantity = Number.isNaN(numericValue) ? 0 : numericValue;
    } else if (field === "childItemId") {
      current.childItemId = value;
      current.unit = rawMaterial?.unit || current.unit || "";
    } else if (field === "unit") {
      const oldUnit = current.unit || baseUnit;
      const displayQty = Number(current.quantity) || 0;
      const baseQty = toBaseQuantity(displayQty, oldUnit, baseUnit);
      const newDisplayQty = fromBaseQuantity(baseQty, baseUnit, value);
      current.unit = value;
      current.quantity = Number.isFinite(newDisplayQty) ? newDisplayQty : 0;
    }
    newItems[index] = current;
    setRecipeItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = recipeItems.filter((_, i) => i !== index);
    setRecipeItems(newItems);
  };

  const openEditDialog = (recipe: Recipe) => {
    setEditRecipe(recipe);
    setName(recipe.name);
    setRecipeItems(
      recipe.items.map(item => {
        const rm = rawMaterialMap.get(item.childItemId);
        const baseUnit = rm?.unit || "";
        return {
          childItemId: item.childItemId,
          quantity: Number(item.quantity),
          unit: baseUnit,
        };
      }) || [{ childItemId: "", quantity: 0, unit: "" }]
    );
    setIsEditDialogOpen(true);
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasValidItems = recipeItems.some(
    (item) => item.childItemId && item.childItemId.trim() && Number(item.quantity) > 0
  );

  const sanitizeItems = () =>
    recipeItems
      .filter((item) => item.childItemId && item.childItemId.trim() && Number(item.quantity) > 0)
      .map((item) => {
        const rm = rawMaterialMap.get(item.childItemId);
        const baseUnit = rm?.unit || item.unit || "";
        const displayUnit = item.unit || baseUnit;
        const baseQty = toBaseQuantity(Number(item.quantity), displayUnit, baseUnit);
        return { childItemId: item.childItemId, quantity: baseQty };
      });

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
              <DialogDescription>Define a recipe using raw materials and quantities.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hasRawMaterials) {
                  toast({ title: "No raw materials available", description: "Add raw materials first.", variant: "destructive" });
                  return;
                }
                const items = sanitizeItems();
                if (!items.length) {
                  toast({ title: "Add at least one raw material with a quantity > 0", variant: "destructive" });
                  return;
                }
                createMutation.mutate({ name: name.trim(), items });
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Raw Materials</h3>
                  {!hasRawMaterials && (
                    <p className="text-sm text-muted-foreground">No raw materials available. Please create raw materials first.</p>
                  )}
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
                      <Select
                        onValueChange={(v) => handleItemChange(index, "unit", v)}
                        value={item.unit || rawMaterialMap.get(item.childItemId)?.unit || ""}
                        disabled={!item.childItemId}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllowedUnits(rawMaterialMap.get(item.childItemId)?.unit).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-24"
                        min="0.0001"
                        step="0.0001"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={handleAddItem} disabled={!hasRawMaterials}>
                    Add Raw Material
                  </Button>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    !name.trim() ||
                    !hasValidItems ||
                    !hasRawMaterials
                  }
                >
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
            <TableHead>Raw Materials</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{recipe.name}</TableCell>
              <TableCell>
                {recipe.items && recipe.items.length > 0 ? (
                  <div>
                    {recipe.items.map((item) => {
                      const rm = rawMaterialMap.get(item.childItemId);
                      const display = getDisplayQuantity(rm?.unit, Number(item.quantity));
                      const unitLabel = display.unit ? ` ${display.unit}` : "";
                      const qtyLabel = Number.isFinite(display.qty) ? display.qty : item.quantity;
                      return (
                        <div key={`${recipe.id}-${item.childItemId}`}>
                          {rm?.name ?? "Unknown"}: {qtyLabel}
                          {unitLabel}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
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
            <DialogDescription>Update the name and ingredient quantities for this recipe.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (!editRecipe) return;
              if (!hasRawMaterials) {
                toast({ title: "No raw materials available", description: "Add raw materials first.", variant: "destructive" });
                return;
              }
              const items = sanitizeItems();
              if (!items.length) {
                toast({ title: "Add at least one raw material with a quantity > 0", variant: "destructive" });
                return;
              }
              updateMutation.mutate({ id: editRecipe.id, data: { name: name.trim(), items } }); 
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <h3 className="font-medium mb-2">Raw Materials</h3>
                {!hasRawMaterials && (
                  <p className="text-sm text-muted-foreground">No raw materials available. Please create raw materials first.</p>
                )}
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
                    <Select
                      onValueChange={(v) => handleItemChange(index, "unit", v)}
                      value={item.unit || rawMaterialMap.get(item.childItemId)?.unit || ""}
                      disabled={!item.childItemId}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllowedUnits(rawMaterialMap.get(item.childItemId)?.unit).map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-24"
                      min="0.0001"
                      step="0.0001"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} disabled={!hasRawMaterials}>
                  Add Raw Material
                </Button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  !name.trim() ||
                  !hasValidItems ||
                  !hasRawMaterials
                }
              >
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
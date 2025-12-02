import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NewItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { adjustStock } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command as CommandPrimitive } from "cmdk";
import { CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const ItemForm = ({ items, onSubmit, isPending, fixedType, showRecipeOnly = false, initialValues = null }) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [type, setType] = useState(fixedType || "RAW");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [lowStockLevel, setLowStockLevel] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [recipe, setRecipe] = useState<{ childItemId: string; quantity: string }[]>([]);
  const [recipeId, setRecipeId] = useState(initialValues?.recipeId || "");

  const { toast } = useToast();

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || "");
      setSku(initialValues.sku || "");
      setType(initialValues.type || fixedType || "RAW");
      setUnit(initialValues.unit || "");
      setPrice(initialValues.price ? initialValues.price.toString() : "");
      setLowStockLevel(initialValues.lowStockLevel ? initialValues.lowStockLevel.toString() : "");
      setInitialQuantity(initialValues.initialQuantity ? initialValues.initialQuantity.toString() : "");
      setRecipe(initialValues.recipe || []);
    }
  }, [initialValues]);

  useEffect(() => {
    if (type !== "RAW" && recipe.length === 0) {
      setRecipe([{ childItemId: "", quantity: "" }]);
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === "RAW" && (!initialQuantity || parseFloat(initialQuantity) <= 0)) {
      toast({ title: "Validation Error", description: "Initial Quantity is required for raw materials and must be greater than 0.", variant: "destructive" });
      return;
    }
    
    const values: NewItem = {
      name,
      sku: sku || undefined,
      type,
      unit,
      price: price ? parseFloat(price) : undefined,
      lowStockLevel: lowStockLevel ? parseFloat(lowStockLevel) : undefined,
      recipe: type !== "RAW" ? recipe : undefined,
      recipeId: type === "PRODUCT" ? recipeId : undefined,
    };
    
    try {
      const newItem = await onSubmit(values);
      if (initialQuantity && parseFloat(initialQuantity) > 0) {
        await adjustStock({
          itemId: newItem.id,
          quantity: parseFloat(initialQuantity),
          reason: "Initial stock",
        });
      }
    } catch (error) {
      if (error.message.includes("UNIQUE constraint failed: items.sku")) {
        toast({ title: "Duplicate SKU", description: "This SKU already exists. Please choose a unique one or leave it blank.", variant: "destructive" });
      } else {
        toast({ title: "Failed to create item", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleAddRecipeItem = () => {
    setRecipe([...recipe, { childItemId: "", quantity: "" }]);
  };

  const handleRecipeChange = (index, field, value) => {
    const newRecipe = [...recipe];
    newRecipe[index][field] = value;
    setRecipe(newRecipe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showRecipeOnly && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={setUnit} value={unit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(type === "PRODUCT" || type === "RAW") && (
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="initialQuantity">Initial Quantity</Label>
            <Input 
              id="initialQuantity" 
              type="number" 
              value={initialQuantity} 
              onChange={(e) => setInitialQuantity(e.target.value)} 
              required={type === "RAW"}
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lowStockLevel">Low Stock Level</Label>
            <Input id="lowStockLevel" type="number" value={lowStockLevel} onChange={(e) => setLowStockLevel(e.target.value)} />
          </div>

          {!fixedType ? (
            <div>
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(v) => setType(v)} value={type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAW">Raw Material</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Type</Label>
              <p>{type}</p>
            </div>
          )}
        </>
      )}

      {type === "PRODUCT" && (
        <div>
          <h3 className="font-medium mb-2">Recipe</h3>
          <p className="text-sm text-muted-foreground mb-2">Add ingredients or sub-assemblies required to manufacture this item.</p>
          {recipe.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <Select onValueChange={(v) => handleRecipeChange(index, "childItemId", v)} value={item.childItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items
                    .filter((i) => i.id !== item.childItemId && (i.type === "RAW" || i.type === "PRODUCT"))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name} ({i.type}, {i.unit})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleRecipeChange(index, "quantity", e.target.value)} className="w-24" />
              <Button type="button" variant="ghost" size="icon" onClick={() => {
                const newRecipe = [...recipe];
                newRecipe.splice(index, 1);
                setRecipe(newRecipe);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddRecipeItem}>
            Add Recipe Item
          </Button>
        </div>
      )}

      {type === "PRODUCT" && (
        <div>
          <Label htmlFor="recipeId">Select Recipe</Label>
          <Select onValueChange={setRecipeId} value={recipeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a recipe" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((r) => ( // recipes passed as prop
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Item"}
        </Button>
      </div>
    </form>
  );
};

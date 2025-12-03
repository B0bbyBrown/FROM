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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newItemSchema } from "@shared/schema";
import { Controller } from "react-hook-form";

export const ItemForm = ({ items, onSubmit, isPending, fixedType, showRecipeOnly = false, initialValues = null, recipes = [] }) => {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(newItemSchema),
    defaultValues: {
      name: initialValues?.name || '',
      sku: initialValues?.sku || '',
      type: fixedType || initialValues?.type || 'RAW',
      unit: initialValues?.unit || '',
      price: initialValues?.price?.toString() || '',
      lowStockLevel: initialValues?.lowStockLevel?.toString() || '',
      initialQuantity: initialValues?.initialQuantity?.toString() || '',
      recipeId: initialValues?.recipeId || '',
    },
  });

  useEffect(() => {
    if (fixedType) {
      form.setValue('type', fixedType);
    }
  }, [fixedType, form]);

  const handleSubmit = form.handleSubmit((data) => {
    // Convert strings to numbers where needed
    const values = {
      ...data,
      price: data.price ? parseFloat(data.price) : undefined,
      lowStockLevel: data.lowStockLevel ? parseFloat(data.lowStockLevel) : undefined,
      initialQuantity: data.initialQuantity ? parseFloat(data.initialQuantity) : undefined,
    };
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showRecipeOnly && (
        <>
          <div className={`grid ${form.watch('type') === "PRODUCT" ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} required />
            </div>
            {form.watch('type') !== "PRODUCT" && (
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Controller
                  name="unit"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  )}
                />
              </div>
            )}
          </div>

          {(form.watch('type') === "PRODUCT" || form.watch('type') === "RAW") && (
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" {...form.register('price')} required />
            </div>
          )}
          {form.watch('type') === "RAW" && (
            <div>
              <Label htmlFor="initialQuantity">Initial Quantity</Label>
              <Input 
                id="initialQuantity" 
                type="number" 
                {...form.register('initialQuantity')} 
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...form.register('sku')} />
          </div>
          {form.watch('type') !== "PRODUCT" && (
            <div>
              <Label htmlFor="lowStockLevel">Low Stock Level</Label>
              <Input id="lowStockLevel" type="number" {...form.register('lowStockLevel')} />
            </div>
          )}

          {!fixedType ? (
            <div>
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RAW">Raw Material</SelectItem>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          ) : (
            <div>
              <Label>Type</Label>
              <p>{form.watch('type')}</p>
            </div>
          )}
        </>
      )}

      {form.watch('type') === "PRODUCT" && (
        <div>
          <Label htmlFor="recipeId">Select Recipe</Label>
          <Controller
            name="recipeId"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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

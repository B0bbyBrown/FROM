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

export const ItemForm = ({ items, onSubmit, isPending, fixedType, showRecipeOnly = false, initialValues = null, recipes = [], lockedRecipeId = undefined, lockedRecipeName = undefined }) => {
  const { toast } = useToast();

  const form = useForm({
    // Allow passthrough so helper fields (e.g., initialQuantity) survive validation
    resolver: zodResolver(newItemSchema.passthrough()),
    defaultValues: {
      name: initialValues?.name || '',
      sku: initialValues?.sku || '',
      type: fixedType || initialValues?.type || 'RAW',
      unit: initialValues?.unit || (fixedType === 'PRODUCT' ? 'item' : ''),
      price: initialValues?.price ?? undefined,
      lowStockLevel: initialValues?.lowStockLevel ?? initialValues?.low_stock_level ?? undefined,
      initialQuantity: initialValues?.initialQuantity ?? undefined,
      recipeId: initialValues?.recipeId || '',
    },
  });

  useEffect(() => {
    if (fixedType) {
      form.setValue('type', fixedType);
    }
  }, [fixedType, form]);

  const watchType = form.watch('type');

  useEffect(() => {
    if (watchType === 'PRODUCT' && !form.getValues('unit')) {
      form.setValue('unit', 'item');
    }
  }, [form, watchType]);

  useEffect(() => {
    if (lockedRecipeId) {
      form.setValue('recipeId', lockedRecipeId);
    }
  }, [lockedRecipeId, form]);

  const handleSubmit = form.handleSubmit((data) => {
    // Convert strings to numbers where needed
    let values: any = {
      ...data,
      unit: data.unit || (data.type === 'PRODUCT' ? 'item' : data.unit),
      price: data.price ? parseFloat(String(data.price)) : undefined,
      lowStockLevel: data.lowStockLevel ? parseFloat(String(data.lowStockLevel)) : undefined,
      initialQuantity: data.initialQuantity ? parseFloat(String(data.initialQuantity)) : undefined,
    };

    // Auto-set price from bulk if bulk is used
    if (data.unit === 'bulk' && data.bulkQuantity > 0 && data.bulkPrice > 0) {
      values.price = data.bulkPrice / data.bulkQuantity;
    }

    // Map camel to snake for backend
    const payload = {
      ...values,
      low_stock_level: values.lowStockLevel,
    };
    delete payload.lowStockLevel;

    onSubmit(payload);
  }, (errors) => {
    console.error("Form validation failed:", errors);
    toast({
      title: "Form Validation Error",
      description: "Please check required fields and try again.",
      variant: "destructive",
    });
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showRecipeOnly && (
        <>
          <div className={`grid ${form.watch('type') === "PRODUCT" ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} required />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
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
                        <SelectItem value="bulk">Bulk (Pack/Case)</SelectItem>
                        <SelectItem value="item">Item</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
              </div>
            )}
          </div>

          {(form.watch('unit') !== 'bulk' && (form.watch('type') === "PRODUCT" || form.watch('type') === "RAW")) && (
            <div>
              <Label htmlFor="price">Price per Unit</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register('price', {
                  valueAsNumber: true,
                  setValueAs: (v) =>
                    v === "" || v === null || typeof v === "undefined" ? undefined : Number(v),
                })}
                required
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
          )}

          {form.watch('unit') === 'bulk' && (
            <>
              <div>
                <Label htmlFor="bulkUnit">Bulk Type (e.g., Pack, Case)</Label>
                <Input id="bulkUnit" placeholder="Enter pack, case, etc." {...form.register('bulkUnit')} required />
                {errors.bulkUnit && <p className="text-red-500 text-sm">{errors.bulkUnit.message}</p>}
              </div>
              <div>
                <Label htmlFor="bulkQuantity">Qty per Bulk {form.watch('bulkUnit') || 'Unit'}</Label>
                <Input
                  id="bulkQuantity"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g., 20"
                  {...form.register('bulkQuantity', {
                    valueAsNumber: true,
                    setValueAs: (v) =>
                      v === "" || v === null || typeof v === "undefined" ? undefined : Number(v),
                  })}
                  required
                />
                {errors.bulkQuantity && <p className="text-red-500 text-sm">{errors.bulkQuantity.message}</p>}
              </div>
              <div>
                <Label htmlFor="bulkPrice">Price per Bulk Unit (total for the unit)</Label>
                <Input
                  id="bulkPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 250"
                  {...form.register('bulkPrice', {
                    valueAsNumber: true,
                    setValueAs: (v) =>
                      v === "" || v === null || typeof v === "undefined" ? undefined : Number(v),
                  })}
                  required
                />
                {errors.bulkPrice && <p className="text-red-500 text-sm">{errors.bulkPrice.message}</p>}
              </div>
              {form.watch('bulkQuantity') > 0 && form.watch('bulkPrice') > 0 && (
                <div>
                  <Label>Calculated Price per Individual Unit</Label>
                  <p className="text-sm text-muted-foreground">
                    {/* Assuming formatCurrency is defined elsewhere or will be added */}
                    {/* {formatCurrency(form.watch('bulkPrice') / form.watch('bulkQuantity'))} */}
                  </p>
                </div>
              )}
            </>
          )}

          {form.watch('type') === "RAW" && (
            <div>
              <Label htmlFor="initialQuantity">Initial Quantity</Label>
              <Input 
                id="initialQuantity" 
                type="number" 
                {...form.register('initialQuantity', {
                  valueAsNumber: true,
                  setValueAs: (v) =>
                    v === "" || v === null || typeof v === "undefined" ? undefined : Number(v),
                })} 
                required
              />
              {errors.initialQuantity && <p className="text-red-500 text-sm">{errors.initialQuantity.message}</p>}
            </div>
          )}
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...form.register('sku')} />
            {errors.sku && <p className="text-red-500 text-sm">{errors.sku.message}</p>}
          </div>
          {form.watch('type') !== "PRODUCT" && (
            <div>
              <Label htmlFor="lowStockLevel">Low Stock Level</Label>
              <Input
                id="lowStockLevel"
                type="number"
                {...form.register('lowStockLevel', {
                  valueAsNumber: true,
                  setValueAs: (v) =>
                    v === "" || v === null || typeof v === "undefined" ? undefined : Number(v),
                })}
              />
              {errors.lowStockLevel && <p className="text-red-500 text-sm">{errors.lowStockLevel.message}</p>}
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
              {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>
          ) : null}
        </>
      )}

      {form.watch('type') === "PRODUCT" && (
        <div>
          <Label htmlFor="recipeId">Recipe confirmation</Label>
          {lockedRecipeId ? (
            <div className="rounded border px-3 py-2 text-sm text-muted-foreground bg-muted/50">
              {lockedRecipeName || "Locked recipe"}
            </div>
          ) : (
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
          )}
          {errors.recipeId && <p className="text-red-500 text-sm">{errors.recipeId.message}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (initialValues ? "Updating..." : "Creating...") : (initialValues ? "Update Item" : "Create Item")}
        </Button>
      </div>
    </form>
  );
};

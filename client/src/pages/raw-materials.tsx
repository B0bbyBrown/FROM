import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { getRawMaterials, createRawMaterial } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { NewItem } from "@shared/schema";
import { ItemTable } from "@/components/ItemTable";
import { ItemForm } from "@/components/ItemForm";

export default function RawMaterials() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/raw-materials", "RAW"],
    queryFn: () => getRawMaterials("RAW"),
  });

  const createMutation = useMutation({
    mutationFn: (newItem: NewItem) => createRawMaterial(newItem),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/raw-materials", "RAW"] });
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout title="Raw Materials" description="Manage raw ingredients.">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogTrigger asChild>
    <Button>Create New Raw Material</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Raw Material</DialogTitle>
      <DialogDescription>Enter the details for the new raw material.</DialogDescription>
    </DialogHeader>
    <ItemForm items={items} onSubmit={(values: NewItem) => createMutation.mutate(values as NewItem)} isPending={createMutation.isPending} fixedType="RAW" />
  </DialogContent>
</Dialog>
      <ItemTable items={items} />
    </Layout>
  );
}

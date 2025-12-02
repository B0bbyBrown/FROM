import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import styles from "./db-visualizer.module.css";

const fetchDbSchema = async () => {
  const response = await fetch("/api/db-schema");
  if (!response.ok) throw new Error("Failed to fetch schema");
  return response.json();
};

export default function DbVisualizer() {
  const { data: schema = {}, isLoading, error } = useQuery({
    queryKey: ["/api/db-schema"],
    queryFn: fetchDbSchema,
  });

  if (isLoading) return <div>Loading schema...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Layout title="Database Visualizer" description="DEV-only view of DB schema">
      <div className={styles.container}>
        {Object.entries(schema).map(([tableName, columns]) => (
          <div key={tableName} className={styles.tableSection}>
            <h2 className={styles.tableTitle}>{tableName}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Not Null?</TableHead>
                  <TableHead>Primary Key?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((col, index) => (
                  <TableRow key={index}>
                    <TableCell>{col.name}</TableCell>
                    <TableCell>{col.type}</TableCell>
                    <TableCell>{col.notnull ? "Yes" : "No"}</TableCell>
                    <TableCell>{col.pk ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AdminStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase.from("stores").select("*");
      if (error) {
        console.error("Error fetching stores:", error);
      } else {
        setStores(data as Store[]);
      }
      setLoading(false);
    };
    fetchStores();
  }, []);

  const handleAddStore = () => {
    // TODO: Implement add store functionality
    console.log("Add store clicked");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Stores</h1>
        <Button onClick={handleAddStore}>Add Store</Button>
      </div>
      {loading ? (
        <p>Loading stores...</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Is Open</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.location}</TableCell>
                    <TableCell>{store.is_open ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminStores;

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBudget } from "@/actions/budget";
import { toast } from "sonner";

export function AddBudgetModal({ isOpen, onClose, onBudgetAdded }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddBudget = async () => {
    setLoading(true);
    try {
      const budget = await createBudget({ name, amount: parseFloat(amount) });
      onBudgetAdded(budget);
      toast.success("Budget added successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to add budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Add New Budget</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter budget name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter budget amount"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleAddBudget} disabled={loading}>
          {loading ? "Adding..." : "Add Budget"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
"use client";
import React, { useState, useEffect } from "react";
import { ScrollShadow, Input, Button, Skeleton } from "@nextui-org/react";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/hooks/useAxios";

interface Dependency {
  [key: string]: string;
}

const DependencyManager = ({ projectId }: { projectId: string }) => {
  const [dependencies, setDependencies] = useState<Dependency | null>(null);
  const [loading, setLoading] = useState(false);
  const [newDependency, setNewDependency] = useState("");
  const [filteredDependencies, setFilteredDependencies] = useState<Dependency | null>(null);

  const fetchDependencies = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/react/${projectId}/dependencies`
      );

      console.log(data);

      setDependencies(data);
      setFilteredDependencies(data);
    } catch (error) {
      console.error("Failed to fetch dependencies:", error);
      toast.error("Failed to fetch dependencies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [projectId]);

  const handleRemoveDependency = async (dependency: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/react/${projectId}/dependencies`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dependency }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success("Dependency removed successfully.");
      fetchDependencies();
    } catch (error) {
      console.error("Failed to remove dependency:", error);
      toast.error("Failed to remove dependency.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependency = async () => {
    if (!newDependency.trim()) {
      toast.error("Dependency name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/react/${projectId}/dependencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dependency: newDependency }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success("Dependency added successfully.");
      setNewDependency("");
      fetchDependencies();
    } catch (error) {
      console.error("Failed to add dependency:", error);
      toast.error("Failed to add dependency.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDependency = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewDependency(value);

    if (!dependencies) return;

    if (value.trim() === "") {
      setFilteredDependencies(dependencies);
      return;
    }

    const filtered = Object.fromEntries(
      Object.entries(dependencies).filter(([key]) =>
        key.toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredDependencies(filtered);
  };

  const generateRandomWidth = () => `${Math.floor(Math.random() * 75) + 25}%`;

  return (
    <div className="relative h-full">
      <div className="relative h-full bg-[#0d0d12] rounded-xl p-2 ring-1 ring-gray-800/50 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Input
            className="w-3/4"
            placeholder="Search dependency"
            size="sm"
            type="text"
            value={newDependency}
            onChange={handleSearchDependency}
          />
          <Button
            isIconOnly
            color="primary"
            size="sm"
            startContent={<Plus />}
            variant="bordered"
          />
        </div>
        <ScrollShadow className="h-[calc(100%-50px)]">
          {loading ? (
            <div className="flex flex-col gap-2 p-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-3 rounded`}
                  style={{ width: generateRandomWidth() }}
                />
              ))}
            </div>
          ) : filteredDependencies ? (
            <ul className="flex flex-col gap-2">
              {Object.entries(filteredDependencies).map(([key, value]) => (
                <li
                  key={key}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-800/50"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-300 text-sm">{key}</span>
                    <span className="text-gray-500 text-xs">
                      {value.replace("^", "@")}
                    </span>
                  </div>
                  <button
                    aria-label="Remove Dependency"
                    className="p-1 rounded transition-all duration-150 ease-in-out bg-black hover:bg-white/10"
                    onClick={() => handleRemoveDependency(key)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              No dependencies found.
            </div>
          )}
        </ScrollShadow>
      </div>
    </div>
  );
};

export default DependencyManager;

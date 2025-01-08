"use client";
import React, { useState, useEffect } from "react";
import {
  ScrollShadow,
  Input,
  Button,
  Skeleton,
  Spinner,
} from "@nextui-org/react";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { axiosInstance } from "@/hooks/useAxios";
import useReactStore, { Dependency } from "@/store/reactStore";

const DependencyManager = ({ projectId }: { projectId: string }) => {
  const { dependencies, setDependencies } = useReactStore();
  const [loading, setLoading] = useState(false);
  const [newDependency, setNewDependency] = useState("");
  const [filteredDependencies, setFilteredDependencies] =
    useState<Dependency | null>(null);

  const fetchDependencies = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/react/${projectId}/dependencies`
      );

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
        <div className="flex gap-2 items-center justify-between mb-2">
          <Input
            className="w-full"
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
                <DependencyItem
                  key={key}
                  name={key}
                  version={value}
                  projectId={projectId}
                  fetchDependencies={fetchDependencies}
                />
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

const DependencyItem = ({
  name,
  version,
  projectId,
  fetchDependencies,
}: {
  name: string;
  version: string;
  projectId: string;
  fetchDependencies: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { setDependencies } = useReactStore();

  const handleRemoveDependency = async () => {
    setLoading(true);

    try {
      await axiosInstance.delete(`/react/${projectId}/dependencies`, {
        data: {
          dependency: name,
        },
      });

      toast.success("Dependency removed successfully.");

      const { data } = await axiosInstance.get(
        `/react/${projectId}/dependencies`
      );

      setDependencies(data);
      await fetchDependencies();
    } catch (error) {
      console.error("Failed to remove dependency:", error);
      toast.error("Failed to remove dependency.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="flex items-center justify-between p-2 rounded-md bg-gray-800/50">
      <div className="flex flex-col gap-1">
        <span className="text-gray-300 text-sm">{name}</span>
        <span className="text-gray-500 text-xs">
          {version.replace("^", "@")}
        </span>
      </div>
      <button
        aria-label="Remove Dependency"
        className="h-6 w-6 flex items-center justify-center rounded transition-all disabled:opacity-75 duration-150 ease-in-out bg-black hover:bg-white/10"
        disabled={loading}
        onClick={handleRemoveDependency}
      >
        {loading ? (
          <Spinner size="sm" color="primary" />
        ) : (
          <Trash className="h-4 w-4 text-red-500" />
        )}
      </button>
    </li>
  );
};

export default DependencyManager;

"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardHeader,
  ScrollShadow,
  Skeleton,
} from "@nextui-org/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";

import { axiosInstance } from "@/hooks/useAxios";

interface Project {
  id: string;
  name: string;
}

const ProjectSelector = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isOpen, onOpenChange] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/react`);

      console.log(data);
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName) return;
    setLoading(true);
    try {
      await axiosInstance.post("/react", {
        name: newProjectName,
      });

      toast.success("Project created successfully.");
      setNewProjectName("");
      onOpenChange(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    router.push(`/react-editor?projectId=${projectId}`);
  };

  const generateRandomWidth = () => `${Math.floor(Math.random() * 75) + 25}%`;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">
        Select a Project
      </h2>
      <ScrollShadow className="w-full max-w-md">
        {loading ? (
          <div className="flex flex-col gap-2 p-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-10 rounded`}
                style={{ width: generateRandomWidth() }}
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="flex flex-col gap-2">
            {projects.map((project) => (
              <Card
                key={project.id}
                isPressable
                className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 transition-colors"
                onClick={() => handleSelectProject(project.id)}
              >
                <CardHeader className="text-gray-300">
                  {project.name}
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">No projects found.</div>
        )}
      </ScrollShadow>
      <Button
        className="mt-4"
        color="primary"
        startContent={<Plus />}
        variant="bordered"
        onClick={() => onOpenChange(true)}
      >
        Create New Project
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Create New Project
          </ModalHeader>
          <ModalBody>
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={newProjectName}
              variant="bordered"
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button color="primary" onPress={handleCreateProject}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProjectSelector;

"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Chrome, Plus, Server, Trash } from "lucide-react";

import { axiosInstance } from "@/hooks/useAxios";
import { languageIcons } from "@/constants/icons";
import Link from "next/link";

export interface Project {
  id: string;
  name: string;
  port: number;
}

const ProjectSelector = ({
  setProjects,
  projects,
}: {
  setProjects: (projects: Project[]) => void;
  projects: Project[];
}) => {
  const [loading, setLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isOpen, onOpenChange] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/react`);

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

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <span>Select or Create a Project</span>

          <button
            className="p-1.5 ml-auto hover:bg-gray-700 rounded-md transition-colors"
            onClick={() => onOpenChange(true)}
          >
            <Plus className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardBody>
          <div className="flex flex-col">
            <span className="text-xs mb-2">Projects:</span>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className="
                      flex items-center gap-2
                      p-2 rounded-md cursor-pointer
                      hover:bg-gray-100/10 transition-colors
                    "
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <span className="flex items-center gap-2">
                      <img
                        alt="React"
                        className="w-6 h-6"
                        src={languageIcons["react"]}
                      />
                    </span>
                    <span>{project.name}</span>

                    <div className="flex items-center gap-1 ml-auto">
                      <Link
                        href={`http://localhost:${project.port}`}
                        target="_blank"
                        className="p-1.5 flex items-center rounded transition-all duration-150 ease-in-out bg-white/10 hover:bg-black"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Chrome className="h-4 w-4 text-blue-500" />
                      </Link>
                      <button
                        className="p-1.5 flex items-center rounded transition-all duration-150 ease-in-out bg-white/10 hover:bg-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <Server className="h-4 w-4 text-blue-500" />
                        <span className="text-xs ml-1">{project.port}</span>
                      </button>
                      <button
                        className="p-1.5 rounded transition-all duration-150 ease-in-out bg-white/10 hover:bg-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

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

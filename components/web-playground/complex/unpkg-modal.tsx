"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Checkbox, Link, User, Chip, cn } from "@nextui-org/react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";
import axios from "axios";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  defaultPackages: Package[];
  handleInstallPackage: (newpkgs: Package[]) => void;
};

export interface Package {
  name: string;
  keywords: string[];
  version: string;
  description: string;
  publisher: {
    email: string;
    username: string;
  };
  maintainers: {
    email: string;
    username: string;
  }[];
  license: string;
  date: string;
  links: {
    homepage: string;
    repository: string;
    bugs: string;
    npm: string;
  };
  unpkgUrl?: string;
}

const UnpkgModal = ({
  isOpen,
  onOpenChange,
  handleInstallPackage,
  defaultPackages,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);

  const getPackages = async () => {
    try {
      setLoading(true);
      setPackages([]);
      const {
        data: { objects },
      } = await axios.get(
        `https://registry.npmjs.org/-/v1/search?text=${debouncedSearch}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setPackages(objects.map((pkg: { package: Package }) => pkg.package));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultPackages.length > 0) {
      setSelectedPackages(defaultPackages);
    }
  }, [defaultPackages]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (isOpen && !loading && debouncedSearch !== "") {
      getPackages();
    }
  }, [isOpen, debouncedSearch]);

  const togglePackageSelection = (pkg: Package) => {
    setSelectedPackages((prev) => {
      const newPackages = [...prev];
      const index = newPackages.findIndex((p) => p.name === pkg.name);

      if (index > -1) {
        newPackages.splice(index, 1);
      } else {
        newPackages.push(pkg);
      }

      return newPackages;
    });
  };

  const renderPackageCard = (pkg: Package) => (
    <Checkbox
      key={pkg.name}
      aria-label={pkg.name}
      classNames={{
        base: cn(
          "w-full max-w-md bg-[#18181b]",
          "hover:bg-[#27272a] items-center justify-start",
          "cursor-pointer rounded-md gap-2 p-2 py-1 border-2 mx-auto border-transparent",
          "data-[selected=true]:border-primary"
        ),
        label: "w-full",
      }}
      isSelected={selectedPackages.some((p) => p.name === pkg.name)}
      onValueChange={() => togglePackageSelection(pkg)}
    >
      <div className="w-full flex justify-between gap-2">
        <User
          avatarProps={{
            className: "hidden",
          }}
          description={
            <Link isExternal href={pkg.links.npm} size="sm">
              {typeof pkg.description === "string" &&
                pkg.description?.slice(0, 25)}
              ...
            </Link>
          }
          name={pkg.name}
        />
        <div className="flex flex-col items-end gap-1">
          <span className="text-tiny text-default-500">{pkg.version}</span>
          <Chip color="success" size="sm" variant="flat">
            {pkg.license || "Unknown"}
          </Chip>
        </div>
      </div>
    </Checkbox>
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(val) => {
        setDebouncedSearch("");
        setSearch("");
        setLoading(false);
        setPackages([]);
        setSelectedPackages([]);
        onOpenChange(val);
      }}
    >
      <ModalContent>
        <ModalHeader>Search for packages</ModalHeader>

        <ModalBody>
          <Input
            label="Search"
            placeholder="Search packages"
            size="sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <div className="flex justify-center p-4">
              <Spinner />
            </div>
          ) : packages.length === 0 ? (
            <div className="p-2 text-center text-default-500 text-sm">
              No packages found. Try another search term.
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-2 max-h-60 overflow-y-auto overflow-x-hidden">
              {packages.map(renderPackageCard)}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => {
              setDebouncedSearch("");
              onOpenChange(false);
            }}
          >
            Close
          </Button>
          <Button
            color="primary"
            size="sm"
            variant="bordered"
            onClick={() => {
              handleInstallPackage(selectedPackages);
              setDebouncedSearch("");
              onOpenChange(false);
            }}
          >
            Install
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnpkgModal;

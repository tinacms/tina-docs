import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useVersion } from "./VersionContext";

export default function VersionSelectHeader(props) {
  const { versions, title, currentVersion } = props;
  const { setCurrentVersion } = useVersion();

  //-1 for latest, otherwise the index of the version
  const [versionSelected, setVersionSelected] = useState(
    versions.indexOf(currentVersion) ?? -1,
  );
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  useEffect(() => {
    setVersionSelected(versions.indexOf(currentVersion) ?? -1);
  }, [currentVersion, versions]);

  const router = useRouter();

  const handleVersionClick = (version) => {
    setVersionSelected(version);
    setIsOverflowOpen(false);

    if (version === -1) {
      setCurrentVersion("Latest");
      router.push("/docs");
    } else {
      setCurrentVersion(versions[version]);
      router.push(`/docs/_versions/${versions[version]}/index`);
    }
  };

  return (
    <div className="pl-6">
      <h1
        className={
          "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text pb-4 pt-6 font-tuner text-4xl text-transparent"
        }
      >
        {title}
      </h1>
      <div className="relative max-w-32">
        <div
          className="flex cursor-pointer items-center justify-center rounded-lg bg-white px-4 py-1 text-center text-stone-600 shadow-md"
          onClick={() => setIsOverflowOpen(!isOverflowOpen)}
        >
          <div>{versions[versionSelected] ?? "Latest"}</div>
          <div>
            <FaChevronRight
              className={`ml-2 transition-transform duration-300${
                isOverflowOpen ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>
        {isOverflowOpen && (
          <div className="animate-fade-down animate-duration-300 absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg">
            <div
              className={`cursor-pointer px-4 py-2 hover:bg-stone-100 ${
                currentVersion === "Latest"
                  ? "font-bold text-orange-500"
                  : "text-stone-600"
              }`}
              onClick={() => handleVersionClick(-1)}
            >
              Latest
            </div>
            {versions.map((version, index) => (
              <div
                key={index}
                className={`cursor-pointer px-4 py-2 hover:bg-stone-100  ${
                  version === currentVersion
                    ? "font-bold text-orange-500"
                    : "text-stone-600"
                }`}
                onClick={() => handleVersionClick(index)}
              >
                {version}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

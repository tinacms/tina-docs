"use client";

import { useGitHubMetadata } from "@/src/components/page-metadata/github-metadata-context";
import { formatDate } from "date-fns";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { getRelativeTime } from "./timeUtils";
import type { GitHubMetadataProps } from "./type";

export default function GitHubMetadata({
  className = "",
}: Omit<GitHubMetadataProps, "path">) {
  const { data } = useGitHubMetadata();

  if (!data) {
    return (
      <div className={`text-slate-400 text-sm ${className}`}>
        Unable to load last updated info
      </div>
    );
  }

  const { latestCommit, firstCommit, historyUrl } = data;
  const lastUpdatedDate = latestCommit.commit.author.date;
  const lastUpdateInRelativeTime = getRelativeTime(lastUpdatedDate);
  const lastUpdateInAbsoluteTime = formatDate(lastUpdatedDate, "dd MMM yyyy");
  const createdDate = firstCommit?.commit.author.date;
  const createdTime = createdDate
    ? formatDate(createdDate, "d MMM yyyy")
    : null;

  const tooltipContent = createdTime
    ? `Created ${createdTime}\nLast updated ${lastUpdateInAbsoluteTime}`
    : `Last updated ${lastUpdateInAbsoluteTime}`;

  return (
    <div className={`text-slate-500 text-sm ${className}`}>
      <div className="flex sm:flex-row flex-col sm:items-center gap-2">
        <span>
          Last updated by{" "}
          <span className="font-bold text-black">
            {latestCommit.commit.author.name}
          </span>
          {` ${lastUpdateInRelativeTime}.`}
        </span>
        <div className="relative group">
          <Link
            href={historyUrl}
            target="_blank"
            title={tooltipContent}
            rel="noopener noreferrer"
            className="text-black hover:text-orange-600 underline flex flex-row items-center gap-1.5"
          >
            See history
            <FaHistory className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

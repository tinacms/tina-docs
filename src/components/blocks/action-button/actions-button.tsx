import { FlushButton, LinkButton } from "@/components/ui/buttons";
import { sanitizeLabel } from "@/utils/sanitizeLabel";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { tinaField } from "tinacms/dist/react";

export const Actions = ({ items, align = "left", flush = false }) => {
  const isList = true;
  const ActionButton = flush ? FlushButton : LinkButton;

  return (
    <>
      <div
        className={[
          "items-center",
          isList
            ? "flex flex-col sm:flex-row md:flex-row lg:flex-row"
            : "flex flex-row",
          align === "center" && "actionGroupCenter",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items?.map((item) => {
          const { variant, label, icon, url } = item;
          {
            const externalUrlPattern = /^((http|https|ftp):\/\/)/;
            const external = externalUrlPattern.test(url);
            const link = url || "#";
            return (
              <ActionButton
                key={label}
                id={sanitizeLabel(label)}
                size={item.size ? item.size : "medium"}
                link={link}
                target={external ? "_blank" : "_self"}
                color={variant}
                data-tina-field={tinaField(item, "label")}
              >
                {label}
                {icon && (
                  <ArrowLeftIcon className="-mr-1 -mt-1 ml-2 h-[1.125em] w-auto rotate-180 opacity-70" />
                )}
              </ActionButton>
            );
          }
        })}
      </div>
      <style jsx>{`
        .or-text {
          margin: 0.5rem 1.5rem 0.5rem 0.75rem;
          font-size: 1.125rem;
          color: var(--color-secondary);
          font-weight: bold;
        }

        .actionGroupCenter {
          justify-content: center;
        }

        .icon-class {
          display: inline-block;
          fill: currentColor;
          margin-left: 0.375em;
          height: 1em;
          width: auto;
          transition: opacity ease-out 150ms;
        }
      `}</style>
    </>
  );
};
